# The Backpack

A small local file library built with Express, Prisma, PostgreSQL, and vanilla JavaScript.

## Run it

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Uploaded file metadata is stored in PostgreSQL through Prisma. In local development, file contents use the `storage/` directory, which is intentionally kept out of version control. Set `DATABASE_URL` and `SESSION_SECRET` in `.env` before running the migration.

The upload limit is 50 MB per file. The API supports listing and searching files with `GET /api/files`, creating files with `POST /api/files`, downloading with `GET /api/files/:id/download`, and deleting with `DELETE /api/files/:id`.

This project requires Node.js `20.19.0` or newer because Prisma 7 and the AWS SDK use Node 20 APIs.

## Deploy to Railway

1. Create a new Railway project and add a PostgreSQL service.
2. Deploy this repository as a Railway service.
3. Add these variables to the application service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<long-random-production-secret>
NODE_ENV=production
S3_ENDPOINT=<your-s3-compatible-endpoint>
S3_REGION=auto
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET=<your-bucket-name>
```

Railway provides `PORT` automatically. The `railway.toml` configuration runs `npm ci`, generates Prisma Client, applies committed migrations with `prisma migrate deploy`, and starts the server. When all five `S3_*` variables are present, uploads use object storage automatically.

Do not use the local `storage/` fallback for production uploads because Railway service disks are ephemeral.
