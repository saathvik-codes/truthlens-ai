# TruthLens AI - Multimodal Misinformation Intelligence Platform

## Overview

TruthLens AI is a research-grade multimodal misinformation detection platform that provides not just detection, but detailed explanations, source tracing, and credibility intelligence powered by cutting-edge AI models.

## Key Features

### 🧠 Multimodal Detection Engine
- **Text Analysis**: Detect fake news and misleading claims in articles and social media
- **Image Forensics**: Identify manipulated photos and AI-generated imagery
- **Video Analysis**: Frame-by-frame deepfake detection with anomaly highlighting

### 🔍 Explainable AI
- Highlighted suspicious phrases and segments
- Detailed reasoning from multiple AI providers
- Visual heatmaps for manipulation detection
- Frame-level anomaly detection for videos

### 🌐 AI Ensemble Analysis
- **OpenAI GPT-5.2**: Advanced text and image analysis
- **Claude Sonnet 4.5**: Sophisticated fact-checking and reasoning
- **Gemini 3 Flash**: High-speed multimodal verification

### 📊 Credibility Scoring System
- 0-100 credibility score with color-coded indicators
- Green (≥70%): Reliable
- Yellow (40-69%): Suspicious  
- Red (<40%): Fake/Manipulated

### 🧬 Knowledge Graph Visualization
- Interactive network showing content relationships
- Source verification mapping
- Claim tracking and connections

### 📈 Analysis Dashboard
- Historical analysis tracking
- Statistical insights (total analyses, avg credibility, fake detected)
- Trend visualization

## Technology Stack

### Backend
- **FastAPI**: High-performance API framework
- **MongoDB**: Analysis data storage
- **EmergentIntegrations**: Unified LLM integration library
- **OpenCV**: Image and video processing
- **Pillow**: Image manipulation

### Frontend
- **React 19**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization
- **React Force Graph 2D**: Knowledge graph rendering
- **Shadcn/UI**: Component library

### AI Models
- OpenAI GPT-5.2 (text + vision)
- Claude Sonnet 4.5 (reasoning)
- Gemini 3 Flash (multimodal)

## API Endpoints

### Analysis
- `POST /api/analyze-text` - Analyze text content
- `POST /api/analyze-image` - Analyze images for manipulation
- `POST /api/analyze-video` - Deepfake video detection
- `GET /api/analysis/{id}` - Get specific analysis result
- `GET /api/history` - Retrieve analysis history

## Usage

### Text Analysis
1. Navigate to "Analyze" page
2. Select "Text" tab
3. Paste content (news article, social media post, etc.)
4. Click "Analyze Text"
5. View credibility score, prediction, and detailed explanations

### Image Analysis
1. Select "Image" tab
2. Drag-drop or browse to upload image
3. Click "Analyze Image"
4. Review authenticity score and manipulation indicators

### Video Analysis
1. Select "Video" tab
2. Upload video file
3. Click "Analyze Video"
4. View frame-by-frame analysis with suspicious frame timestamps

## Design Philosophy

**Swiss & High-Contrast Aesthetic**: Clean, functional, research-grade interface with:
- Cabinet Grotesk for headings (authoritative)
- IBM Plex Sans for body text (technical clarity)
- High contrast for data readability
- Minimal distractions
- Progressive disclosure of complex data

## Research Potential

This platform demonstrates:
- **Multimodal AI integration** across text, image, and video
- **Explainable AI** with transparent reasoning
- **Ensemble learning** from multiple LLM providers
- **Graph-based knowledge representation**
- **Real-time misinformation detection**

## Future Enhancements

1. **Chrome Extension** - Real-time social media fact-checking
2. **Twitter/X Integration** - Live tweet analysis
3. **Public API** - Developer access for integrations
4. **Alert System** - Automated misinformation notifications
5. **Enhanced Knowledge Graphs** - Deeper source mapping
6. **Claim Database** - Historical fact-check repository

## Credits

Built with Emergent AI Platform using state-of-the-art language models and computer vision techniques.

---

**Note**: This is a research and educational platform. Always verify critical information through multiple trusted sources.
