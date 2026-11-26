# Changelog — frontend repair

## Created
css/layout.css · script/store.js · script/layout.js (replaces the missing ui-enhancer.js) · script/dashboard.js · script/orders.js · script/profile.js · pages/profile.html · pages/orders.html · pages/info.html (Shipping/FAQ/Support/Privacy/Terms — footer links previously went nowhere) · images/hero.mp4 (renamed hero video) · README.md · TESTING-REPORT.md · CHANGELOG.md

## Modified
index.html and every page in pages/ (consistent head, header, footer, scripts; relative paths) · all scripts in script/ (rewritten on a shared Store) · data/artworks.js (now the single data source) · css/style.css, style-premium.css, design-system.css (removed render-blocking @imports; fonts now preloaded via <link>) · all images (resized/compressed 27.8 MB → 3.0 MB, same filenames and look)

## Deleted
data/artworks-improved.js, data/hot-artworks.js (merged into data/artworks.js) · images/SnapInsta….mp4 (renamed to images/hero.mp4)

## Main bugs fixed
- Absolute paths (`/I-ArtWorks/…`, `/IArtWorks/…`) broke images/CSS/links everywhere except one hosting layout.
- Missing `ui-enhancer.js`, missing profile/orders pages, dead footer/`#` links.
- Mobile menu button did nothing; no navigation on phones.
- Wishlist used 2 different storage keys; cart allowed duplicate one-of-a-kind items; hot-slider "Add" added the wrong painting.
- Promo codes could push totals negative and went stale when the cart changed.
- Orders were never linked to users, so dashboard stats were always empty.
- Forgot-password/Settings opened the register form; "Remember me" did nothing.
- Titles didn't match images (e.g. "3D pepcie" is a Pepsi can; two paintings shared "couple love"; four preview cards had swapped titles). Hard-coded 2025 delivery dates replaced by dates computed from today.
- Product heart button hidden under header; duplicate element IDs; invalid CSS `font-variation-settings`.

## Decisions for you to review
- **Prices/titles:** I kept the values the live site was showing (`artworks.js`), not the higher ones in the unused `artworks-improved.js`. New items I had to add (ids 11–18, from the carousel/preview/hot sections) have placeholder prices — edit in `data/artworks.js`.
- Carousel slides now link to real products instead of invented artists/₹45,000 prices.
- Checkout now requires login so orders appear in history; earlier guest orders can be claimed from My Orders.
- Unused files left untouched: css/global-improved.css, css/design-system.css (not loaded by any page).
