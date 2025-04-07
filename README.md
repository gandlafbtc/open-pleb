# OpenPleb

![openpleb](./openpleb.png)

OpenPleb is a platform for matching users that want to pay a banking QR with bitcoin, and earners that want to earn bitcoin for paying the users offers.

## Architecture Overview

The architecture is built on the monorepo pattern. All code can be found in the `packages` directory. The `backend` is written in TypeScript and uses bun.js as the runtime and elysia.js as the API framework. The `frontend` is written in SvelteKit. For persistence, PostgreSQL is used with drizzle as the ORM. Shared logic is placed in the `common` package.

## General Flow

The architecture contains 4 roles: 

1. **Maker**: A user who wants to pay a banking QR with bitcoin.
2. **Taker**: An earner who wants to earn bitcoin for paying the users offers.
3. **Server**: Platform facilitating the matching between makers and takers.
4. **Mint**: Custodian while a match is in progress.

![flow](docs/flow.svg)

