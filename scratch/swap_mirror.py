import sys

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Swap the textures between Right Side and Left Side
# Currently Right is hddSideTexture, Left is hddSideTextureMirrored

import re

# We will temporarily rename to a dummy name, then swap
content = re.sub(
    r'(\{\/\* HDD Right Side Texture \*\/\}[\s\S]*?)map=\{hddSideTexture\}',
    r'\1map={SWAP_TEMP}',
    content
)

content = re.sub(
    r'(\{\/\* HDD Left Side Texture \*\/\}[\s\S]*?)map=\{hddSideTextureMirrored\}',
    r'\1map={hddSideTexture}',
    content
)

content = content.replace("SWAP_TEMP", "hddSideTextureMirrored")

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
