This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (with Turso)

Locally the app uses the `dev.db` SQLite file. In production it uses a hosted
[Turso](https://turso.tech) (libSQL) database whenever `TURSO_DATABASE_URL` is set.

1. **Create the database (free):** sign up at https://app.turso.tech, create a
   database, then copy its URL (`libsql://...turso.io`) and create a database token.
2. **Import the repo:** at https://vercel.com/new import this GitHub repo
   (framework preset: Next.js, no other settings needed).
3. **Set environment variables** in the import screen (or Project → Settings →
   Environment Variables):

   | Name | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | `libsql://<your-db>.turso.io` |
   | `TURSO_AUTH_TOKEN` | the database token |
   | `NEXTAUTH_SECRET` | any long random string (e.g. `openssl rand -base64 32`) |

4. **Deploy.** The `vercel-build` script applies the migrations in
   `prisma/migrations` to Turso (`scripts/migrate-turso.mjs`), seeds demo data
   if the database is empty, then builds. Vercel gives you a public URL like
   `https://tailorkartmvp.vercel.app`.

Demo logins created by the seed (change these before real use):
`admin@tailorkart.com` / `admin123` and `priya@example.com` / `customer123`.
