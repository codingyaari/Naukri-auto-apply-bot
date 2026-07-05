
if(window.location.href.includes("naukri.com/job-listings")) {
  

const interceptorCode = `(function() {
  if (window.__naukriInterceptorJD) return;
  window.__naukriInterceptorJD = true;

  function isJDUrl(url) { return url.includes("/jobapi/v4/job/"); }

  // Override fetch
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
    } catch(e) {}
    return resp;
  };

  // XHR — sirf JD URL ke liye
  const _origOpen = XMLHttpRequest.prototype.open;
  const _origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._jdURL = url;
    return _origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('load', function() {
      try {
        if (isJDUrl(this._jdURL || '') && this.status === 200) {
          const data = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('naukriJDEvent', { detail: data }));
        }
      } catch(e) {}
    });
    return _origSend.apply(this, arguments);
  };
})();`;

const script = document.createElement("script");
script.textContent = interceptorCode;
(document.head || document.documentElement).appendChild(script);
script.remove();

window.addEventListener("naukriJDEvent", (evt) => {
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

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12

  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
}

function insertData(data) {
  const jd = data.jobDetails || {};

  const posted = formatCustomDate(jd.createdDate);
  const applied = jd.applyDate ? formatCustomDate(jd.applyDate) : "Not Applied";

  const statsContainer = document.querySelector(".styles_jhc__jd-stats__KrId0");
  if (!statsContainer) return;

  if (document.getElementById("custom-insights")) return;

  const newRow = document.createElement("div");
  newRow.id = "custom-insights";
  newRow.style.marginTop = "6px";

  newRow.innerHTML = `
   <div style="height: 3px;"></div> <!-- Line ke beech ki spacing -->
 <span class="styles_jhc__stat__PgY67" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 5px;">
    <!-- Users/Applicants Icon -->
    <svg style="width: 15px; height: 15px; color: #3b82f6;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    <label style="color: #2563eb; font-weight: 600; margin: 0;">Applicants: </label>
    <span style="color: #1d4ed8; font-weight: 700;">${jd.applyCount || 0}</span>
  </span>

  <span class="styles_jhc__stat__PgY67" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 5px;">
    <!-- Eye/Views Icon -->
    <svg style="width: 15px; height: 15px; color: #f97316;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    <label style="color: #ea580c; font-weight: 600; margin: 0;">Page Views: </label>
    <span style="color: #c2410c; font-weight: 700;">${jd.viewCount || 0}</span>
  </span>
  <span class="styles_jhc__stat__PgY67" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 15px;">
    <!-- Tag Icon (Job Type) -->
    <svg style="width: 15px; height: 15px; color: #64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
    <label style="color: #64748b; font-weight: 500; margin: 0;">JobType: </label>
    <span style="color: #1e293b; font-weight: 600;">${jd.jobType}</span>
  </span>
    <br/><div style="height: 6px;"></div> <!-- Line ke beech ki spacing -->

  <span class="styles_jhc__stat__PgY67" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 1px;">
    <!-- Clock Icon (Posted On) -->
    <svg style="width: 15px; height: 15px; color: #64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    <label style="color: #64748b; font-weight: 500; margin: 0;">Posted: </label>
    <span style="color: #1e293b; font-weight: 600;">${posted}</span>
  </span>
  
  <span class="styles_jhc__stat__PgY67" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 1px;">
    <!-- Document Check Icon (You Applied) -->
    <svg style="width: 15px; height: 15px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>
    <label style="color: #64748b; font-weight: 500; margin: 0;">You Applied: </label>
    <span style="color: #1e293b; font-weight: 600;">${applied}</span>
  </span>


  


 
`;

  statsContainer.appendChild(newRow);

  // console.log("✅ Data inserted in DOM");
}

// ========== Fallback in case of no data ==========
setTimeout(() => {
  if (!document.getElementById("custom-insights")) {
    // console.warn("⚠️ Job data not captured. Please reload or check extension.");
  }
}, 7000);

// ========== Observe for SPA navigation ==========
const observer = new MutationObserver(() => {
  const statsContainer = document.querySelector(".styles_jhc__jd-stats__KrId0");
  if (statsContainer && !document.getElementById("custom-insights")) {
    // Re-inject by simulating the above listener (or simply reload data if stored)
    window.dispatchEvent(new Event("naukriSimEvent"));
  }
});
function startObserver() {
  if (!document.body) {
    // console.log("⏳ body not ready, retry...");
    return setTimeout(startObserver, 500);
  }

  // console.log("👀 Observer started");

  const observer = new MutationObserver(() => {
    const statsContainer = document.querySelector(
      ".styles_jhc__jd-stats__KrId0",
    );

    if (statsContainer && !document.getElementById("custom-insights")) {
      // console.log("🔁 Re-injecting data...");

      // IMPORTANT: yaha fake event mat bhejo bina data ke
      // instead stored data use karo (neeche fix diya hai)
      if (window.__lastJobData) {
        insertData(window.__lastJobData);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

startObserver();

}