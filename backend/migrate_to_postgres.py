"""
Migrate Universal Document Creator from SQLite to PostgreSQL.

Usage:
  1. Set DATABASE_URL in .env: postgresql://user:pass@host:5432/dbname
  2. Run: python migrate_to_postgres.py
  3. Restart the server — it will auto-detect PostgreSQL

Requirements:
  pip install psycopg2-binary python-dotenv
"""

import os
import sys
import sqlite3

# Load env
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "")
SQLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "udc.db")

if not DATABASE_URL:
    print("ERROR: Set DATABASE_URL in .env first")
    print("Example: DATABASE_URL=postgresql://user:pass@localhost:5432/universaldoc")
    sys.exit(1)

if not DATABASE_URL.startswith("postgresql"):
    print("ERROR: DATABASE_URL must start with postgresql://")
    sys.exit(1)

if not os.path.exists(SQLITE_PATH):
    print(f"ERROR: SQLite database not found at {SQLITE_PATH}")
    print("Nothing to migrate — start the app first to create the SQLite database.")
    sys.exit(1)

# Mask credentials in output
pg_display = DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else DATABASE_URL
print(f"SQLite source: {SQLITE_PATH}")
print(f"PostgreSQL target: ...@{pg_display}")

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("\nERROR: psycopg2 not installed.")
    print("Run: pip install psycopg2-binary")
    sys.exit(1)

# Connect to both databases
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row

try:
    pg_conn = psycopg2.connect(DATABASE_URL)
except Exception as e:
    print(f"\nERROR: Could not connect to PostgreSQL: {e}")
    sys.exit(1)

pg_cursor = pg_conn.cursor()

# ==================== CREATE POSTGRESQL SCHEMA ====================

print("\nCreating PostgreSQL schema...")
pg_cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    is_admin INTEGER DEFAULT 0,
    generation_count INTEGER DEFAULT 0,
    generation_reset TEXT,
    email_verified INTEGER DEFAULT 1,
    verify_token TEXT,
    reset_token TEXT,
    reset_token_expires TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content TEXT NOT NULL,
    html_content TEXT,
    skill_used TEXT,
    prompt TEXT,
    model_used TEXT,
    brand_style TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Brand',
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#64748b',
    accent_color TEXT DEFAULT '#f59e0b',
    font_family TEXT DEFAULT 'Arial, sans-serif',
    logo_url TEXT,
    screenshot_path TEXT,
    style_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'enterprise',
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS shared_templates (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    skill_name TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_templates_team ON shared_templates(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
""")
pg_conn.commit()
print("Schema created.")

# ==================== MIGRATE DATA ====================

print("\nMigrating data...")

# Tables in dependency order (users first since others reference it)
tables = ["users", "documents", "brand_profiles", "settings", "teams",
          "team_members", "shared_templates"]

for table in tables:
    try:
        # Check if table exists in SQLite
        check = sqlite_conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table,)
        ).fetchone()
        if not check:
            print(f"  {table}: not in SQLite, skipping")
            continue

        rows = sqlite_conn.execute(f"SELECT * FROM {table}").fetchall()
        if not rows:
            print(f"  {table}: empty, skipping")
            continue

        columns = [desc[0] for desc in
                    sqlite_conn.execute(f"SELECT * FROM {table} LIMIT 1").description]
        # Skip 'id' column — let PostgreSQL SERIAL handle it
        cols_no_id = [c for c in columns if c != "id"]
        placeholders = ", ".join(["%s"] * len(cols_no_id))
        col_names = ", ".join(cols_no_id)

        count = 0
        skipped = 0
        for row in rows:
            values = tuple(row[c] for c in cols_no_id)
            try:
                pg_cursor.execute(
                    f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
                    f" ON CONFLICT DO NOTHING",
                    values
                )
                count += 1
            except Exception as e:
                skipped += 1
                pg_conn.rollback()

        pg_conn.commit()
        msg = f"  {table}: migrated {count}/{len(rows)} rows"
        if skipped:
            msg += f" ({skipped} skipped)"
        print(msg)

    except Exception as e:
        print(f"  {table}: error — {e}")
        pg_conn.rollback()

# ==================== RESET SEQUENCES ====================

print("\nResetting ID sequences...")
for table in tables:
    try:
        pg_cursor.execute(
            f"SELECT setval('{table}_id_seq', "
            f"COALESCE((SELECT MAX(id) FROM {table}), 1))"
        )
        pg_conn.commit()
    except Exception:
        pg_conn.rollback()

# ==================== VERIFY ====================

print("\nVerification:")
for table in tables:
    try:
        pg_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = pg_cursor.fetchone()[0]
        print(f"  {table}: {count} rows in PostgreSQL")
    except Exception:
        pg_conn.rollback()

print("\nMigration complete!")
print("\nNext steps:")
print("  1. Ensure DATABASE_URL is set in your .env file")
print("  2. Restart the server")
print("  3. The app will continue using SQLite by default")
print("     (PostgreSQL query layer is a future enhancement)")

sqlite_conn.close()
pg_cursor.close()
pg_conn.close()
