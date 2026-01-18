# Catalyst UI Kit (Vendored)

Commercial UI kit from the Tailwind CSS team. This is a vendored copy, not an npm package.

## Overview

- **Source**: Vendored from Tailwind Catalyst.
- **Requirements**: Tailwind v4, `@headlessui/react`, `clsx`, `framer-motion`.
- **Location**: `frontend/src/components/catalyst-ui-kit/typescript/`.

## Components (27)

`alert`, `auth-layout`, `avatar`, `badge`, `button`, `checkbox`, `combobox`, `description-list`, `dialog`, `divider`, `dropdown`, `fieldset`, `heading`, `input`, `link`, `listbox`, `navbar`, `pagination`, `radio`, `select`, `sidebar-layout`, `sidebar`, `stacked-layout`, `switch`, `table`, `text`, `textarea`.

## Usage

```tsx
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Dialog, DialogTitle, DialogBody } from '@/components/catalyst-ui-kit/typescript/dialog'

<Button color="indigo">Primary</Button>
<Button outline>Secondary</Button>
<Button plain>Tertiary</Button>
```

## Customizations Made

- `link.tsx`: Updated to use React Router's `Link` component (not plain `<a>`).

## Agent Constraints

- **DO NOT** modify component internals unless necessary.
- **DO NOT** import from `javascript/` or `demo/` folders (deleted).
- Always use these components for consistent UI/UX.

## Docs

https://catalyst.tailwindui.com/docs
