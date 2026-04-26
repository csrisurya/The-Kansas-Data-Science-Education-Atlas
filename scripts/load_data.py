import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

import urllib.parse

database_url = os.environ.get('DATABASE_URL', 'postgresql://localhost/atlas')

def get_connection():
    return psycopg2.connect(database_url)

CSV_TABLES = [
    ("data/raw/dataset1.csv", "institutions"),
    ("data/raw/dataset2.csv", "county_aggregations"),
    ("data/raw/dataset3.csv", "courses"),
    ("data/raw/dataset4.csv", "college_locations"),
    ("data/raw/dataset5.csv", "digital_infrastructure"),
    ("data/raw/dataset6.csv", "socioeconomic"),
    ("data/raw/dataset7.csv", "atlas"),
]

def load_csv_to_postgres(csv_path, table_name, conn):
    print(f"\nLoading {csv_path} → {table_name}")
    print(f"\nLoading {csv_path} → {table_name}")
    try:
        if 'dataset3' in csv_path:
            df = pd.read_csv(csv_path, encoding='latin1')
        else:
            df = pd.read_csv(csv_path)
        df.columns = [c.lower() for c in df.columns]
        df = df.where(pd.notnull(df), None)
        cols = ','.join(df.columns)
        values = df.values.tolist()
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
            batch_size = 100
            for i in range(0, len(values), batch_size):
                batch = values[i:i+batch_size]
                execute_values(
                    cur,
                    f"INSERT INTO {table_name} ({cols}) VALUES %s",
                    batch
                )
                print(f"Inserted {min(i+batch_size, len(values))}/{len(values)} rows into {table_name}")
        conn.commit()
        print(f"Loaded {len(values)} rows into {table_name}")
    except Exception as e:
        print(f"Error loading {csv_path} into {table_name}: {e}")
        conn.rollback()

def get_row_count(table_name, conn):
    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cur.fetchone()[0]

def print_summary(row_counts):
    print("\nSummary Table:")
    print(f"{'Table':<30} | {'Rows Loaded':>10}")
    print("-"*45)
    for table, count in row_counts.items():
        print(f"{table:<30} | {count:>10}")

def ensure_courses_columns(conn):
    """Add county_name and institution_type to courses table if missing."""
    with conn.cursor() as cur:
        cur.execute("""
            ALTER TABLE courses
                ADD COLUMN IF NOT EXISTS county_name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS institution_type VARCHAR(50);
        """)
    conn.commit()
    print("Ensured courses.county_name and courses.institution_type exist.")


def populate_courses_county(conn):
    """Populate county_name and institution_type in courses from institutions."""
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE courses c
            SET
                county_name      = i.county_name,
                institution_type = i.college_type::varchar
            FROM (
                SELECT DISTINCT ON (college_name) college_name, county_name, college_type
                FROM institutions
                WHERE college_name != 'DNE'
                ORDER BY college_name
            ) i
            WHERE c.school_name = i.college_name
              AND c.county_name IS NULL;
        """)
        updated = cur.rowcount
    conn.commit()
    print(f"Populated county_name for {updated} course rows.")


def main():
    row_counts = {}
    try:
        conn = get_connection()
        ensure_courses_columns(conn)
        for csv_path, table_name in CSV_TABLES:
            if not os.path.exists(csv_path):
                print(f"File not found: {csv_path}")
                continue
            try:
                load_csv_to_postgres(csv_path, table_name, conn)
                count = get_row_count(table_name, conn)
                row_counts[table_name] = count
            except Exception as e:
                print(f"Error loading {csv_path} into {table_name}: {e}")
        populate_courses_county(conn)
        print_summary(row_counts)
    except Exception as e:
        print(f"Database connection error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
