# CIPCEI Frontend

Frontend application for CIPCEI - Sistema de Gerenciamento de IPs e Salas.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **API Integration** - Pre-configured for NestJS backend

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy `.env.example` to `.env.local` and adjust if needed:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

> **Note:** The frontend runs on port 3001 to avoid conflicts with the NestJS backend on port 3000.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
cipcei-frontend-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API client utilities
│   │   └── utils.ts      # General utilities
│   └── types/            # TypeScript type definitions
│       └── index.ts      # Shared types
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
└── .env.local           # Environment variables (not committed)
```

## API Integration

The project includes a pre-configured API client in `src/lib/api.ts` with the following features:

- Automatic JWT token handling
- Request/response interceptors
- Error handling
- TypeScript support

### Usage Example

```typescript
import { api } from '@/lib/api';

// GET request
const users = await api.get('/users');

// POST request
const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Error handling
try {
  const data = await api.get('/protected-route');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.message);
  }
}
```

## Adding shadcn/ui Components

To add new components from shadcn/ui:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
