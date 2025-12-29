import pandas as pd

# Specify the path to your file, even with the incorrect .csv extension
file_path = 'kansas_schools_raw.html'

try:
    # read_html() automatically handles parsing HTML tables from a file.
    # It returns a list of dataframes, one for each table found.
    tables = pd.read_html(file_path)

    if tables:
        # Assuming the first table is the one you want
        df = tables[0]

        # Convert the dataframe into a clean CSV file
        df.to_csv('kansas_schools_raw.csv', index=False)
        print("Successfully converted HTML table to output_table.csv")
    else:
        print("No tables found in the file.")

except Exception as e:
    print(f"An error occurred: {e}")