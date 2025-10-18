# syntax=docker/dockerfile:1.6

FROM --platform=$BUILDPLATFORM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY . .

# build backend
WORKDIR /app/packages/backend
RUN mkdir -p empty/logs
RUN bun install

# arch mapping
ARG TARGETARCH
ENV BUN_TARGET=bun-linux-x64
RUN if [ "$TARGETARCH" = "arm64" ]; then BUN_TARGET=bun-linux-arm64; fi \
    && echo "Building for $BUN_TARGET" \
    && bun build --compile --minify --sourcemap --target=$BUN_TARGET ./src/index.ts --outfile openpleb

FROM --platform=$TARGETPLATFORM oven/bun:1 AS release
ENV OPENPLEB_PORT=3003
ENV OPENPLEB_LOG_FILE_NAME=/app/data/logs/app.log
WORKDIR /app
COPY --from=install /app/packages/backend/openpleb /app/openpleb
COPY --from=install /app/data/migrations /app/migrations
EXPOSE 3003/tcp
ENTRYPOINT ["./openpleb"]