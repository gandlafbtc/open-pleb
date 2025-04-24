# OpenPleb

![openpleb](./openpleb.png)

OpenPleb is a platform for matching users that want to pay a banking QR with bitcoin, and earners that want to earn bitcoin for paying the users offers.

## UNDER CONSTRUCTION!

This project is under construction, and we are working on it actively. It is not considered ready for production use.

### Progress

- [x] `bond` creation (use cashu tokens as `bonds`, to ensure incentives for both parties are aligned)
    - [x] Issue `bond` tokens
    - [x] store and handle `bond` tokens locally
- [x] `offer` creation
    - [x] `offer` creation UX (scan bank QR and enter amount)
    - [x] `offer` validation (`bond`)
    - [x] Lightning payment & validation
    - [x] Mint and store ecash 
    - [x] List `offer` and persistence
    - [x] `offer` live updates
    - [ ] `offer` expiry
- [x] Claiming offers
    - [x] claim UX (select `offer`)
    - [x] claim validation (`bond`)
    - [] claim expiry
- [x] paying `offer`
    - [x] display payment details (payment out-of-band)
    - [x] upload receipt UX
    - [x] receipt live updates
- [ ] receipt aproval
    - [x] Approve receipt UX
        - [x] Dispurse funds to local wallet (cashu token)
        - [ ] Dispurse funds (to ln adress)
    - [ ] Reject receipt UX
- [ ] resolve conflicts
    - [ ] Handle bonds
    - [ ] Handle inflight funds
    - [ ] handle refunds




## Architecture Overview

The architecture is built on the monorepo pattern. All code can be found in the `packages` directory. The `backend` is written in TypeScript and uses bun.js as the runtime and elysia.js as the API framework. The `frontend` is written in SvelteKit. For persistence, PostgreSQL is used with drizzle as the ORM. Shared logic is placed in the `common` package.

## General Flow

The architecture contains 4 roles: 

1. **Maker**: A user who wants to pay a banking QR with bitcoin.
2. **Taker**: An earner who wants to earn bitcoin for paying the users offers.
3. **Server**: Platform facilitating the matching between makers and takers.
4. **Mint**: Custodian while a match is in progress.

![flow](docs/flow.svg)



### Disputes

Fiat banking usually doesn't offer open protocols that would allow us to make atomic swaps. Thus, we have to rely on participants to act in their best intrest, to preserve their bonds. Disputes are handled in the following way: 

![dispute flow](docs/dispute.svg)

## development setup


### requirements

- bun.js
- docker
- docker-compose

### setup steps

1. change the `.env` files accordingly (see .env.example for an example)
1. run `docker-compose up` to start the local database
1. navigate to `packages/common` and run `bun i && bun run db:push` to migrate the database schema
2. navigate to `packages/backend` and run `bun i && bun run dev` to start the backend server
3. navigate to `packages/frontend` and run `bun i  && bun run dev` to start the frontend development server


## Environment Configuration

**IMPORTANT**: WHEN RUNNING IN PRODUCTION, YOU NEED TO CONFIGURE THE ENVIRONMENT VARIABLES FOR YOUR OWN ENVIRONMENT! ESPACIALLY THE `DATABASE_URL` SHOULD BE CHANGED TO USE NON DEFAULT CREDENTIALS


OpenPleb requires several environment variables to be configured for proper operation. Below are instructions for configuring environment variables for both local development and Docker deployment.

### Local Development (.env Files)

For local development, you need to create `.env` files in each package directory by copying the corresponding `.env.example` files:

```bash
# For the backend
cp packages/backend/.env.example packages/backend/.env

# For the frontend
cp packages/frontend/.env.example packages/frontend/.env

# For common code
cp packages/common/.env.example packages/common/.env
```

#### Backend Environment Variables

The backend requires the following environment variables in `packages/backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
FRONTEND_URL=localhost:5137
PORT=3004
LOG_FILE_NAME="../../data/logs/app.log"
PUBLIC_PLATFORM_FEE_PERCENTAGE=1
PUBLIC_PLATFORM_FEE_FLAT_RATE=100
PUBLIC_TAKER_FEE_PERCENTAGE=1
PUBLIC_TAKER_FEE_FLAT_RATE=100
PUBLIC_MINT_URL=http://localhost:3003
PUBLIC_BOND_PERCENTAGE=10

```

#### Frontend Environment Variables

The frontend requires the following environment variables in `packages/frontend/.env`:

```
PUBLIC_BACKEND_URL=http://localhost:3004
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
PUBLIC_PLATFORM_FEE_PERCENTAGE=1
PUBLIC_PLATFORM_FEE_FLAT_RATE=100
PUBLIC_TAKER_FEE_PERCENTAGE=1
PUBLIC_TAKER_FEE_FLAT_RATE=100
PUBLIC_MINT_URL=http://localhost:3003
PUBLIC_API_VERSION=v1
PUBLIC_BOND_PERCENTAGE=10

```

#### Common Environment Variables

The common package requires the following environment variables in `packages/common/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
```

### Docker Deployment

For Docker deployment, environment variables are configured in multiple places:

#### 1. Docker Compose Configuration

The `docker-compose.yml` file contains environment variables for each service. Here's a basic configuration:

**Important notes for Docker Compose configuration:**
- When working with Docker Compose, use service names as hostnames for internal service communication (e.g., `postgres`, `backend`, `frontend`, `nutshell`)
- Ensure all services are on the same network

#### 2. Dockerfile

The `Dockerfile.frontend` file contains the environment variables for the frontend. 


### Building and Running

#### With Docker:

```bash
# Build and start all services
docker compose up --build
# OR just start all services without building again
docker compose up

# View logs
docker compose logs -f

# Stop all services
docker compose down
```
