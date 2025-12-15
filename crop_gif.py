#!/usr/bin/env python3
"""
Crop GIF file using specified coordinates
"""
import sys
import subprocess

def install_pillow():
    """Install Pillow if not available"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except:
        return False

def crop_gif(input_file, output_file, x, y, width, height):
    """Crop GIF file"""
    try:
        from PIL import Image
        
        # Open the GIF
        img = Image.open(input_file)
        
        # Get frames
        frames = []
        try:
            while True:
                # Crop each frame
                frame = img.copy()
                cropped_frame = frame.crop((x, y, x + width, y + height))
                frames.append(cropped_frame)
                img.seek(img.tell() + 1)
        except EOFError:
            pass
        
        # Save cropped GIF
        if frames:
            frames[0].save(
                output_file,
                save_all=True,
                append_images=frames[1:],
                duration=img.info.get('duration', 100),
                loop=img.info.get('loop', 0)
            )
            print(f"✓ Successfully cropped GIF!")
            print(f"  Original: {img.size[0]} x {img.size[1]}")
            print(f"  Cropped: {width} x {height}")
            print(f"  Saved to: {output_file}")
            return True
        else:
            print("Error: No frames found in GIF")
            return False
            
    except ImportError:
        print("Installing Pillow...")
        if install_pillow():
            # Retry after installation
            return crop_gif(input_file, output_file, x, y, width, height)
        else:
            print("Error: Could not install Pillow. Please install it manually:")
            print("  pip3 install Pillow")
            return False
    except Exception as e:
        print(f"Error cropping GIF: {e}")
        return False

if __name__ == "__main__":
    # Crop coordinates from the tool
    x = 0
    y = 66
    width = 260
    height = 390
    
    input_file = "MrPDF.gif"
    output_file = "MrPDF_cropped.gif"
    
    print(f"Cropping {input_file}...")
    print(f"Coordinates: X={x}, Y={y}, Width={width}, Height={height}")
    
    if crop_gif(input_file, output_file, x, y, width, height):
        print("\n✓ Crop complete! Preview the cropped file, then we can replace the original.")
    else:
        print("\n✗ Crop failed. Please check the error messages above.")

