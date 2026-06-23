import sys

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 3. moboTrayShape
content = content.replace("shape.moveTo(-1.97, -2.4);", "shape.moveTo(-1.97, -2.3);")
content = content.replace("shape.lineTo(1.97, -2.4);", "shape.lineTo(1.97, -2.3);")
content = content.replace("shape.lineTo(-1.97, -2.4);", "shape.lineTo(-1.97, -2.3);")

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
