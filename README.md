# 🚀 Hono + Drizzle Template

A project-ready template for building modern Node.js APIs using [Hono](https://hono.dev/) web framework and [Drizzle ORM](https://orm.drizzle.team/). This template includes authentication, JWT management, database integration, and follows clean architecture principles.

## ✨ Features

- 🔥 **[Hono](https://hono.dev/)** - Ultra-fast web framework
- 🗃️ **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL ORM
- 🔐 **JWT Authentication** - Access & refresh token management
- 🍪 **Secure Cookies** - HTTP-only cookie handling
- 🛡️ **Security Headers** - Built-in security middleware
- 📝 **TypeScript** - Full type safety
- 🎯 **Clean Architecture** - Organized folder structure
- 🔄 **Token Refresh** - Automatic token rotation
- 🧹 **Cleanup Jobs** - Expired token cleanup
- 🗄️ **MySQL Support** - Pre-configured for MySQL

## 🚀 Quick Start

### Using npx degit (Recommended)

```bash
# Clone the template
npx degit helmorritualo/hono-drizzle-template {project-folder-name}

# Navigate to project directory
cd my-project

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
hono-drizzle-template/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database connection setup
│   │   └── env.ts              # Environment variables
│   ├── controllers/            # Route controllers
│   │   ├── routes.ts           # Route aggregation
│   │   ├── auth/               # Authentication controllers
│   │   │   ├── auth.controller.ts
│   │   │   └── route.ts
│   │   └── user/               # User controllers
│   │       ├── user.controller.ts
│   │       └── route.ts
│   ├── db/                     # Database related files
│   │   └── schema/             # Drizzle schema definitions
│   │       └── schema.ts
│   ├── jobs/                   # Background jobs
│   │   └── clean-expired-tokens.ts
│   ├── middlewares/            # Custom middlewares
│   │   ├── authentication.ts   # JWT authentication middleware
│   │   └── error-handler.ts    # Global error handler
│   ├── models/                 # Data access layer
│   │   └── auth.model.ts       # Authentication model
│   ├── utils/                  # Utility functions
│   │   ├── cookies.ts          # Cookie management
│   │   ├── custom-error.ts     # Custom error classes
│   │   └── jwt.ts              # JWT utilities
│   └── index.ts                # Application entry point
├── drizzle.config.ts           # Drizzle configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/your_database
# Example: mysql://demo:demo@localhost:3306/drizzle_demo

# JWT Secrets (Use strong, random strings)
JWT_SECRET=your-super-secret-access-token-key-here
REFRESH_JWT_SECRET=your-super-secret-refresh-token-key-here

# Token Expiry
ACCESS_TOKEN_EXPIRY=    # Set your own expiry
REFRESH_TOKEN_EXPIRY=

# Cookie Secret
COOKIE_SECRET=your-cookie-secret-key-here
```

### Database Setup

1. **Create MySQL Database**:

   - If you are using xampp, create a database in phpMyAdmin

   ```sql
   CREATE DATABASE your_database_name;
   ```

2. **Update DATABASE_URL** in your `.env` file with your database credentials

3. **Generate and Push Schema**:

   ```bash
   # Generate SQL migrations files in ./Drizzle Folder(auto-generated)
   npm run db:generate

   # Apply schema to database
   npm run db:push
   ```

## 🏗️ Architecture Guidelines

### 1. Controllers

Controllers handle HTTP requests and responses. They should be thin and delegate business logic to models or services.

### 2. Models

Models contain data access logic and interact with the database using Drizzle ORM.

### 3. Routes

Define your API routes in separate files and aggregate them in `controllers/routes.ts`.


### 4. Middleware

Create reusable middleware for cross-cutting concerns like authentication, logging, etc.

### Authentication Endpoints

```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/refresh-token # Token refresh
POST /api/v1/auth/logout       # Logout (single session)
POST /api/v1/auth/logout-all   # Logout all sessions
```

### Protected Routes

```
GET /api/v1/profile            # Get user profile (requires auth)
```

## 🛡️ Security Features

- **Secure Headers**: Automatic security headers via Hono middleware
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Token Rotation**: Automatic refresh token rotation
- **Input Validation**: Zod integration ready for request validation

## 🔨 Development Guidelines

### Adding New Features

1. **Create Database Schema** (if needed):

   ```typescript
   // src/db/schema/schema.ts
   export const newTable = table("new_table", {
     id: t.int("id").primaryKey().autoincrement(),
     // ... fields
   });
   ```

2. **Create Model**:

   ```typescript
   // src/models/new.model.ts
   export const createNewEntity = async (data) => {
     return await db.insert(newTable).values(data);
   };
   ```

3. **Create Controller**:

   ```typescript
   // src/controllers/new/new.controller.ts
   export const handleNewFeature = async (c: Context) => {
     // Implementation
   };
   ```

4. **Create Routes**:

   ```typescript
   // src/controllers/new/route.ts
   const newRouter = new Hono();
   newRouter.post("/endpoint", handleNewFeature);
   export default newRouter;
   ```

5. **Add to Route Aggregation**:
   ```typescript
   // src/controllers/routes.ts
   import newRouter from "./new/route";
   export const routes = [authRouter, userRouter, newRouter];
   ```

## 📞 Support

If you have any questions or need help with the template, please:

1. Check the [Issues](https://github.com/your-username/my-hono-drizzle-template/issues) page
2. Create a new issue if your question hasn't been answered

---
**Happy coding! 🎉**
