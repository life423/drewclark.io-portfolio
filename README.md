# drewclark.io

Source for [drewclark.io](https://drewclark.io), Drew Clark's portfolio. Besides the project write-ups, the site has a chat that answers questions about each project from its current source code on GitHub.

## Stack

- **Frontend:** React and Vite (`app/`)
- **API:** Express (`server.js`, `api/`)
- **AI:** OpenAI `gpt-4o-mini` for answers and `text-embedding-3-small` for code search
- **Data:** MongoDB Atlas for contact messages and the code index (Atlas Vector Search)
- **Hosting:** Docker image on Azure Container Apps, deployed by GitHub Actions

## Running locally

```bash
npm run setup   # installs root and app dependencies
npm run dev     # API on http://localhost:3000, site on http://localhost:5173
```

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD="a-long-password"
```

Put quotes around any value that contains `#`. Without `MONGODB_URI`, contact messages are saved to a local file and the chat answers from the project descriptions only.

Optional settings: `MONGODB_DB` (default `portfolio`), `OPENAI_CHAT_MODEL` (default `gpt-4o-mini`), `CHAT_LIMIT_PER_MINUTE` (default 10 per visitor), `CHAT_LIMIT_PER_DAY` (default 500 for the whole site) and `ALLOWED_REPOS`.

## How the chat knows the code

1. **Indexing.** `scripts/index-repos.js` shallow-clones each repo in `repositories.allowed` (`api/config.js`), splits the source files into overlapping chunks of about 60 lines, and stores their embeddings in the `code_chunks` collection. It skips lockfiles, build output, env files and binaries, and blanks out anything that looks like a credential. `code_index_state` remembers each repo's commit and file hashes, so later runs skip repos with no new commits and only re-embed files that changed.
2. **Staying current.** The *Index repos for the chat* workflow (`.github/workflows/index-repos.yml`) runs the indexer every hour, on every push to `main`, and on demand from the Actions tab, with an option to rebuild everything. A run where nothing changed embeds nothing.
3. **Answering.** Visitors send only their question and, optionally, a project id. The server embeds the question, uses Atlas Vector Search to find the closest code in that project's repo (or in every repo, for general questions), and builds the prompt from the project descriptions plus those excerpts. Responses include `sources` that link to the exact lines on GitHub. If the search is unavailable, the chat falls back to the descriptions.

To run the indexer yourself:

```bash
npm run index:repos                          # update whatever changed
npm run index:repos -- --dry-run             # show what would change, without embedding or writing
npm run index:repos -- --full                # re-embed everything
npm run index:repos -- life423/ascend-avoid  # one repo only
```

The first portfolio project is CudaRL-Arena, replacing AI Platform Trainer. Its
overview uses the repository's `docs/images/tadpole-learning.png` screenshot, copied
to `app/public/projects/cudarl-arena.png`. Project descriptions and chat context
share `app/src/data/projects.json`.

The default chat allowlist includes this website and all four project repositories.
The indexer includes C++, CUDA, GDScript and CMake sources as well as web and Python
files. After deployment, the index workflow adds CudaRL-Arena automatically;
AI Platform Trainer is excluded from searches. If `ALLOWED_REPOS` is overridden,
update that environment setting too. Indexing requires `MONGODB_URI` and
`OPENAI_API_KEY`; a local preview without MongoDB answers from project descriptions.

**Adding a project repo:** add it to `repositories.allowed` in `api/config.js`, set `"repo"` on the project in `app/src/data/projects.json`, and run the indexer.

**Updates within minutes (optional):** the hourly run picks up pushes to the project repos within an hour. To have a project repo trigger the indexer as soon as you push, add this workflow to it (change `main` if the repo's default branch is different) and give it a `PORTFOLIO_DISPATCH_TOKEN` secret: a fine-grained token with read and write access to Contents on this repo only.

```yaml
name: Update portfolio chat
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - env:
          GH_TOKEN: ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}
          REPO: ${{ github.repository }}
        run: |
          if [ -z "$GH_TOKEN" ]; then echo "PORTFOLIO_DISPATCH_TOKEN is not set"; exit 0; fi
          gh api repos/life423/drewclark.io-portfolio/dispatches \
            -f event_type=repo-updated -f "client_payload[repo]=$REPO"
```

## Portfolio presentation

Project detail views show each project's main image at full content width,
using its natural aspect ratio rather than a fixed-height frame. Explicit source
dimensions reserve space before loading. Images link to the original in a new tab.
Both the mobile/tablet view and the desktop cards use `ProjectImage`. On desktop,
the selected project, a row of three short image cards and the chat follow one
vertical flow. Do not restore a tall sidebar beside shorter project details: it
creates a large empty column. Compact cards retain uncropped thumbnails; clicking
the preview opens that project's details, while the featured image opens at full
size. Compact cards also support Enter and Space with a visible focus indicator.

Ascend-Avoid keeps the user's `BEST.png`, copied unchanged to
`app/public/projects/ascend-avoid-cover-best.png`, in project details and the
full-image link. The latest user choice is to try emerald/teal artwork on the
overview and smaller cards, using the optional `cardImage` source, dimensions
and alt text in `projects.json`. The full-resolution 1122 × 1402 emerald artwork
is saved at `app/public/projects/ascend-avoid-best-emerald-master.png` for a
possible future detail-view switch. Preserve the natural proportions. Generation
prompt and provenance are in `docs/ascend-avoid-emerald-art.md`.

The hero offers Featured Projects and a direct Play Ascend-Avoid link. The latter
starts with a green outline, then fills on hover, keyboard focus or press. The
buttons share the brand green with dark text when filled, stack on small phones,
and disable their transitions when reduced motion is requested. Keep the overview
introduction short so visitors reach the apps quickly.

Each detail header has a keyboard-accessible Next control that cycles through
all four projects and wraps to the first. Keep the bottom Previous/Next controls
available too. Selecting a project scrolls its header below the fixed site nav,
and the selection survives phone/tablet/desktop breakpoint changes.

## Browser verification

Run `npm run build`, install test browsers with
`npx playwright install --with-deps chrome msedge firefox webkit`, then run
`npm run test:ui`. The tests start an isolated production-build preview on port
3201. Chat requests are intercepted with success/failure fixtures; no API key or
database is required. To test an existing server, set `UI_TEST_URL` first.

The suite covers nine phone, landscape, tablet and desktop dimensions, artwork
selection/proportions, overflow, project cycling/wrapping, bottom navigation,
keyboard focus, touch/rotation, reduced motion, hero interaction states, chat
loading/source links/recovery and contact dialog opening/closing. Pull requests
run the same suite on Linux in Chrome, Edge, Firefox and WebKit. WebKit is an
engine compatibility check; it does not replace testing real Safari on macOS/iOS.
See `docs/portfolio-ui-validation.md` for the release evidence and remaining limits.

## Admin inbox

Contact form messages are at `/admin`. Sign in with `ADMIN_PASSWORD`. The session is an HttpOnly cookie that lasts 8 hours, and five wrong passwords lock sign-in for 15 minutes.

## Deployment

Pushes to `main` build the Docker image and deploy it to Azure Container Apps (`.github/workflows/landingpage-AutoDeployTrigger-*.yml`). No secrets are baked into the image. On every deploy the workflow copies the `OPENAI_API_KEY`, `MONGODB_URI` and `ADMIN_PASSWORD` repository secrets into the Container App's secrets, deploys the new image with them as environment variables, and then confirms the app runs a single container on that image and that the public site reports the new commit from `/api/health`.

The index workflow needs the `OPENAI_API_KEY` and `MONGODB_URI` repository secrets. GitHub's runners don't have fixed IP addresses, so Atlas network access has to allow connections from anywhere; give the database user a long generated password and access to the `portfolio` database only.

## License

MIT
