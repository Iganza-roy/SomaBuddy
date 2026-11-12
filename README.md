# SomaBuddy

SomaBuddy is a React + TypeScript application built with Vite, Tailwind CSS,
Supabase, and Lucide icons.

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Supabase project URL and
   anon key. The app can run without Supabase credentials until you call
   `getSupabaseClient()`.

3. Start the development server:

   ```sh
   npm run dev
   ```

## Available scripts

- `npm run dev` — start Vite in development mode
- `npm run build` — type-check and create a production build
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build
