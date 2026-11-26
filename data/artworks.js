// ═══════════════════════════════════════════════════════════════
// I-ArtWorks — single source of truth for all artwork data.
// Every page (gallery, detail, cart, wishlist, carousel, hot list)
// reads from this file. Edit prices / titles here only.
// Image paths are RELATIVE TO THE SITE ROOT (the loader in utils.js
// adds "../" automatically on pages inside /pages/).
// ═══════════════════════════════════════════════════════════════

const CATEGORIES = ["ABSTRACT", "LANDSCAPE", "PORTRAIT", "WATERCOLOR", "SKETCH", "3D ART"];

const artworks = [
  { id: 1,  image: "images/c.jpg",  label: "New",      title: "Cute Puppy",        artist: "Eveline Sander",  category: "SKETCH",     meta: "SKETCH",     size: '12" × 16"', medium: "Pencil on Paper",      original_price: 100, discount_percentage: 10, return_period: 14, delivery_days: 5, rating: 4.8, reviews: 45, in_stock: true, hot: "best",
    description: "A tender pencil study of a puppy peeking out of a paw-print teacup, shaded softly for warmth and detail." },
  { id: 2,  image: "images/mu.jpg", label: "Curated",  title: "Mountain View",     artist: "Alex Noir",       category: "LANDSCAPE",  meta: "LANDSCAPE",  size: '18" × 22"', medium: "Oil Pastel on Paper",  original_price: 1000, discount_percentage: 28, return_period: 14, delivery_days: 5, rating: 4.9, reviews: 67, in_stock: true, hot: "best",
    description: "Snow-capped peaks glowing at sunset above a winding river valley, rendered in rich oil pastel." },
  { id: 3,  image: "images/wc.jpg", label: "Featured", title: "Colour White",      artist: "Alex Noir",       category: "ABSTRACT",   meta: "ABSTRACT",   size: '18" × 22"', medium: "Water Colour",         original_price: 832, discount_percentage: 76, return_period: 14, delivery_days: 7, rating: 4.7, reviews: 52, in_stock: true, hot: "best",
    description: "Flowing blue and violet ink washes drifting across white paper — expressive, airy and calm." },
  { id: 4,  image: "images/E.jpg",  label: "New",      title: "Elephant Portrait", artist: "Imtiyaz Rehman",  category: "PORTRAIT",   meta: "PORTRAIT",   size: '18" × 22"', medium: "Ink on Paper",         original_price: 761, discount_percentage: 43, return_period: 14, delivery_days: 7, rating: 4.6, reviews: 38, in_stock: true, hot: "best",
    description: "A detailed graphite and ink study of an elephant's head, trunk and tusk — textured, powerful and gentle." },
  { id: 5,  image: "images/w.jpg",  label: "Featured", title: "Break Paper",       artist: "Imtiyaz Rehman",  category: "ABSTRACT",   meta: "ABSTRACT",   size: '18" × 22"', medium: "Ink on Paper",         original_price: 678, discount_percentage: 21, return_period: 14, delivery_days: 7, rating: 4.5, reviews: 31, in_stock: true, hot: "new",
    description: "A face breaking through torn paper — a bold monochrome piece about emerging, freedom and expression." },
  { id: 6,  image: "images/g.jpg",  label: "Curated",  title: "M.K. Gandhi",       artist: "Imtiyaz Rehman",  category: "PORTRAIT",   meta: "PORTRAIT",   size: '18" × 22"', medium: "Pencil on Paper",      original_price: 577, discount_percentage: 30, return_period: 14, delivery_days: 7, rating: 4.8, reviews: 89, in_stock: true,
    description: "A finely shaded pencil portrait of Mahatma Gandhi, capturing his calm, wise expression." },
  { id: 7,  image: "images/p.jpg",  label: "Featured", title: "3D Pepsi",          artist: "Imtiyaz Rehman",  category: "3D ART",     meta: "3D ART",     size: '18" × 22"', medium: "Ink on Paper",         original_price: 500, discount_percentage: 30, return_period: 8,  delivery_days: 7, rating: 4.9, reviews: 72, in_stock: true, hot: "new",
    description: "A hyper-realistic 3D illusion drawing of a Pepsi can that appears to rest right on the page." },
  { id: 8,  image: "images/m.jpg",  label: "Limited",  title: "Illusion Sketch",   artist: "Imtiyaz Rehman",  category: "SKETCH",     meta: "SKETCH",     size: '18" × 22"', medium: "Ink on Paper",         original_price: 700, discount_percentage: 60, return_period: 14, delivery_days: 7, rating: 4.7, reviews: 56, in_stock: true, hot: "new",
    description: "A dramatic, distorted-perspective portrait study in graphite that plays with proportion and depth." },
  { id: 9,  image: "images/lo.jpg", label: "Limited",  title: "Couple Love",       artist: "Imtiyaz Rehman",  category: "WATERCOLOR", meta: "WATERCOLOR", size: '18" × 22"', medium: "Water Colour on Paper", original_price: 700, discount_percentage: 75, return_period: 14, delivery_days: 5, rating: 4.8, reviews: 61, in_stock: true,
    description: "A minimal watercolour of a couple celebrating together, painted in bold reds and soft shadows." },
  { id: 10, image: "images/6.jpg",  label: "Limited",  title: "Teal Portrait",     artist: "Imtiyaz Rehman",  category: "ABSTRACT",   meta: "ABSTRACT",   size: '18" × 22"', medium: "Mixed Media on Paper", original_price: 700, discount_percentage: 75, return_period: 14, delivery_days: 5, rating: 4.9, reviews: 74, in_stock: true,
    description: "An expressive portrait built from layered teal and ochre brush strokes, half dissolving into texture." },
  { id: 11, image: "images/it.jpg", label: "New",      title: "Soft Bloom",        artist: "Imtiyaz Rehman",  category: "PORTRAIT",   meta: "PORTRAIT",   size: '18" × 22"', medium: "Water Colour on Paper", original_price: 650, discount_percentage: 40, return_period: 14, delivery_days: 7, rating: 4.7, reviews: 28, in_stock: true, hot: "new",
    description: "A gentle watercolour portrait of a young woman in soft, natural skin tones." },
  { id: 12, image: "images/im.jpg", label: "New",      title: "Amber Flow",        artist: "Imtiyaz Rehman",  category: "PORTRAIT",   meta: "PORTRAIT",   size: '18" × 22"', medium: "Water Colour on Paper", original_price: 600, discount_percentage: 35, return_period: 14, delivery_days: 7, rating: 4.6, reviews: 24, in_stock: true, hot: "best",
    description: "A delicate watercolour of a girl with warm amber splashes flowing through the paper." },
  { id: 13, image: "images/1.jpg",  label: "Featured", title: "Silent Forest",     artist: "Elena Rossi",     category: "LANDSCAPE",  meta: "LANDSCAPE",  size: '18" × 24"', medium: "Digital Print on Paper", original_price: 900, discount_percentage: 25, return_period: 14, delivery_days: 7, rating: 4.7, reviews: 33, in_stock: true,
    description: "Sunlight filtering through ancient moss-covered oaks in a quiet, misty forest." },
  { id: 14, image: "images/2.jpg",  label: "Curated",  title: "Ocean Bliss",       artist: "Maria Lee",       category: "LANDSCAPE",  meta: "LANDSCAPE",  size: '18" × 24"', medium: "Digital Print on Paper", original_price: 850, discount_percentage: 20, return_period: 14, delivery_days: 7, rating: 4.8, reviews: 41, in_stock: true,
    description: "A wooden sailing ship gliding across a golden-lit sea at dawn." },
  { id: 15, image: "images/3.jpg",  label: "Featured", title: "Golden Horizon",    artist: "Kai Tanaka",      category: "LANDSCAPE",  meta: "LANDSCAPE",  size: '18" × 24"', medium: "Digital Print on Paper", original_price: 950, discount_percentage: 30, return_period: 14, delivery_days: 7, rating: 4.9, reviews: 58, in_stock: true,
    description: "A lone fishing boat resting on the shore as the sun sets over a glowing sea." },
  { id: 16, image: "images/4.jpg",  label: "New",      title: "Geometric Dreams",  artist: "Alex Noir",       category: "ABSTRACT",   meta: "ABSTRACT",   size: '18" × 24"', medium: "Acrylic on Canvas",     original_price: 800, discount_percentage: 25, return_period: 14, delivery_days: 7, rating: 4.6, reviews: 29, in_stock: true,
    description: "A vivid kaleidoscope of red, yellow and blue triangles radiating from a single centre point." },
  { id: 17, image: "images/cn.jpg", label: "Curated",  title: "Golden Serenity",   artist: "Aisha Patel",     category: "LANDSCAPE",  meta: "LANDSCAPE",  size: '24" × 30"', medium: "Oil on Canvas",         original_price: 52000, discount_percentage: 0, return_period: 14, delivery_days: 10, rating: 4.9, reviews: 19, in_stock: true,
    description: "Peaceful moments captured in warm, luminous tones — a pastoral scene under dappled light." },
  { id: 18, image: "images/bd.jpg", label: "Limited",  title: "Midnight Reflections", artist: "James Morrison", category: "SKETCH",    meta: "SKETCH",     size: '24" × 30"', medium: "Ink & Watercolour",     original_price: 41000, discount_percentage: 0, return_period: 14, delivery_days: 10, rating: 4.8, reviews: 16, in_stock: true,
    description: "Birds in flight sketched in ink and soft wash on warm kraft paper — bold strokes and shadows." }
];

// Carousel slides reference real products so "View Artwork" always works.
const carouselIds = [10, 2, 17, 18];

// "Hot This Week" tabs are driven by the `hot` field above ("best" | "new").
