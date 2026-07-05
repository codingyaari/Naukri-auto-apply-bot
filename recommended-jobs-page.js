// ==================== naukri-job-enhancer.js ====================

if (window.location.href.includes("recommendedjobs")) {

  // ========== Inject interceptor into page context ==========
  const interceptorCode = `(function() {
    if (window.__naukriInterceptor) return;
    window.__naukriInterceptor = true;
    function isNaukriJobURL(url) { return url.includes("/jobapi/v2/search/recom-jobs"); }
    
    // Override fetch
    const _origFetch = window.fetch;
    window.fetch = async function(input, init) {
      const resp = await _origFetch.apply(this, arguments);
      try {
        const url = typeof input === 'string' ? input : (input.url || '');
        if (isNaukriJobURL(url)) {
          const clone = resp.clone();
          const data = await clone.json();
          window.dispatchEvent(new CustomEvent('naukriJobEvent', { detail: data }));
        }
      } catch(e) {}
      return resp;
    };

    // Override XHR
    const _origXHR = XMLHttpRequest.prototype;
    const origOpen = _origXHR.open;
    _origXHR.open = function(method, url) {
      this._naukriURL = url;
      return origOpen.apply(this, arguments);
    };
    const origSend = _origXHR.send;
    _origXHR.send = function(body) {
      this.addEventListener('load', function() {
        try {
          if (isNaukriJobURL(this._naukriURL) && this.status === 200) {
            const data = JSON.parse(this.responseText);
            window.dispatchEvent(new CustomEvent('naukriJobEvent', { detail: data }));
          }
        } catch(e) {}
      });
      return origSend.apply(this, arguments);
    };

    // Override Response.json
    const origJson = Response.prototype.json;
    Response.prototype.json = async function() {
      const data = await origJson.apply(this, arguments);
      try {
        if (isNaukriJobURL(this.url || '')) {
          window.dispatchEvent(new CustomEvent('naukriJobEvent', { detail: data }));
        }
      } catch(e) {}
      return data;
    };
  })();`;

  
  const script = document.createElement("script");
  script.textContent = interceptorCode;
  (document.head || document.documentElement).appendChild(script);
  script.remove();

  // ========== Content script listener ==========
  window.addEventListener("naukriJobEvent", (evt) => {
    const data = evt.detail;
    window.__lastJobData = data;
    insertData(data);
  });

  function formatCustomDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
  }

 
  function insertData(data) {
    const jobs = data?.jobDetails || data?.data || [];
    if (!Array.isArray(jobs)) return;

    const allCards = document.querySelectorAll("article.jobTuple");

    allCards.forEach((article, index) => {
      const jd = jobs[index];
      if (!jd) return;

      const posted = jd.createdDate ? formatCustomDate(jd.createdDate) : "N/A";
      const companyApply = jd.companyApplyJob;
      const applyUrl = jd.companyApplyUrl;
      const applyByTime = jd.applyByTime ?? "N/A";
      const jobId = jd.jobId || article.getAttribute("data-job-id") || jd.jobIdString || jd.id;

      const footer = article.querySelector(".jobTupleFooter");
      if (!footer) return;

      const cardId = article.getAttribute("data-job-id") || jobId || index;
      const insertId = `custom-insights-${cardId}`;
      const matchButtonId = `match-button-${cardId}`;
      const matchResultsId = `match-results-${cardId}`;

      if (document.getElementById(insertId)) return;

      const newRow = document.createElement("div");
      newRow.id = insertId;
      newRow.style.cssText = `
        display: block; width: 100%; margin-top: 8px;
        padding-top: 8px; border-top: 1px solid #e5e7eb;
      `;

      if (applyUrl) {
        article.style.backgroundColor = "ivory";
        article.style.border = "1px solid #1e9610";
      }

      let companyApplyHtml = "";
      const allowInstantApply = !applyUrl;
      if (companyApply && applyUrl) {
        companyApplyHtml = `
          <a href="${applyUrl}" target="_blank" title="Apply for this job" rel="noopener noreferrer" 
             style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border:1px solid #22c55e; border-radius:6px; background:#ecfdf5; color:#16a34a; font-weight:600; text-decoration:none;"
             onclick="event.stopImmediatePropagation(); event.stopPropagation();">
            <svg style="width:17px;height:17px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Apply Now</span> 
          </a>`;
      }

      const matchButtonHtml = jobId ? `
        <button id="${matchButtonId}" type="button"
          title="Match Score"
          style="display:inline-flex; align-items:center; justify-content:center; padding:8px; border:none; background: transparent; cursor:pointer; min-width:38px; min-height:38px;"
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;">
            <g stroke-width="0"></g>
            <g stroke-linecap="round" stroke-linejoin="round"></g>
            <g>
              <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
              <path d="M34 6.67564C39.978 10.1337 44 16.5972 44 24M34 6.67564V14M34 6.67564H41.3244M41.3244 34C37.8663 39.978 31.4028 44 24 44M41.3244 34H34M41.3244 34V41.3244M14 41.3244C8.02199 37.8663 4 31.4028 4 24M14 41.3244V34M14 41.3244H6.67564M6.67564 14C10.1337 8.02199 16.5972 4 24 4M6.67564 14H14M6.67564 14V6.67564" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </button>
      ` : "";

      newRow.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; width:100%;">
          <span style="display:inline-flex; align-items:center; gap:4px; color:#64748b; font-weight:500;">
            <svg style="width:15px;height:15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <b>Posted:</b> <span style="color:#1e293b;">${posted}</span>
          </span>

          <span style="display:inline-flex; align-items:center; gap:4px; color:#64748b; font-weight:500;">
            <svg style="width:17px;height:17px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <b>Best Time For Apply:</b> <span style="color:#dc2626;">${applyByTime}</span>
          </span>
          ${companyApplyHtml}
          ${matchButtonHtml}
        </div>
        <div id="${matchResultsId}" style="display:none; width:100%; margin-top:10px; min-height:30px; color:#475569; font-size:13px;"></div>
      `;

      if (allowInstantApply) {
        article.setAttribute('data-instant-apply', 'true');
      }
      footer.appendChild(newRow);
      // if instant-apply util is available, trigger it to add buttons immediately
      try {
        if (typeof insertInstantApplyButtons === 'function') {
          insertInstantApplyButtons();
        }
      } catch (e) {}
      article.style.height = "auto";
      article.style.minHeight = "0";
      article.style.maxHeight = "none";
      article.style.overflow = "visible";
      footer.style.overflow = "visible";

      if (jobId) {
        const button = newRow.querySelector(`#${matchButtonId}`);
        if (button) {
          button.addEventListener("click", async (event) => {
            event.stopImmediatePropagation();
            event.preventDefault();
            if (button.disabled) return;
            const handler = window.__naukriMatchScoreHandler;
            const resultsNode = document.getElementById(matchResultsId);
            if (typeof handler === "function") {
              handler(jobId, matchResultsId, matchButtonId);
            } else if (resultsNode) {
              resultsNode.textContent = "Match score module not ready yet.";
            }
          });
        }
      }
    });
  }

  // ========== Observer for SPA navigation ==========
  function startObserver() {
    if (!document.body) return setTimeout(startObserver, 500);

    const observer = new MutationObserver(() => {
      if (window.__lastJobData) {
        insertData(window.__lastJobData);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  setTimeout(startObserver, 1500);
}