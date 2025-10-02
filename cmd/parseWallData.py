import math
from shapely.geometry import LineString
from shapely.ops import polygonize, unary_union
import re
import csv
import matplotlib.pyplot as plt

BORDER_RADIUS = 25000

def getBiomeColor(biome):
  color = None
  if (biome == "Green Pines"):
      color = "#63c74d"
  if (biome == "Azure Grove"):
      color = "#0099db"
  if (biome == "Atlas Heights"):
      color = "#124e89"
  if (biome == "Midlands"):
    color = "#262b44"
  return color

def getWallColor(wallRegion):
  color = None
  if (wallRegion == "WindRegion1"):
      color = "#c0cbdc"
  if (wallRegion == "WindRegion2"):
      color = "#8b9bb4"
  if (wallRegion == "StormRegion4"):
      color = "#124e89"
  return color

def plot_polygons(polygons, polygon_colors, walls, wall_colors):
    fig, (ax1) = plt.subplots(1, 1, figsize=(12, 5))
    
    ax1.set_title(f'Polygons: {len(polygons)} | Walls: {len(walls)}')
    ax1.set_aspect('equal')
    ax1.grid(True)
    
    circle = plt.Circle((0, 0),alpha=1.0, radius=BORDER_RADIUS, color='#3a4466', fill=True, linewidth=0)
    ax1.add_patch(circle)
    
    for i, poly in enumerate(polygons):
        color = polygon_colors[i]
        x_coords = [p[0] for p in poly]
        y_coords = [p[1] for p in poly]
        ax1.fill(x_coords, y_coords, alpha=0.5, color=color)
        #ax1.plot(x_coords, y_coords, 'o-', color=color, linewidth=8, markersize=0)
    
    for i, wall in enumerate(walls):
        x_coords = [p[0] for p in wall]
        y_coords = [p[1] for p in wall]
        ax1.plot(x_coords, y_coords, 'o-', color=wall_colors[i], linewidth=4, markersize=0)
    
    circle = plt.Circle((0, 0), radius=BORDER_RADIUS, color='#ff0044', fill=False, linewidth=4)
    ax1.add_patch(circle)
    
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
def ordered_deduplicate(seq):
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
        
        mapped_polygons.append(ordered_deduplicate(mapped_polygon))
    
    return mapped_polygons

if __name__ == "__main__":   
    wall_segments = []
    wall_points = []
    data = {
        "walls": [],
        "regions": []
    }
    
    with open('cmd/NinesWallData.txt', 'r') as file:
        lines = file.readlines()
    
    lastX, lastY = None, None
    lastPos = [0, 0]
    curWall = -1
    walls = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = re.search(r'([\d.-]*),([\d.-]*)\),\(([\d.-]*),([\d.-]*).* (\d+), (.*)', line)
        
        if match:
            x1, z1, x2, z2, thickness, region_name = match.groups()
            x1, z1 = float(x1), float(z1)
            x2, z2 = float(x2), float(z2)
            
            # new wall detected
            if lastX != x1 and lastY != z1:
                curWall+=1
                walls.append([])
                data['walls'].append({
                    "Type": region_name,
                    "Thickness": int(thickness),
                    "Points": []
                })
                
            lastX, lastY = x2, z2
            
            walls[curWall].extend([(x1, z1), (x2, z2)])
            wall_segments.append([(x1, z1), (x2, z2)])
    
    for i, wall in enumerate(walls):
        unique_points = ordered_deduplicate(wall)
        if wall[0] == wall[-1]:
            unique_points.append(wall[0])
            
        points = []
        lastPos = (0, 0)
        for j in range(len(unique_points)-1):
            p1, p2 = unique_points[j], unique_points[j+1]
            p1Dist = euclidean_distance(p1, [0, 0])
            p2Dist = euclidean_distance(p2, [0, 0])
            
            if p1Dist > BORDER_RADIUS and p2Dist > BORDER_RADIUS:
                continue
            elif p1Dist <= BORDER_RADIUS and p2Dist > BORDER_RADIUS:
                scale = BORDER_RADIUS / p2Dist
                p2 = (p2[0] * scale, p2[1] * scale)
            elif p1Dist > BORDER_RADIUS and p2Dist <= BORDER_RADIUS:
                scale = BORDER_RADIUS / p1Dist
                p1 = (p1[0] * scale, p1[1] * scale)
            lastPos = p2
            points.append(p1)
            
        points.append(lastPos)
        
        data['walls'][i]['Points'] = points
        
        wall_points.extend(points)
            
    
    circle_points = []
    num_segments = 200
    
    for i in range(num_segments):
        angle = 2 * math.pi * i / num_segments
        x = BORDER_RADIUS * math.cos(angle)
        y = BORDER_RADIUS * math.sin(angle)
        circle_points.append((x, y))
    
    for i in range(num_segments):
        p1 = circle_points[i]
        p2 = circle_points[(i + 1) % num_segments]
        wall_segments.append([p1, p2])
    
    polygons = find_polygons_from_buffered_lines_shapely(wall_segments, 150)
    
    unique_points = list(set(wall_points))
    mapped_polygons = map_polygons_to_points(polygons[1:], unique_points+circle_points)
    
    # Green Pines
    # Azure Grove
    # Atlas Heights
    # Midlands
    biomes = [
        "Midlands", # 0
        "Azure Grove", # 1
        "Green Pines", # 2
        "Azure Grove", # 3
        "Atlas Heights", # 4
        "Atlas Heights", # 5
        "Azure Grove", # 6
        "Green Pines", # 7
        "Midlands", # 8
        "Atlas Heights", # 9
        "Azure Grove", # 10
        "Midlands", # 11
        "Green Pines", # 12
        "Atlas Heights", # 13
    ]
    
    colors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', # 0, 1, 2, 3
        '#f58231', '#911eb4', '#46f0f0', '#f032e6', # 4, 5, 6, 7
        '#bcf60c', '#fabebe', '#008080', '#e6beff', # 8, 9, 10,11
        '#9a6324', '#fffac8', '#800000', '#aaffc3', # 12,13,14,15
    ]
    
    polygon_colors = []
    for i, b in enumerate(biomes):
        color = getBiomeColor(b)
        if color != None:
            polygon_colors.append(color)
        else:
            polygon_colors.append(colors[i%len(colors)])
    
    wall_colors = []
    walls = []
    for wall in data['walls']:
        color = getWallColor(wall['Type'])
        if color != None:
            wall_colors.append(color)
        else:
            wall_colors.append(colors[i%len(colors)])
        walls.append(wall['Points'])
            
    for i, poly in enumerate(mapped_polygons):
        data['regions'].append({
            "Type": biomes[i],
            "Points": []
        })
        data['regions'][i]['Points'] = poly
    
    print(f"Found {len(data['walls'])} walls")
    print(f"Found {len(data['regions'])} regions")
    
    with open('regionData.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        writer.writerow(["Type", "Name", "Type", "PosX...", "PosY..."])

        for wall in data['walls']:
            wallData = ['wall', '', wall['Type']]
            for point in wall['Points']:
                wallData.extend(point)
            
            writer.writerow(wallData)
        
        for region in data['regions']:
            regionData = ['region', '', region['Type']]
            for point in region['Points']:
                regionData.extend(point)
            
            writer.writerow(regionData)
            
    
    # Visualize
    plot_polygons(mapped_polygons, polygon_colors, walls, wall_colors)