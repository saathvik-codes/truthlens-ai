#!/usr/bin/env python3
"""
TruthLens AI Enhanced Features Test Suite
Tests: weighted ensemble scoring, Wikipedia source verification, claim extraction/tracking, stats endpoint
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://factcheck-explain.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"


class TestAPIRoot:
    """Basic API accessibility tests"""
    
    def test_api_root_accessible(self):
        """Test API root endpoint returns 200"""
        response = requests.get(f"{API_URL}/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "TruthLens" in data["message"]
        print(f"API Root: {data['message']}")


class TestStatsEndpoint:
    """Tests for GET /api/stats endpoint"""
    
    def test_stats_endpoint_returns_200(self):
        """Test stats endpoint is accessible"""
        response = requests.get(f"{API_URL}/stats", timeout=30)
        assert response.status_code == 200
        data = response.json()
        print(f"Stats response: {data}")
    
    def test_stats_contains_required_fields(self):
        """Test stats response contains all required fields"""
        response = requests.get(f"{API_URL}/stats", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "total_analyses" in data, "Missing total_analyses field"
        assert "total_claims_tracked" in data, "Missing total_claims_tracked field"
        assert "prediction_distribution" in data, "Missing prediction_distribution field"
        assert "content_type_distribution" in data, "Missing content_type_distribution field"
        
        # Validate types
        assert isinstance(data["total_analyses"], int), "total_analyses should be int"
        assert isinstance(data["total_claims_tracked"], int), "total_claims_tracked should be int"
        assert isinstance(data["prediction_distribution"], list), "prediction_distribution should be list"
        assert isinstance(data["content_type_distribution"], list), "content_type_distribution should be list"
        
        print(f"Total analyses: {data['total_analyses']}, Total claims: {data['total_claims_tracked']}")
    
    def test_stats_prediction_distribution_structure(self):
        """Test prediction_distribution has correct structure"""
        response = requests.get(f"{API_URL}/stats", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        for item in data["prediction_distribution"]:
            assert "label" in item, "prediction_distribution item missing 'label'"
            assert "count" in item, "prediction_distribution item missing 'count'"
            assert isinstance(item["count"], int), "count should be int"
        
        print(f"Prediction distribution: {data['prediction_distribution']}")
    
    def test_stats_content_type_distribution_structure(self):
        """Test content_type_distribution has correct structure"""
        response = requests.get(f"{API_URL}/stats", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        for item in data["content_type_distribution"]:
            assert "label" in item, "content_type_distribution item missing 'label'"
            assert "count" in item, "content_type_distribution item missing 'count'"
            assert isinstance(item["count"], int), "count should be int"
        
        print(f"Content type distribution: {data['content_type_distribution']}")


class TestRecentClaimsEndpoint:
    """Tests for GET /api/claims/recent endpoint"""
    
    def test_claims_recent_returns_200(self):
        """Test claims/recent endpoint is accessible"""
        response = requests.get(f"{API_URL}/claims/recent", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Recent claims count: {len(data)}")
    
    def test_claims_recent_with_limit(self):
        """Test claims/recent with limit parameter"""
        response = requests.get(f"{API_URL}/claims/recent?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) <= 5, "Should respect limit parameter"
        print(f"Claims with limit=5: {len(data)}")
    
    def test_claims_recent_structure(self):
        """Test claims/recent response structure"""
        response = requests.get(f"{API_URL}/claims/recent", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            claim = data[0]
            # Check expected fields
            assert "id" in claim, "Claim missing 'id'"
            assert "claim_text" in claim, "Claim missing 'claim_text'"
            assert "verdict" in claim, "Claim missing 'verdict'"
            assert "analysis_id" in claim, "Claim missing 'analysis_id'"
            assert "timestamp" in claim, "Claim missing 'timestamp'"
            print(f"Sample claim: {claim['claim_text'][:50]}... - {claim['verdict']}")
        else:
            print("No claims in database yet")


class TestEnhancedTextAnalysis:
    """Tests for enhanced POST /api/analyze-text endpoint with weighted scoring and claim extraction"""
    
    def test_text_analysis_returns_weighted_score(self):
        """Test text analysis returns weighted_score field"""
        test_text = "The Earth is approximately 4.5 billion years old according to scientific research."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90  # AI calls take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check weighted_score field
        assert "weighted_score" in data, "Missing weighted_score field"
        assert isinstance(data["weighted_score"], (int, float)), "weighted_score should be numeric"
        assert 0 <= data["weighted_score"] <= 100, f"weighted_score out of range: {data['weighted_score']}"
        
        print(f"Weighted score: {data['weighted_score']}")
    
    def test_text_analysis_returns_confidence_interval(self):
        """Test text analysis returns confidence_interval field"""
        test_text = "Water boils at 100 degrees Celsius at sea level."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check confidence_interval field
        assert "confidence_interval" in data, "Missing confidence_interval field"
        if data["confidence_interval"]:
            assert "lower" in data["confidence_interval"], "confidence_interval missing 'lower'"
            assert "upper" in data["confidence_interval"], "confidence_interval missing 'upper'"
            assert data["confidence_interval"]["lower"] <= data["confidence_interval"]["upper"], "Invalid interval"
            print(f"Confidence interval: {data['confidence_interval']['lower']:.1f}% - {data['confidence_interval']['upper']:.1f}%")
    
    def test_text_analysis_returns_agreement_score(self):
        """Test text analysis returns agreement_score field"""
        test_text = "The speed of light is approximately 299,792 kilometers per second."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check agreement_score field
        assert "agreement_score" in data, "Missing agreement_score field"
        if data["agreement_score"] is not None:
            assert isinstance(data["agreement_score"], (int, float)), "agreement_score should be numeric"
            assert 0 <= data["agreement_score"] <= 100, f"agreement_score out of range: {data['agreement_score']}"
            print(f"Agreement score: {data['agreement_score']}")
    
    def test_text_analysis_extracts_claims(self):
        """Test text analysis with extract_claims=true returns extracted_claims array"""
        test_text = "Albert Einstein developed the theory of relativity. The Eiffel Tower is located in Paris, France."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check extracted_claims field
        assert "extracted_claims" in data, "Missing extracted_claims field"
        assert isinstance(data["extracted_claims"], list), "extracted_claims should be a list"
        
        if len(data["extracted_claims"]) > 0:
            claim = data["extracted_claims"][0]
            assert "claim" in claim, "Claim missing 'claim' field"
            print(f"Extracted {len(data['extracted_claims'])} claims")
            for c in data["extracted_claims"][:3]:
                print(f"  - {c.get('claim', 'N/A')[:60]}...")
    
    def test_text_analysis_wikipedia_verification(self):
        """Test text analysis includes Wikipedia source verification"""
        test_text = "Mount Everest is the tallest mountain on Earth, located in the Himalayas."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check source_verification field
        assert "source_verification" in data, "Missing source_verification field"
        
        if data["source_verification"]:
            assert "total_claims" in data["source_verification"], "source_verification missing 'total_claims'"
            assert "verified" in data["source_verification"], "source_verification missing 'verified'"
            assert "verification_rate" in data["source_verification"], "source_verification missing 'verification_rate'"
            print(f"Source verification: {data['source_verification']['verified']}/{data['source_verification']['total_claims']} verified")
        
        # Check claims have verification data
        if len(data.get("extracted_claims", [])) > 0:
            for claim in data["extracted_claims"]:
                if "verification" in claim and claim["verification"]:
                    if claim["verification"].get("wikipedia_found"):
                        print(f"  Wikipedia verified: {claim.get('claim', 'N/A')[:50]}...")
                        if claim["verification"].get("sources"):
                            for src in claim["verification"]["sources"][:1]:
                                print(f"    Source: {src.get('title', 'N/A')}")
    
    def test_text_analysis_all_enhanced_fields(self):
        """Comprehensive test for all enhanced fields in text analysis response"""
        test_text = "NASA landed astronauts on the Moon in 1969 during the Apollo 11 mission. Neil Armstrong was the first person to walk on the Moon."
        
        response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": True, "extract_claims": True},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields
        required_fields = [
            "id", "content_type", "content", "credibility_score", "weighted_score",
            "confidence_interval", "prediction", "explanation", "highlighted_segments",
            "source_verification", "extracted_claims", "knowledge_graph", "timestamp",
            "ai_provider_analysis", "agreement_score"
        ]
        
        missing_fields = [f for f in required_fields if f not in data]
        assert len(missing_fields) == 0, f"Missing fields: {missing_fields}"
        
        # Validate content_type
        assert data["content_type"] == "text", f"Expected content_type 'text', got '{data['content_type']}'"
        
        # Validate prediction
        valid_predictions = ["Reliable", "Suspicious", "Fake"]
        assert data["prediction"] in valid_predictions, f"Invalid prediction: {data['prediction']}"
        
        print(f"All enhanced fields present. Score: {data['credibility_score']:.1f}%, Prediction: {data['prediction']}")


class TestHistoryEndpoint:
    """Tests for GET /api/history endpoint"""
    
    def test_history_returns_200(self):
        """Test history endpoint is accessible"""
        response = requests.get(f"{API_URL}/history", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"History items: {len(data)}")
    
    def test_history_item_structure(self):
        """Test history items have correct structure"""
        response = requests.get(f"{API_URL}/history", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            required_fields = ["id", "content_type", "credibility_score", "prediction", "timestamp"]
            missing_fields = [f for f in required_fields if f not in item]
            assert len(missing_fields) == 0, f"Missing fields in history item: {missing_fields}"
            print(f"Latest: {item['content_type']} - {item['prediction']} ({item['credibility_score']:.1f}%)")


class TestAnalysisRetrieval:
    """Tests for GET /api/analysis/{id} endpoint"""
    
    def test_analysis_retrieval_by_id(self):
        """Test retrieving analysis by ID"""
        # First create an analysis
        test_text = "Test content for retrieval verification."
        
        create_response = requests.post(
            f"{API_URL}/analyze-text",
            json={"text": test_text, "check_sources": False, "extract_claims": False},
            headers={"Content-Type": "application/json"},
            timeout=90
        )
        
        if create_response.status_code != 200:
            pytest.skip("Could not create analysis for retrieval test")
        
        analysis_id = create_response.json().get("id")
        assert analysis_id, "No ID in create response"
        
        # Now retrieve it
        get_response = requests.get(f"{API_URL}/analysis/{analysis_id}", timeout=30)
        assert get_response.status_code == 200
        
        data = get_response.json()
        assert data["id"] == analysis_id, "Retrieved ID doesn't match"
        print(f"Successfully retrieved analysis: {analysis_id}")
    
    def test_analysis_retrieval_not_found(self):
        """Test 404 for non-existent analysis"""
        response = requests.get(f"{API_URL}/analysis/non-existent-id-12345", timeout=30)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returns 404 for non-existent analysis")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
