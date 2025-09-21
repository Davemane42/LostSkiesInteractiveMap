import json
import re
import sys

def parse_wind_data(input_file):
    # Dictionary to store the parsed data
    wind_data = {}
    
    try:
        with open(input_file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Use regex to extract the relevant parts - now supports WindRegion and StormRegion
        match = re.search(r'([\d.-]*),([\d.-]*)\),\(([\d.-]*),([\d.-]*).* (\d+), (.*)', line)
        
        if match:
            x1, z1, x2, z2, thickness, region_name = match.groups()
            
            # Initialize region if it doesn't exist
            if region_name not in wind_data:
                wind_data[region_name] = {
                    "Thickness": int(thickness),
                    "Segments": []
                }
            
            # Add the segment to the region
            wind_data[region_name]["Segments"].append([x1, z1, x2, z2])
        else:
            print(f"Warning: Could not parse line: {line}")
    
    return wind_data

def main():   
    # Parse the data
    parsed_data = parse_wind_data("NinesWallData.txt")

    for region in parsed_data:
        print(f"\n{region}:")
        print(f"  Thickness: {parsed_data[region]['Thickness']}")
        print(f"  Number of segments: {len(parsed_data[region]['Segments'])}")
    
    # Convert to JSON with pretty formatting
    try:
        with open("../wallData.json", 'w') as f:
            json.dump(parsed_data, f, indent=2)

    except Exception as e:
        print(f"Error writing to file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()