import sys

with open("src/components/InfoPanel/InfoPanel.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
import_replacement = """import { usePCSelection, usePCSettings } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RadarChart } from './RadarChart';"""
content = content.replace("import { usePCSelection } from '../../hooks/usePC';\nimport { useIsMobile } from '../../hooks/useIsMobile';", import_replacement)

# 2. Add usePCSettings hook
hook_replacement = """export const InfoPanel = () => {
  const { selectedComponent, setSelectedComponent } = usePCSelection();
  const { rgbColor, rgbEnabled } = usePCSettings();
  const activeColor = rgbEnabled ? rgbColor : '#4f46e5';
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);"""
content = content.replace("""export const InfoPanel = () => {
  const { selectedComponent, setSelectedComponent } = usePCSelection();
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);""", hook_replacement)

# 3. Replace ProgressBar logic with RadarChart
old_stats_block = """          <motion.div variants={itemVariants}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <Activity size={14} />
              {selectedComponent.customStats ? "Kluczowe Parametry" : "Wp'yw na wydajno>"}
            </h3>
            
            {selectedComponent.customStats ? (
              selectedComponent.customStats.map((stat, i) => (
                <ProgressBar key={i} label={stat.label} value={stat.value} />
              ))
            ) : (
              <>
                <ProgressBar label="Gry Komputerowe" value={selectedComponent.perfImpact.gaming} />
                <ProgressBar label="Obliczenia AI" value={selectedComponent.perfImpact.ai} />
                <ProgressBar label="Codzienna Praca" value={selectedComponent.perfImpact.productivity} />
              </>
            )}
          </motion.div>"""

old_stats_block_fallback = """          <motion.div variants={itemVariants}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <Activity size={14} />
              {selectedComponent.customStats ? "Kluczowe Parametry" : "Wpływ na wydajność"}
            </h3>
            
            {selectedComponent.customStats ? (
              selectedComponent.customStats.map((stat, i) => (
                <ProgressBar key={i} label={stat.label} value={stat.value} />
              ))
            ) : (
              <>
                <ProgressBar label="Gry Komputerowe" value={selectedComponent.perfImpact.gaming} />
                <ProgressBar label="Obliczenia AI" value={selectedComponent.perfImpact.ai} />
                <ProgressBar label="Codzienna Praca" value={selectedComponent.perfImpact.productivity} />
              </>
            )}
          </motion.div>"""

new_stats_block = """          {selectedComponent.radarStats && (
            <motion.div variants={itemVariants}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-3 flex items-center gap-2">
                <Activity size={14} />
                Profil Charakterystyki
              </h3>
              
              <RadarChart stats={selectedComponent.radarStats} color={activeColor} />
            </motion.div>
          )}"""

if "selectedComponent.customStats ?" in content:
    import re
    # We use regex to replace the block to handle encoding artifacts
    pattern = r'<motion\.div variants=\{itemVariants\}>\s*<h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">\s*<Activity size=\{14\} />.*?Kluczowe Parametry.*?Wp.*?wydajno.*?\s*</h3>\s*\{selectedComponent\.customStats \? \(\s*selectedComponent\.customStats\.map\(\(stat, i\) => \(\s*<ProgressBar key=\{i\} label=\{stat\.label\} value=\{stat\.value\} />\s*\)\)\s*\) : \(\s*<>\s*<ProgressBar label="Gry Komputerowe" value=\{selectedComponent\.perfImpact\.gaming\} />\s*<ProgressBar label="Obliczenia AI" value=\{selectedComponent\.perfImpact\.ai\} />\s*<ProgressBar label="Codzienna Praca" value=\{selectedComponent\.perfImpact\.productivity\} />\s*</>\s*\)\}\s*</motion\.div>'
    
    content = re.sub(pattern, new_stats_block, content, flags=re.DOTALL)

with open("src/components/InfoPanel/InfoPanel.tsx", "w", encoding="utf-8") as f:
    f.write(content)
