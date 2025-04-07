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

## Docker Setup and Run instruction

Open Pleb can be easily deployed using Docker and Docker compose. The setup inclouds a PostgreSQL database and a pgAdmin instance for database management.

### Prerequisites

- [Docker] (https://www.docker.com/get-started) installed on your system
- [Docker Compose] (https://docs.docker.com/compose/install/) installed on your system

### Running the Application

1. **Clone the Repository**
    ```bash
   git clone https://github.com/yourusername/openpleb.git
   cd openpleb
   ```
2. **Start the services using Docker compose:**
    ```bash
    docker-compose up -d
    ```

3. **Access the services:**
- PostgreSQL: Accessible on port 5432  
    -  Username : postgres  
    -  Password : postgres  
    -  Database : postgres  
- pgAdmin: Accessible on port 5050  
    -  Username : admin@example.com
    -  Password : admin

    > **Security Tip:**  
    > Using default credentials (Username: `postgres`, Password: `postgres`) is not secure.  
    > In production environments, always change to a strong username and password.  
    > To update PostgreSQL credentials, modify the `POSTGRES_USER` and `POSTGRES_PASSWORD` values in the `docker-compose.yml` file.

4. **Stop the services:** 
    To stop the containers and remove the volumes (which will delete all data):  
    ```bash
    docker-compose down
    ```

    To stop the contianers and remove the volumes (which will delete all data):
    ```bash
    docker-compose down -v
    ```

    

