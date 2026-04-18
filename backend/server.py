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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

class TextAnalysisRequest(BaseModel):
    text: str
    check_sources: bool = True

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_type: str
    content: str
    credibility_score: float
    prediction: str
    explanation: str
    highlighted_segments: List[Dict[str, Any]] = []
    source_verification: Optional[Dict[str, Any]] = None
    knowledge_graph: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_provider_analysis: Dict[str, Any] = {}

class AnalysisHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    content_type: str
    credibility_score: float
    prediction: str
    timestamp: datetime

async def analyze_text_with_ai(text: str) -> Dict[str, Any]:
    """Analyze text using multiple AI providers for ensemble analysis"""
    results = {}
    
    # OpenAI Analysis
    try:
        openai_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"openai-{uuid.uuid4()}",
            system_message="You are an expert misinformation detection system. Analyze the provided text for credibility, misleading claims, and suspicious patterns. Provide a detailed JSON response with: credibility_score (0-100), is_fake (boolean), suspicious_phrases (list), reasoning (detailed explanation), and claim_verification (list of claims with their validity)."
        ).with_model("openai", "gpt-5.2")
        
        response = await openai_chat.send_message(UserMessage(
            text=f"Analyze this text for misinformation and provide detailed JSON analysis:\n\n{text}"
        ))
        
        try:
            openai_result = json.loads(response)
        except:
            openai_result = {"raw_response": response}
        
        results['openai'] = openai_result
    except Exception as e:
        results['openai'] = {"error": str(e)}
    
    # Claude Analysis
    try:
        claude_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"claude-{uuid.uuid4()}",
            system_message="You are a sophisticated fact-checking AI. Analyze text for truthfulness, bias, and manipulation tactics. Return JSON with: credibility_score (0-100), is_reliable (boolean), manipulation_tactics (list), detailed_analysis (string), and confidence_level (0-100)."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await claude_chat.send_message(UserMessage(
            text=f"Analyze this content for credibility:\n\n{text}"
        ))
        
        try:
            claude_result = json.loads(response)
        except:
            claude_result = {"raw_response": response}
        
        results['claude'] = claude_result
    except Exception as e:
        results['claude'] = {"error": str(e)}
    
    # Gemini Analysis
    try:
        gemini_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gemini-{uuid.uuid4()}",
            system_message="You are an AI fact-checker specializing in detecting false information. Analyze the text and return JSON containing: truth_score (0-100), verdict (Reliable/Suspicious/Fake), key_issues (list), evidence_quality (0-100), and explanation (detailed reasoning)."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await gemini_chat.send_message(UserMessage(
            text=f"Evaluate this text for misinformation:\n\n{text}"
        ))
        
        try:
            gemini_result = json.loads(response)
        except:
            gemini_result = {"raw_response": response}
        
        results['gemini'] = gemini_result
    except Exception as e:
        results['gemini'] = {"error": str(e)}
    
    return results

async def analyze_image_with_ai(image_base64: str) -> Dict[str, Any]:
    """Analyze image using AI vision models"""
    results = {}
    
    # OpenAI Vision Analysis
    try:
        openai_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"openai-vision-{uuid.uuid4()}",
            system_message="You are an expert image forensics AI. Analyze images for manipulation, deepfakes, and authenticity. Provide JSON with: authenticity_score (0-100), is_manipulated (boolean), manipulation_areas (list of suspicious regions), detection_confidence (0-100), and detailed_analysis."
        ).with_model("openai", "gpt-5.2")
        
        response = await openai_chat.send_message(UserMessage(
            text="Analyze this image for manipulation, editing, or deepfake indicators. Provide detailed JSON analysis.",
            file_contents=[ImageContent(image_base64=image_base64)]
        ))
        
        try:
            openai_result = json.loads(response)
        except:
            openai_result = {"raw_response": response}
        
        results['openai'] = openai_result
    except Exception as e:
        results['openai'] = {"error": str(e)}
    
    # Gemini Vision Analysis
    try:
        gemini_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gemini-vision-{uuid.uuid4()}",
            system_message="You are an image authenticity detector. Identify signs of manipulation, inconsistencies, and artifacts. Return JSON: authenticity_score (0-100), verdict (Authentic/Edited/Fake), anomalies (list), confidence (0-100), reasoning."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await gemini_chat.send_message(UserMessage(
            text="Examine this image for signs of manipulation or forgery. Provide detailed JSON analysis.",
            file_contents=[ImageContent(image_base64=image_base64)]
        ))
        
        try:
            gemini_result = json.loads(response)
        except:
            gemini_result = {"raw_response": response}
        
        results['gemini'] = gemini_result
    except Exception as e:
        results['gemini'] = {"error": str(e)}
    
    return results

def calculate_ensemble_score(ai_results: Dict[str, Any]) -> float:
    """Calculate credibility score from multiple AI analyses"""
    scores = []
    
    for provider, result in ai_results.items():
        if isinstance(result, dict) and 'error' not in result:
            # Extract score from various possible keys
            score = None
            for key in ['credibility_score', 'truth_score', 'authenticity_score']:
                if key in result:
                    score = result[key]
                    break
            
            if score is not None:
                scores.append(float(score))
    
    if not scores:
        return 50.0  # Default neutral score
    
    return sum(scores) / len(scores)

def generate_knowledge_graph(text: str, ai_results: Dict[str, Any]) -> Dict[str, Any]:
    """Generate knowledge graph structure for visualization"""
    nodes = [
        {"id": "content", "label": "Analyzed Content", "group": 1},
        {"id": "openai", "label": "OpenAI Analysis", "group": 2},
        {"id": "claude", "label": "Claude Analysis", "group": 2},
        {"id": "gemini", "label": "Gemini Analysis", "group": 2}
    ]
    
    links = [
        {"source": "content", "target": "openai", "value": 1},
        {"source": "content", "target": "claude", "value": 1},
        {"source": "content", "target": "gemini", "value": 1}
    ]
    
    # Add claim nodes if available
    claim_id = 0
    for provider, result in ai_results.items():
        if isinstance(result, dict) and 'error' not in result:
            if 'claim_verification' in result:
                for claim in result.get('claim_verification', [])[:3]:
                    claim_id += 1
                    node_id = f"claim_{claim_id}"
                    nodes.append({
                        "id": node_id,
                        "label": claim.get('claim', 'Claim')[:30],
                        "group": 3
                    })
                    links.append({
                        "source": provider,
                        "target": node_id,
                        "value": 1
                    })
    
    return {"nodes": nodes, "links": links}

@api_router.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text(request: TextAnalysisRequest):
    """Analyze text content for misinformation"""
    try:
        ai_results = await analyze_text_with_ai(request.text)
        
        credibility_score = calculate_ensemble_score(ai_results)
        
        # Determine prediction based on score
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
                if 'reasoning' in result:
                    explanations.append(f"{provider.upper()}: {result['reasoning']}")
                elif 'detailed_analysis' in result:
                    explanations.append(f"{provider.upper()}: {result['detailed_analysis']}")
                elif 'explanation' in result:
                    explanations.append(f"{provider.upper()}: {result['explanation']}")
        
        explanation = " | ".join(explanations) if explanations else "Analysis completed by AI ensemble."
        
        # Extract highlighted segments
        highlighted_segments = []
        for provider, result in ai_results.items():
            if isinstance(result, dict) and 'suspicious_phrases' in result:
                for phrase in result['suspicious_phrases'][:5]:
                    highlighted_segments.append({
                        "text": phrase,
                        "reason": f"Flagged by {provider}"
                    })
        
        # Generate knowledge graph
        knowledge_graph = generate_knowledge_graph(request.text, ai_results)
        
        analysis_obj = AnalysisResult(
            content_type="text",
            content=request.text[:500],
            credibility_score=credibility_score,
            prediction=prediction,
            explanation=explanation[:1000],
            highlighted_segments=highlighted_segments,
            knowledge_graph=knowledge_graph,
            ai_provider_analysis=ai_results
        )
        
        # Save to database
        doc = analysis_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        return analysis_obj
    
    except Exception as e:
        logging.error(f"Error in text analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze image for manipulation and deepfakes"""
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Perform AI vision analysis
        ai_results = await analyze_image_with_ai(image_base64)
        
        # Perform technical analysis (edge detection, noise analysis)
        image = Image.open(io.BytesIO(contents))
        img_array = np.array(image.convert('RGB'))
        
        # Edge detection for manipulation
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Add technical analysis to results
        ai_results['technical_analysis'] = {
            "edge_density": float(edge_density),
            "image_size": image.size,
            "format": image.format or "Unknown"
        }
        
        credibility_score = calculate_ensemble_score(ai_results)
        
        if credibility_score >= 70:
            prediction = "Authentic"
        elif credibility_score >= 40:
            prediction = "Suspicious"
        else:
            prediction = "Manipulated"
        
        # Generate explanation
        explanations = []
        for provider, result in ai_results.items():
            if isinstance(result, dict) and 'error' not in result and provider != 'technical_analysis':
                if 'detailed_analysis' in result:
                    explanations.append(result['detailed_analysis'])
                elif 'reasoning' in result:
                    explanations.append(result['reasoning'])
        
        explanation = " | ".join(explanations) if explanations else "Image analysis completed."
        
        analysis_obj = AnalysisResult(
            content_type="image",
            content=f"Image: {file.filename}",
            credibility_score=credibility_score,
            prediction=prediction,
            explanation=explanation[:1000],
            ai_provider_analysis=ai_results
        )
        
        doc = analysis_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        return analysis_obj
    
    except Exception as e:
        logging.error(f"Error in image analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """Analyze video for deepfakes and manipulation"""
    try:
        contents = await file.read()
        
        # Save temporarily for processing
        temp_path = f"/tmp/{uuid.uuid4()}.mp4"
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        # Extract frames
        cap = cv2.VideoCapture(temp_path)
        frame_analyses = []
        frame_count = 0
        suspicious_frames = []
        
        # Analyze every 30th frame
        while cap.isOpened() and frame_count < 10:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % 30 == 0:
                # Convert frame to base64
                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Analyze frame with AI
                frame_ai_results = await analyze_image_with_ai(frame_base64)
                frame_score = calculate_ensemble_score(frame_ai_results)
                
                frame_analyses.append({
                    "frame_number": frame_count,
                    "score": frame_score
                })
                
                if frame_score < 50:
                    suspicious_frames.append(frame_count)
            
            frame_count += 1
        
        cap.release()
        os.remove(temp_path)
        
        # Calculate overall score
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
        logging.error(f"Error in video analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analysis/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str):
    """Get analysis by ID"""
    result = await db.analyses.find_one({"id": analysis_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if isinstance(result['timestamp'], str):
        result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    
    return result

@api_router.get("/history", response_model=List[AnalysisHistory])
async def get_history(limit: int = 20):
    """Get analysis history"""
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

@api_router.get("/")
async def root():
    return {"message": "TruthLens AI - Multimodal Misinformation Detection API"}

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