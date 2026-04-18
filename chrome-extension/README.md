# TruthLens AI Chrome Extension

Real-time misinformation detection for any webpage using AI-powered multimodal analysis.

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `/app/chrome-extension` folder
5. The TruthLens AI extension will appear in your toolbar

## How to Use

### Method 1: Select & Verify
1. Select any text on a webpage
2. A "Verify with TruthLens" badge will appear above your selection
3. Click to open the analysis popup

### Method 2: Right-Click Menu
1. Select any text
2. Right-click and choose "Analyze with TruthLens AI"
3. View instant credibility analysis

### Method 3: Toolbar Icon
1. Select text on a page
2. Click the TruthLens AI icon in your toolbar
3. Click "Analyze Selection"

## Features

- **Instant Analysis**: Real-time credibility scoring (0-100%)
- **AI Ensemble**: Powered by OpenAI, Claude, and Gemini
- **Visual Feedback**: Color-coded predictions (Reliable/Suspicious/Fake)
- **Detailed Explanations**: Multi-model reasoning
- **Floating Badge**: Appears on text selection

## API Connection

Connects to: `https://factcheck-explain.preview.emergentagent.com/api`

## Icons

Place icon files in extension folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)
