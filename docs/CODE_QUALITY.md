# Code Quality Standards

This document outlines the code quality standards, tools, and best practices for the Business Navigator project.

## Overview

We maintain high code quality through automated tooling and strict standards:

- **ESLint**: Linting and code quality rules
- **Prettier**: Code formatting
- **EditorConfig**: Editor consistency
- **Husky**: Git pre-commit hooks
- **GitHub Actions**: Automated CI/CD checks

## File Length Limits

To ensure maintainability and clean code architecture, we enforce strict file length limits:

### Maximum Lines Per File: 300

Files should not exceed 300 lines (excluding blank lines and comments). This encourages:

- Single Responsibility Principle
- Better code organization
- Easier code review
- Improved testability

### Maximum Lines Per Function: 50

Functions should not exceed 50 lines (excluding blank lines and comments). This promotes:

- Function decomposition
- Clearer intent
- Easier debugging
- Better reusability

### When Files Exceed Limits

If a file exceeds these limits, consider:

1. **Extract Components/Functions**: Move related code to separate files
2. **Create Utilities**: Extract helper functions to utility files
3. **Split Concerns**: Separate business logic from presentation
4. **Use Composition**: Break down complex components into smaller ones

## Complexity Limits

### Cyclomatic Complexity: 10

Functions should have a cyclomatic complexity of 10 or less. Reduce complexity by:

- Extracting conditional logic to separate functions
- Using early returns
- Simplifying nested conditions
- Applying guard clauses

### Maximum Nesting Depth: 4

Code should not be nested more than 4 levels deep. Flatten code by:

- Using early returns
- Extracting nested blocks to functions
- Refactoring to reduce conditional depth

### Maximum Parameters: 4

Functions should accept no more than 4 parameters. When you need more:

- Use object parameters
- Group related parameters
- Consider if function is doing too much

### Maximum Nested Callbacks: 3

Avoid deeply nested callbacks. Instead:

- Use async/await
- Extract callback logic to named functions
- Use Promise chains

## Code Quality Scripts

### Run All Quality Checks

```bash
bun run quality
```

This runs all quality checks in sequence:

1. Format check (Prettier)
2. Linting (ESLint)
3. Type checking (TypeScript)

### Individual Checks

#### Linting

```bash
# Check for linting errors
bun run lint

# Auto-fix linting errors
bun run lint:fix

# Check specific package
bun run lint:frontend
bun run lint:backend
```

#### Formatting

```bash
# Check if code is formatted
bun run format:check

# Auto-format code
bun run format
```

#### Type Checking

```bash
# Check TypeScript types
bun run type-check

# Check specific package
bun run type-check:frontend
bun run type-check:backend
bun run type-check:shared
```

#### File Length Check

```bash
# Frontend
cd frontend && bun run check:file-length

# Backend
cd backend && bun run check:file-length
```

## ESLint Rules

### Frontend (React + TypeScript)

Key rules enforced in `frontend/eslint.config.js`:

- `max-lines`: 300 line limit per file
- `max-lines-per-function`: 50 line limit per function
- `complexity`: Maximum cyclomatic complexity of 10
- `max-depth`: Maximum nesting depth of 4
- `max-nested-callbacks`: Maximum 3 nested callbacks
- `max-params`: Maximum 4 function parameters
- React Hooks rules
- TypeScript strict rules

### Backend (Node + TypeScript)

Key rules enforced in `backend/eslint.config.js`:

- Same file and function length limits
- Same complexity limits
- Security rules:
  - `no-eval`: Prevent eval usage
  - `no-implied-eval`: Prevent implied eval
  - `no-new-func`: Prevent Function constructor
- Best practices:
  - `eqeqeq`: Require strict equality
  - `no-throw-literal`: Throw Error objects
  - `require-await`: Ensure async functions have await
  - `no-return-await`: Disallow unnecessary return await

## Prettier Configuration

Formatting standards in `.prettierrc`:

- **Semi**: false (no semicolons)
- **Single Quote**: true (use single quotes)
- **Tab Width**: 2 spaces
- **Trailing Comma**: ES5 style
- **Print Width**: 100 characters
- **Arrow Parens**: always
- **End of Line**: LF (Unix style)

## EditorConfig

Consistency standards in `.editorconfig`:

- **Charset**: UTF-8
- **End of Line**: LF
- **Indent Style**: spaces
- **Indent Size**: 2
- **Insert Final Newline**: true
- **Trim Trailing Whitespace**: true
- **Max Line Length**: 100 (80 for Markdown)

## Pre-commit Hooks

Husky automatically runs quality checks before each commit. See the CI/CD section above for details.

## CI/CD Automation

GitHub Actions runs comprehensive checks on every push and pull request.

### Workflow: `.github/workflows/ci.yml`

| Job       | Runs          | Purpose                        |
| --------- | ------------- | ------------------------------ |
| `quality` | First         | Format check, lint, type-check |
| `build`   | After quality | Build all packages             |
| `test`    | After quality | Run backend tests              |

### Branch Protection Rules (GitHub Settings)

To enable branch protection on `main`:

1. Go to **GitHub → Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable these protections:
   - ☑️ **Require a pull request before merging**
   - ☑️ **Require status checks to pass before merging**
     - Add required checks: `quality`, `build`
   - ☑️ **Require branches to be up to date before merging**
   - ☑️ **Do not allow bypassing the above settings**
4. Click **Create** or **Save changes**

### Pre-commit Hooks (Local)

Husky runs quality checks before each commit:

```
.husky/pre-commit → bun run format:check && bun run lint && bun run type-check
```

If any check fails, the commit is blocked. Fix issues before committing.

## Best Practices

### DO ✅

- Keep files under 300 lines
- Keep functions under 50 lines
- Write descriptive variable and function names
- Extract complex logic to separate functions
- Use TypeScript types properly
- Run `bun run quality` before committing
- Fix linting warnings, not just errors
- Keep cyclomatic complexity low

### DON'T ❌

- Disable ESLint rules without good reason
- Skip pre-commit hooks
- Commit code that fails quality checks
- Use `any` type without justification
- Create deeply nested code
- Write functions with many parameters
- Ignore TypeScript errors
- Use `eval` or similar unsafe practices

## Examples

### Good Code ✅

```typescript
// Clear, concise, single responsibility
interface UserData {
  email: string
  name: string
}

async function createUser(data: UserData): Promise<User> {
  validateEmail(data.email)
  const hashedPassword = await hashPassword(data.password)
  return saveUser({ ...data, password: hashedPassword })
}
```

### Bad Code ❌

```typescript
// Too long, doing too much, poor typing
function processUser(e: any, n: any, p: any, a: any, ph: any, addr: any) {
  if (e && e.includes('@')) {
    if (n && n.length > 0) {
      if (p && p.length >= 8) {
        if (a && a > 0) {
          // ... 50+ more lines of nested logic
        }
      }
    }
  }
}
```

## Troubleshooting

### "File exceeds maximum line count"

Extract code into separate modules:

- Create utility functions
- Split large components
- Separate concerns

### "Function is too complex"

Reduce cyclomatic complexity:

- Extract conditions to functions
- Use early returns
- Simplify nested logic

### "Too many nested callbacks"

Use modern async patterns:

- async/await instead of callbacks
- Promise chains
- Named functions

### Pre-commit Hook Fails

1. Run `bun run quality` to see all issues
2. Fix errors one by one
3. Use `bun run lint:fix` for auto-fixable issues
4. Use `bun run format` to auto-format code
5. Retry commit

## Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
