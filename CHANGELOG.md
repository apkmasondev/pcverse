# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Final Aesthetic Polish & Layout Corrections
### Added
- **Instructions Modal**: Added an "Instrukcja" button that opens an elegant, glassmorphic modal overlay explaining the key interactions (navigation, teardown, tools).
- **Component Labels Toggle**: Added an "Etykiety" toggle button to easily show/hide all 3D floating HTML labels for a cleaner view.
- **Clickable & Hoverable Component Labels**: The HTML tags hovering over components are now fully interactive. Hovering over a label triggers the same effects as hovering over the 3D model (sounds, highlights), and clicking the label opens its InfoPanel.
- **Fourth Environment Preset**: Added "Jasny Pokój" (`apartment`) preset to provide an ultra-bright, well-lit scene option.
- **InfoPanel UI Adjustments**: Reduced the height of the hero images to give text and details more vertical breathing room without scrolling.
- **Teardown Sequence Animation**: The "Rozłóż na Części" button now triggers a sequenced animation (`explodeStep`). The side glass panel seamlessly slides back and fades out before the main components explode from the case, and vice versa when assembling.
- **HDRi Environment Switcher**: Added a UI dropdown to switch between premium High Dynamic Range lighting presets (`Studio`, `Cyberpunk`, `Świt`). The 3D scene background dynamically adjusts to match the environment mapping and lighting.

### Changed
- Przebudowano od zera trójwymiarowy model Płyty Głównej (Motherboard), dodając mu charakteru w segmencie "High-End":
  - Zainstalowano masywne chłodzenie sekcji zasilania (VRM Heatsinks) oraz metaliczne chłodzenia dysków M.2 (Armor NVMe).
  - Wymodelowano kondensatory (srebrne przy CPU, złote w sekcji audio).
  - Dodano kluczowe gniazda: 24-pin ATX, 8-pin EPS, wyjścia SATA.
  - Wyodrębniono sekcję Audio za pomocą ścieżki świecącej RGB, dodano w pełni wymodelowaną baterię CMOS, klipsy portów PCIe oraz interaktywny, świecący na czerwono wyświetlacz błędów POST Code.
- Wzbogacono galerię każdego podzespołu o trzeci, dedykowany i wygenerowany przez AI obraz (High-End Studio Shot), np. pustą obudowę, procesor AMD Ryzen, kości RAM DDR4 czy makro otwartego dysku HDD. Pliki oczywiście poddano od razu kompresji do WebP.
- Zmodyfikowano formatowanie tytułów w Kartach Informacyjnych komponentów. Zamiast brzydkich nawiasów `( )` wprowadzono separator w postaci myślnika ` - `, a angielska część nazwy (np. PC Case, GPU, Motherboard) renderowana jest teraz w akcentującym kolorze (Indigo-400), dodając interfejsowi elegancji i dynamiki.
- Zoptymalizowano zasoby graficzne całego projektu z myślą o środowisku produkcyjnym (zmniejszono rozdzielczości obrazów 8K komponentów oraz przeprowadzono bezstratną kompresję i konwersję plików `.png`/`.jpg` do super-lekkiego formatu `.webp` dla sieci web).
- Zmodyfikowano wektory rozstrzału komponentów (`explodedPosition`) dla karty graficznej (GPU) oraz zasilacza (PSU), aby przy animacji dekompozycji komputera nie nakładały się na siebie w lewym dolnym narożniku sceny.
- Zamknięto przerwę między kartą graficzną a ścianą obudowy poprzez przedłużenie modelu GPU do formatu high-endowej, pełnowymiarowej karty i przesunięcie jej względem płyty głównej.
- Dodano na samej karcie graficznej wyprowadzenie jej autorskich portów (HDMI + 3x DisplayPort) oraz wspornik ścienny, dzięki czemu idealnie komponują się one ze śledziami obudowy komputera.
- Wzbogacono model GPU o "fajne bajery": wycięto w backplate'cie specjalne kanały przelotowe powietrza (cutouts), dodano kabel zasilający i port 12VHPWR oraz dodatkowe punkty świetlne z paskami Edge RGB na froncie i boku.
- Odwrócono bryłę zasilacza (PSU) o 180 stopni względem osi Z, by główny włącznik i wtyk zasilający wychodziły z tyłu obudowy, a złącza modularne były poprawnie skierowane do wnętrza komputera.
- Dodano wycięcie wentylacyjne w postaci siatki (mesh) na dolnym panelu obudowy dokładnie pod zasilaczem, by stworzyć fizycznie poprawny ciąg powietrza.
- Przeprowadzono gruntowną analizę układu modelu (weryfikacja pozycji X,Y,Z każdego podzespołu względem obudowy i sąsiednich elementów).
- Dodano fizyczne wycięcie z matrycą siatki ("mesh") na tylnej ścianie obudowy (Z = -2.01) oraz otwór techniczny w samej tacy płyty głównej. Zapewnia to logiczny ciąg odprowadzania powietrza, które wentylator CPU wdmuchuje przez radiatory prosto w płytę główną.
- Skorygowano wektor osadzenia dysku twardego HDD w obudowie (obniżenie na oś Y=-2.27), by wyeliminować błąd jego fizycznego "lewitowania" w dolnej komorze.
- Odwrócono zwrot (Z=-0.6) konektora złącza PCIe karty graficznej, tak by fizycznie wpinał się bezpośrednio w odpowiedni slot złącza PCIe płyty głównej.
- Przebudowano wygląd panelu portów (Rear IO) na lewej ściance obudowy, dodając układ spotykany w profesjonalnych płytach głównych (przyciski BIOS Flashback/Clear CMOS, złote złącza anten Wi-Fi, porty USB 2.0, USB 3.2 Gen 1/2, USB-C, port LAN 2.5G oraz pełny panel wysokiej jakości złączy audio z wyjściem optycznym SPDIF).
- Przeniesiono wycięcia portów płyty głównej (Rear IO) oraz śledzi PCIe karty graficznej na lewą ściankę obudowy, by odpowiednio pasowały do układu płyty głównej zamontowanej równolegle do tylnej ścianki.
- Przesunięto wzdłuż osi Z boczny wentylator wyciągowy (oraz dedykowane mu wycięcie z siatką) z `Z=-1.0` na `Z=-0.4`, by zapobiec kolizjom przestrzennym z nową pozycją portów płyty głównej.
- Added a rear exhaust fan mounted on the left side panel (`X = -1.8, Z = -1.0`) with proper 90-degree outward rotation.
- Overhauled the Airflow particle system:
  - Intake fans blow cool blue particles into the case.
  - Exhaust fans (Rear Fan and PSU) suck hot red particles out of the case.
  - Corrected vector mathematics to ensure particles originate from inside the case and flow accurately through the fans outwards.
- Added background click detection (`onPointerMissed`): clicking anywhere on the empty 3D scene now automatically closes the component InfoPanel and smoothly zooms the camera back out.
- Fixed GPU PCB/bracket length mismatch where the RGB strip accidentally extruded along the Z-axis.
- Fixed GPU Airflow system: reversed the airflow vector to accurately simulate cool air being sucked upwards (`Y=-0.85` to `Y=-0.05`) into the heatsink by the three graphics card fans.
- Updated ComponentMesh HTML labels to dynamically apply the active user-selected RGB color (`rgbColor`) as glowing backgrounds, borders, and text accents.
- Passed `rgbColor` dynamically to the RAM geometry to sync the RAM module RGB strips with the global PC theme.
- Increased SSD `explodedPosition` to `X=4.5` to prevent intersection with the case bounds during Explode mode.
- Pushed Motherboard `explodedPosition` further back (`Z=-7.5`, `X=-2.5`) to create more depth and space in exploded view.
- Lifted PSU `explodedPosition` upward (`Y=-1.5`) to prevent it from clipping through the floor grid during Explode mode.
- Reoriented the CPU and CPU Cooler geometries to be vertical (parallel to the motherboard / XY plane) instead of flat, aligning them physically correctly.
- Repositioned the PSU slightly upward (Y=-1.92) to eliminate spillage/clipping with the case bottom panel while maintaining a clean clearance from the GPU.
- Adjusted the CPU exploded position Z-coordinate from -2 to -1.5 and X-coordinate from -1.5 to -1.2 to prevent breakthrough of the back and side solid panels during exploded view.
- Adjusted CPU Cooler position to Z=-1.35 to ensure the base contact sits perfectly on top of the CPU IHS without intersection.
- Fixed a bug in `FanGeometry` where rubber corner meshes were not rendered because they were mapped via `.forEach` instead of `.map` in the JSX tree.
- Upgraded the case glass material (front and side panels) with realistic refraction indices (`ior={1.5}`), a glossy clearcoat layer (`clearcoat={1}`), and a premium ice-blue tint for high-end look.
- Added dual-color internal RGB point lighting (indigo at the top, pink at the bottom) inside the case to illuminate the components with dynamic light and highlights.
- Added slow, out-of-phase floating hover animations (sinusoidal levitation) for components in the exploded view to create a premium sci-fi holographic breakdown look.
- Resolved Z-fighting (overlapping mesh planes) between the CPU Cooler fin stack and the attached fan by reducing fin stack depth (from 0.6 to 0.54) and centering it slightly forward.
- Resolved Z-fighting between the GPU heatsink block and the fan shroud by lowering the shroud to Y=-0.325.
- Fixed the PSU fan orientation: removed the vertical rotation wrapper, aligning it horizontally on top of the PSU casing, and converted it to a real rotating fan.
- Corrected the case fans' RGB torus ring rotation from horizontal (XZ) to vertical (XY), aligning it perfectly with the fan frames.
- Optimized the InfoPanel component details: decreased the image banner aspect ratio to cinematic 16:9, formatted text descriptions inside beautiful frosted glass cards, and styled the benchmarks with premium multicolor gradient progress bars.

## [Unreleased] - Audit Polish
### Added
- Comprehensive SEO optimization (lang, meta tags, Open Graph, JSON-LD, sr-only H1).
- Content-Security-Policy (CSP) headers for improved security.
- `N8AO` (Screen Space Ambient Occlusion) for enhanced 3D depth and realism.
- `PerformanceMonitor` to automatically adjust resolution on slower devices.
- `Bvh` from drei for optimized raycasting and better performance.
- Onboarding hint for new users indicating interactivity.
- Intro cinematic camera animation.
- Escape key support for closing the InfoPanel.

### Changed
- Refactored `Vector3` allocations inside `useFrame` and `useEffect` to use `useMemo` and `useRef` to eliminate microstuttering caused by Garbage Collection.
- Added smooth scale interpolation (`lerp`) on component hover.
- Fixed `viewOffset` not being cleaned up when Scene3D unmounts.
- Hid technical stack traces in `ErrorBoundary` on production environments.
- Removed unused `App.css` file from boilerplate.

## [Unreleased] - Initial Setup and Basic Features
### Added
- Initial setup with React 19, Vite, and TypeScript.
- Configured Tailwind CSS v4.
- Added Three.js, React Three Fiber, React Three Drei, and Framer Motion.
- Created interactive 3D scene with components (`PCModel`, `Scene3D`).
- Implemented camera controls, lerping, and raycasting.
- Built interactive `InfoPanel` with Framer Motion animations and responsive bottom sheet behavior for mobile devices.
- Created Exploded View state with animated component separation.
- Added structured component data in `src/data/components.ts` covering CPU, GPU, RAM, SSD, PSU, Motherboard, and Fans.
- WebGL support check on mount.
  
## [Unreleased] - UX/UI Overhaul  
### Changed  
- Redesigned 3D components from simple cubes to procedural grouping for realistic aesthetics (CPU with IHS, GPU with fans and shroud, Motherboard with slots and VRM, RAM with heatsinks, etc.).  
- Replaced floating 3D Text with sleek HTML annotations via @react-three/drei.  
- Replaced OrbitControls and custom camera lerp with CameraControls for professional cinematic movements.  
- Replaced flat lighting with Environment preset=studio and ContactShadows for realistic depth.  
- Redesigned UI Panel and buttons to an ultra-minimal premium aesthetic inspired by Linear/Vercel (deep black, 1px subtle borders, monochrome typography). 
- Replaced procedural placeholder geometries with realistic image textures mapped to dynamically oriented PlaneGeometries.  
- Added lazy loading for textures with procedural geometries as fallback using Suspense.  
- Updated InfoPanel to display component images.  
- Restricted camera distances (min: 4, max: 14) and polar angles to prevent clipping through models.  
  
## [Unreleased] - UX/UI Overhaul  
### Changed  
- Redesigned 3D components from simple cubes to procedural grouping for realistic aesthetics (CPU with IHS, GPU with fans and shroud, Motherboard with slots and VRM, RAM with heatsinks, etc.).  
- Replaced floating 3D Text with sleek HTML annotations via @react-three/drei.  
- Replaced OrbitControls and custom camera lerp with CameraControls for professional cinematic movements.  
- Replaced flat lighting with Environment preset=studio and ContactShadows for realistic depth.  
- Redesigned UI Panel and buttons to an ultra-minimal premium aesthetic inspired by Linear/Vercel (deep black, 1px subtle borders, monochrome typography). 
- Replaced procedural placeholder geometries with realistic image textures mapped to dynamically oriented PlaneGeometries.  
- Added lazy loading for textures with procedural geometries as fallback using Suspense.  
- Updated InfoPanel to display component images.  
- Restricted camera distances (min: 4, max: 14) and polar angles to prevent clipping through models.  
- Updated camera focus animation to stop exactly 5 units away from the target component. 
  
## [Unreleased] - Professional Aesthetics Polish  
### Changed  
- Removed 2D textured planes representing hardware and fully restored highly-detailed 3D procedural models.  
- Replaced the Case component with actual tinted Glass panels using MeshPhysicalMaterial.  
- Added emissive glow lines to GPU and RAM geometries for premium feel.  
- Re-styled component labels into sleek frosted glass badges.
- Fixed Z-fighting intersection between CPU Cooler heatsink and fan geometry.
- Generated custom, high-quality 8k photorealistic component images and migrated them locally.
- Tweaked camera bounds (minDistance: 6, maxDistance: 20) for a better default framing.
- Added Post-Processing Bloom effect to enhance emissive lighting on GPU and RAM.
- Increased exploded view distances to allow much better visibility of internal components.
- Completely redesigned InfoPanel into an epic, animated glassmorphism modal with staggered text entrance and glowing accents.
- Tweaked camera focal point on component click to perfectly frame the part to the left, making room for the new InfoPanel.
- Translated all component content (descriptions, roles, fun facts) into Polish.
- Translated UI headers and buttons ("Rozłóż na Części", "Zresetuj Widok", etc.) to Polish.
- Expanded InfoPanel to occupy exactly 50% of the screen width smoothly.
- Hidden the scrollbar natively in CSS for a cleaner UX.
- Modified camera offset so the 3D model drastically shifts to the left side when the half-screen panel opens.
- Automatically hide the floating 3D labels whenever a component is selected for a cleaner view.
- Added cinematic `Sparkles` particles floating in the background for a premium sci-fi aesthetic.
- Fixed camera rotation axis: Re-centered the focal point exactly on the hardware component, but shifted the camera's view frustum natively by 25% to perfectly frame the object on the left side of the screen.
- Significantly upgraded all 3D procedural geometries to feature highly detailed composite models (e.g., 3 rotating fans and heatpipes on GPU, VRM heatsinks and slots on Motherboard, memory chips on SSD).
- Removed the PSU Shroud (piwnicę zasilacza) for a cleaner, full-glass case aesthetic.
- Slimmed down the PSU model slightly and lowered its position on the Y-axis to guarantee perfect clearance below the GPU.
- Moved the GPU further out in exploded view (Z=3.5) to prevent it from clipping into the front glass panel of the case.
- Fixed Case Fan positioning so they act correctly as front-intake fans behind the front glass panel.
- Added cinematic `Vignette` post-processing (but reverted `ChromaticAberration` to keep the image sharp and free of "blur" or stereoscopic artifacts).
- Introduced staggered text blur-reveal animations and button-pop animations using `framer-motion`.
- Mathematically aligned all core components (Motherboard, CPU, GPU, RAM, SSD, Cooler) perfectly to the Case Motherboard Tray and PSU Shroud, eliminating any floating parts or bottom clipping.
- Fixed a major coordinate space issue where the Case was offset by `Z=1`, causing components to stick out of the back panel. All components are now perfectly enclosed.
