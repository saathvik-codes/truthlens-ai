const API_BASE = 'https://factcheck-explain.preview.emergentagent.com/api';

let selectedText = '';

// Check for selected text when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    
    if (result && result.trim().length > 0) {
      selectedText = result;
      showSelection(result);
    } else {
      document.getElementById('no-selection').style.display = 'block';
    }
  } catch (err) {
    document.getElementById('no-selection').style.display = 'block';
  }
});

function showSelection(text) {
  document.getElementById('no-selection').style.display = 'none';
  document.getElementById('selection-ready').style.display = 'block';
  document.getElementById('selected-preview').textContent = text.substring(0, 200) + (text.length > 200 ? '...' : '');
}

document.getElementById('analyze-btn')?.addEventListener('click', async () => {
  if (!selectedText) return;
  
  document.getElementById('selection-ready').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
  
  try {
    const response = await fetch(`${API_BASE}/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: selectedText,
        check_sources: true,
        extract_claims: false
      })
    });
    
    const data = await response.json();
    showResult(data);
  } catch (err) {
    alert('Analysis failed: ' + err.message);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('selection-ready').style.display = 'block';
  }
});

function showResult(data) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  
  const score = Math.round(data.credibility_score);
  const scoreEl = document.getElementById('score-value');
  scoreEl.textContent = `${score}%`;
  
  let color = '#00C853';
  if (score < 70) color = '#FFC107';
  if (score < 40) color = '#FF2A2A';
  scoreEl.style.color = color;
  
  const badge = document.getElementById('prediction-badge');
  badge.textContent = data.prediction;
  badge.className = 'prediction ' + data.prediction.toLowerCase();
  
  document.getElementById('explanation-text').textContent = data.explanation || 'Analysis completed.';
}

document.getElementById('new-analysis-btn')?.addEventListener('click', () => {
  document.getElementById('result').style.display = 'none';
  document.getElementById('selection-ready').style.display = 'block';
});
