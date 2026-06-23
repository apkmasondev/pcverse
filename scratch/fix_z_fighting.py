import sys

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. leftPanelShape
content = content.replace("shape.moveTo(-1.95, -2.4);", "shape.moveTo(-1.95, -2.3);")
content = content.replace("shape.lineTo(1.945, -2.4);", "shape.lineTo(1.945, -2.3);")
content = content.replace("shape.lineTo(-1.95, -2.4);", "shape.lineTo(-1.95, -2.3);")

content = content.replace("psuHole.moveTo(-0.8 - 0.9, -1.92 - 0.45);", "psuHole.moveTo(-0.8 - 0.9, -2.3);")
content = content.replace("psuHole.lineTo(-0.8 + 0.9, -1.92 - 0.45);", "psuHole.lineTo(-0.8 + 0.9, -2.3);")
content = content.replace("psuHole.lineTo(-0.8 - 0.9, -1.92 - 0.45);", "psuHole.lineTo(-0.8 - 0.9, -2.3);")


# 2. backPanelShape
content = content.replace("shape.moveTo(-1.97, -2.4);", "shape.moveTo(-1.97, -2.3);")
content = content.replace("shape.lineTo(1.97, -2.4);", "shape.lineTo(1.97, -2.3);")
content = content.replace("shape.lineTo(-1.97, -2.4);", "shape.lineTo(-1.97, -2.3);")
content = content.replace("addHole(-0.73, -2.38, 0.73, -1.52);", "addHole(-0.73, -2.3, 0.73, -1.52);")

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
