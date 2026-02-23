import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

DB_PARAMS = {
    'dbname': 'kansas_atlas',
    'user': 'atlas_user',
    'password': 'password',
    'host': 'localhost',
    'port': 5432
}

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

def main():
    row_counts = {}
    try:
        conn = psycopg2.connect(**DB_PARAMS)
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
        print_summary(row_counts)
    except Exception as e:
        print(f"Database connection error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
