# Business Navigator - Backend API

RESTful API for Business Navigator built with Bun + ElysiaJS + Supabase.

## Tech Stack

- **Runtime**: Bun - Fast JavaScript runtime
- **Framework**: ElysiaJS - High-performance web framework
- **Database**: Supabase (PostgreSQL) - Backend-as-a-Service
- **Authentication**: Supabase Auth - JWT-based authentication
- **Validation**: Zod - TypeScript schema validation
- **AI/LLM**: OpenAI/Anthropic (optional) - Business formation agents

## Features

✅ **Authentication** - Register, login, logout with Supabase Auth
✅ **Business Management** - CRUD operations for business entities
✅ **AI Agent System** - Intelligent business formation guidance
✅ **Type Safety** - Full TypeScript with strict mode
✅ **Security** - JWT authentication, CORS, RLS policies
✅ **Validation** - Request/response validation with Zod
✅ **Database** - PostgreSQL with automatic migrations

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (v1.0+)
- [Supabase](https://supabase.com) project created
- Node.js (for npm packages compatibility)

### Installation

```bash
# Install dependencies
npm install  # or bun install (may have issues with some packages)

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
```

### Environment Setup

Edit `.env` with your actual values:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase (get from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT (use a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# AI/LLM (optional - for enhanced agent features)
OPENAI_API_KEY=sk-...  # Optional
ANTHROPIC_API_KEY=sk-ant-...  # Optional

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Database Setup

1. Create a Supabase project
2. Run the migration scripts in `../scripts/database/`:
   - Open Supabase SQL Editor
   - Run `001_initial_schema.sql`
   - Verify tables were created

See `../scripts/database/README.md` for detailed instructions.

### Development

```bash
# Start development server with hot reload
bun run dev

# Start production server
bun run start

# Type check
bun run type-check

# Build for production
bun run build
```

The server will start on `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── agents/               # AI agents for business guidance
│   │   ├── base.agent.ts     # Base agent class
│   │   └── business-formation.agent.ts  # Business formation agent
│   ├── config/               # Configuration files
│   │   ├── env.ts            # Environment variable validation
│   │   └── database.ts       # Supabase client setup
│   ├── middleware/           # Express-style middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   └── error.ts          # Error handling utilities
│   ├── routes/               # API route handlers
│   │   ├── auth.routes.ts    # Authentication endpoints
│   │   ├── business.routes.ts # Business CRUD endpoints
│   │   └── agent.routes.ts   # AI agent endpoints
│   ├── services/             # Business logic layer
│   │   └── business.service.ts # Business operations
│   ├── types/                # TypeScript type definitions
│   │   └── database.ts       # Supabase database types
│   └── index.ts              # Application entry point
├── .env.example              # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All authenticated endpoints require an `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check

```http
GET /health
```

Returns server health status and database connection.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "database": "connected",
    "environment": "development"
  }
}
```

---

#### Authentication

##### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

##### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

##### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

##### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

#### Businesses

##### List Businesses

```http
GET /api/businesses
Authorization: Bearer <token>
```

##### Get Business by ID

```http
GET /api/businesses/:id
Authorization: Bearer <token>
```

##### Create Business

```http
POST /api/businesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Amazing Startup",
  "type": "LLC",
  "state": "CA"
}
```

**Business Types:** `LLC`, `CORPORATION`, `SOLE_PROPRIETORSHIP`, `PARTNERSHIP`

##### Update Business

```http
PATCH /api/businesses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Business Name",
  "status": "IN_PROGRESS"
}
```

**Business Statuses:** `DRAFT`, `IN_PROGRESS`, `SUBMITTED`, `APPROVED`, `REJECTED`

##### Delete Business

```http
DELETE /api/businesses/:id
Authorization: Bearer <token>
```

---

#### AI Agent

##### Chat with Business Formation Agent

```http
POST /api/agent/chat
Content-Type: application/json

{
  "message": "What business structure should I choose?",
  "context": {
    "state": "CA",
    "hasPartners": false,
    "hasEmployees": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Great question! Let me help you...",
    "confidence": 0.95,
    "metadata": {
      "agent": "BusinessFormationAgent",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

##### Get Agent Information

```http
GET /api/agent/info
```

Returns agent capabilities and supported topics.

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## AI Agent System

### Business Formation Agent

The Business Formation Agent provides intelligent guidance for:

- Choosing the right business structure
- Understanding state-specific requirements
- Step-by-step formation process
- Compliance and legal information
- Tax implications

### Extending the Agent System

To add a new agent:

1. Create a new agent class in `src/agents/`
2. Extend the `BaseAgent` class
3. Implement the `process()` method
4. Add routes in `src/routes/agent.routes.ts`

Example:

```typescript
export class TaxAdvisorAgent extends BaseAgent {
  constructor() {
    super('TaxAdvisorAgent', 'Your system prompt here...')
  }

  async process(query: string, context?: Record<string, any>): Promise<AgentResponse> {
    // Implement your logic here
    // Call LLM API, process response, return formatted answer
  }
}
```

### Integrating Real LLM APIs

The current agent uses mock responses. To integrate real AI:

1. Install LLM SDK:

```bash
bun add openai  # or @anthropic-ai/sdk
```

2. Update agent to call API:

```typescript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

async process(query: string, context?: Record<string, any>): Promise<AgentResponse> {
  const messages = this.buildMessages(query, context)
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
  })
  return {
    content: response.choices[0].message.content,
    confidence: 0.95,
  }
}
```

## Security

### Authentication

- JWT tokens via Supabase Auth
- Tokens expire after configured period
- Refresh tokens for session renewal

### Authorization

- Row Level Security (RLS) policies in Supabase
- Users can only access their own data
- Service role key for admin operations

### CORS

Configured to allow requests from frontend URL only. Update `FRONTEND_URL` in `.env` for production.

### Environment Variables

- Never commit `.env` file
- Use strong, random JWT secrets
- Rotate keys regularly in production

## Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Test chat agent (no auth required)
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about LLCs"}'
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random `JWT_SECRET` (min 32 characters)
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Use environment-specific Supabase projects

### Recommended Platforms

- **Railway** - Easy deployment with Bun support
- **Fly.io** - Global deployment
- **Render** - Simple setup
- **AWS/GCP/Azure** - Full control

## Troubleshooting

### Database Connection Issues

```bash
# Check Supabase credentials
# Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env

# Test database connection
curl http://localhost:3000/health
```

### Authentication Errors

```bash
# Verify JWT_SECRET is set
# Check token expiration
# Ensure Supabase Auth is enabled
```

### TypeScript Errors

```bash
# Run type check
bun run type-check

# Rebuild if needed
rm -rf node_modules && npm install
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `bun run type-check`
4. Test all endpoints
5. Submit a pull request

## License

Proprietary - All rights reserved

---

**Questions?** Check the main monorepo README or open an issue.
