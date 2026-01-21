# Production-grade Serverless E-commerce API with Lambda Layers

A production-ready, serverless e-commerce API built with TypeScript, MongoDB, and AWS Lambda. This project demonstrates best practices for serverless architecture, including Lambda Layers for dependency optimization, monorepo structure with Turborepo, and comprehensive local development setup.

## 🚀 Features

- **Serverless Architecture** - Built on AWS Lambda with Serverless Framework
- **Lambda Layers** - Optimized dependency management for smaller deployment packages
- **Monorepo Structure** - Turborepo-powered monorepo with shared packages
- **TypeScript** - Full type safety across the codebase
- **MongoDB Integration** - Mongoose ODM for database operations
- **JWT Authentication** - Secure user authentication and authorization
- **RESTful API** - Complete CRUD operations
- **Local Development** - Comprehensive tooling for offline Lambda testing
- **CI/CD Ready** - GitHub Actions workflows for automated deployment

## 🏗️ Architecture

### Monorepo Structure

```
├── apps/
│   └── ecommerce-api/          # Main API application
│       ├── layer/              # Lambda layer dependencies
│       ├── src/                # Application source code
│       └── serverless/         # Serverless configuration
├── packages/                   # Shared packages
│   ├── config/                 # Environment configuration
│   ├── constants/              # Shared constants
│   ├── db/                     # Database connection
│   ├── errors/                 # Custom error classes
│   ├── logger/                 # Logging utilities
│   ├── middlewares/            # Lambda middlewares
│   ├── utils/                  # Utility functions
│   └── validators/             # Zod validation schemas
└── turbo.json                  # Turborepo configuration
```

### Lambda Layer Architecture

This project uses AWS Lambda Layers to optimize deployment:

- **Production**: All runtime dependencies come from the Lambda layer
- **Local Development**: Dependencies available via workspace hoisting
- **Benefits**: Smaller deployment packages, faster cold starts, dependency reuse

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript
- **Framework**: Serverless Framework
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Build Tool**: esbuild
- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces

## 📋 Prerequisites

- **Node.js**: 20.x (use `.nvmrc` for version management)
- **npm**: 8.19.2 or higher
- **MongoDB**: 7.x (local or Docker)
- **AWS Account**: For deployment (optional for local development)
- **Serverless Framework**: Installed globally or via npx

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/amit373/express-sql-orm-comparison
cd serverless-ecommerce-api-turbo
npm install
```

### 2. Build Packages

```bash
npm run build:packages
```

### 3. Set Up Environment Variables

```bash
cd apps/ecommerce-api
cp .env.example .env  # If .env.example exists
# Edit .env with your configuration
```

Required environment variables:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce-dev
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-minimum
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-32-chars-minimum
AWS_REGION=us-east-1
STAGE=dev
```

### 4. Start MongoDB

```bash
# Option 1: Using Docker Compose (recommended)
make docker-up

# Option 2: Using local MongoDB
mongod
```

### 5. Run Local Development Server

```bash
cd apps/ecommerce-api
npm run dev
```

The API will be available at `http://localhost:3000`

**Note**: Routes are prefixed with `/dev/` in offline mode (e.g., `/dev/products`)

## 📚 Available Scripts

### Root Level

```bash
npm install              # Install all dependencies
npm run build            # Build all packages and apps
npm run build:packages   # Build only shared packages
npm run dev              # Run development server (via turbo)
npm run lint             # Lint all packages
npm run type-check       # Type check all packages
npm run test             # Run tests
```

### API Level

```bash
cd apps/ecommerce-api
npm run dev              # Start serverless offline
npm run build            # Build TypeScript
npm run build:layer      # Build Lambda layer
npm run deploy           # Deploy to AWS
npm run type-check       # Type check
```

### Make Commands

```bash
make help                # Show all available commands
make install             # Install dependencies and build packages
make dev                 # Start development server
make dev-with-db         # Start MongoDB and development server
make build-packages      # Build all packages
make docker-up           # Start Docker containers
make docker-down         # Stop Docker containers
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Users
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Products
- `GET /products` - Get all products (supports query params: page, limit, category, search)
- `POST /products` - Create product
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category

### Cart
- `GET /cart` - Get user cart (requires authentication)
- `POST /cart` - Add item to cart
- `PUT /cart` - Update cart item
- `DELETE /cart/{id}` - Remove item from cart
- `POST /cart/clear` - Clear cart

### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order by ID

**Note**: In local development, all routes are prefixed with `/dev/` (e.g., `/dev/products`)

## 🧪 Testing Locally

### Example Requests

```bash
# Register a user
curl -X POST http://localhost:3000/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Get products
curl http://localhost:3000/dev/products

# Get categories
curl http://localhost:3000/dev/categories
```

## 🚢 Deployment

### Prerequisites

1. Configure AWS credentials:
```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1
```

2. Build the Lambda layer:
```bash
cd apps/ecommerce-api
npm run build:layer
```

### Deploy to AWS

```bash
cd apps/ecommerce-api

# Deploy to dev stage
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

The deployment process will:
1. Build and deploy the Lambda layer
2. Build the API functions (with dependencies marked as external)
3. Deploy all functions with the layer attached
4. Create/update API Gateway endpoints

### CI/CD

GitHub Actions workflows are configured in `.github/workflows/deploy-layer-api.yml`:
- Automatic deployment on push to `main` (production) or `develop` (dev)
- Runs tests, linting, and type checking before deployment
- Builds and deploys the layer before the API

## 📦 Lambda Layer

The Lambda layer contains all production runtime dependencies:

- `@packages/*` - All workspace packages
- `mongoose` - MongoDB ODM
- `zod` - Schema validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens

**Key Benefits:**
- Smaller deployment packages (dependencies not bundled)
- Faster cold starts
- Dependency reuse across functions
- Easier dependency updates

## 🏛️ Project Structure

```
serverless-ecommerce-api-turbo/
├── apps/
│   └── ecommerce-api/          # Main API application
│       ├── layer/              # Lambda layer
│       │   └── nodejs/         # Layer dependencies
│       ├── scripts/            # Build scripts
│       ├── serverless/         # Serverless config files
│       └── src/
│           ├── controllers/    # Request handlers
│           ├── functions/      # Lambda function handlers
│           ├── models/         # Mongoose models
│           └── services/       # Business logic
├── packages/                   # Shared packages
│   ├── config/                 # Environment config
│   ├── constants/              # Constants
│   ├── db/                     # DB connection
│   ├── errors/                 # Error classes
│   ├── logger/                # Logging
│   ├── middlewares/            # Lambda middlewares
│   ├── utils/                 # Utilities
│   └── validators/            # Zod schemas
├── .github/
│   └── workflows/             # CI/CD workflows
├── docker-compose.yml         # Local MongoDB
├── Makefile                   # Common commands
├── turbo.json                 # Turborepo config
└── package.json               # Root package.json
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `apps/ecommerce-api/`:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce-dev
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-minimum
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-32-chars-minimum
AWS_REGION=us-east-1
STAGE=dev
SALT_ROUNDS=10
```

### Serverless Configuration

Main configuration: `apps/ecommerce-api/serverless.yml`
- Function definitions: `apps/ecommerce-api/serverless/functions.yml`
- Resources: `apps/ecommerce-api/serverless/resources.yml`
- Custom config: `apps/ecommerce-api/serverless/custom.yml`

## 🐛 Troubleshooting

### Node Version Issues

**Problem**: `ERR_REQUIRE_ASYNC_MODULE` error with Node 22

**Solution**: Use Node.js 20.x
```bash
nvm install 20
nvm use 20
# Or use the .nvmrc file
nvm use
```

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solution**:
1. Ensure MongoDB is running: `docker ps | grep mongo` or `mongod`
2. Check `MONGODB_URI` in `.env` file
3. Default connection: `mongodb://localhost:27017/ecommerce-dev`

### Module Not Found Errors

**Problem**: Cannot find module `@packages/*`

**Solution**:
```bash
npm install
npm run build:packages
```

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: Change port in `serverless.yml`:
```yaml
custom:
  offline:
    httpPort: 3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run test && npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

ISC

## 🙏 Acknowledgments

- Serverless Framework
- AWS Lambda
- Turborepo
- MongoDB

---

**Built with ❤️ using Serverless Framework and AWS Lambda**
