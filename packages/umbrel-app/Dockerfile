FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY . .

# build frontend
WORKDIR /app
RUN bun install

RUN bun run build

FROM base AS release
WORKDIR /app
COPY --from=install /app/build /app

EXPOSE 3000/tcp
ENTRYPOINT ["bun","run","index.js"]