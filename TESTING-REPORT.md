# I-ArtWorks — Testing Report

**Result: 122/122 automated checks passed.** Zero uncaught JavaScript errors, zero failed local requests, zero broken images, no horizontal scrolling on any page at 1280 px (desktop), 820 px (tablet) or 390 px (phone).

Tested with headless Chromium (Playwright) against a local web server. Every check below drives the real UI (clicks, typing, forms) and asserts real values — e.g. cart totals were verified to the rupee.

| # | Check | Result |
|---|-------|--------|
| 1 | Home: gallery renders all artworks | ✅ Pass |
| 2 | Home: count label matches | ✅ Pass |
| 3 | Category PORTRAIT filters correctly | ✅ Pass |
| 4 | Search "elephant" → 1 result | ✅ Pass |
| 5 | Search no match shows empty state | ✅ Pass |
| 6 | Reset restores gallery | ✅ Pass |
| 7 | Search by artist works | ✅ Pass |
| 8 | Sort price low→high | ✅ Pass |
| 9 | Sort price high→low | ✅ Pass |
| 10 | Filter panel opens | ✅ Pass |
| 11 | Price filter caps results at ₹500 | ✅ Pass |
| 12 | List view toggles | ✅ Pass |
| 13 | Grid view toggles | ✅ Pass |
| 14 | Add to cart (card) → badge 1 | ✅ Pass |
| 15 | Duplicate add keeps cart at 1 | ✅ Pass |
| 16 | Wishlist heart (card) → badge 1 | ✅ Pass |
| 17 | Heart shows active state | ✅ Pass |
| 18 | Wishlist heart toggles off | ✅ Pass |
| 19 | Quick view modal opens with title | ✅ Pass |
| 20 | Quick view → Add to Cart works | ✅ Pass |
| 21 | Hot tabs switch content | ✅ Pass |
| 22 | Hot slider cart button adds the right item | ✅ Pass |
| 23 | Carousel renders 4 slides | ✅ Pass |
| 24 | Carousel next works | ✅ Pass |
| 25 | Carousel prev works | ✅ Pass |
| 26 | Carousel indicator jumps | ✅ Pass |
| 27 | Carousel CTA links to a product page | ✅ Pass |
| 28 | Newsletter rejects bad email | ✅ Pass |
| 29 | Newsletter subscribes valid email | ✅ Pass |
| 30 | Commission modal opens | ✅ Pass |
| 31 | Commission modal validates empty form | ✅ Pass |
| 32 | Commission modal submits & opens WhatsApp | ✅ Pass |
| 33 | Commission saved locally | ✅ Pass |
| 34 | Product: title/price/discount | ✅ Pass |
| 35 | Product: description filled | ✅ Pass |
| 36 | Product: image loaded | ✅ Pass |
| 37 | Product: shows "In Your Bag" because already in cart | ✅ Pass |
| 38 | Product: wishlist toggle on | ✅ Pass |
| 39 | Product: wishlist toggle off | ✅ Pass |
| 40 | Product: similar works use same category first | ✅ Pass |
| 41 | Product: accordion opens | ✅ Pass |
| 42 | Product: zoom opens | ✅ Pass |
| 43 | Product: zoom closes with Esc | ✅ Pass |
| 44 | Product: artist link filters gallery | ✅ Pass |
| 45 | Product: unknown id shows not-found state | ✅ Pass |
| 46 | Product: Add to Cart works | ✅ Pass |
| 47 | Product: Buy Now → bag page | ✅ Pass |
| 48 | Bag: contains expected items | ✅ Pass |
| 49 | Bag: item count text | ✅ Pass |
| 50 | Bag: total = subtotal + fee (₹1,088) | ✅ Pass |
| 51 | Promo ART10 → 10% of ₹1,010 = ₹101 → ₹987 | ✅ Pass |
| 52 | Remove item recomputes promo & total (₹807) | ✅ Pass |
| 53 | Promo can be removed (₹888) | ✅ Pass |
| 54 | Invalid promo rejected | ✅ Pass |
| 55 | Big fixed promo is capped (never below fee): ₹78 | ✅ Pass |
| 56 | Clear cart empties bag & shows empty state | ✅ Pass |
| 57 | Place order disabled when empty | ✅ Pass |
| 58 | Checkout asks guests to sign in | ✅ Pass |
| 59 | Register validates empty form | ✅ Pass |
| 60 | Register rejects short phone | ✅ Pass |
| 61 | Register rejects mismatched passwords | ✅ Pass |
| 62 | Register succeeds & resumes checkout (address modal) | ✅ Pass |
| 63 | Header shows user name | ✅ Pass |
| 64 | Checkout validates address | ✅ Pass |
| 65 | Checkout rejects bad PIN | ✅ Pass |
| 66 | Order confirmed with number | ✅ Pass |
| 67 | Cart cleared after order | ✅ Pass |
| 68 | Order saved with total ₹ (761*0.57=434 +78=512) | ✅ Pass |
| 69 | Dashboard: greets user | ✅ Pass |
| 70 | Dashboard: stats (1 order, ₹512) | ✅ Pass |
| 71 | Dashboard: recent order listed | ✅ Pass |
| 72 | Dashboard: commission section hidden when none for this email | ✅ Pass |
| 73 | Orders: order shown with Processing status | ✅ Pass |
| 74 | Orders: details expand | ✅ Pass |
| 75 | Orders: filter hides non-matching | ✅ Pass |
| 76 | Orders: Order again → bag has the item | ✅ Pass |
| 77 | Orders: cancel works | ✅ Pass |
| 78 | Dashboard: cancelled order excluded from spend | ✅ Pass |
| 79 | Profile: prefilled | ✅ Pass |
| 80 | Profile: name validation | ✅ Pass |
| 81 | Profile: phone validation | ✅ Pass |
| 82 | Profile: saves name | ✅ Pass |
| 83 | Profile: address validation | ✅ Pass |
| 84 | Profile: wrong current password rejected | ✅ Pass |
| 85 | Profile: password changes | ✅ Pass |
| 86 | Account dropdown opens with working links | ✅ Pass |
| 87 | Dropdown links resolve under /pages/ | ✅ Pass |
| 88 | Logout redirects home from protected page | ✅ Pass |
| 89 | Protected page redirects to login with next= | ✅ Pass |
| 90 | Login: old password rejected after change | ✅ Pass |
| 91 | Login: success returns to requested page | ✅ Pass |
| 92 | Forgot: unknown email rejected | ✅ Pass |
| 93 | Forgot: step 2 asks for new password | ✅ Pass |
| 94 | Forgot: reset password then login works | ✅ Pass |
| 95 | Wishlist: empty state | ✅ Pass |
| 96 | Wishlist: legacy/dup/invalid entries migrated | ✅ Pass |
| 97 | Wishlist: 3 items rendered | ✅ Pass |
| 98 | Wishlist: On Sale filter | ✅ Pass |
| 99 | Wishlist: Add All → cart has 3 | ✅ Pass |
| 100 | Wishlist: buttons show In Bag | ✅ Pass |
| 101 | Wishlist: remove one | ✅ Pass |
| 102 | Wishlist: share link has ids | ✅ Pass |
| 103 | Wishlist: shared link opens read-only view | ✅ Pass |
| 104 | Wishlist: Clear All (confirm) | ✅ Pass |
| 105 | Commission: empty submit shows errors | ✅ Pass |
| 106 | Commission: custom size field appears | ✅ Pass |
| 107 | Commission: phone/description/custom-size validated | ✅ Pass |
| 108 | Commission: only valid image accepted | ✅ Pass |
| 109 | Commission: file can be removed | ✅ Pass |
| 110 | Commission: submit opens WhatsApp w/ message | ✅ Pass |
| 111 | Commission: success dialog shown | ✅ Pass |
| 112 | Commission: dialog closes (stays on page) | ✅ Pass |
| 113 | Commission: request stored | ✅ Pass |
| 114 | Mobile: hamburger visible, desktop nav hidden | ✅ Pass |
| 115 | Mobile: drawer opens | ✅ Pass |
| 116 | Mobile: drawer has nav links | ✅ Pass |
| 117 | Mobile: drawer closes after navigation | ✅ Pass |
| 118 | Mobile: search box filters gallery & syncs | ✅ Pass |
| 119 | Mobile: no horizontal scroll | ✅ Pass |
| 120 | Mobile: drawer Login opens auth modal | ✅ Pass |
| 121 | Link crawl: no dead links / missing anchors on public pages | ✅ Pass |
| 122 | No uncaught JS errors across whole run | ✅ Pass |

## What was NOT possible to test here

- **Google Fonts / Material icons / Font Awesome** are loaded from the internet; the test sandbox is offline, so icon rendering was verified by layout box only. They load normally on any connected device.
- **Real phones / Safari / Firefox:** tested in Chromium at phone/tablet/desktop viewport sizes only. Please do a quick pass on your own Android phone (see README → *Test on your phone*).
- **WhatsApp hand-off:** verified that the correct `wa.me` URL and message are generated; actually sending needs WhatsApp on the device.
- **Hero video autoplay** depends on the browser's autoplay policy; a poster image shows if blocked.
