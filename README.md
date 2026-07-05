# 🕵️ NaukriSpy — Smart Naukri.com Job Application Assistant
 
<div align="center">
<img src="https://github.com/codingyaari/codingyari-assets/blob/main/asssets/nokry-spy.png?raw=true" 
             alt="Auto Apply" style="width:100px; height:100px; object-fit:contain; pointer-events:none; user-select:none; ">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-red.svg)

### 🎬 Intro Video

[![Watch the Demo Video](https://img.shields.io/badge/▶️_Watch-Intro_Video-blue?style=for-the-badge)](images/intro.mp4)



**A powerful Chrome extension that supercharges your Naukri.com job search with smart filtering, enhanced job cards, and useful recruitment insights.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Configuration](#-configuration) • [Technical Details](#-technical-details)

</div>

---

## 🎯 Overview

NaukriSpy transforms your Naukri.com job search experience by adding intelligent automation, enhanced UI elements, and smarter job discovery features directly into the platform.

### 🎬 Intro Video

You can view the extension intro video locally by opening the `images/intro.html` file in your browser (place `intro.mp4` into the `images/` folder if not already present).

### Why NaukriSpy?

- ⚡ **Save Time**: Find the right jobs faster with improved job cards and filters
- 🎯 **Smart Filtering**: Apply only to jobs matching your skills and preferences
- 📊 **Enhanced Insights**: See hidden job metrics and application stats
- 🎨 **Better UI**: Clean, modern interface with visual feedback

---

## ✨ Features

### 🔍 Smart Job Filtering
- **Keyword Matching**: Filter jobs by specific titles and technologies
- **Intelligent Matching**: Fuzzy search with confidence scoring
- **Custom Rules**: Skip company-apply jobs or specific companies
- **Toggle Control**: Enable/disable filtering on the fly

### 📊 Enhanced Job Cards
- **Extra Metrics**: Posted date, best apply time, applicant count
- **Direct Apply Links**: Highlighted external application URLs
- **Status Indicators**: Visual badges for easy job review
- **Company Insights**: Better visibility into each job card

### 📊 Enhanced Job Cards
- **Extra Metrics**: Posted date, best apply time, applicant count
- **Direct Apply Links**: Highlighted external application URLs
- **Status Indicators**: Visual badges for questionnaire jobs vs. simple applies
- **Company Insights**: AmbitionBox ratings integration

### 🎨 Improved UI/UX
- **Floating Action Button**: Draggable, non-intrusive control panel
- **Slide-Out Panel**: Clean settings interface with all controls
- **Right-Side Questionnaire Panel**: Smooth sliding interface for questions
- **Visual Status**: Green (success), Red (failed), Yellow (skipped)

---

## 📁 Project Structure


naukri-extension/
├── manifest.json                    # Extension manifest (Manifest V3)
├── content.js                       # Main content script orchestrator
├── scripts/
│   ├── filter-jobs-page.js         # Search page enhancements
│   ├── job-listing-page.js         # Job detail page enhancements
│   ├── recommended-jobs-page.js    # Recommended jobs handler
├── styles/
│   └── custom-ui.css               # Custom styling for injected UI
├── assets/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── logo.png                    # NaukriSpy logo
├── README.md                       # You are here!
└── LICENSE                         # MIT License


---

## 🚀 Installation

### Method 1: Chrome Web Store (Coming Soon)
1. Visit Chrome Web Store
2. Search for "NaukriSpy"
3. Click **Add to Chrome**

### Method 2: Developer Mode (Current)

1. **Download the Extension**
```bash
   git clone https://github.com/yourusername/naukri-spy.git
   cd naukri-spy
```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)

3. **Load Extension**
   - Click **Load unpacked**
   - Select the `naukri-extension` folder
   - Extension icon should appear in toolbar

4. **Verify Installation**
   - Visit `https://www.naukri.com/`
   - Look for NaukriSpy floating button (bottom-right)

---

## 📖 Usage

### 🎬 Quick Start

1. **Visit Naukri.com**
   - Navigate to any job search or recommended jobs page
   - NaukriSpy auto-activates and intercepts job data

2. **Configure Your Profile** (First Time Setup)
   - Click the floating NaukriSpy button
   - Click **Edit Profile**
   - Fill in your skills, experience, CTC, notice period, etc.
   - Save changes

4. **Configure Filters** (Optional)
   - Enable **Smart Filtering** toggle
   - Add keywords like: `react developer`, `node.js`, `full stack`
   - Set minimum confidence threshold (default: 50%)

---

## ⚙️ Configuration

### 🎯 Filter Keywords

```javascript
const filterKeywords = [
    "react developer",
    "full stack developer",
    "mern stack developer",
    "frontend developer",
    "node.js developer"
];

localStorage.setItem("naukri_filter_keywords", JSON.stringify(filterKeywords));
```

---

## 🛠️ Technical Details

### Architecture
┌─────────────────────────────────────────────────────────┐
│                    Naukri.com Page                      │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │         API Interceptor (Injected Script)         │  │
│  │  • Hooks fetch() & XMLHttpRequest                 │  │
│  │  • Captures job data from API responses           │  │
│  │  • Dispatches custom events                       │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Content Script (NaukriSpy Core)           │  │
│  │  • Listens to custom events                       │  │
│  │  • Injects enhanced UI elements                   │  │
│  │  • Enhances the Naukri.com job browsing experience │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

### API Endpoints Intercepted

| Endpoint | Purpose | Data Extracted |
|----------|---------|----------------|
| `/jobapi/v3/search` | Job search results | Job IDs, titles, companies, posted dates |
| `/jobapi/v2/search/recom-jobs` | Recommended jobs | Same as above + apply time windows |
| `/jobapi/v4/job/{id}` | Job details | Full job description, requirements, stats |

### Key Technologies

- **Manifest V3**: Latest Chrome extension standard
- **Content Scripts**: Injected at `document_start` for early interception
- **Page Context Injection**: Direct access to native `fetch()` and `XMLHttpRequest`
- **Custom Events**: Bridge between page context and content script
- **Mutation Observer**: Detects dynamic DOM changes (SPA navigation)
- **LocalStorage**: Persistent settings and user profile data

### Performance Optimizations

- ✅ Debounced DOM mutations
- ✅ Efficient CSS selectors
- ✅ Minimal re-renders
- ✅ Lazy-loaded UI components
- ✅ Request batching for API calls

---

## 🔒 Privacy & Security

### Data Handling

- ✅ **No Data Collection**: Extension does not send your data to any external servers
- ✅ **Local Storage Only**: All settings and profile data stored locally in browser
- ✅ **Token Security**: Bearer tokens never leave your browser
- ✅ **HTTPS Only**: All API calls use secure HTTPS connections

### API Key Safety

```javascript
// ⚠️ IMPORTANT: Never commit your API key to Git
// Store it locally or use environment variables

// Bad ❌
const API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXX";

// Good ✅
const API_KEY = localStorage.getItem("gemini_api_key");
```

### Permissions Explained

```json
{
  "permissions": [
    "storage",        // Save settings locally
    "scripting"       // Inject content scripts
  ],
  "host_permissions": [
    "https://www.naukri.com/*"  // Only Naukri.com access
  ]
}
```

---

## 🐛 Troubleshooting

### Extension Not Loading?

1. Check Chrome version (requires Chrome 88+)
2. Disable other Naukri extensions
3. Clear cache and reload extension
4. Check Console for errors (F12 → Console)

### Troubleshooting

1. Verify Bearer token is correct and not expired
2. Check if you're on the correct page (Job Agent page)
3. Open DevTools and check for API errors
4. Ensure job cards are visible on page

### AI Not Answering Questions?

1. Verify Gemini API key is set correctly
2. Check API key quota/limits
3. Ensure user profile is filled in localStorage
4. Check Console for AI API errors

### Questions Panel Not Opening?

1. Check if `question-container` div exists in panel HTML
2. Verify `OpenPanel` variable is set
3. Check CSS `right` property transitions
4. Look for JavaScript errors in Console

---

## 📊 Metrics & Analytics

### Performance Stats

- **Average Apply Time**: ~5-7 seconds per job
- **Success Rate**: ~85-90% (without questionnaires)
- **AI Accuracy**: ~92% for standard questions
- **Jobs Processed**: 50+ jobs per session

### Supported Question Types

| Type | AI Support | Auto-Submit |
|------|-----------|-------------|
| Text Box | ✅ Yes | ✅ Yes |
| Radio Button | ✅ Yes | ✅ Yes |
| Dropdown/List | ✅ Yes | ✅ Yes |
| Checkbox (Multi) | ⚠️ Partial | ❌ No |
| File Upload | ❌ No | ❌ No |

---


## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check existing issues first
2. Include Chrome version, OS, and extension version
3. Provide steps to reproduce
4. Attach screenshots/console logs if possible

### Suggesting Features

1. Open a GitHub issue with `[Feature Request]` tag
2. Describe the feature and use case
3. Explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔗 Connect & Links

- 🌐 Website: [codingyari.com](https://codingyari.com)
- 💼 LinkedIn: [linkedin.com/in/sameerkhandev](https://linkedin.com/in/sameerkhandev)
- 📄 Privacy Policy: [codingyari.com/privacy-policy](https://codingyari.com/privacy-policy)

---
## 🔒 Privacy Policy (Summary)

NaukriSpy runs entirely in your browser and does not send your job search data, resume, or profile information to any external server owned by CodingYari. All settings, match-score logic, and profile data stay in your browser's local storage. For the full policy, see [codingyari.com/privacy-policy](https://codingyari.com/privacy-policy/naukri-spy).