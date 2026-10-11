# Bookshelf

A local library for books and authors, built to show how an Astro SSR application connects React islands to a Clojure REST API. Companion to [bookshelf-api](https://github.com/matlux/bookshelf-api), implementing [frontend issue #4](https://github.com/matlux/bookshelf-api/issues/4).

## Run locally

Use Node 22.12 or newer (the project is tested with Node 22), npm, and a running backend. With both checkouts next to one another:

```sh
cd ../bookshelf-api
docker compose up --build -d
cd ../bookshelf-fe
nvm use # optional, if you use nvm
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Astro 7 manages the development server in the background; use `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop` to inspect or stop it. The default backend is http://127.0.0.1:3000. Existing backend data stays in its PostgreSQL volume.

| Variable | Default | Meaning |
| --- | --- | --- |
| `BOOKSHELF_API_URL` | `http://127.0.0.1:3000` | Backend HTTP(S) origin, without a path or credentials; server-side only |
| `PORT` | `5173` | Frontend listening port, used by dev, preview, production, and Compose |
| `ROLLUP_STALE_SECONDS` | `60` | Positive age threshold for the dashboard’s stale indicator |
| `BOOKSHELF_API_PATH` | `../bookshelf-api` | Local backend checkout used by Docker Compose |
| `HOST` | `127.0.0.1` | Production bind address; Docker uses `0.0.0.0` internally |

The Node launch scripts load `.env`; environment variables already set in the shell take precedence. For example, `PORT=5174 npm run dev` changes the frontend port. Backend settings are read at request time, so the production image can use a different API origin without rebuilding.

## Screens

- **Books:** server-side title/author filtering, sorting, and limit/offset pagination; create, edit, and confirmed delete. Filters are reflected in the URL and restored on reload or browser navigation. Title search waits 300 ms before requesting data.
- **Authors:** create, rename, and confirmed delete. A referenced author stays in the dialog with the API’s conflict message.
- **Overview:** a books-per-author chart and table, per-row refresh timestamps, freshness badges, and manual refetch.
- **Service status:** liveness and dependency readiness, PostgreSQL/Redis state, HTTP status, round-trip latency, and request IDs. A 503 readiness response is shown as degraded.

Shared navigation, persisted light/dark appearance, mobile layouts, island error boundaries, and a useful 404 page complete the shell.

## How the pieces connect

```text
Astro page / SSR layout
  → React island + its QueryClient and error boundary
  → feature hooks (TanStack Query)
  → single API client + request ID
  → same-origin Astro /api/v1/* proxy
  → bookshelf-api → PostgreSQL / Redis worker
```

Astro renders the navigation and initial island/loading markup on the server. React hydrates the interactive screens and fetches their data in the browser. The browser always requests its own origin; `src/server/proxy.ts` forwards to `BOOKSHELF_API_URL`, preserving method, query, body, status, and `X-Request-ID`. It returns JSON 502 when the backend cannot be reached. This avoids needing CORS configuration when changing frontend ports. The backend’s direct-browser CORS support is not needed by this frontend.

`src/api/client.ts` handles JSON and empty 204 responses and creates `ApiError` values with status, message, request ID, and response data. It explicitly handles 400/404/409/422/502/503/504; mutations never retry automatically. `src/api/queries/books.api.ts` contains requests; `books.queries.ts` owns hooks and query keys; `books.mutations.ts` invalidates related book, author, and rollup caches after changes.

React Query owns server data. Nanostores own client state: each books island creates its own filter store to avoid cross-request SSR state, while the theme store persists locally. React Hook Form and Zod validate names/titles (1–300 characters), positive author IDs, and years (1–9999). The author selector uses the current author list; the backend remains authoritative if an author disappears during editing.

Base shadcn/Radix primitives live in `src/components/ui`; B-prefixed application wrappers live in `src/components/bookshelf`, each with a Storybook story. Feature components build on those wrappers. Tailwind 3 and `global.css` define the shared theme; no external fonts or images are fetched.

## API types

`src/types/schema.ts` is generated from the backend’s Swagger 2 document. `api/swagger.json` records the source snapshot. Small aliases live in `src/types/api.ts`.

```sh
# Backend must be running; the configured origin is used.
npm run types:generate
npm run build
```

The generator converts Swagger 2 to OpenAPI 3 with `swagger2openapi`, preserves Malli singleton values as enums, and uses `openapi-typescript`. Commit both the snapshot and regenerated types when the backend contract changes.

## Tests and component development

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:stories
npm run build:storybook
npm run storybook # http://localhost:6006

# Start the backend and frontend first. This test uses real API data.
npm run test:e2e
# Target another running frontend:
FRONTEND_URL=http://127.0.0.1:15173 npm run test:e2e
```

Unit tests cover query keys, error normalization, URL stores, validation/freshness, proxy forwarding/failure, and MSW-backed feature behavior. Storybook runs component stories in Chromium through addon-vitest. Both use shared MSW handlers and fixtures; mock handlers are never registered in the application.

The end-to-end suite creates uniquely named temporary records, exercises CRUD, a referenced-author conflict, URL state, rollup data, health, persisted theme, mobile overflow, and 404 navigation. It fails on browser errors (including hydration errors), and deletes only records it created in a `finally` cleanup. Screenshots and failure traces are written under ignored `test-results/`.

Biome is the only formatter/linter: `npm run format` applies formatting and safe fixes. Generated schema, MSW worker, build output, and test artifacts are excluded. Astro compiler checks cover template imports that Biome cannot yet track reliably.

## Production and Docker

```sh
npm run build
PORT=5174 npm run start:prod
# Or inspect the build with npm run preview (stop with npx astro preview stop).
```

The multi-stage Dockerfile installs from the lockfile, builds the SSR bundle, omits development dependencies in the runtime stage, and runs as the non-root `node` user.

To start an entire separate local stack, first stop any stack already using the default ports, then:

```sh
BOOKSHELF_API_PATH=../bookshelf-api docker compose up --build -d
```

Docker Compose v2 with `include` support is required. The included backend definition brings PostgreSQL, Redis, migrations, API, and worker; its build paths resolve relative to the backend checkout. Frontend requests use `http://api:3000` inside Docker. Published ports bind only to localhost. This project has its own Compose PostgreSQL volume; it does not reuse an already-running backend project’s data.

To run beside an existing backend without port conflicts:

```sh
PORT=15173 API_HOST_PORT=13000 POSTGRES_HOST_PORT=15432 REDIS_HOST_PORT=16379 \
  docker compose -p bookshelf-fe-validation up --build -d
```

Open http://localhost:15173. Use the same environment overrides/project name with later Compose commands. `docker compose down` stops that stack and retains its database volume.

## Validation of the initial implementation

Verified locally with Node 22 and the companion backend:

- Clean `npm ci`; Biome lint; Astro type check and production build.
- 30 unit/component tests and 15 Storybook Chromium tests; static Storybook build.
- Real browser workflows against development, host production, and Docker production servers, including a persisted-theme hydration regression check.
- Runtime port overrides, non-root container user, Compose health checks, and reproducible Swagger type generation.
- An isolated Redis outage returned readiness 503 while liveness stayed 200; the UI displayed Degraded. Stopping the isolated API returned JSON 502 with the original request ID. Services were restored after the checks.
- Source and lockfile scan found no credential signatures, private registry URLs, or unrelated business terms. All resolved lockfile dependencies use `registry.npmjs.org`.

These are local verification results, not a hosted CI/deployment pipeline.

## Intentional limits

This is a local learning app with **no authentication or authorization**. Keep it on localhost; it is not a hosted multi-user service. There are no cloud SDKs, runtime analytics, external error-reporting integrations, tokens, or private registries. Astro and Storybook telemetry are disabled in project scripts/configuration.

The API returns book arrays without a total count. A full page enables Next; an exact multiple of the page size may lead to an empty final page with a way back. IDs use JavaScript safe integers. Author lists are unpaginated because that is the API contract.

Rollups are eventually consistent: mutations trigger the backend’s Redis worker, while refetch only reads PostgreSQL’s current rollup. A cache invalidation can arrive before the worker update, so use Refresh after a moment. A stale badge measures snapshot age, which can grow even when an idle library is consistent; it does not prove that data is wrong.

MIT licensed. See [LICENSE](LICENSE).
