from PIL import Image
import os

path = 'public/textures/posters/new_mug_screen.webp'
if os.path.exists(path):
    img = Image.open(path)
    img = img.resize((512, 512))
    img.save(path, 'WEBP', quality=80)
    print("Mug texture compressed!")
else:
    print("File not found")
