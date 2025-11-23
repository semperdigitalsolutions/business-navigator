# Business Navigator - Shared

Shared TypeScript types, constants, and utilities for the Business Navigator monorepo.

## Purpose

This package contains code that is shared between the frontend and backend applications:

- **Types** - TypeScript interfaces and enums
- **Constants** - Shared configuration values and constants
- **Utilities** - Helper functions used across the monorepo

## Structure

```
shared/
├── src/
│   ├── types/        # TypeScript type definitions
│   ├── constants/    # Shared constants
│   ├── utils/        # Utility functions
│   └── index.ts      # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### In Frontend

```typescript
import { User, BusinessType, ApiResponse } from '@shared/types'
import { APP_NAME, API_ROUTES } from '@shared/constants'

const user: User = {
  id: '123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
}

console.log(`Welcome to ${APP_NAME}!`)
```

### In Backend

```typescript
import { User, ApiResponse } from '@/shared/types'
import { API_ROUTES } from '@/shared/constants'

function createResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}
```

## Available Exports

### Types

- `User` - User account interface
- `Business` - Business entity interface
- `BusinessType` - Enum for business types (LLC, Corporation, etc.)
- `BusinessStatus` - Enum for business formation status
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated data response

### Constants

- `APP_NAME` - Application name
- `APP_VERSION` - Current version
- `API_ROUTES` - API endpoint paths
- `DEFAULT_PAGE_SIZE` - Default pagination size
- `MAX_PAGE_SIZE` - Maximum pagination size
- `US_STATES` - US states list for business formation

## Development

```bash
# Type check
bun run type-check
```

## Adding New Shared Code

1. Add your types to `src/types/`
2. Add constants to `src/constants/`
3. Add utilities to `src/utils/`
4. Export from `src/index.ts`
5. Run type-check to ensure everything compiles

## Monorepo Integration

This package is automatically available to other packages in the monorepo through path aliases:

- Frontend: `@shared/*` maps to `../shared/src/*`
- Backend: `@shared/*` maps to `../shared/src/*`

No installation or linking required!
