// Content script - runs on every page
// Adds a floating badge for quick analysis on selection

let badge = null;

document.addEventListener('mouseup', () => {
  const selection = window.getSelection().toString().trim();
  
  if (selection.length > 20) {
    showBadge();
  } else {
    hideBadge();
  }
});

document.addEventListener('mousedown', (e) => {
  if (badge && !badge.contains(e.target)) {
    hideBadge();
  }
});

function showBadge() {
  if (badge) return;
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  badge = document.createElement('div');
  badge.id = 'truthlens-badge';
  badge.innerHTML = `
    <div style="
      position: fixed;
      top: ${rect.top + window.scrollY - 40}px;
      left: ${rect.left + window.scrollX}px;
      background: linear-gradient(135deg, #0A0A0A 0%, #002FA7 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      font-family: -apple-system, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    " id="truthlens-btn">
      🔍 Verify with TruthLens
    </div>
  `;
  
  document.body.appendChild(badge);
  
  document.getElementById('truthlens-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'analyze',
      text: selection.toString()
    });
  });
}

function hideBadge() {
  if (badge) {
    badge.remove();
    badge = null;
  }
}
