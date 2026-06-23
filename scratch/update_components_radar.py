import sys

with open("src/data/components.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add radarStats to interface
interface_replacement = """  geometryArgs: [number, number, number];
  radarStats?: {
    performance: number;
    thermals: number;
    acoustics: number;
    power: number;
    value: number;
  };"""
content = content.replace("  geometryArgs: [number, number, number];", interface_replacement)

# A helper to inject radarStats after geometryArgs
def inject_radar_stats(cid, stats):
    global content
    import re
    pattern = r'(id:\s*[\'"]' + cid + r'[\'"].*?geometryArgs:\s*\[.*?\]\s*,)'
    replacement = r'\1\n    radarStats: { performance: ' + str(stats[0]) + ', thermals: ' + str(stats[1]) + ', acoustics: ' + str(stats[2]) + ', power: ' + str(stats[3]) + ', value: ' + str(stats[4]) + ' },'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# [performance, thermals, acoustics, power, value]
inject_radar_stats("motherboard", [85, 70, 0, 40, 75])
inject_radar_stats("cpu", [95, 90, 80, 85, 80])
inject_radar_stats("cpu_cooler", [10, 95, 90, 10, 85])
inject_radar_stats("gpu", [100, 95, 85, 100, 70])
inject_radar_stats("ram_1", [80, 30, 0, 15, 90])
inject_radar_stats("ram_2", [80, 30, 0, 15, 90])
inject_radar_stats("ssd", [90, 60, 0, 20, 85])
inject_radar_stats("psu", [10, 50, 40, 95, 95])
inject_radar_stats("case_fan_1", [5, 10, 85, 5, 80])
inject_radar_stats("case_fan_2", [5, 10, 85, 5, 80])
inject_radar_stats("rear_fan", [5, 10, 90, 5, 80])
inject_radar_stats("side_fan_2", [5, 10, 90, 5, 80])
inject_radar_stats("case", [0, 80, 70, 0, 90])
inject_radar_stats("storage_hdd", [30, 40, 45, 15, 100])

with open("src/data/components.ts", "w", encoding="utf-8") as f:
    f.write(content)
