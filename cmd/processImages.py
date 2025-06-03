import os
from PIL import Image

def process_images(input_folder, output_folder, width_resized=320, square_size=96):
    """
    Process all images in the input folder:
    1. Create a resized version with specified width (maintaining aspect ratio)
    2. Create a square cropped and resized version
    Save both as compressed WebP files in the output folder.
    """
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Supported image extensions
    supported_extensions = ('.jpg', '.jpeg', '.png')
    
    # Process each file in the input folder
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(supported_extensions):
            try:
                # Open the image file
                filepath = os.path.join(input_folder, filename)
                with Image.open(filepath) as img:
                    
                    img.save(
                        os.path.join(output_folder, f"{os.path.splitext(filename)[0]}.webp"),
                        'WEBP',
                        optimize = True,
                        quality=80  # Adjust quality for compression (0-100)
                    )
                    
                    # Process and save resized version
                    target_height = int(width_resized * img.size[1] / img.size[0])
                    resized_img = img.resize((width_resized, target_height), Image.LANCZOS)
                    
                    resized_filename = f"{os.path.splitext(filename)[0]}_small.webp"
                    resized_img.save(
                        os.path.join(output_folder, resized_filename),
                        'WEBP',
                        optimize = True,
                        quality=80  # Adjust quality for compression (0-100)
                    )
                    
                    # Process and save square cropped version
                    square_img = crop_center_square(img, square_size)
                    square_filename = f"{os.path.splitext(filename)[0]}_square.webp"
                    square_img.save(
                        os.path.join(output_folder, square_filename),
                        'WEBP',
                        optimize = True,
                        quality=80  # Adjust quality for compression (0-100)
                    )
                    
                    print(f"Processed {filename} successfully")
                    
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")

def crop_center_square(img, target_size):
    """Crop a square from the center of the image and resize to target size"""
    # Get dimensions
    width, height = img.size
    
    # Calculate crop dimensions
    crop_size = min(width, height)
    left = (width - crop_size) // 2
    top = (height - crop_size) // 2
    right = left + crop_size
    bottom = top + crop_size
    
    # Crop and resize
    cropped_img = img.crop((left, top, right, bottom))
    return cropped_img.resize((target_size, target_size), Image.LANCZOS)

if __name__ == "__main__":
    # Configuration
    input_folder = "./"  # Folder containing original images
    output_folder = "../img/islands"  # Folder to save processed images
    
    # Run the processing
    process_images(input_folder, output_folder)