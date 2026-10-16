# Monochrome Edition — your magazine portfolio

A black-and-white, magazine-style portfolio. It has the same structure as niccolomiranda.com:
- a masthead front page
- a torn-paper menu
- page transitions
- a bookshelf of projects
- feature-style project pages

## Make it yours (no coding needed beyond one file)
1. Open `js/data.js` and change the studio name (`studio`), the logo (`logo`, a transparent WebP in `images/`), your name and title, tagline, email, socials, services, process, stats and testimonials.
   - **About page**: write your biography in `story` (headline, deck, paragraphs, pull quote). It is laid out like a newspaper feature. Fill in your CV in `experience`, `education`, `skills`, `awards` and `languages`. The text there now is placeholder.
2. **Animated photos of you**: shoot a burst of 6 to 12 photos (phone burst mode works). Save them as `images/me-1.webp`, `images/me-2.webp`, and so on (the current `me-*.webp` frames were made from your photo), then list them in `portrait.frames`. They play like a flipbook. Alternatively, put a short muted clip in `portrait.video` (for example `'images/me.mp4'`).
   - Any colour photo is fine. The site turns everything into black ink with grain and halftone automatically.
3. **Projects**: for each project, add a cover (portrait 3:4 works best), a couple of gallery images, a one-line `line` and a short `scope` list. Project pages are deliberately big type and few words. Each project automatically becomes a card in the Featured Work carousel and gets its own page. The words that cycle under the studio cartoon are `toonWords`.

## Run it
WebGL needs the files served over http, not opened by double-click:
```
cd portfolio
npx serve .          # or: python3 -m http.server
```
Then open the printed address. If you double-click `index.html` instead, it still works, but photos show without the ink shader.

## Put it online (free)
Drag the folder onto **Netlify Drop** (app.netlify.com/drop), or push it to GitHub and enable **GitHub Pages** or **Vercel**. The built files are already in the folder, so the host needs no build step.

Before you upload:
- Leave out `design-sources/` (original photos and unused art, not loaded by the site) and any `node_modules/`.
- Once you know the domain, change `og:image` in `index.html` to the full address (for example `https://kampo.ke/images/og.jpg`) so link previews show the picture.
- Netlify, Vercel and GitHub Pages compress files automatically. On other hosts, turn on gzip or Brotli.

## Changing the code
The page loads two built files, `js/site.min.js` and `css/site.min.css`. They are made from the readable sources (`js/gl.js`, `js/tear.js`, `js/edges.js`, `js/script-line.js`, `js/pages.js`, `js/app.js`, `css/style.css`). After editing a source, rebuild from the `portfolio` folder:
```
npm install --no-save esbuild@0.24.2
node tools/build.mjs
```
`js/data.js` (your words and links) is loaded on its own, so editing it needs no rebuild.

Images are WebP. To add one, convert it first (for example at squoosh.app, quality 75).

## What's inside
| File | Does |
|---|---|
| `js/data.js` | All your content |
| `js/gl.js` | One WebGL canvas that prints every photo as a sheet of paper. Each photo unfolds from a centre crease when it scrolls into view, with a little bounce, and curls when you scroll. On hover it reacts like Hello Monday's project cards: springs pull the four corners in toward the cursor, the sheet crumples and twitches while the pointer moves, and its edges ripple into a wavy, uneven outline. It also adds black ink, grain, and a halftone and ripple on hover. |
| Page turn (`js/app.js`, `Turn`) | When a visitor reaches the bottom of a page, a dog-eared corner appears. Clicking it, dragging it, or scrolling past the end flips the page over to the next one (Index ↔ About, and project → next project). Change the order in `ORDER`. |
| Opening spin (`js/app.js`, `pressIntro`) | On first load the front page rises from below as a small sheet and spins 360° into place, like a newspaper in an old film (after niccolomiranda.com). Change the timings in `pressIntro`. |
| `js/edges.js` | The living ink frame around the screen, after Hello Monday's sticky edges. The left and right edges are chains of springs that bulge gently toward the cursor (or a finger) when it is near and ripples like liquid. The top and bottom stay still. Clicking the right edge opens the menu. |
| `js/tear.js` | Ragged torn-paper edges, used by the menu and page transitions |
| `js/app.js` | Router, smooth scroll (Lenis), menu, cursor, drag carousels, bookshelf, scroll animations (GSAP) |
| `js/pages.js` | Page layouts: Index (the agency front page: services, a looping studio cartoon after Hello Monday's home hero, featured work, process, founder teaser, clients) and About (a newspaper feature about you plus your CV). Each project also gets its own page. |
| `css/style.css` | Magazine grid, typography, and the paper itself (pulp tone, fibres, fold creases, yellowed edges, letterpress ink) |
| `images/` | Photos and art, all WebP except the `og.jpg` link preview |
| `tools/build.mjs` | Rebuilds `site.min.js` and `site.min.css` |

## Contact page

`#/contact` opens on an ink-drawn carved Swahili door. Scrolling pushes through it into a letter that signs itself, then the ways to reach the studio and the brief. The WhatsApp link opens a ready-made greeting. Change the number with `whatsapp` in `js/data.js` (international format, digits only, e.g. `254718235532`) and the greeting with `whatsappText`.

## Getting leads (questionnaire, WhatsApp, case studies)

- **Questionnaire**: four steps on the front page and Contact page. Answers are sent as a ready-written WhatsApp message or email. To also receive every questionnaire in your inbox, create a free form at formspree.io and paste its URL into `formEndpoint` in `js/data.js`.
- **Questionnaire options** (team sizes, ERP modules and so on) live in `brief` in `js/data.js`.
- **Industries**: `industries` in `js/data.js`. Each one has `brand`, `web` and `system` lines.
- **Free check**: `freeCheck` in `js/data.js`.
- **Case studies**: add `caseStudy` to a project. Put real numbers in `results` (for example `{ value: '2 days → 20 min', label: 'Time to raise an invoice' }`); the results row stays hidden while it is empty.
- **Questionnaire inbox (Web3Forms)**: sign up free at web3forms.com with your email, copy the access key into `web3formsKey` in `js/data.js`. Briefs then arrive in your inbox with the client's email as reply-to. Until then, Send opens the visitor's email app with the brief written out.
