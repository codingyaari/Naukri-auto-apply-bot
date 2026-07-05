if (window.location.href.includes("naukri.com/job-listings")) {
    // ========== ONE Interceptor — Dono URLs handle karta hai ==========
    const interceptorCode = `(function() {
    if (window.__naukriInterceptor) return;
    window.__naukriInterceptor = true;

    function isJDUrl(url)  { return url.includes("/jobapi/v4/job/"); }
    function isSimUrl(url) { return url.includes("/jobapi/v2/search/simjobs"); }

    // ===== Override Fetch =====
    const _origFetch = window.fetch;
    window.fetch = async function(input, init) {
      const resp = await _origFetch.apply(this, arguments);
      try {
        const url = typeof input === 'string' ? input : (input.url || '');

        if (isJDUrl(url)) {
          const clone = resp.clone();
          const data = await clone.json();
          window.dispatchEvent(new CustomEvent('naukriJDEvent', { detail: data }));
        }

        if (isSimUrl(url)) {
          const clone = resp.clone();
          const data = await clone.json();
          window.dispatchEvent(new CustomEvent('naukriSimEvent', { detail: data }));
        }

      } catch(e) {}
      return resp;
    };

    // ===== Override XHR =====
    const _origOpen = XMLHttpRequest.prototype.open;
    const _origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._interceptURL = url;
      return _origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
      this.addEventListener('load', function() {
        try {
          const url = this._interceptURL || '';
          if (this.status === 200) {
            const data = JSON.parse(this.responseText);
            if (isJDUrl(url))  window.dispatchEvent(new CustomEvent('naukriJDEvent',  { detail: data }));
            if (isSimUrl(url)) window.dispatchEvent(new CustomEvent('naukriSimEvent', { detail: data }));
          }
        } catch(e) {}
      });
      return _origSend.apply(this, arguments);
    };

    // ===== Override Response.json (catch-all) =====
    const origJson = Response.prototype.json;
    Response.prototype.json = async function() {
      const data = await origJson.apply(this, arguments);
      try {
        const url = this.url || '';
        if (isJDUrl(url))  window.dispatchEvent(new CustomEvent('naukriJDEvent',  { detail: data }));
        if (isSimUrl(url)) window.dispatchEvent(new CustomEvent('naukriSimEvent', { detail: data }));
      } catch(e) {}
      return data;
    };

  })();`;

    const script = document.createElement("script");
    script.textContent = interceptorCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();

    // ========== Shared: Date Formatter ==========
    function formatCustomDate(dateStr) {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        let month = d.getMonth() + 1;
        let day = d.getDate();
        let year = d.getFullYear();
        let hours = d.getHours();
        let minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
    }

    // =====================================================
    // ========== JD Page — Job Detail Panel ==========
    // =====================================================

    window.addEventListener("naukriJDEvent", (evt) => {
        window.__lastJobData = evt.detail;
        insertJDData(evt.detail);
    });

    function insertJDData(data) {
        const jd = data.jobDetails || {};

        const posted = formatCustomDate(jd.createdDate);
        const applied = jd.applyDate
            ? formatCustomDate(jd.applyDate)
            : "Not Applied";

        const statsContainer = document.querySelector(
            ".styles_jhc__jd-stats__KrId0",
        );
        if (!statsContainer) return;

        if (document.getElementById("custom-insights")) return;

        const newRow = document.createElement("div");
        newRow.id = "custom-insights";
        newRow.style.marginTop = "6px";

        newRow.innerHTML = `
      <div style="height: 3px;"></div>

      <span class="styles_jhc__stat__PgY67" style="display:inline-flex;align-items:center;gap:4px;margin-right:5px;">
        <svg style="width:15px;height:15px;color:#3b82f6;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <label style="color:#2563eb;font-weight:600;margin:0;">Applicants:</label>
        <span style="color:#1d4ed8;font-weight:700;">${jd.applyCount || 0}</span>
      </span>

      <span class="styles_jhc__stat__PgY67" style="display:inline-flex;align-items:center;gap:4px;margin-right:5px;">
        <svg style="width:15px;height:15px;color:#f97316;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <label style="color:#ea580c;font-weight:600;margin:0;">Page Views:</label>
        <span style="color:#c2410c;font-weight:700;">${jd.viewCount || 0}</span>
      </span>

      <span class="styles_jhc__stat__PgY67" style="display:inline-flex;align-items:center;gap:4px;margin-right:15px;">
        <svg style="width:15px;height:15px;color:#64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
        <label style="color:#64748b;font-weight:500;margin:0;">JobType:</label>
        <span style="color:#1e293b;font-weight:600;">${jd.jobType || "N/A"}</span>
      </span>

      <br/><div style="height:6px;"></div>

      <span class="styles_jhc__stat__PgY67" style="display:inline-flex;align-items:center;gap:4px;margin-right:1px;">
        <svg style="width:15px;height:15px;color:#64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <label style="color:#64748b;font-weight:500;margin:0;">Posted:</label>
        <span style="color:#1e293b;font-weight:600;">${posted}</span>
      </span>

      <span class="styles_jhc__stat__PgY67" style="display:inline-flex;align-items:center;gap:4px;margin-right:1px;">
        <svg style="width:15px;height:15px;color:#10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="m9 15 2 2 4-4"></path>
        </svg>
        <label style="color:#64748b;font-weight:500;margin:0;">You Applied:</label>
        <span style="color:#1e293b;font-weight:600;">${applied}</span>
      </span>
    `;

        statsContainer.appendChild(newRow);
    }

    // =====================================================
    // ========== SimJobs — Job Cards List ==========
    // =====================================================

    window.addEventListener("naukriSimEvent", (evt) => {
        window.__lastSimJobData = evt.detail;
        insertSimData(evt.detail);
    });

    function insertSimData(data) {
        const jobs = data?.simJobDetails || {};
        const contentData = jobs?.content || [];
        const collabData = jobs?.collaborative || [];
        insertSimCardsToHtml(contentData);
        insertcollabDataToHtml(collabData);
    }

    function insertSimCardsToHtml(contentData) {
        if (!Array.isArray(contentData) || !contentData.length) return;

        const allCards = document.querySelectorAll(
            ".styles_SJB__container__0gNlz article[data-job-id]",
        );
        if (!allCards.length) return;

        // jobId -> job data map
        const jobMap = {};
        contentData.forEach((job) => {
            if (job?.jobId) jobMap[String(job.jobId)] = job;
        });

        allCards.forEach((article) => {
            const cardId = article.getAttribute("data-job-id");
            const jd = jobMap[String(cardId)];
            if (!jd) return;

            const posted = jd.createdDate ? formatCustomDate(jd.createdDate) : "N/A";
            const companyApply = jd.companyApplyJob;
            const applyUrl = jd.companyApplyUrl;
            const applyByTime = jd.applyByTime ?? "N/A";

            const footer = article.querySelector("footer");
            if (!footer) return;

            const postedBlock = footer.querySelector(
                ".styles_SJC__posted-date__eiY9o",
            );
            if (!postedBlock) return;

            const insertId = `custom-insights-${cardId}`;
            if (document.getElementById(insertId)) return;

            // ✅ Green highlight agar direct apply URL ho
            if (applyUrl) {
                article.style.backgroundColor = "ivory";
                article.style.border = "1px solid #1e9610";
            }

            let companyApplyHtml = "";
            if (companyApply && applyUrl) {
                companyApplyHtml = `
          <a href="${applyUrl}" target="_blank" rel="noopener noreferrer"
             class="custom-apply-link" data-card-id="${cardId}"
             style="
               display:inline-flex;align-items:center;gap:6px;
               padding:6px 12px;border:1px solid #22c55e;border-radius:6px;
               background-color:#ecfdf5;color:#16a34a;font-weight:600;
               text-decoration:none;transition:all 0.2s ease-in-out;
             ">
            <span>Apply Now</span>
          </a>
        `;
            }

            const newRow = document.createElement("div");
            newRow.id = insertId;
            newRow.style.cssText = `
        display: block;
        width: 100%;
        margin-top: 8px;
        clear: both;
        flex-basis: 100%;
      `;

            newRow.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:4px;color:#64748b;font-weight:500;margin-right:4px;">
          <svg style="width:15px;height:15px;color:#64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <b>Posted:</b>
          <span style="color:#1e293b;font-weight:500;">${posted}</span>
        </span>

        <span style="display:inline-flex;align-items:center;gap:4px;color:#64748b;font-weight:500;">
          <svg style="width:17px;height:17px;color:#343333;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8"  y1="2" x2="8"  y2="6"></line>
            <line x1="3"  y1="10" x2="21" y2="10"></line>
            <line x1="12" y1="14" x2="12" y2="17"></line>
          </svg>
          <b>Best Time For Apply:</b>
          <span style="color:#dc2626;">${applyByTime}</span>
        </span>

        ${companyApplyHtml}
      `;

            // ✅ New line mein insert — postedBlock ke parent ke BAAD
            postedBlock.parentElement.insertAdjacentElement("afterend", newRow);

            newRow
                .querySelector(".custom-apply-link")
                ?.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
        });
    }

    function insertcollabDataToHtml(contentData) {
        if (!Array.isArray(contentData) || !contentData.length) return;

        const allCards = document.querySelectorAll(
            ".styles_simjobs-right-container__LiCCx.styles_complete__R9_rL article",
        );
        if (!allCards.length) return;

        // jobId -> job data map
        const jobMap = {};
        contentData.forEach((job) => {
            if (job?.jobId) jobMap[String(job.jobId)] = job;
        });

        allCards.forEach((article) => {
            const cardId = article.getAttribute("data-job-id");
            const jd = jobMap[String(cardId)];
            if (!jd) return;

            const posted = jd.createdDate ? formatCustomDate(jd.createdDate) : "N/A";
            const companyApply = jd.companyApplyJob;
            const applyUrl = jd.companyApplyUrl;
            const applyByTime = jd.applyByTime ?? "N/A";

            const locDiv = article.querySelector(".styles_src__details-loc__wS85u");
            if (!locDiv) return;

            const insertId = `custom-insights-${cardId}`;
            if (document.getElementById(insertId)) return;

            // ✅ Green highlight agar direct apply URL ho
            if (applyUrl) {
                article.style.backgroundColor = "ivory";
                
            }

            let companyApplyHtml = "";
            if (companyApply && applyUrl) {
                companyApplyHtml = `


          <a href="${applyUrl}" target="_blank" rel="noopener noreferrer"
             class="custom-apply-link" data-card-id="${cardId}"
             style="
             display:inline-flex;align-items:center;gap:4px;
               padding:2px 5px;border:1px solid #22c55e;border-radius:2px;
               background-color:#ecfdf5;color:#16a34a;font-weight:600;
               text-decoration:none;transition:all 0.2s ease-in-out;
             ">
          <svg style="width: 14px; height: 14px; color: #16a34a;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 17l9.2-9.2M17 17V7H7"/>
  </svg>
          </a>
        `;
            }

            const newRow = document.createElement("div");
            newRow.id = insertId;
            newRow.style.cssText = `
    display: inline-flex;
    gap: 6px;

    flex-wrap: wrap;
  `;

            newRow.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:4px;color:#64748b;font-weight:500;margin-left:10px;">
          <svg style="width:15px;height:15px;color:#64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
    <span style="font-size: 11px; color: #1e293b; font-weight: 500;">${posted}</span>
        </span>

        ${companyApplyHtml}
      `;

            // ✅ New line mein insert — postedBlock ke parent ke BAAD
            locDiv.appendChild(newRow);

            newRow
                .querySelector(".custom-apply-link")
                ?.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
        });
    }

    // =====================================================
    // ========== Observer — SPA Navigation Handle ==========
    // =====================================================

    function startObserver() {
        if (!document.body) return setTimeout(startObserver, 500);

        const observer = new MutationObserver(() => {
            // JD panel re-inject
            const statsContainer = document.querySelector(
                ".styles_jhc__jd-stats__KrId0",
            );
            if (statsContainer && !document.getElementById("custom-insights")) {
                if (window.__lastJobData) insertJDData(window.__lastJobData);
            }

            // SimJobs cards re-inject
            const allCards = document.querySelectorAll(
                ".styles_SJB__container__0gNlz article[data-job-id]",
            );
            if (allCards.length && window.__lastSimJobData) {
                insertSimData(window.__lastSimJobData);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    startObserver();
} // end if job-listings
