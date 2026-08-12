# Ticket Booking Backend

A NestJS ticket booking backend with PostgreSQL persistence, JWT authentication, role-based access control, and scheduled order cleanup.

## Technologies

- Node.js + npm
- TypeScript
- NestJS
- Express (via `@nestjs/platform-express`)
- TypeORM
- PostgreSQL
- Docker / Docker Compose
- Passport.js with `passport-jwt`
- JSON Web Tokens (JWT)
- `bcrypt` for password hashing
- `class-validator` and `class-transformer` for DTO validation
- `@nestjs/config` for environment configuration
- `@nestjs/schedule` for cron jobs
- `cookie-parser` for HTTP cookie handling
- Jest + `ts-jest` for testing
- ESLint + Prettier for linting and formatting
- Supertest for integration testing

## Project structure

- `src/`
  - `auth/` - authentication controllers, service, guards, JWT strategy
  - `users/` - user entity, repository, refresh token handling, admin seeding
  - `tickets/` - ticket CRUD operations and entity model
  - `orders/` - order creation, confirmation, cancellation, and scheduled cleanup
- `Dockerfile` - multi-stage production image build
- `docker-compose.yml` - PostgreSQL service definition
- `package.json` - scripts and dependencies

## Features

- User registration and login
- JWT access tokens with refresh token issuance
- Role-based access control for admin ticket management
- Ticket creation, update, deletion, listing, and retrieval
- Order creation, confirmation, cancellation, and user order history
- Pessimistic stock locking during order creation
- Background job that cancels pending orders older than 10 minutes
- Admin account seeding via environment variables

## Requirements

- Node.js 20+
- npm
- PostgreSQL

## Environment variables

Create a `.env` file or set these values in your environment.

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - PostgreSQL database name
- `JWT_SECRET_KEY` - secret used to sign JWT tokens
- `JWT_EXPIRATION` - JWT token lifetime (for example: `15m`)
- `ADMIN_EMAIL` - admin user email to seed on startup
- `ADMIN_PASSWORD` - admin user password to seed on startup
- `PORT` - optional app port (defaults to `3000`)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL with Docker Compose:

   ```bash
   docker compose up -d
   ```

3. Set environment variables.

4. Start in development mode:

   ```bash
   npm run start:dev
   ```

5. Open the API at `http://localhost:3000`

## Docker usage

Build the image:

```bash
docker build -t ticket-booking-backend .
```

Run the container:

```bash
docker run --env-file .env -p 3000:3000 ticket-booking-backend
```

## npm scripts

- `npm run build` - build the NestJS application
- `npm run start` - start the built application
- `npm run start:dev` - start in watch mode
- `npm run start:debug` - start with debugger support
- `npm run lint` - run ESLint and auto-fix issues
- `npm run format` - format source files with Prettier
- `npm run test` - run Jest tests
- `npm run test:watch` - run Jest in watch mode
- `npm run test:cov` - run tests with coverage
- `npm run test:e2e` - run end-to-end tests

## API reference

### Auth

- `POST /auth/register` - register a new user
- `POST /auth/login` - login and receive an access token and an HTTP-only refresh token cookie
- `POST /auth/refresh` - refresh JWT tokens using `refreshToken` and `userId`

### Tickets

- `GET /tickets` - list tickets
- `GET /tickets/:id` - get ticket details
- `POST /tickets` - create a ticket (admin only)
- `PATCH /tickets/:id` - update a ticket (admin only)
- `DELETE /tickets/:id` - delete a ticket (admin only)

### Orders

- `POST /orders` - create a new order (authenticated users)
- `GET /orders/me` - get current user orders
- `PATCH /orders/:id/confirm` - confirm a pending order
- `PATCH /orders/:id/cancel` - cancel a pending order

## Notes

- TypeORM is configured with `synchronize: true` for automatic schema synchronization.
- Refresh tokens are hashed and stored on the user record.
- Login sets an HTTP-only refresh token cookie; production uses `secure` cookies.
- Pending orders older than 10 minutes are cancelled by a scheduled cron job.
- Admin seeding only runs when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided.
