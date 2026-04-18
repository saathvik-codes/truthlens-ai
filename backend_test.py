#!/usr/bin/env python3

import requests
import sys
import json
import base64
import io
from datetime import datetime
from PIL import Image
import numpy as np

class TruthLensAPITester:
    def __init__(self, base_url="https://factcheck-explain.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"name": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_text_analysis(self):
        """Test text analysis endpoint"""
        test_text = "Breaking: Scientists discover that vaccines contain microchips to control population. This shocking revelation proves government conspiracy theories."
        
        try:
            response = requests.post(
                f"{self.api_url}/analyze-text",
                json={"text": test_text, "check_sources": True},
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['id', 'content_type', 'credibility_score', 'prediction', 'explanation']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", Score: {data['credibility_score']:.1f}%, Prediction: {data['prediction']}"
                    
                    # Validate score range
                    if not (0 <= data['credibility_score'] <= 100):
                        success = False
                        details += f", Invalid score range: {data['credibility_score']}"
                    
                    # Validate prediction values
                    valid_predictions = ['Reliable', 'Suspicious', 'Fake']
                    if data['prediction'] not in valid_predictions:
                        success = False
                        details += f", Invalid prediction: {data['prediction']}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Text Analysis", success, details)
            return success, response.json() if success else None
            
        except Exception as e:
            self.log_test("Text Analysis", False, str(e))
            return False, None

    def create_test_image(self):
        """Create a simple test image in base64 format"""
        # Create a simple test image with some visual features
        img = Image.new('RGB', (200, 200), color='white')
        pixels = img.load()
        
        # Add some visual features (gradient and shapes)
        for i in range(200):
            for j in range(200):
                # Create a gradient with some shapes
                r = min(255, i + j)
                g = min(255, abs(i - j))
                b = min(255, (i * j) // 100)
                pixels[i, j] = (r % 256, g % 256, b % 256)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        img_data = buffer.getvalue()
        return img_data

    def test_image_analysis(self):
        """Test image analysis endpoint"""
        try:
            # Create test image
            img_data = self.create_test_image()
            
            files = {'file': ('test_image.jpg', img_data, 'image/jpeg')}
            response = requests.post(
                f"{self.api_url}/analyze-image",
                files=files,
                timeout=60
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['id', 'content_type', 'credibility_score', 'prediction']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", Score: {data['credibility_score']:.1f}%, Prediction: {data['prediction']}"
                    
                    # Validate content type
                    if data['content_type'] != 'image':
                        success = False
                        details += f", Wrong content type: {data['content_type']}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Image Analysis", success, details)
            return success, response.json() if success else None
            
        except Exception as e:
            self.log_test("Image Analysis", False, str(e))
            return False, None

    def create_test_video(self):
        """Create a simple test video file"""
        # For testing purposes, we'll create a minimal MP4-like file
        # In a real scenario, you'd use a proper video file
        # This is a placeholder that simulates video data
        video_header = b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom'
        video_data = video_header + b'\x00' * 1000  # Minimal video-like data
        return video_data

    def test_video_analysis(self):
        """Test video analysis endpoint"""
        try:
            # Create test video data
            video_data = self.create_test_video()
            
            files = {'file': ('test_video.mp4', video_data, 'video/mp4')}
            response = requests.post(
                f"{self.api_url}/analyze-video",
                files=files,
                timeout=120  # Video analysis takes longer
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['id', 'content_type', 'credibility_score', 'prediction']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", Score: {data['credibility_score']:.1f}%, Prediction: {data['prediction']}"
                    
                    # Validate content type
                    if data['content_type'] != 'video':
                        success = False
                        details += f", Wrong content type: {data['content_type']}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Video Analysis", success, details)
            return success, response.json() if success else None
            
        except Exception as e:
            self.log_test("Video Analysis", False, str(e))
            return False, None

    def test_history_endpoint(self):
        """Test analysis history endpoint"""
        try:
            response = requests.get(f"{self.api_url}/history", timeout=30)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    details += f", History items: {len(data)}"
                    
                    # If there are items, validate structure
                    if len(data) > 0:
                        item = data[0]
                        required_fields = ['id', 'content_type', 'credibility_score', 'prediction', 'timestamp']
                        missing_fields = [field for field in required_fields if field not in item]
                        
                        if missing_fields:
                            success = False
                            details += f", Missing fields in history item: {missing_fields}"
                else:
                    success = False
                    details += f", Expected list, got: {type(data)}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("History Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("History Endpoint", False, str(e))
            return False

    def test_analysis_retrieval(self, analysis_id):
        """Test retrieving specific analysis by ID"""
        if not analysis_id:
            self.log_test("Analysis Retrieval", False, "No analysis ID provided")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/analysis/{analysis_id}", timeout=30)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['id', 'content_type', 'credibility_score', 'prediction']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", Retrieved analysis: {data['id']}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Analysis Retrieval", success, details)
            return success
            
        except Exception as e:
            self.log_test("Analysis Retrieval", False, str(e))
            return False

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting TruthLens AI API Tests")
        print("=" * 50)
        
        # Test API availability
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test text analysis
        text_success, text_result = self.test_text_analysis()
        analysis_id = text_result.get('id') if text_result else None
        
        # Test image analysis
        self.test_image_analysis()
        
        # Test video analysis (may fail due to video processing complexity)
        self.test_video_analysis()
        
        # Test history endpoint
        self.test_history_endpoint()
        
        # Test analysis retrieval if we have an ID
        if analysis_id:
            self.test_analysis_retrieval(analysis_id)
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 70  # Consider 70% success rate as acceptable

def main():
    tester = TruthLensAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())