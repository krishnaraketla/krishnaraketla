# Personal portfolio (GitHub Pages)

A single-page static portfolio: introduction, projects, and learning. No build step — edit HTML and CSS, push to GitHub.

## Local preview

Open `index.html` in a browser, or run a simple server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Customize content

Edit [`index.html`](index.html):

- Replace **Your Name**, bio, and social links (`YOUR_USERNAME`, email, LinkedIn, resume URL)
- Update project cards (titles, descriptions, tags, GitHub/demo links)
- Update learning sections under Currently / Recently finished / Want to explore
- Optional: add `assets/profile.jpg` and uncomment the profile image in the About section

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

Changes usually appear within 1–3 minutes.

## Optional later

- Custom domain: add a `CNAME` file and configure DNS in repo Settings → Pages
- Favicon: add `favicon.ico` in the repo root and link it in `index.html`
