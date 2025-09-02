# Doorkita Backend

A healthcare platform backend service built with NestJS that enables secure interactions between doctors, patients, and labs. This system allows doctors to create lab orders, labs to upload results, and patients to view their own results with comprehensive audit logging for compliance.

## Features

- **JWT Authentication** with role-based access control
- **Role Management**: Doctor, Lab, Patient roles with specific permissions
- **Lab Orders**: Create and manage laboratory test orders
- **Results Management**: Upload and view test results
- **Audit Logging**: Complete audit trail for all actions
- **PostgreSQL Database** with TypeORM
- **Docker Support** for easy deployment

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Yarn package manager

## Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd doorkita-backend
   ```

2. **Start the services**

   ```bash
   docker-compose up -d
   ```

3. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

The application will be available at `http://localhost:3000` and PostgreSQL at `localhost:5432`.

## Local Development Setup

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Start PostgreSQL** (using Docker)

   ```bash
   docker run --name doorkita-postgres -e POSTGRES_DB=doorkita_db -e POSTGRES_USER=doorkita_user -e POSTGRES_PASSWORD=doorkita_password -p 5432:5432 -d postgres:15-alpine
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=doorkita_db
   DATABASE_USER=doorkita_user
   DATABASE_PASSWORD=doorkita_password
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Run the application**

   ```bash
   # development with hot reload
   yarn start:dev

   # production
   yarn build
   yarn start:prod
   ```

## API Endpoints

Once the application is running, you can access:

- **Health Check**: `GET /`
- **API Documentation**: Swagger UI will be available at `/api` (when implemented)

## Testing

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Clean up volumes (WARNING: deletes database data)
docker-compose down -v
```

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts                # Application entry point
├── auth/                  # Authentication module
├── users/                 # User management
├── lab-orders/           # Lab orders management
├── results/              # Test results management
├── audit-logs/           # Audit logging
└── utils/                # Utility functions
```

## Environment Variables

| Variable            | Description        | Default             |
| ------------------- | ------------------ | ------------------- |
| `NODE_ENV`          | Environment mode   | `development`       |
| `PORT`              | Application port   | `3000`              |
| `DATABASE_HOST`     | PostgreSQL host    | `localhost`         |
| `DATABASE_PORT`     | PostgreSQL port    | `5432`              |
| `DATABASE_NAME`     | Database name      | `doorkita_db`       |
| `DATABASE_USER`     | Database user      | `doorkita_user`     |
| `DATABASE_PASSWORD` | Database password  | `doorkita_password` |
| `JWT_SECRET`        | JWT signing secret | (required)          |

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Doctor, Lab, Patient accounts
- **Lab Orders**: Test orders created by doctors
- **Results**: Test results uploaded by labs
- **Audit Logs**: Complete audit trail of all actions

## Security Considerations

- JWT tokens with configurable expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation with class-validator
- Audit logging for compliance
- CORS configuration (to be implemented)

## Future Enhancements

- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Email notifications
- [ ] File upload for lab results
- [ ] FHIR standard integration
- [ ] Horizontal scaling considerations

## License

This project is licensed under the MIT License.
