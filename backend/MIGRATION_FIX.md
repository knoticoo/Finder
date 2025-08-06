# Fixing Prisma Migration P3005 Error

## What is the P3005 Error?

The P3005 error occurs when Prisma tries to apply migrations to a database that already has existing tables/schema, but Prisma doesn't know about them. This typically happens when:

1. You have an existing database with tables
2. You're trying to apply Prisma migrations for the first time
3. The database schema doesn't match what Prisma expects

## Solutions

### Option 1: Baseline Existing Database (Recommended for Production)

If you have an existing database with data you want to keep:

```bash
# Mark the migration as already applied
npx prisma migrate resolve --applied 20250804170825_init

# Generate the Prisma client
npx prisma generate
```

### Option 2: Reset Database (Development Only)

If you don't need existing data and want to start fresh:

```bash
# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset --force
```

### Option 3: Use db push (Recommended for Development)

For development environments, use `db push` instead of migrations:

```bash
# Push the schema directly to the database
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

## Setting Up PostgreSQL

### Using Docker (Recommended)

1. Start PostgreSQL with Docker Compose:
```bash
docker-compose up -d postgres
```

2. Wait for PostgreSQL to start (about 10-15 seconds)

3. Run the migration fix script:
```bash
./fix-migration.sh
```

### Using Local PostgreSQL

1. Install PostgreSQL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2. Start PostgreSQL:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

3. Create the database and user:
```bash
sudo -u postgres psql -c "CREATE USER visipakalpojumi_user WITH PASSWORD 'visipakalpojumi_password';"
sudo -u postgres psql -c "CREATE DATABASE visipakalpojumi OWNER visipakalpojumi_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE visipakalpojumi TO visipakalpojumi_user;"
```

4. Run the migration fix script:
```bash
./fix-migration.sh
```

## Using the Fix Script

The `fix-migration.sh` script provides an interactive way to resolve the P3005 error:

```bash
./fix-migration.sh
```

The script will:
1. Check if PostgreSQL is running
2. Detect existing migrations
3. Provide options to resolve the issue
4. Generate the Prisma client

## Environment Variables

Make sure your `.env` file has the correct database URL:

```env
DATABASE_URL="postgresql://visipakalpojumi_user:visipakalpojumi_password@localhost:5432/visipakalpojumi"
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Check if PostgreSQL is running:
```bash
docker ps  # If using Docker
# or
sudo systemctl status postgresql  # If using local PostgreSQL
```

2. Verify the connection string in `.env`

3. Test the connection:
```bash
npx prisma db pull
```

### Migration Issues

If you get migration errors:

1. Check if the database has existing tables:
```bash
npx prisma db pull
```

2. Use the baseline approach if tables exist:
```bash
npx prisma migrate resolve --applied 20250804170825_init
```

3. Or use db push for development:
```bash
npx prisma db push
```

## Next Steps

After resolving the P3005 error:

1. Generate the Prisma client:
```bash
npx prisma generate
```

2. Start your application:
```bash
npm run dev
```

3. Verify everything works by checking the database:
```bash
npx prisma studio
```

## Production Considerations

For production environments:

1. Always use migrations instead of `db push`
2. Test migrations on a staging database first
3. Backup your database before applying migrations
4. Use the baseline approach for existing databases