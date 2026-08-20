# MindTek

MindTek Ltd – SAP technical consultancy website, built as an **OpenUI5** single-page application using static i18n content (no OData service, no backend, no external API, no CSS, no third-party libraries).

## Project structure

```
mindtek/
├── package.json          # @ui5/cli tooling
├── ui5.yaml               # OpenUI5 framework & library configuration
├── cv/                    # Source CV (reference material only, not exposed by the app)
├── logos/                 # Source client-logo images (not currently shown on the public site)
└── webapp/
    ├── index.html
    ├── Component.js
    ├── manifest.json      # app descriptor + routing configuration
    ├── i18n/i18n.properties
    ├── model/
    │   ├── i18n.properties # all static content and UI labels
    │   └── models.js
    ├── controller/
    │   ├── BaseController.js
    │   ├── App.controller.js
    │   ├── Home.controller.js
    │   ├── About.controller.js
    │   ├── Portfolio.controller.js  # FLP-style showcase (mock data)
    │   └── Contact.controller.js    # enquiry form handler (validation + transparent mock notice)
    ├── view/
    │   ├── App.view.xml    # root NavContainer
    │   ├── Home.view.xml
    │   ├── About.view.xml
    │   ├── Portfolio.view.xml       # Fiori Launchpad-style tile showcase
    │   ├── Contact.view.xml
    │   └── fragment/
    │       └── Footer.fragment.xml   # social links + copyright
    └── assets/
        └── mindtek-logo.jpg
```

## Running the app

```bash
cd mindtek
npm install
npm start
```

This starts the `ui5 serve` dev server and opens the app in the browser (defaults to `http://localhost:8080`).

## Routes

| Route | Pattern | View |
|---|---|---|
| Home | `` | `Home.view.xml` |
| About MindTek | `about` | `About.view.xml` |
| Portfolio | `portfolio` | `Portfolio.view.xml` |
| Contact | `contact` | `Contact.view.xml` |

## Notes

- All content (company positioning, services, engagement models, approach, proof points, contact copy) is served from [webapp/i18n/i18n.properties](webapp/i18n/i18n.properties) — there is no backend or OData service.
- The contact form ([webapp/controller/Contact.controller.js](webapp/controller/Contact.controller.js)) validates input and shows a transparent notice — it does **not** claim the enquiry was sent, since no backend is wired up. See the `TODO` comment in that file for where to integrate a real submission endpoint.
- `i18n.properties` contains a `REPLACE_WITH_VERIFIED_COMPANY_EMAIL` placeholder — replace it with MindTek's verified company email before go-live.
- No custom CSS or HTML is used — only OpenUI5 controls (`sap.m`, `sap.f`, `sap.ui.layout`) and the standard `sapUi*` spacing/margin classes that ship with the framework. A minimal [webapp/css/style.css](webapp/css/style.css) adds the hero gradient, a centred content wrapper, and tile sizing.
- The single fixed header lives in [webapp/view/App.view.xml](webapp/view/App.view.xml) as one `sap.m.OverflowToolbar` (logo left, nav centred, logo right on desktop; only the left logo on smaller screens via CSS media queries). It stays fixed while each page scrolls. The footer fragment is included in every page's content so it scrolls with the page and sits at the bottom.
- The `Services` and `Engagement Models` content is consolidated onto the Home page; `Services.view.xml` / `EngagementModels.view.xml` and their controllers are no longer routed and can be removed.
- The `cv/` and `logos/` folders are source reference material only; neither the CV PDF nor the client logos are linked or displayed by the running application.
