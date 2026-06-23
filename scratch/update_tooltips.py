import sys

with open("src/components/PCModel/PCModel.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_html = """            <div 
              className={`px-4 py-2 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${hovered ? 'text-white scale-105' : 'bg-black/60 border-white/10 text-slate-200'}`}
              style={hovered ? { 
                backgroundColor: `${rgbColor}33`, 
                borderColor: `${rgbColor}80`, 
                boxShadow: `0 0 15px ${rgbColor}80` 
              } : undefined}
            >
              <span className="font-semibold tracking-wide text-sm whitespace-nowrap">{data.name}</span>
            </div>
            <div 
              className={`w-px h-8 transition-all duration-300 ${!hovered ? 'bg-gradient-to-b from-white/30 to-transparent' : ''}`}
              style={hovered ? {
                backgroundColor: rgbColor,
                boxShadow: `0 0 10px ${rgbColor}`
              } : undefined}
            ></div>"""

new_html = """            <div 
              className={`px-4 py-2 rounded-xl rounded-br-sm backdrop-blur-xl border shadow-2xl transition-all duration-300 ${hovered ? 'scale-105' : 'bg-gradient-to-br from-black/80 to-slate-900/40 border-white/20'}`}
              style={hovered ? { 
                backgroundColor: `${rgbColor}33`, 
                borderColor: `${rgbColor}80`, 
                boxShadow: `0 0 15px ${rgbColor}80` 
              } : undefined}
            >
              <span className="font-bold tracking-wider text-sm whitespace-nowrap drop-shadow-md">
                {data.name.includes(' - ') ? (
                  <>
                    <span className="text-white">{data.name.split(' - ')[0]}</span>
                    <span className="text-white/40 mx-1.5">-</span>
                    <span className="text-white/70">{data.name.split(' - ').slice(1).join(' - ')}</span>
                  </>
                ) : (
                  <span className="text-white">{data.name}</span>
                )}
              </span>
            </div>
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-px h-8 transition-all duration-300 ${!hovered ? 'bg-gradient-to-b from-white/40 to-white/5' : ''}`}
                style={hovered ? {
                  backgroundColor: rgbColor,
                  boxShadow: `0 0 10px ${rgbColor}`
                } : undefined}
              />
              <div 
                className={`absolute -bottom-1 w-2 h-2 rounded-full border transition-all duration-300 ${!hovered ? 'border-white/40 bg-black/80' : ''}`}
                style={hovered ? {
                  borderColor: rgbColor,
                  backgroundColor: `${rgbColor}40`,
                  boxShadow: `0 0 8px ${rgbColor}`
                } : undefined}
              />
            </div>"""

content = content.replace(old_html, new_html)

with open("src/components/PCModel/PCModel.tsx", "w", encoding="utf-8") as f:
    f.write(content)
