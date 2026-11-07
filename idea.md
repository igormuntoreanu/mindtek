# MindTek Ltd — Company Website

> **Live:** [mindtek-ltd.com](https://mindtek-ltd.com)
> **Stack:** OpenUI5 1.151.0 · static i18n content · no backend
> **Hosting:** GitHub Pages (custom domain) via GitHub Actions CI/CD

## What this is

A corporate website for **MindTek Ltd**, a small SAP technical consultancy run by Igor Muntoreanu and Neska Braga. The site positions MindTek as a hands-on, direct-delivery SAP consultancy — clients work with the people writing the code, not a management layer.

The entire site is a **single-page OpenUI5 application** with all content stored in `webapp/i18n/i18n.properties`. There is no backend, no OData service, no external API.

## Pages & Routes

| Route | Pattern | View | Content |
|---|---|---|---|
| Home | `/` | `Home.view.xml` | Hero, 28 client logos, 6 service cards, 3 engagement models, 4-step approach, people teaser, work teaser, closing CTA |
| About | `/about` | `About.view.xml` | Company description, operating model, proof points |
| People | `/people` | `People.view.xml` | Director profiles (Igor & Neska) with photos, bios, certifications |
| Work | `/work` | `Portfolio.view.xml` | Fiori Launchpad-style tile grid linking to 6 demo showcase apps |
| Contact | `/contact` | `Contact.view.xml` | Enquiry form (name, email, company, project type, requirement) |

Old `#/portfolio` hash route redirects to `/work`. Clean path-based URLs (not hash) via custom `PathHashChanger`.

## Services Offered (displayed on Home)

1. **SAP Development and Enhancement** — ABAP, RAP, S/4HANA, CDS, clean-core extensions
2. **SAP Fiori and SAP Build** — Fiori, OpenUI5, SAP Build apps
3. **Integrations, CAP and CPI** — BTP, CAP services, CPI iFlows, Workflow
4. **Testing, QA and Technical Assurance** — Unit, functional, regression test cycles
5. **Project Delivery Support** — Blueprint through go-live, no separate management layer
6. **Technical Reviews and Optimisation** — Code, performance, architecture reviews

## Engagement Models

1. **Dedicated SAP professionals** — Longer-term specialists embedded in client teams
2. **On-demand technical delivery** — Defined deliverable against an agreed estimate
3. **Review and recovery** — Diagnosis and hands-on support to stabilise projects

## Showcase Apps (Work page)

Six separate repos, pulled into the build via GitHub Actions:

| App | Floorplan | Repo |
|---|---|---|
| Journal Entry Monitor | List Report + Object Page | `igormuntoreanu/mindtek-journalentry-monitor` |
| Journal Entry Analytics | Analytical List Page | `igormuntoreanu/mindtek-journalentry-monitor-alp` |
| Sales Overview | Overview Page | `igormuntoreanu/mindtek-sales-overview` |
| Purchase Approval Worklist | Worklist | `igormuntoreanu/mindtek-purchaseorder-worklist` |
| Warehouse Cockpit | Freestyle / Custom | `igormuntoreanu/mindtek-warehouse-cockpit` |
| Supplier Registration | Form Entry Object Page | `igormuntoreanu/mindtek-supplier-registration` |

Local dev uses `localhost:8081–8086`; production links go to `mindtek-ltd.com/<app>/`.

## Architecture

```
mindtek/
├── package.json              # @ui5/cli + puppeteer
├── ui5.yaml                  # OpenUI5 framework config + serve-spa middleware
├── middleware/serveSpa.js     # Dev server: serves index.html for all SPA routes
├── scripts/prerender.js      # Build step: Puppeteer snapshots each route as static HTML for SEO
├── .github/workflows/pages.yml  # CI/CD: build + pull showcase repos + deploy to GitHub Pages
└── webapp/
    ├── index.html            # Shell with OpenUI5 bootstrap
    ├── Component.js           # UI5 component root
    ├── init.js               # Custom bootstrap with PathHashChanger
    ├── manifest.json          # App descriptor, routing config, SEO keywords
    ├── routing/PathHashChanger.js  # Clean URLs: /work instead of /#/work
    ├── i18n/i18n.properties   # ALL site content (copy, labels, people bios, service descriptions)
    ├── css/style.css          # Minimal: hero gradient, card grid stretch, client logo sizing, responsive fixes
    ├── controller/
    │   ├── BaseController.js      # Shared nav helpers + resource bundle access
    │   ├── App.controller.js      # SEO meta tags per route, cookie banner, privacy dialog
    │   ├── Home.controller.js     # Scroll-to-services, page-top focus
    │   ├── About.controller.js    # Nav to contact
    │   ├── People.controller.js   # Nav to contact
    │   ├── Portfolio.controller.js # Showcase tile grid model, opens demo apps in new tab
    │   ├── Contact.controller.js  # Form validation + mailto: submission
    │   ├── Services.controller.js # Legacy, not routed (content merged into Home)
    │   └── EngagementModels.controller.js  # Legacy, not routed
    ├── view/
    │   ├── App.view.xml           # Shell: header toolbar + NavContainer + cookie banner + privacy dialog
    │   ├── Home.view.xml          # Full homepage
    │   ├── About.view.xml         # About page
    │   ├── People.view.xml        # People page
    │   ├── Portfolio.view.xml     # Work/showcase page
    │   ├── Contact.view.xml       # Contact form
    │   └── fragment/
    │       ├── Header.fragment.xml    # Legacy header (unused — shell toolbar in App.view.xml replaced it)
    │       ├── Footer.fragment.xml    # Social links (LinkedIn, X, YouTube), footer nav, copyright
    │       └── PeopleCards.fragment.xml  # Reusable people card grid (used on Home + People)
    └── assets/
        ├── mindtek-logo-white.jpeg  # Header/shell logo
        ├── mindtek-logo.jpg         # Unused (legacy)
        ├── logos/                   # 28 client logo images
        ├── people/                  # Igor + Neska portrait photos
        ├── icons/                   # LinkedIn + YouTube icon PNGs
        └── favicon/                 # Favicon assets
```

## Build & Deploy

- **Dev:** `npm start` → `ui5 serve` on `localhost:8080` with livereload
- **Build:** `npm run build` → `ui5 build --clean-dest` + `node scripts/prerender.js`
  - Prerender uses Puppeteer to render each route, captures the DOM, and writes static HTML snapshots into `dist/` so Google crawlers get page text without executing UI5
- **Deploy:** Push to `main` triggers `.github/workflows/pages.yml`:
  1. Checks out the main repo + 6 showcase app repos
  2. Runs `npm ci` + `npm run build`
  3. Copies showcase `webapp/` folders into `dist/` subdirectories
  4. Adds `CNAME` (mindtek-ltd.com) + `.nojekyll`
  5. Deploys to GitHub Pages

## Key Design Decisions

- **All content in i18n.properties** — easy to update copy without touching views or controllers
- **mailto: for contact form** — no backend needed; opens the user's email client with a pre-filled message
- **Clean URLs** — custom `PathHashChanger` keeps `/work` in the address bar instead of `/#/work`
- **SEO prerendering** — Puppeteer snapshots ensure crawlers see real content (critical for GitHub Pages which can't do server-side rendering)
- **No tracking cookies** — cookie banner is informational only; consent stored in localStorage
- **Responsive** — phone/tablet/desktop via OpenUI5 Grid + Device.media handlers; phone-specific CSS for shellbar button sizing
- **Card grid** — flexbox stretch so cards in a row match the tallest sibling

## Open TODOs

- [ ] LinkedIn company page URL (currently `#` placeholder in i18n)
- [ ] X (Twitter) profile URL (currently `#` placeholder in i18n)
- [ ] YouTube channel URL (currently `#` placeholder in i18n)
- [ ] Real form submission backend (currently mailto: only)
- [ ] Remove legacy `Services.controller.js` and `EngagementModels.controller.js` (no longer routed)
- [ ] Remove legacy `Header.fragment.xml` (replaced by shell toolbar in `App.view.xml`)

## People

- **Igor Muntoreanu** — Founder and Principal Developer. 16 years SAP (ABAP, Fiori, RAP, S/4HANA). SAP-certified, MBA in SAP. Works in English, German, Portuguese.
- **Neska Braga** — Director and Principal Project Manager. PRINCE2 Practitioner, Scrum Master, ITIL. Works in English, Portuguese, Spanish.

## Client Experience (logos on homepage)

Mercedes-Benz, Porsche, Mastercard, Unilever, Vodafone, Deutsche Telekom, Bayer, Santander, Accenture, John Deere, Takeda, Bacardi, Capgemini, Canada Life, Natura, BRF, Bunge, Voith, ERM, Cloudreach, Grünenthal, Provinzial, Infoglobo, Cogna, West Sussex County Council, Hochschulrektorenkonferenz, Alleasy, SOW
