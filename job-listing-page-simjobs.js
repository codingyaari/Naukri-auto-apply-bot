// ========== Inject interceptor into page context ==========

const interceptorCode = `(function() {
  if (window.__naukriInterceptorSIM) return;
  window.__naukriInterceptorSIM = true;

  function isSimUrl(url) { return url.includes("/jobapi/v2/search/simjobs"); }

  // Override fetch
  const _origFetch2 = window.fetch;
  window.fetch = async function(input, init) {
    const resp = await _origFetch2.apply(this, arguments);
    try {
      const url = typeof input === 'string' ? input : (input.url || '');
      if (isSimUrl(url)) {
        const clone = resp.clone();
        const data = await clone.json();
        window.dispatchEvent(new CustomEvent('naukriSimEvent', { detail: data }));
      }
    } catch(e) {}
    return resp;
  };

  // ✅ XHR — existing open/send ko wrap karo, replace mat karo
  const _origOpen2 = XMLHttpRequest.prototype.open;
  const _origSend2 = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._simURL = url;           // ✅ alag property name _simURL
    return _origOpen2.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('load', function() {
      try {
        if (isSimUrl(this._simURL || '') && this.status === 200) {
          const data = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('naukriSimEvent', { detail: data }));
        }
      } catch(e) {}
    });
    return _origSend2.apply(this, arguments);
  };
})();`;

const script = document.createElement("script");
script.textContent = interceptorCode;
(document.head || document.documentElement).appendChild(script);
script.remove();

window.addEventListener("naukriSimEvent", (evt) => {
  const data = evt.detail;
  window.__lastSimJobData = data;
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
  const jobs = data?.simJobDetails || [];

  const collaborativeData = jobs?.collaborative || [];
  const contentData = jobs?.content|| [];

  contentDataToHtml(contentData);
  // agar array nahi hai to skip

}

function contentDataToHtml(contentData) {
  if (!Array.isArray(contentData)) {

    return;
  }

  const allCards = document.querySelectorAll(".styles_SJB__container__0gNlz article[data-job-id]");

  // if (!allCards.length) {
  //   console.log("❌ cards not found");
  //   return;
  // }

  // jobId -> job data map
  const jobMap = {};

contentData?.forEach((job) => {
   if(job?.jobId) {
    jobMap[String(job.jobId)] = job;
   }
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

const postedBlock = footer.querySelector(".styles_SJC__posted-date__eiY9o");
if (!postedBlock) return;

const insertId = `custom-insights-${cardId}`;
if (document.getElementById(insertId)) return;

const newRow = document.createElement("div");
newRow.id = insertId;
newRow.style.cssText = `
  display: block;
  width: 100%;
  margin-top: 8px;
  clear: both;
  flex-basis: 100%;
`;
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
         display: inline-flex;
         align-items: center;
         gap: 6px;
         padding: 6px 12px;
         border: 1px solid #22c55e;
         border-radius: 6px;
         background-color: #ecfdf5;
         color: #16a34a;
         font-weight: 600;
         text-decoration: none;
         transition: all 0.2s ease-in-out;
       ">
      <span>Apply Now</span>
    </a>
  `;
}

 newRow.innerHTML = `
    <span style="display:inline-flex; align-items:center; gap:4px; color:#64748b; font-weight:500; margin-right: 4px;">
      <!-- File Clock Icon (Posted On) -->
     <svg style="width: 15px; height: 15px; color: #64748b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <b>Posted:</b> <span style="color:#1e293b; font-weight:500;">${posted}</span>
    </span>

   

    <span style="display:inline-flex; align-items:center; gap:4px; color:#64748b; font-weight:500;">
      <!-- Calendar Arrow Icon (Apply By Time) -->
     <svg style="width: 17px; height: 17px; color: #343333;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <line x1="12" y1="14" x2="12" y2="17"></line> <!-- Exclamation mark body -->
    <line x1="12" y1="10" x2="12" y2="10"></line> <!-- Exclamation mark dot -->
  </svg>
      <b>Best Time For Apply:</b> <span style="color:#dc2626;">${applyByTime}</span>
    </span>
     ${companyApplyHtml}
  `;

postedBlock.parentElement.insertAdjacentElement("afterend", newRow);
newRow.querySelector(".custom-apply-link")?.addEventListener("click", (e) => {
  e.stopPropagation();
});

  });
}


// ========== Fallback in case of no data ==========
setTimeout(() => {
  if (!document.getElementById("custom-insights")) {

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

    return setTimeout(startObserver, 500);
  }


  const observer = new MutationObserver(() => {
    const statsContainer = document.querySelector(
      ".styles_jhc__jd-stats__KrId0",
    );

    if (statsContainer && !document.getElementById("custom-insights")) {


      // IMPORTANT: yaha fake event mat bhejo bina data ke
      // instead stored data use karo (neeche fix diya hai)
      if (window.__lastSimJobData) {
        insertData(window.__lastSimJobData);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

startObserver();
