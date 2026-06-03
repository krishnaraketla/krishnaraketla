# Personal portfolio (GitHub Pages)

A single-page static portfolio: introduction, projects, and learning. No build step : edit HTML and CSS, push to GitHub.

## Local preview

Open `index.html` in a browser, or run a simple server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Customize content

### About

Edit [`index.html`](index.html):

- Professional summary and contact line
- GitHub and LinkedIn URLs (replace `YOUR_USERNAME` / `YOUR_PROFILE`)
- Optional: add `assets/profile.jpg` and uncomment the profile image

### Education & skills

- [`data/education.json`](data/education.json) : degrees and dates
- [`data/skills.json`](data/skills.json) : skill categories and tags

### Work experience (data file)

Add roles in [`data/experience.json`](data/experience.json). Entries render as a timeline (most recent first).

**Example entry:**

```json
{
  "id": "acme-intern-2024",
  "company": "Acme Corp",
  "role": "Software Engineering Intern",
  "location": "Boston, MA",
  "startDate": "2024-06",
  "endDate": "2024-08",
  "highlights": [
    "Built X that improved Y by Z%.",
    "Worked with Python and AWS on …"
  ],
  "tags": ["Python", "AWS"],
  "url": "https://acme.example.com",
  "order": 1
}
```

Use `"endDate": "Present"` for current roles. Dates use `YYYY-MM` format.

Each role should feel human, not like a resume:

- `blurb` : one conversational hook on the card
- `stories` : array of `{ "title": "...", "paragraphs": ["...", "..."] }` for the detail modal
- Avoid bullet dumps on the card; save narrative for `stories`

### Projects (data file)

Add and edit projects in [`data/projects.json`](data/projects.json). The page loads this file and renders cards, tag filters, and a detail modal automatically.

Put screenshots in [`assets/projects/`](assets/projects/) (e.g. `assets/projects/my-app.png`).

**Example entry:**

```json
{
  "id": "my-app",
  "title": "My App",
  "blurb": "Short one-liner shown on the card.",
  "description": [
    "First paragraph of the full write-up.",
    "Second paragraph : problem, stack, outcome, etc."
  ],
  "tags": ["Python", "Flask"],
  "github": "https://github.com/YOUR_USERNAME/my-app",
  "demo": "https://my-app.example.com",
  "images": [
    {
      "src": "assets/projects/my-app.png",
      "alt": "Screenshot of My App dashboard"
    }
  ],
  "featured": true,
  "order": 1
}
```

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | yes | Unique slug; used for “View details” |
| `title` | yes | Project name |
| `blurb` | yes | Short summary on the card |
| `description` | yes | Array of paragraphs in the detail modal |
| `tags` | yes | Used for filter buttons (e.g. `Python`, `Web`) |
| `github` | no | Repo URL; omit if none |
| `demo` | no | Live URL; use `null` if none |
| `images` | no | Screenshots; first image is the card thumbnail |
| `order` | no | Sort order (lower = first) |

After editing JSON, refresh the page (use a local server so `fetch` works : see above).

Colors and layout live in [`css/style.css`](css/style.css).

## Deploy to GitHub Pages (user site)

Your site will be at **`https://<github-username>.github.io`**.

### 1. Create the repository on GitHub

Create a **new public** repository named exactly:

```text
<github-username>.github.io
```

Example: if your username is `jane`, the repo must be `jane.github.io`. Do not initialize with a README (this folder already has one).

### 2. Push this project

From this folder:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<github-username>/<github-username>.github.io.git
git push -u origin main
```

### 3. Enable GitHub Pages

In the repo on GitHub:

1. **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. Save

After a minute or two, the site is live at `https://<github-username>.github.io`.

### Updates

Edit files locally, then:

```bash
git add .
git commit -m "Update portfolio content"
git push
```

Changes usually appear within 1-3 minutes.

## Optional later

- Custom domain: add a `CNAME` file and configure DNS in repo Settings → Pages
- Favicon: add `favicon.ico` in the repo root and link it in `index.html`
