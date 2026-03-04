#!/usr/bin/env python3
"""
Add institution_type and county_name columns to the courses table,
then populate them from dataset1 (College_Type) and dataset4 (COUNTYNM).
"""
import csv
import psycopg2

DB = dict(dbname='kansas_atlas', user='atlas_user', password='your_secure_password_here')
DATA_DIR = 'data/raw'

TYPE_MAP = {'1': '4-Year', '2': '2-Year', '3': '<2-Year'}

def build_school_type_map():
    """College_Name -> institution_type from dataset1."""
    m = {}
    with open(f'{DATA_DIR}/dataset1.csv') as f:
        for row in csv.DictReader(f):
            cn = row['College_Name'].strip()
            ct = row['College_Type'].strip()
            if cn != 'DNE' and ct != '-1' and cn not in m:
                m[cn] = TYPE_MAP.get(ct, ct)
    return m

def build_school_county_map():
    """school_name -> county_name from dataset4."""
    m = {}
    with open(f'{DATA_DIR}/dataset4.csv') as f:
        for row in csv.DictReader(f):
            sn = row['school_name'].strip()
            county = row['COUNTYNM'].strip()
            if sn not in m:
                m[sn] = county
    return m

def main():
    school_type = build_school_type_map()
    school_county = build_school_county_map()

    print(f"School type mappings: {len(school_type)}")
    print(f"School county mappings: {len(school_county)}")

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # 1. Add columns if they don't exist
    cur.execute("""
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS institution_type VARCHAR(50);
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS county_name VARCHAR(255);
    """)
    conn.commit()
    print("Added institution_type and county_name columns.")

    # 2. Get distinct school names from courses
    cur.execute("SELECT DISTINCT school_name FROM courses")
    course_schools = [r[0] for r in cur.fetchall()]
    print(f"\nDistinct schools in courses: {len(course_schools)}")

    missing_type = []
    missing_county = []
    for s in sorted(course_schools):
        if s not in school_type:
            missing_type.append(s)
        if s not in school_county:
            missing_county.append(s)

    if missing_type:
        print(f"\nSchools missing institution_type ({len(missing_type)}):")
        for s in missing_type:
            print(f"  - {s}")

    if missing_county:
        print(f"\nSchools missing county ({len(missing_county)}):")
        for s in missing_county:
            print(f"  - {s}")

    # 3. Update institution_type
    updated_type = 0
    for school, itype in school_type.items():
        cur.execute(
            "UPDATE courses SET institution_type = %s WHERE school_name = %s AND (institution_type IS NULL OR institution_type != %s)",
            (itype, school, itype)
        )
        updated_type += cur.rowcount

    # 4. Update county_name
    updated_county = 0
    for school, county in school_county.items():
        cur.execute(
            "UPDATE courses SET county_name = %s WHERE school_name = %s AND (county_name IS NULL OR county_name != %s)",
            (county, school, county)
        )
        updated_county += cur.rowcount

    conn.commit()
    print(f"\nUpdated institution_type for {updated_type} rows")
    print(f"Updated county_name for {updated_county} rows")

    # 5. Verify
    cur.execute("SELECT institution_type, COUNT(*) FROM courses GROUP BY institution_type ORDER BY institution_type")
    print("\nInstitution type distribution:")
    for row in cur.fetchall():
        print(f"  {row[0] or 'NULL'}: {row[1]}")

    cur.execute("SELECT county_name, COUNT(*) FROM courses GROUP BY county_name ORDER BY county_name")
    print("\nCounty distribution:")
    for row in cur.fetchall():
        print(f"  {row[0] or 'NULL'}: {row[1]}")

    conn.close()
    print("\nDone!")

if __name__ == '__main__':
    main()
