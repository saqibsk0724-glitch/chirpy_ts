# Chirpy – Backend API

A RESTful backend API built with TypeScript, Node.js, Express, and PostgreSQL.

Chirpy allows users to create, retrieve, update, and delete short messages called chirps. This project was built as part of the Boot.dev backend development course to gain practical experience building backend applications.

## Features

- User registration and account management
- Password hashing using Argon2
- JWT-based authentication
- Refresh token generation and revocation
- Create, retrieve, and delete chirps
- Filter chirps by author ID
- Sort chirps by creation date (ascending or descending)
- Authorization and ownership checks
- Chirpy Red upgrades through Polka webhooks
- Database migrations using Drizzle ORM
- Request logging and API metrics

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT and Argon2
- **Testing:** Vitest
- **Package Manager:** npm

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

## Installation

### 1. Clone the repository

    git clone https://github.com/saqibsk0724-glitch/chirpy_ts.git

### 2. Navigate to the project directory

    cd chirpy_ts

### 3. Install dependencies

    npm install

### 4. Configure environment variables

Create a `.env` file in the root directory:

    PORT=8080
    PLATFORM=dev
    DB_URL="postgres://postgres:postgres@localhost:5432/chirpy_ts?sslmode=disable"
    JWT_SECRET=your_secret_key
    POLKA_KEY=your_polka_api_key

Replace the database credentials and secret values with your own configuration.

### 5. Create the PostgreSQL database

    sudo -u postgres createdb chirpy_ts

Make sure PostgreSQL is running.

### 6. Build the project

    npm run build

### 7. Start the server

    npm start

The server will run at:

    http://localhost:8080

For development, run:

    npm run dev

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/healthz` | Check API health |
| POST | `/api/users` | Create a user |
| PUT | `/api/users` | Update user information |
| POST | `/api/login` | Log in |
| POST | `/api/refresh` | Refresh access token |
| POST | `/api/revoke` | Revoke refresh token |
| GET | `/api/chirps` | Get all chirps |
| GET | `/api/chirps/:chirpId` | Get a specific chirp |
| POST | `/api/chirps` | Create a chirp |
| DELETE | `/api/chirps/:chirpId` | Delete a chirp |
| POST | `/api/polka/webhooks` | Handle Chirpy Red upgrades |
| GET | `/admin/metrics` | View server metrics |
| POST | `/admin/reset` | Reset development data |

## Chirp Filtering and Sorting

The `/api/chirps` endpoint supports optional query parameters.

### Filter by author

    GET /api/chirps?authorId=USER_ID

### Sort in ascending order

Oldest chirps first:

    GET /api/chirps?sort=asc

### Sort in descending order

Newest chirps first:

    GET /api/chirps?sort=desc

### Combine filtering and sorting

    GET /api/chirps?authorId=USER_ID&sort=desc

## Testing

Run the test suite:

    npm test

## Project Structure

    chirpy_ts/
    ├── src/
    │   ├── api/              # API handlers and middleware
    │   ├── db/
    │   │   ├── migrations/   # Database migrations
    │   │   └── queries/      # Database queries
    │   ├── app/              # Static application files
    │   ├── auth.ts           # Authentication utilities
    │   ├── config.ts         # Application configuration
    │   └── index.ts          # Application entry point
    ├── .env                  # Environment variables (not committed)
    ├── .gitignore
    ├── drizzle.config.ts
    ├── package.json
    └── tsconfig.json

## What I Learned

- Building REST APIs using Node.js and Express.
- Writing backend applications with TypeScript.
- Working with PostgreSQL and relational databases.
- Using Drizzle ORM for database operations and migrations.
- Implementing authentication and authorization.
- Working with JWTs and refresh tokens.
- Creating reusable middleware.
- Organizing and structuring backend projects.

## Acknowledgements

- [Boot.dev](https://www.boot.dev/) – Backend development course and project guidance.
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)

---

Built with TypeScript, Node.js, and PostgreSQL.
