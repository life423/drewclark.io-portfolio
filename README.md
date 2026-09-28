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

Indexing all four repos from scratch costs about one cent in embeddings.

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

## Admin inbox

Contact form messages are at `/admin`. Sign in with `ADMIN_PASSWORD`. The session is an HttpOnly cookie that lasts 8 hours, and five wrong passwords lock sign-in for 15 minutes.

## Deployment

Pushes to `main` build the Docker image and deploy it to Azure Container Apps (`.github/workflows/landingpage-AutoDeployTrigger-*.yml`). No secrets are baked into the image: the container needs `OPENAI_API_KEY`, `MONGODB_URI` and `ADMIN_PASSWORD` at runtime, set as Container App secrets.

The index workflow needs the `OPENAI_API_KEY` and `MONGODB_URI` repository secrets. GitHub's runners don't have fixed IP addresses, so Atlas network access has to allow connections from anywhere; give the database user a long generated password and access to the `portfolio` database only.

## License

MIT
