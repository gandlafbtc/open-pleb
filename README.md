# OpenPleb

![openpleb](./openpleb.png)

OpenPleb is a platform for matching users that want to pay a banking QR with bitcoin, and earners that want to earn bitcoin for paying the users offers.

## UNDER CONSTRUCTION!

This project is under construction, and we are working on it actively. It is not considered ready for production use.

### Progress

_First prototype will be done without bonds_

- [ ] `bond` creation (use cashu tokens as `bonds`, to ensure incentives for both parties are aligned)
    - [ ] Issue `bond` tokens
    - [ ] store and handle `bond` tokens locally
- [ ] `offer` creation
    - [x] `offer` creation UX (scan bank QR and enter amount)
    - [ ] `offer` validation (`bond`)
    - [x] Lightning payment & validation
    - [ ] Mint and store ecash 
    - [x] List `offer` and persistence
    - [x] `offer` live updates
- [ ] Claiming offers
    - [ ] claim UX (select `offer`)
    - [ ] claim validation (`bond`)
    - [ ] claim expiry
- [ ] paying `offer`
    - [x] display payment details (payment out-of-band)
    - [x] upload receipt UX
    - [x] receipt live updates
- [ ] receipt aproval
    - [x] Approve receipt UX
        - [x] Dispurse funds (cashu token)
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


