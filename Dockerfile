FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 STORYBOOK_DISABLE_TELEMETRY=1
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5173 ASTRO_TELEMETRY_DISABLED=1
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node scripts/start.mjs ./scripts/start.mjs
COPY --chown=node:node package.json ./package.json
RUN mkdir -p /app/.astro && chown node:node /app/.astro
USER node
EXPOSE 5173
CMD ["node", "scripts/start.mjs"]
