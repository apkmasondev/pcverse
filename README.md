# PCVerse

Interaktywny, edukacyjny przewodnik 3D po komponentach komputera PC, zbudowany przy użyciu technologii React, Vite, Three.js, React Three Fiber oraz Tailwind CSS.

## Funkcje
- **Interaktywna scena 3D**: Stylizowany trójwymiarowy model komputera z klikalnymi podzespołami.
- **Widok rozłożony (Exploded View)**: Animacja rozdzielająca wszystkie części dla lepszej widoczności.
- **Kontrola kamery**: Swobodne obracanie wokół PC oraz automatyczne przybliżanie po kliknięciu wybranego komponentu.
- **Panel edukacyjny**: Szczegółowe informacje o roli każdego elementu, ciekawostki oraz ich wpływ na wydajność komputera.
- **W pełni responsywny interfejs**: Dedykowany układ graficzny dopasowany do urządzeń mobilnych i desktopowych.

## Uruchomienie lokalne

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

3. Otwórz adres wyświetlony w terminalu (domyślnie `http://localhost:5173`).

## Wdrożenie i uruchomienie na GitHub Pages

Projekt został skonfigurowany pod kątem automatycznego wdrożenia (CI/CD) przy użyciu **GitHub Actions**.

Aby strona zaczęła działać pod Twoim adresem GitHub Pages:

1. Przejdź do swojego repozytorium na GitHubie: `https://github.com/apkmasondev/pcverse`.
2. Kliknij zakładkę **Settings** (Ustawienia) w górnym menu.
3. W menu po lewej stronie wybierz zakładkę **Pages** (w sekcji *Code and automation*).
4. W sekcji **Build and deployment** (Budowanie i wdrożenie), zmień opcję **Source** (Źródło) z *Deploy from a branch* na **GitHub Actions**.
5. Wdrożenie rozpocznie się automatycznie. Postęp możesz śledzić w zakładce **Actions** na swoim repozytorium.
6. Po zakończeniu procesu strona będzie dostępna pod adresem: [https://apkmasondev.github.io/pcverse/](https://apkmasondev.github.io/pcverse/).
