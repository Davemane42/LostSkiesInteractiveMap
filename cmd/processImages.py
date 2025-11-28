import os
from PIL import Image

def process_images(input_folder, output_folder, width_resized=320, square_size=96, force=False):
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
    supported_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    # Process each file in the input folder
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(supported_extensions):
            try:
                # Open the image file
                filepath = os.path.join(input_folder, filename)
                split_filename = os.path.splitext(filename)[0]
                with Image.open(filepath) as img:
                    msg = ""
                    
                    # Fullsize
                    out_filename = os.path.join(output_folder, f"{split_filename}.webp")
                    if force or not os.path.isfile(out_filename):
                        img.save(
                            out_filename,
                            'WEBP',
                            optimize = True,
                            quality=80  # Adjust quality for compression (0-100)
                        )
                    else:
                        msg += " Fullsize already exist,"
                    
                    # Resized
                    resized_filename = os.path.join(output_folder, f"{split_filename}_small.webp")
                    if force or not os.path.isfile(resized_filename):
                        target_height = int(width_resized * img.size[1] / img.size[0])
                        resized_img = img.resize((width_resized, target_height), Image.LANCZOS)
                        resized_img.save(
                            resized_filename,
                            'WEBP',
                            optimize = True,
                            quality=80  # Adjust quality for compression (0-100)
                        )
                    else:
                        msg += " Resized already exist,"
                    
                    # square cropped preview
                    square_filename = os.path.join(output_folder, f"{split_filename}_square.webp")
                    if force or not os.path.isfile(square_filename):
                        square_img = crop_center_square(img, square_size)
                        square_img.save(
                            square_filename,
                            'WEBP',
                            optimize = True,
                            quality=80  # Adjust quality for compression (0-100)
                        )
                    else:
                        msg += " Cropped already exist,"
                    
                    if msg == "":
                        print(f"Processed {filename}: Successfully")
                    else:
                        print(f"Processed {filename}: Already Exist")
                    
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
    input_folder = "../img/rawIslandImages"  # Folder containing original images
    output_folder = "../img/islands"  # Folder to save processed images
    
    process_images(input_folder, output_folder)