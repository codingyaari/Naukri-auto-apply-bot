// ==================== naukri-job-enhancer.js (Search Pages) ====================

if (window.location.pathname.includes("-jobs")) {

  // ========== INTERCEPTOR ==========
  const interceptorCode = `(function() {
    if (window.__naukriInterceptor) return;
    window.__naukriInterceptor = true;

    function isNaukriJobURL(url) {
      return url.includes("/jobapi/v3/search");
    }

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

    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._url = url;
      return origOpen.apply(this, arguments);
    };

    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
      this.addEventListener('load', function() {
        try {
          if (this._url?.includes("/jobapi/v3/search")) {
            const data = JSON.parse(this.responseText);
            window.dispatchEvent(new CustomEvent('naukriJobEvent', { detail: data }));
          }
        } catch(e) {}
      });
      return origSend.apply(this, arguments);
    };
  })();`;

  const script = document.createElement("script");
  script.textContent = interceptorCode;
  document.documentElement.appendChild(script);
  script.remove();

  // ========== DATE FORMAT ==========
  function formatCustomDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  let lastProcessedDataHash = "";

   // ========== MAIN INSERT FUNCTION ==========

  // ========== MAIN INSERT FUNCTION ==========
  function insertData(data) {
    const jobs = data?.jobDetails || [];
    if (!Array.isArray(jobs) || jobs.length === 0) return;

    const jobMap = {};
    jobs.forEach(j => { jobMap[j.jobId] = j; });

    const allCards = document.querySelectorAll(".srp-jobtuple-wrapper");

    allCards.forEach(article => {
      const cardId = article.getAttribute("data-job-id");
      const jd = jobMap[cardId];
      if (!jd) return;

      // Remove Naukri save icon from filter cards
      article.querySelectorAll('.ni-job-tuple-icon.ni-job-tuple-icon-srpSaveUnfilled.un-saved.save-job-tag').forEach(el => el.remove());

      // Try multiple possible footer locations
      let footer = article.querySelector(".row6") || 
                   article.querySelector(".jobTupleFooter") || 
                   article.querySelector(".bottom-section") ||
                   article.querySelector("div:last-child");

      if (!footer) {
        footer = article; 
      }

      const insertId = `custom-${cardId}`;
      if (document.getElementById(insertId)) return;

      const posted = jd.createdDate ? formatCustomDate(jd.createdDate) : "N/A";
      const companyApply = jd.companyApplyJob;
      const applyUrl = jd.companyApplyUrl;
      const allowInstantApply = !applyUrl;
      const matchButtonId = `match-button-${cardId}`;
      const matchResultsId = `match-results-${cardId}`;
      const applyByTime = jd.applyByTime ?? "N/A";
      const applyfooterLabel = jd.footerPlaceholderLabel.toLowerCase().includes('ago')

      // Highlight the main card
      const mainCard = article.querySelector(".cust-job-tuple") || article;
      if (applyUrl && mainCard) {
        mainCard.style.backgroundColor = "ivory";
        mainCard.style.border = "1px solid #999966";
       
      }

      const newRow = document.createElement("div");
      newRow.id = insertId;
      const rowWidth = applyUrl ? "100%" : "83%";
      newRow.style.cssText = `
        display: block;
        width: ${rowWidth};
        margin: 0px 5px;
        font-size: 13.2px;
      `;

      let companyApplyHtml = "";
      let matchButtonHtml = "";
      
      if (companyApply && applyUrl) {
        companyApplyHtml = `
          <a href="${applyUrl}" target="_blank" title="Apply for this job" rel="noopener noreferrer" 
             onclick="event.stopImmediatePropagation(); event.stopPropagation();"
             style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; 
                    border:1.5px solid #22c55e; border-radius:8px; background:#ecfdf5; 
                    color:#16a34a; font-weight:700; text-decoration:none; z-index:30;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>${applyfooterLabel?'Apply':'Apply Now'}</span>
          </a>`;
      }

      if (cardId) {
        matchButtonHtml = `
          <button id="${matchButtonId}" type="button"
            title="Match Score"
            style="display:inline-flex; align-items:center; justify-content:center; padding:8px; border:none; background:transparent; cursor:pointer; min-width:38px; min-height:38px;"
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
        `;
      }

      newRow.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; width:100%;">
          <span style="display:inline-flex; align-items:center; gap:5px; color:#64748b;">
            <svg style="width:15px;height:15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <b>Posted:</b> <span style="color:#1e293b;">${posted}</span>
          </span>

          <span style="display:inline-flex; align-items:center; gap:5px; color:#64748b;">
            <svg style="width:15px;height:15px;color:#ef4444" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <b>BestApply:</b> <span style="color:#dc2626;">${applyByTime}</span>
          </span>
          ${companyApplyHtml}
          ${matchButtonHtml}
        </div>
        <div id="${matchResultsId}" style="display:none; width:100%; margin-top:10px; min-height:30px; color:#475569; font-size:13px;"></div>
      `;

      if (allowInstantApply) {
        article.dataset.instantApply = 'true';
      }

      const saveButtonCandidate = Array.from(footer.querySelectorAll('button, a')).find(el => {
        const text = (el.innerText || el.title || el.getAttribute('aria-label') || '').toLowerCase();
        return /save|bookmark|follow/.test(text);
      });
      if (saveButtonCandidate) {
        const saveRow = saveButtonCandidate.closest('div') || saveButtonCandidate;
        saveRow.insertAdjacentElement('beforebegin', newRow);
      } else {
        footer.appendChild(newRow);
      }


      try {
        if (typeof insertInstantApplyButtons === 'function') {
          insertInstantApplyButtons();
        }
      } catch (e) {}

      const button = newRow.querySelector(`#${matchButtonId}`);
      if (button) {
        button.addEventListener('click', (event) => {
          event.stopImmediatePropagation();
          event.preventDefault();
          if (button.disabled) return;
          const handler = window.__naukriMatchScoreHandler;
          const resultsNode = document.getElementById(matchResultsId);
          if (typeof handler === 'function') {
            handler(cardId, matchResultsId, matchButtonId);
          } else if (resultsNode) {
            resultsNode.textContent = 'Match score module not ready yet.';
          }
        });
      }
    });
  }

  // ========== EVENT LISTENER ==========
  window.addEventListener("naukriJobEvent", (evt) => {
    const data = evt.detail;
    window.__lastJobData = data;
    setTimeout(() => {
      insertData(data);
    }, 800);     
  });

  // ========== OBSERVER (Debounced) ==========
  function startObserver() {
    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (window.__lastJobData) {
          insertData(window.__lastJobData);
        }
      }, 800);
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Start
  setTimeout(startObserver, 1200);
}