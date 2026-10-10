# Researchly AI — Project Website (R26-IT-116)

Static HTML/CSS site (plus a little vanilla JS) for the SLIIT research project
*AI-Powered Research Paper Assistant and Collaboration Platform for University Students*.

## Structure

```
Website/
├── index.html           Home: abstract, modules, demo video, ICDMIS achievement, user feedback
├── domain.html          Literature survey, gap, problem, objectives, methodology, results, technologies
├── milestones.html      Assessments (drop-down panels with date + marks) and Gantt timeline
├── documents.html       Charter, proposals, checklists, paper, final theses (Google Drive links)
├── presentations.html   Proposal / PP1 / PP2 / Final slides + conference poster
├── about.html           Supervisors, team (photos, IDs, emails), achievements & certificate
├── contact.html         Contact details + enquiry form (emails dttestmail2000@gmail.com)
└── assets/
    ├── css/style.css    One shared stylesheet
    ├── js/main.js       Nav, scroll reveals, Ctrl+K search, hero graph, video, contact form
    └── images/          team/ · feedback/ · conference/ · logos/ · favicon.svg
```

Total size is about 1.6 MB, well under the 20 MB course limit.

## Design notes

- **Light / dark mode**: follows the visitor's system setting by default. The sun/moon button in
  the header switches themes and remembers the choice in `localStorage`. All colours are tokens
  at the top of `style.css` (the `:root` block is light; the dark values are below it).
- **Fonts**: Plus Jakarta Sans (headings), Inter (body), JetBrains Mono (IDs and labels) and
  Source Serif 4 (the research-paper abstract only), loaded from Google Fonts.
- **Logo**: the blue → purple "R" tile from the live platform, drawn inline as SVG in each page
  header and footer, and in `assets/images/favicon.svg`.

## Things to check before submitting

- **Mark allocations** in `milestones.html` (`.ms-marks` and `.ms-facts`) are placeholders.
  Confirm them against the current IT4010 module outline.
- **Google Drive**: every document and slide links to the shared folder. When the files are
  uploaded, replace each `href` with that file's own link if you want direct links.
- **Contact form** uses [FormSubmit](https://formsubmit.co). The **first** submission sends an
  activation email to `dttestmail2000@gmail.com`. Click "Activate Form" once, and every later
  submission is delivered as a formatted table email, with an auto-reply sent to the visitor.
- **Phone number and address** on `contact.html` are fictional placeholders.

## Run / deploy

Open `index.html` directly, or serve the folder (`npx serve .`) and deploy it to Vercel,
Netlify or the course web space as a static site. The demo video plays inline when the site
is served over http(s). When the page is opened from `file://` it opens YouTube instead,
because YouTube blocks embeds without a referrer.
