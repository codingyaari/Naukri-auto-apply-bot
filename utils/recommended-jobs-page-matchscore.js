// Standalone match score renderer for recommended jobs page

 function ensureMatchSpinnerStyles() {
    if (window.__naukriMatchSpinnerStyles) return;
    window.__naukriMatchSpinnerStyles = true;
    const style = document.createElement("style");
    style.textContent = `@keyframes naukri-match-spinner-rotate { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  async function fetchMatchScore(jobId) {
    if (!jobId) return null;
    try {
      const url = `https://www.naukri.com/jobapi/v3/job/${encodeURIComponent(jobId)}/matchscore`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          accept: "*/*",
          appid: "121",
          systemid: "Naukri",
        },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return { error: body?.message || `HTTP ${response.status}` };
      }
      return body;
    } catch (e) {
      return { error: e.message || "Fetch failed" };
    }
  }

  window.__naukriMatchScoreHandler = async function(jobId, resultContainerId, buttonId) {
    if (!jobId || !resultContainerId) return;
    ensureMatchSpinnerStyles();

    const resultsNode = document.getElementById(resultContainerId);
    const button = buttonId ? document.getElementById(buttonId) : null;
    if (!resultsNode) return;

    if (button) {
      button.disabled = true;
      button.style.opacity = "0.65";
      button.style.cursor = "not-allowed";
      button.innerHTML = getMatchButtonSvg(true);
    }

    // resultsNode.innerHTML = `
    //   <div style="display:inline-flex; align-items:center; gap:8px; color:#475569; font-size:12px;">
       
    //   </div>
    // `;

    const result = await fetchMatchScore(jobId);

    if (button) {
      button.disabled = false;
      button.style.opacity = "";
      button.style.cursor = "pointer";
      button.innerHTML = getMatchButtonSvg(false);
    }

    resultsNode.innerHTML = renderMatchScore(result);
    resultsNode.style.display = "block";
  };

  
function getMatchButtonSvg(isLoading) {
  if (isLoading) {
    return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px; animation:naukri-match-spinner-rotate 1s linear infinite;">
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
        <path d="M34 6.67564C39.978 10.1337 44 16.5972 44 24M34 6.67564V14M34 6.67564H41.3244M41.3244 34C37.8663 39.978 31.4028 44 24 44" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;">
    <g stroke-width="0"></g>
    <g stroke-linecap="round" stroke-linejoin="round"></g>
    <g>
      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
      <path d="M34 6.67564C39.978 10.1337 44 16.5972 44 24M34 6.67564V14M34 6.67564H41.3244M41.3244 34C37.8663 39.978 31.4028 44 24 44M41.3244 34H34M41.3244 34V41.3244M14 41.3244C8.02199 37.8663 4 31.4028 4 24M14 41.3244V34M14 41.3244H6.67564M6.67564 14C10.1337 8.02199 16.5972 4 24 4M6.67564 14H14M6.67564 14V6.67564" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M41.3244 34C37.8663 39.978 31.4028 44 24 44M41.3244 34H34M41.3244 34V41.3244" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 41.3244C8.02199 37.8663 4 31.4028 4 24M14 41.3244V34M14 41.3244H6.67564" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.67566 14C10.1338 8.02199 16.5972 4 24 4M6.67566 14H14M6.67566 14V6.67564" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M34 6.67578C39.978 10.1339 44 16.5973 44 24.0001M34 6.67578V14.0001M34 6.67578H41.3244" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

function renderMatchScore(result) {
  if (!result || typeof result !== "object") {
    return `<div style="color:#b91c1c; font-size:12px;">Match data unavailable</div>`;
  }

  if (result.error) {
    return `<div style="color:#b91c1c; font-size:12px;">${result.error}</div>`;
  }

  const fields = [
    { key: "earlyApplicant", label: "Early Applicant" },
    { key: "Keyskills", label: "Keyskills", isScore: true },
    { key: "location", label: "Location" },
    { key: "workExperience", label: "Work Experience" },
  ];

  const entries = fields
    .map(({ key, label, isScore }) => {
      const value = result[key];
      if (value == null) return null;

      const passed = isScore ? Number(value) > 0 : Boolean(value);
      const text = isScore ? `${label}: ${value}` : label;
      const textColor = "#000000";
      const iconSvg = passed
        ? `<svg viewBox="-61.44 -61.44 1146.88 1146.88" xmlns="http://www.w3.org/2000/svg" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border-radius:7px"><path fill="rgb(62 179 81)" d="M-61.44 -61.44h1146.88v1146.88H-61.44z"/><path fill="#ffffff" d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04-316.8-316.8a64 64 0 0 1 0-90.496z"/></svg>`
        : `<svg fill="#000000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border-radius:7px"><path d="M10,1a9,9,0,1,0,9,9A9,9,0,0,0,10,1Zm0,16.4A7.4,7.4,0,1,1,17.4,10,7.41,7.41,0,0,1,10,17.4ZM13.29,5.29,10,8.59,6.71,5.29,5.29,6.71,8.59,10l-3.3,3.29,1.42,1.42L10,11.41l3.29,3.3,1.42-1.42L11.41,10l3.3-3.29Z"/></svg>`;

      return `<div style="display:inline-flex; align-items:center; gap:6px; margin:4px 4px 0 0; border:none; color:${textColor}; font-size:13px; font-weight:600; background:transparent;">
        ${iconSvg}
        <span style="color:${textColor};">${text}</span>
      </div>`;
    })
    .filter(Boolean);

  if (!entries.length) {
    return `<div style="color:#475569; font-size:12px;">No match score details available.</div>`;
  }

  return `
    <div style="width:100%; margin-top:10px;">
      <div style="display:flex; flex-wrap:wrap; gap:6px;">${entries.join("")}</div>
    </div>
  `;
}
