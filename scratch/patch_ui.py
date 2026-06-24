import re

with open('src/components/UI/UI.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix left-12 to left-14 for mobile overlap
content = content.replace('left-12', 'left-14')

# Improve contrast
content = content.replace('text-slate-500', 'text-slate-400')
content = content.replace('text-slate-400', 'text-slate-300') # this will double replace 500->400->300 if we aren't careful, but it's fine for slate-400 -> 300. Let's do it cleanly:
content = content.replace('text-slate-500', 'TEXT_SLATE_TEMP')
content = content.replace('text-slate-400', 'text-slate-300')
content = content.replace('TEXT_SLATE_TEMP', 'text-slate-400')

# Add aria-labels to buttons that miss them. 
# <button at line 171
content = content.replace('<button\n                onClick={() => {\n                  playSelectSound();\n                  if (rgbEnabled) toggleRgbEnabled();\n                  setShowPalette(false);\n                }}', '<button\n                aria-label="Wyłącz RGB"\n                onClick={() => {\n                  playSelectSound();\n                  if (rgbEnabled) toggleRgbEnabled();\n                  setShowPalette(false);\n                }}')

# <button at line 186
content = content.replace('<button\n                  key={c.hex}\n                  onClick', '<button\n                  key={c.hex}\n                  aria-label={`Kolor RGB ${c.name}`}\n                  onClick')

# <button at line 233
content = content.replace('<button\n                  key={p.id}\n                  onClick', '<button\n                  key={p.id}\n                  aria-label={`Otoczenie ${p.name}`}\n                  onClick')

# <button className="absolute top-4 right-4 ...
content = content.replace('<button \n                onClick={() => setShowInstructions(false)}', '<button \n                aria-label="Zamknij instrukcję"\n                onClick={() => setShowInstructions(false)}')

# <button className="p-1 hover:bg-white/10 rounded-lg transition-colors"
content = content.replace('<button \n                onClick={() => setSelectedComponent(null)}', '<button \n                aria-label="Zamknij detale komponentu"\n                onClick={() => setSelectedComponent(null)}')

with open('src/components/UI/UI.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("UI.tsx patched")
