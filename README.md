# 🚀 Hono + Drizzle Template

A project-ready template for building modern Node.js APIs using [Hono](https://hono.dev/) web framework and [Drizzle ORM](https://orm.drizzle.team/). This template includes authentication, JWT management, database integration, and follows clean architecture principles.

## ✨ Features

- 🔥 **[Hono](https://hono.dev/)** - Ultra-fast web framework
- 🗃️ **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL ORM
- 🔐 **JWT Authentication** - Access & refresh token management
- 🍪 **Secure Cookies** - HTTP-only cookie handling
- 🛡️ **Security Headers** - Built-in security middleware
- ✅ **Input Validation** - Global Zod-based request validation
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
│   │   ├── error-handler.ts    # Global error handler
│   │   └── global-validator.ts # Global input validation middleware
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
   # Generate SQL migrations files in ./Drizzle/megration Folder(auto-generated)
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
- **Global Validation Middleware**: Type-safe input validation with detailed error messages

## ✅ Global Input Validator

This template includes a powerful global input validation system using [Zod](https://zod.dev/) that provides type-safe request validation with detailed error reporting.

### Features

- **Multiple Validation Targets**: Validate JSON body, query parameters, route parameters, and headers
- **Type Safety**: Full TypeScript integration with auto-completion
- **Detailed Error Messages**: Comprehensive validation error reporting
- **Easy Integration**: Simple middleware functions for quick implementation

### Usage Examples

#### 1. JSON Body Validation

```typescript
import { z } from "zod";
import { validateJson, getValidatedData } from "@/middlewares/global-validator";

// Define your schema
const registerSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Use in your route
authRouter.post("/register", validateJson(registerSchema), async (c) => {
  // Get validated data with full type safety
  const { email, password, name } = getValidatedData<z.infer<typeof registerSchema>>(c, "json");

  // Your controller logic here...
});
```

#### 2. Query Parameters Validation

```typescript
import { validateQuery } from "@/middlewares/global-validator";

const searchSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
});

userRouter.get("/search", validateQuery(searchSchema), async (c) => {
  const { page, limit, search } = getValidatedData<z.infer<typeof searchSchema>>(c, "query");
  // Your logic here...
});
```

#### 3. Route Parameters Validation

```typescript
import { validateParam } from "@/middlewares/global-validator";

const userParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().positive()),
});

userRouter.get("/user/:id", validateParam(userParamSchema), async (c) => {
  const { id } = getValidatedData<z.infer<typeof userParamSchema>>(c, "param");
  // Your logic here...
});
```

#### 4. Header Validation

```typescript
import { validateHeader } from "@/middlewares/global-validator";

const headerSchema = z.object({
  "x-api-key": z.string().min(1, "API key is required"),
  "content-type": z.string().optional(),
});

apiRouter.use("/protected/*", validateHeader(headerSchema));
```

### Custom Validation Function

You can also use the base `validator` function for custom validation targets:

```typescript
import { validator } from "@/middlewares/global-validator";

// Custom middleware for specific validation needs
const customValidator = validator("json", myCustomSchema);
```

### Error Response Format

When validation fails, the middleware automatically returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "issues": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["email"],
        "message": "Required"
      }
    ]
  }
}
```

### Best Practices

1. **Define schemas outside of route handlers** for reusability
2. **Use descriptive error messages** to help API consumers
3. **Combine with TypeScript inference** for full type safety
4. **Validate early** in your request pipeline
5. **Use transforms** for data conversion (strings to numbers, etc.)

### Available Validation Functions

- `validateJson(schema)` - Validates request body JSON
- `validateQuery(schema)` - Validates query parameters
- `validateParam(schema)` - Validates route parameters
- `validateHeader(schema)` - Validates request headers
- `validator(target, schema)` - Base validation function
- `getValidatedData<T>(context, target)` - Retrieves validated data with type safety

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
   import { z } from "zod";
   import { validateJson, getValidatedData } from "@/middlewares/global-validator";

   // Define validation schema
   const newFeatureSchema = z.object({
     name: z.string().min(1, "Name is required"),
     description: z.string().optional(),
   });

   export const handleNewFeature = async (c: Context) => {
     // Get validated data with type safety
     const data = getValidatedData<z.infer<typeof newFeatureSchema>>(c, "json");
     // Implementation
   };
   ```

4. **Create Routes**:

   ```typescript
   // src/controllers/new/route.ts
   import { validateJson } from "@/middlewares/global-validator";
   import { newFeatureSchema } from "./schemas"; // Optional: separate schema file

   const newRouter = new Hono();
   newRouter.post("/endpoint", validateJson(newFeatureSchema), handleNewFeature);
   export default newRouter;
   ```

5. **Add to Route Aggregation**:
   ```typescript
   // src/controllers/routes.ts
   import newRouter from "./new/route";
   export const routes = [authRouter, userRouter, newRouter];
   ```

### Schema Organization

For better maintainability, consider creating separate schema files:

```typescript
// src/controllers/new/schemas.ts
import { z } from "zod";

export const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const updateSchema = createSchema.partial(); // All fields optional

export const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)),
  search: z.string().optional(),
});
```

## 📞 Support

If you have any questions or need help with the template, please:

1. Check the [Issues](https://github.com/your-username/my-hono-drizzle-template/issues) page
2. Create a new issue if your question hasn't been answered

---

**Happy coding! 🎉**
