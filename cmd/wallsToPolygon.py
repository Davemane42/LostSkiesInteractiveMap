import math
from shapely.geometry import LineString
from shapely.ops import polygonize, unary_union
import re
import sys
import json
import matplotlib.pyplot as plt

BORDER_RADIUS = 25000

def getBiomeColor(biome):
  color = "#c0cbdc"
  if (biome == "Green Pines"):
      color = "#63c74d"
  if (biome == "Azure Grove"):
      color = "#0099db"
  if (biome == "Atlas Heights"):
      color = "#124e89"
  if (biome == "Midlands"):
    color = "#f77622"
  return color

def plot_polygons(polygons, colors):
    fig, (ax1) = plt.subplots(1, 1, figsize=(12, 5))
    
    # Plot polygons
    for i, poly in enumerate(polygons):
        color = colors[i % len(colors)]
        x_vals = [p[0] for p in poly]
        y_vals = [p[1] for p in poly]
        ax1.fill(x_vals, y_vals, alpha=0.3, color=color)
        ax1.plot(x_vals, y_vals, 'o-', color=color, linewidth=2)
    
    ax1.set_title('Found Polygons')
    ax1.set_aspect('equal')
    ax1.grid(True)
    
    plt.tight_layout()
    plt.show()

def find_polygons_from_buffered_lines_shapely(lines, buffer_distance):
    buffered_polygons = []
    
    for line_coords in lines:
        line = LineString(line_coords)
        buffered = line.buffer(buffer_distance)
        buffered_polygons.append(buffered)
        
    merged_buffer = unary_union(buffered_polygons)
    
    # Use polygonize to find all polygons
    polygons = list(polygonize(merged_buffer))
    
    # Convert to list of point lists
    result = []
    for poly in list(polygons):
        if poly.is_valid and poly.area > 0:  # Filter out invalid and zero-area polygons
            # Get exterior coordinates and convert to list
            result.append(list(poly.buffer(buffer_distance).exterior.coords))
    
    return result

def euclidean_distance(p1, p2):
    """Calculate Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def find_closest_point(point, original_points):
    """Find closest original point."""
    min_distance = float('inf')
    closest_point = None
    
    for orig_point in original_points:
        distance = euclidean_distance(point, orig_point)
        if distance < min_distance:
            min_distance = distance
            closest_point = orig_point
    
    return closest_point, min_distance

# https://stackoverflow.com/a/480227
def f7(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]

def map_polygons_to_points(polygons, original_points):
    """Map each polygon point to closest original point."""
    mapped_polygons = []
    
    for polygon in polygons:
        mapped_polygon = []
        
        for point in polygon:
            closest_point, distance = find_closest_point(point, original_points)
            mapped_polygon.append(closest_point)
        
        mapped_polygons.append(f7(mapped_polygon))
    
    return mapped_polygons

if __name__ == "__main__":   
    segments = []
    points = []
    data = {
        "walls": {},
        "regions": {}
    }
    
    with open('cmd/NinesWallData.txt', 'r') as file:
        lines = file.readlines()
    
    lastX, lastY = None, None
    curWall = -1
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = re.search(r'([\d.-]*),([\d.-]*)\),\(([\d.-]*),([\d.-]*).* (\d+), (.*)', line)
        
        if match:
            x1, z1, x2, z2, thickness, region_name = match.groups()
            x1, z1 = float(x1), float(z1)
            x2, z2 = float(x2), float(z2)
            
            # Initialize region if it doesn't exist
            if lastX != x1 and lastY != z1:
                curWall+=1
                data['walls'][curWall] = {
                    "Type": region_name,
                    "Thickness": int(thickness),
                    "Segments": []
                }
            
            if euclidean_distance([x1, z1], [0, 0]) > BORDER_RADIUS+50 or euclidean_distance([x2, z2], [0, 0]) > BORDER_RADIUS+50:
                lastX, lastY = x2, z2
                continue
            
            data['walls'][curWall]["Segments"].append([x1, z1, x2, z2])
            
            lastX, lastY = x2, z2
            segments.append([(x1, z1), (x2, z2)])
            points.append((x1, z1))
            points.append((x2, z2))
            
    unique_points = list(set(points))
    
    circle_points = []
    num_segments = 200
    
    for i in range(num_segments):
        angle = 2 * math.pi * i / num_segments
        x = BORDER_RADIUS * math.cos(angle)
        y = BORDER_RADIUS * math.sin(angle)
        circle_points.append((x, y))
    
    # Create line segments between consecutive points
    for i in range(num_segments):
        p1 = circle_points[i]
        p2 = circle_points[(i + 1) % num_segments]
        #print([p1, p2])
        segments.append([p1, p2])
    
    polygons = find_polygons_from_buffered_lines_shapely(segments, 150)
    mapped_polygons = map_polygons_to_points(polygons[1:], unique_points+circle_points)
    
    # Green Pines
    # Azure Grove
    # Atlas Heights
    # Midlands
    biomes = [
        "Midlands", # 0
        "", # 1
        "", # 2
        "Green Pines", # 3
        "", # 4
        "Atlas Heights", # 5
        "Azure Grove", # 6
        "Green Pines", # 7
        "", # 8
        "Midlands", # 9
        "Midlands", # 10
        "Azure Grove", # 11
        "Atlas Heights", # 12
        "", # 13
    ]
    
    colors = []
    for b in biomes:
        colors.append(getBiomeColor(b))
    
    # colors = [
    #     '#e6194b', '#3cb44b', '#ffe119', '#4363d8', # 0, 1, 2, 3
    #     '#f58231', '#911eb4', '#46f0f0', '#f032e6', # 4, 5, 6, 7
    #     '#bcf60c', '#fabebe', '#008080', '#e6beff', # 8, 9, 10,11
    #     '#9a6324', '#fffac8', '#800000', '#aaffc3', # 12,13,14,15
    # ]
    
    for i, poly in enumerate(mapped_polygons):
        data['regions'][i] = {
            "Type": biomes[i],
            "Name": "",
            "Points": []
        }
        data['regions'][i]['Points'] = poly
    
    print(f"Found {len(data['walls'])} walls")
    print(f"Found {len(data['regions'])} regions")
    
    with open("regionData.json", 'w') as f:
        json.dump(data, f, indent=None)
    
    # Visualize
    plot_polygons(mapped_polygons, colors)