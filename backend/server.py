from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import io
from PIL import Image
import cv2
import numpy as np
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import json
import aiohttp
import asyncio
import urllib.parse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Weighted ensemble configuration
PROVIDER_WEIGHTS = {
    'openai': 0.35,
    'claude': 0.35,
    'gemini': 0.30
}

class TextAnalysisRequest(BaseModel):
    text: str
    check_sources: bool = True
    extract_claims: bool = True

class ClaimVerification(BaseModel):
    claim: str
    verdict: str  # Verified, Disputed, Unverified
    confidence: float
    sources: List[Dict[str, str]] = []

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_type: str
    content: str
    credibility_score: float
    weighted_score: Optional[float] = None
    confidence_interval: Optional[Dict[str, float]] = None
    prediction: str
    explanation: str
    highlighted_segments: List[Dict[str, Any]] = []
    source_verification: Optional[Dict[str, Any]] = None
    extracted_claims: List[Dict[str, Any]] = []
    knowledge_graph: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_provider_analysis: Dict[str, Any] = {}
    agreement_score: Optional[float] = None

class AnalysisHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    content_type: str
    credibility_score: float
    prediction: str
    timestamp: datetime

class ClaimRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    claim_text: str
    verdict: str
    confidence: float
    analysis_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ========== WIKIPEDIA SOURCE VERIFICATION ==========
async def verify_with_wikipedia(query: str) -> Dict[str, Any]:
    """Search Wikipedia for claim verification"""
    try:
        encoded_query = urllib.parse.quote(query[:200])
        search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={encoded_query}&limit=3&namespace=0&format=json"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url, timeout=10) as resp:
                if resp.status != 200:
                    return {"found": False, "sources": []}
                
                data = await resp.json()
                
                if len(data) >= 4 and len(data[1]) > 0:
                    sources = []
                    for i, title in enumerate(data[1][:3]):
                        sources.append({
                            "title": title,
                            "description": data[2][i] if i < len(data[2]) else "",
                            "url": data[3][i] if i < len(data[3]) else ""
                        })
                    return {"found": True, "sources": sources}
                
                return {"found": False, "sources": []}
    except Exception as e:
        logging.error(f"Wikipedia verification error: {e}")
        return {"found": False, "sources": [], "error": str(e)}


# ========== CLAIM EXTRACTION ==========
async def extract_claims_from_text(text: str) -> List[Dict[str, Any]]:
    """Extract factual claims from text using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"claim-extract-{uuid.uuid4()}",
            system_message=(
                "You are a claim extraction specialist. Extract factual, verifiable claims from text. "
                "Return ONLY a valid JSON array (no markdown, no code blocks) with this structure: "
                '[{"claim": "string", "type": "factual|opinion|statistical", "importance": "high|medium|low"}]. '
                "Extract maximum 5 most important claims. Focus on verifiable factual statements."
            )
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(
            text=f"Extract key factual claims from this text:\n\n{text}"
        ))
        
        # Clean response
        response_clean = response.strip()
        if response_clean.startswith("```"):
            response_clean = response_clean.split("```")[1]
            if response_clean.startswith("json"):
                response_clean = response_clean[4:]
        response_clean = response_clean.strip()
        
        claims = json.loads(response_clean)
        if isinstance(claims, list):
            return claims[:5]
        return []
    except Exception as e:
        logging.error(f"Claim extraction error: {e}")
        return []


async def verify_claims(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Verify extracted claims against trusted sources"""
    verified = []
    for claim in claims[:3]:  # Limit to prevent timeout
        claim_text = claim.get('claim', '')
        if not claim_text:
            continue
        
        wiki_result = await verify_with_wikipedia(claim_text)
        
        verified.append({
            "claim": claim_text,
            "type": claim.get('type', 'factual'),
            "importance": claim.get('importance', 'medium'),
            "verification": {
                "wikipedia_found": wiki_result.get('found', False),
                "sources": wiki_result.get('sources', [])
            }
        })
    
    return verified


# ========== WEIGHTED ENSEMBLE SCORING ==========
def calculate_weighted_ensemble(ai_results: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate weighted ensemble score with confidence metrics"""
    scores = {}
    
    for provider, result in ai_results.items():
        if provider == 'technical_analysis':
            continue
        if isinstance(result, dict) and 'error' not in result:
            score = None
            for key in ['credibility_score', 'truth_score', 'authenticity_score']:
                if key in result:
                    score = result[key]
                    break
            
            if score is not None:
                scores[provider] = float(score)
    
    if not scores:
        return {
            "simple_average": 50.0,
            "weighted_score": 50.0,
            "agreement_score": 0.0,
            "confidence_interval": {"lower": 40.0, "upper": 60.0}
        }
    
    # Simple average
    simple_avg = sum(scores.values()) / len(scores)
    
    # Weighted average based on provider weights
    total_weight = 0
    weighted_sum = 0
    for provider, score in scores.items():
        weight = PROVIDER_WEIGHTS.get(provider, 0.33)
        weighted_sum += score * weight
        total_weight += weight
    
    weighted_score = weighted_sum / total_weight if total_weight > 0 else simple_avg
    
    # Agreement score (lower std dev = higher agreement)
    if len(scores) > 1:
        values = list(scores.values())
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        std_dev = variance ** 0.5
        agreement = max(0, 100 - std_dev * 2)  # Higher = more agreement
    else:
        std_dev = 0
        agreement = 100.0 if scores else 0.0
    
    # Confidence interval
    ci_width = std_dev * 1.96 if len(scores) > 1 else 10
    confidence_interval = {
        "lower": max(0, weighted_score - ci_width),
        "upper": min(100, weighted_score + ci_width)
    }
    
    return {
        "simple_average": round(simple_avg, 2),
        "weighted_score": round(weighted_score, 2),
        "agreement_score": round(agreement, 2),
        "confidence_interval": confidence_interval,
        "provider_scores": scores
    }


# ========== AI ANALYSIS ==========
async def analyze_text_with_ai(text: str) -> Dict[str, Any]:
    """Analyze text using multiple AI providers"""
    results = {}
    
    async def run_openai():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"openai-{uuid.uuid4()}",
                system_message=(
                    "You are an expert misinformation detection system. Analyze text for credibility, "
                    "misleading claims, and suspicious patterns. Return ONLY valid JSON (no markdown): "
                    '{"credibility_score": 0-100 number, "is_fake": boolean, "suspicious_phrases": [strings], '
                    '"reasoning": "detailed explanation", "manipulation_tactics": [strings]}'
                )
            ).with_model("openai", "gpt-5.2")
            
            response = await chat.send_message(UserMessage(text=f"Analyze:\n\n{text}"))
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            return {"error": str(e)}
    
    async def run_claude():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"claude-{uuid.uuid4()}",
                system_message=(
                    "You are a fact-checking AI. Analyze text for truthfulness and bias. "
                    "Return ONLY valid JSON (no markdown): "
                    '{"credibility_score": 0-100 number, "is_reliable": boolean, '
                    '"manipulation_tactics": [strings], "detailed_analysis": "string", "confidence_level": 0-100 number}'
                )
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            response = await chat.send_message(UserMessage(text=f"Analyze credibility:\n\n{text}"))
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            return {"error": str(e)}
    
    async def run_gemini():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"gemini-{uuid.uuid4()}",
                system_message=(
                    "You are an AI fact-checker. Analyze text for misinformation. "
                    "Return ONLY valid JSON (no markdown): "
                    '{"truth_score": 0-100 number, "verdict": "Reliable|Suspicious|Fake", '
                    '"key_issues": [strings], "explanation": "detailed reasoning"}'
                )
            ).with_model("gemini", "gemini-3-flash-preview")
            
            response = await chat.send_message(UserMessage(text=f"Evaluate:\n\n{text}"))
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            return {"error": str(e)}
    
    openai_result, claude_result, gemini_result = await asyncio.gather(
        run_openai(), run_claude(), run_gemini()
    )
    
    results['openai'] = openai_result
    results['claude'] = claude_result
    results['gemini'] = gemini_result
    
    return results


async def analyze_image_with_ai(image_base64: str) -> Dict[str, Any]:
    """Analyze image using AI vision models"""
    results = {}
    
    async def run_openai():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"openai-vision-{uuid.uuid4()}",
                system_message=(
                    "You are an image forensics AI. Analyze for manipulation/deepfakes. "
                    "Return ONLY valid JSON: "
                    '{"authenticity_score": 0-100 number, "is_manipulated": boolean, '
                    '"manipulation_areas": [strings], "detection_confidence": 0-100 number, "detailed_analysis": "string"}'
                )
            ).with_model("openai", "gpt-5.2")
            
            response = await chat.send_message(UserMessage(
                text="Analyze this image for manipulation.",
                file_contents=[ImageContent(image_base64=image_base64)]
            ))
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            return {"error": str(e)}
    
    async def run_gemini():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"gemini-vision-{uuid.uuid4()}",
                system_message=(
                    "You are an image authenticity detector. Return ONLY valid JSON: "
                    '{"authenticity_score": 0-100 number, "verdict": "Authentic|Edited|Fake", '
                    '"anomalies": [strings], "confidence": 0-100 number, "reasoning": "string"}'
                )
            ).with_model("gemini", "gemini-3-flash-preview")
            
            response = await chat.send_message(UserMessage(
                text="Examine this image for manipulation.",
                file_contents=[ImageContent(image_base64=image_base64)]
            ))
            clean = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            return {"error": str(e)}
    
    openai_result, gemini_result = await asyncio.gather(run_openai(), run_gemini())
    results['openai'] = openai_result
    results['gemini'] = gemini_result
    
    return results


def generate_knowledge_graph(text: str, ai_results: Dict[str, Any], claims: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate knowledge graph with claims and sources"""
    nodes = [
        {"id": "content", "label": "Analyzed Content", "group": 1},
        {"id": "openai", "label": "OpenAI", "group": 2},
        {"id": "claude", "label": "Claude", "group": 2},
        {"id": "gemini", "label": "Gemini", "group": 2}
    ]
    
    links = [
        {"source": "content", "target": "openai", "value": 1},
        {"source": "content", "target": "claude", "value": 1},
        {"source": "content", "target": "gemini", "value": 1}
    ]
    
    # Add verified claims
    for i, claim in enumerate(claims[:3]):
        claim_id = f"claim_{i}"
        nodes.append({
            "id": claim_id,
            "label": claim.get('claim', 'Claim')[:30],
            "group": 3
        })
        links.append({
            "source": "content",
            "target": claim_id,
            "value": 2
        })
        
        # Add Wikipedia sources
        if 'verification' in claim and claim['verification'].get('sources'):
            for j, src in enumerate(claim['verification']['sources'][:2]):
                src_id = f"src_{i}_{j}"
                nodes.append({
                    "id": src_id,
                    "label": src.get('title', 'Source')[:25],
                    "group": 4
                })
                links.append({
                    "source": claim_id,
                    "target": src_id,
                    "value": 1
                })
    
    return {"nodes": nodes, "links": links}


@api_router.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text(request: TextAnalysisRequest):
    """Enhanced text analysis with weighted ensemble, claim extraction, and source verification"""
    try:
        # Run AI analysis and claim extraction in parallel
        ai_task = analyze_text_with_ai(request.text)
        claims_task = extract_claims_from_text(request.text) if request.extract_claims else asyncio.sleep(0, result=[])
        
        ai_results, raw_claims = await asyncio.gather(ai_task, claims_task)
        
        # Verify claims if enabled
        verified_claims = []
        if request.check_sources and raw_claims:
            verified_claims = await verify_claims(raw_claims)
        else:
            verified_claims = [{"claim": c.get('claim', ''), "type": c.get('type', 'factual'),
                               "importance": c.get('importance', 'medium'), "verification": None}
                              for c in raw_claims]
        
        # Calculate weighted ensemble
        ensemble = calculate_weighted_ensemble(ai_results)
        
        credibility_score = ensemble['weighted_score']
        
        # Boost/reduce score based on source verification
        if verified_claims:
            verified_count = sum(1 for c in verified_claims if c.get('verification', {}).get('wikipedia_found'))
            if verified_count > 0:
                credibility_score = min(100, credibility_score + (verified_count * 3))
        
        # Determine prediction
        if credibility_score >= 70:
            prediction = "Reliable"
        elif credibility_score >= 40:
            prediction = "Suspicious"
        else:
            prediction = "Fake"
        
        # Generate explanation
        explanations = []
        for provider, result in ai_results.items():
            if isinstance(result, dict) and 'error' not in result:
                for key in ['reasoning', 'detailed_analysis', 'explanation']:
                    if key in result:
                        explanations.append(f"{provider.upper()}: {result[key]}")
                        break
        
        explanation = " | ".join(explanations) if explanations else "Multi-model ensemble analysis completed."
        
        # Extract suspicious phrases
        highlighted_segments = []
        for provider, result in ai_results.items():
            if isinstance(result, dict):
                for key in ['suspicious_phrases', 'manipulation_tactics', 'key_issues']:
                    if key in result and isinstance(result[key], list):
                        for phrase in result[key][:3]:
                            highlighted_segments.append({
                                "text": phrase,
                                "reason": f"Flagged by {provider} ({key.replace('_', ' ')})"
                            })
        
        # Knowledge graph
        knowledge_graph = generate_knowledge_graph(request.text, ai_results, verified_claims)
        
        # Source verification summary
        source_verification = None
        if verified_claims:
            verified_count = sum(1 for c in verified_claims if c.get('verification', {}).get('wikipedia_found'))
            source_verification = {
                "total_claims": len(verified_claims),
                "verified": verified_count,
                "verification_rate": (verified_count / len(verified_claims) * 100) if verified_claims else 0
            }
        
        analysis_obj = AnalysisResult(
            content_type="text",
            content=request.text[:500],
            credibility_score=credibility_score,
            weighted_score=ensemble['weighted_score'],
            confidence_interval=ensemble['confidence_interval'],
            prediction=prediction,
            explanation=explanation[:1500],
            highlighted_segments=highlighted_segments[:10],
            source_verification=source_verification,
            extracted_claims=verified_claims,
            knowledge_graph=knowledge_graph,
            ai_provider_analysis=ai_results,
            agreement_score=ensemble['agreement_score']
        )
        
        # Save to database
        doc = analysis_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        # Save claims to separate collection for historical tracking
        for claim in verified_claims:
            claim_record = {
                "id": str(uuid.uuid4()),
                "claim_text": claim.get('claim', ''),
                "verdict": "Verified" if claim.get('verification', {}).get('wikipedia_found') else "Unverified",
                "confidence": credibility_score,
                "analysis_id": analysis_obj.id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.claims.insert_one(claim_record)
        
        return analysis_obj
    
    except Exception as e:
        logging.error(f"Error in text analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze image for manipulation and deepfakes"""
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        ai_results = await analyze_image_with_ai(image_base64)
        
        # Technical analysis
        image = Image.open(io.BytesIO(contents))
        img_array = np.array(image.convert('RGB'))
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        ai_results['technical_analysis'] = {
            "edge_density": float(edge_density),
            "image_size": list(image.size),
            "format": image.format or "Unknown"
        }
        
        ensemble = calculate_weighted_ensemble(ai_results)
        credibility_score = ensemble['weighted_score']
        
        if credibility_score >= 70:
            prediction = "Authentic"
        elif credibility_score >= 40:
            prediction = "Suspicious"
        else:
            prediction = "Manipulated"
        
        explanations = []
        for provider, result in ai_results.items():
            if provider == 'technical_analysis':
                continue
            if isinstance(result, dict) and 'error' not in result:
                for key in ['detailed_analysis', 'reasoning']:
                    if key in result:
                        explanations.append(f"{provider.upper()}: {result[key]}")
                        break
        
        explanation = " | ".join(explanations) if explanations else "Image analysis completed."
        
        analysis_obj = AnalysisResult(
            content_type="image",
            content=f"Image: {file.filename}",
            credibility_score=credibility_score,
            weighted_score=ensemble['weighted_score'],
            confidence_interval=ensemble['confidence_interval'],
            prediction=prediction,
            explanation=explanation[:1500],
            ai_provider_analysis=ai_results,
            agreement_score=ensemble['agreement_score']
        )
        
        doc = analysis_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        return analysis_obj
    
    except Exception as e:
        logging.error(f"Error in image analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """Analyze video for deepfakes"""
    try:
        contents = await file.read()
        
        temp_path = f"/tmp/{uuid.uuid4()}.mp4"
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        cap = cv2.VideoCapture(temp_path)
        frame_analyses = []
        frame_count = 0
        suspicious_frames = []
        
        while cap.isOpened() and frame_count < 10:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % 30 == 0:
                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                frame_ai_results = await analyze_image_with_ai(frame_base64)
                frame_ensemble = calculate_weighted_ensemble(frame_ai_results)
                frame_score = frame_ensemble['weighted_score']
                
                frame_analyses.append({
                    "frame_number": frame_count,
                    "score": frame_score
                })
                
                if frame_score < 50:
                    suspicious_frames.append(frame_count)
            
            frame_count += 1
        
        cap.release()
        os.remove(temp_path)
        
        if frame_analyses:
            avg_score = sum(f['score'] for f in frame_analyses) / len(frame_analyses)
        else:
            avg_score = 50.0
        
        if avg_score >= 70:
            prediction = "Authentic"
        elif avg_score >= 40:
            prediction = "Suspicious"
        else:
            prediction = "Deepfake Detected"
        
        explanation = f"Analyzed {len(frame_analyses)} frames. Average authenticity: {avg_score:.1f}%. "
        if suspicious_frames:
            explanation += f"Suspicious frames detected at: {', '.join(map(str, suspicious_frames[:5]))}."
        else:
            explanation += "No significant anomalies detected."
        
        analysis_obj = AnalysisResult(
            content_type="video",
            content=f"Video: {file.filename}",
            credibility_score=avg_score,
            prediction=prediction,
            explanation=explanation,
            ai_provider_analysis={
                "frame_analyses": frame_analyses,
                "suspicious_frames": suspicious_frames,
                "total_frames_analyzed": len(frame_analyses)
            }
        )
        
        doc = analysis_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        return analysis_obj
    
    except Exception as e:
        logging.error(f"Error in video analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/analysis/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str):
    result = await db.analyses.find_one({"id": analysis_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if isinstance(result['timestamp'], str):
        result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    
    return result


@api_router.get("/history", response_model=List[AnalysisHistory])
async def get_history(limit: int = 20):
    results = await db.analyses.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    history = []
    for result in results:
        if isinstance(result['timestamp'], str):
            result['timestamp'] = datetime.fromisoformat(result['timestamp'])
        
        history.append(AnalysisHistory(
            id=result['id'],
            content_type=result['content_type'],
            credibility_score=result['credibility_score'],
            prediction=result['prediction'],
            timestamp=result['timestamp']
        ))
    
    return history


@api_router.get("/claims/recent")
async def get_recent_claims(limit: int = 20):
    """Get recently tracked claims"""
    results = await db.claims.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return results


@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    total_analyses = await db.analyses.count_documents({})
    total_claims = await db.claims.count_documents({})
    
    # Aggregate by prediction type
    pipeline = [
        {"$group": {"_id": "$prediction", "count": {"$sum": 1}}}
    ]
    prediction_stats = await db.analyses.aggregate(pipeline).to_list(100)
    
    # Aggregate by content type
    type_pipeline = [
        {"$group": {"_id": "$content_type", "count": {"$sum": 1}}}
    ]
    type_stats = await db.analyses.aggregate(type_pipeline).to_list(100)
    
    return {
        "total_analyses": total_analyses,
        "total_claims_tracked": total_claims,
        "prediction_distribution": [{"label": s["_id"], "count": s["count"]} for s in prediction_stats],
        "content_type_distribution": [{"label": s["_id"], "count": s["count"]} for s in type_stats]
    }


@api_router.get("/")
async def root():
    return {"message": "TruthLens AI - Multimodal Misinformation Detection API v2.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
