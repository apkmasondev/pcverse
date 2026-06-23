import sys

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace logic for sideGlassRef
old_side_lerp = """      sideGlassRef.current.position.x = THREE.MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 2.5);
      sideGlassMatRef.current.opacity = THREE.MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 2.5);"""
new_side_lerp = """      if (Math.abs(sideGlassRef.current.position.x - targetX) < 0.005) {
        sideGlassRef.current.position.x = targetX;
        sideGlassMatRef.current.opacity = targetOpacity;
      } else {
        sideGlassRef.current.position.x = THREE.MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 2.5);
        sideGlassMatRef.current.opacity = THREE.MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 2.5);
      }"""
content = content.replace(old_side_lerp, new_side_lerp)

# Replace logic for frontGlassRef
old_front_lerp = """      frontGlassRef.current.position.z = THREE.MathUtils.lerp(frontGlassRef.current.position.z, targetZ, delta * 2.5);
      frontGlassMatRef.current.opacity = THREE.MathUtils.lerp(frontGlassMatRef.current.opacity, targetOpacity, delta * 2.5);"""
new_front_lerp = """      if (Math.abs(frontGlassRef.current.position.z - targetZ) < 0.005) {
        frontGlassRef.current.position.z = targetZ;
        frontGlassMatRef.current.opacity = targetOpacity;
      } else {
        frontGlassRef.current.position.z = THREE.MathUtils.lerp(frontGlassRef.current.position.z, targetZ, delta * 2.5);
        frontGlassMatRef.current.opacity = THREE.MathUtils.lerp(frontGlassMatRef.current.opacity, targetOpacity, delta * 2.5);
      }"""
content = content.replace(old_front_lerp, new_front_lerp)

# Replace logic for solidSideRef
old_solid_lerp = """      solidSideRef.current.position.x = THREE.MathUtils.lerp(solidSideRef.current.position.x, targetX, delta * 2.5);"""
new_solid_lerp = """      if (Math.abs(solidSideRef.current.position.x - targetX) < 0.005) {
        solidSideRef.current.position.x = targetX;
      } else {
        solidSideRef.current.position.x = THREE.MathUtils.lerp(solidSideRef.current.position.x, targetX, delta * 2.5);
      }"""
content = content.replace(old_solid_lerp, new_solid_lerp)

with open("src/components/PCModel/geometries/CaseGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
