// Carousel functionality
class ArtCarousel {
    constructor(options = {}) {
        this.container = document.querySelector('.carousel-container');
        this.slides = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = options.autoplayDelay || 5000;
        this.isAutoplayEnabled = options.autoplay !== false;
        this.progressBar = null;
        this.progressInterval = null;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
        if (this.slides.length === 0) return;

        this.setupNavigation();
        this.setupIndicators();
        this.setupThumbnails();
        this.setupControls();
        this.setupProgressBar();
        this.setupKeyboardNav();
        this.setupSwipeGestures();
        
        // Show first slide
        this.showSlide(0);
        
        // Start autoplay if enabled
        if (this.isAutoplayEnabled) {
            this.startAutoplay();
        }
    }

    showSlide(index) {
        // Ensure index is within bounds
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        // Remove active class from all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });

        // Add active class to current slide
        this.slides[index].classList.add('active');
        
        // Add prev/next classes for smoother transitions
        const prevIndex = index === 0 ? this.slides.length - 1 : index - 1;
        const nextIndex = index === this.slides.length - 1 ? 0 : index + 1;
        this.slides[prevIndex].classList.add('prev');
        this.slides[nextIndex].classList.add('next');

        this.currentIndex = index;
        this.updateIndicators();
        this.updateThumbnails();
        this.resetProgress();
    }

    nextSlide() {
        this.showSlide(this.currentIndex + 1);
    }

    prevSlide() {
        this.showSlide(this.currentIndex - 1);
    }

    setupNavigation() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.resetAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoplay();
            });
        }
    }

    setupIndicators() {
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                this.showSlide(index);
                this.resetAutoplay();
            });

            indicatorsContainer.appendChild(indicator);
        });
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    setupThumbnails() {
        const thumbnailsContainer = document.querySelector('.carousel-thumbnails');
        if (!thumbnailsContainer) return;

        thumbnailsContainer.innerHTML = '';

        this.slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (!img) return;

            const thumbnail = document.createElement('div');
            thumbnail.classList.add('carousel-thumbnail');
            if (index === 0) thumbnail.classList.add('active');

            const thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = img.alt;

            thumbnail.appendChild(thumbImg);
            thumbnail.addEventListener('click', () => {
                this.showSlide(index);
                this.resetAutoplay();
            });

            thumbnailsContainer.appendChild(thumbnail);
        });
    }

    updateThumbnails() {
        const thumbnails = document.querySelectorAll('.carousel-thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            if (index === this.currentIndex) {
                thumbnail.classList.add('active');
            } else {
                thumbnail.classList.remove('active');
            }
        });
    }

    setupControls() {
        const playPauseBtn = document.getElementById('carouselPlayPause');
        
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('.material-symbols-outlined');
            
            playPauseBtn.addEventListener('click', () => {
                if (this.isAutoplayEnabled) {
                    this.stopAutoplay();
                    icon.textContent = 'play_arrow';
                } else {
                    this.startAutoplay();
                    icon.textContent = 'pause';
                }
                this.isAutoplayEnabled = !this.isAutoplayEnabled;
            });
        }
    }

    setupProgressBar() {
        const progressBar = document.querySelector('.carousel-progress-bar');
        if (!progressBar) return;

        this.progressBar = progressBar;
    }

    resetProgress() {
        if (!this.progressBar) return;
        
        clearInterval(this.progressInterval);
        this.progressBar.style.width = '0%';
        
        if (this.isAutoplayEnabled) {
            let progress = 0;
            const increment = 100 / (this.autoplayDelay / 100);
            
            this.progressInterval = setInterval(() => {
                progress += increment;
                if (progress >= 100) {
                    clearInterval(this.progressInterval);
                } else {
                    this.progressBar.style.width = progress + '%';
                }
            }, 100);
        }
    }

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.resetAutoplay();
            }
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        let endX = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.resetAutoplay();
            }
        });

        // Mouse drag support
        let isDragging = false;
        let startMouseX = 0;

        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startMouseX = e.clientX;
            this.container.style.cursor = 'grabbing';
        });

        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
        });

        this.container.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            this.container.style.cursor = 'grab';
            
            const endMouseX = e.clientX;
            const diff = startMouseX - endMouseX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.resetAutoplay();
            }
        });

        this.container.addEventListener('mouseleave', () => {
            isDragging = false;
            this.container.style.cursor = 'grab';
        });
    }

    startAutoplay() {
        this.stopAutoplay(); // Clear any existing interval
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
        this.resetProgress();
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }

    resetAutoplay() {
        if (this.isAutoplayEnabled) {
            this.startAutoplay();
        }
    }

    destroy() {
        this.stopAutoplay();
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }
}

// Featured artworks for carousel
const carouselArtworks = [
    {
        id: 1,
        image: '/I-ArtWorks/images/6.jpg',
        title: 'Ethereal Dreams',
        artist: 'Sophia Chen',
        description: 'A mesmerizing blend of colors and emotions captured on canvas',
        price: '₹45,000',
        link: '#'
    },
    {
        id: 2,
        image: '/I-ArtWorks/images/mu.jpg',
        title: 'Urban Symphony',
        artist: 'Marcus Rivera',
        description: 'Contemporary expression of city life through abstract forms',
        price: '₹38,000',
        link: '#'
    },
    {
        id: 3,
        image: '/I-ArtWorks/images/cn.jpg',
        title: 'Golden Serenity',
        artist: 'Aisha Patel',
        description: 'Peaceful moments captured in warm, luminous tones',
        price: '₹52,000',
        link: '#'
    },
    {
        id: 4,
        image: '/I-ArtWorks/images/bd.jpg',
        title: 'Midnight Reflections',
        artist: 'James Morrison',
        description: 'Deep contemplation expressed through bold strokes and shadows',
        price: '₹41,000',
        link: '#'
    }
];

// Generate carousel HTML
function generateCarouselHTML() {
    const carouselSection = document.getElementById('featuredCarousel');
    if (!carouselSection) return;

    const html = `
        <div class="carousel-header">
            <h2 class="carousel-title">Featured Masterpieces</h2>
            <p class="carousel-subtitle">Discover our handpicked collection of extraordinary artworks</p>
        </div>

        <div class="carousel-wrapper">
            <div class="carousel-container" style="cursor: grab;">
                ${carouselArtworks.map(art => `
                    <div class="carousel-slide">
                        <img src="${art.image}" alt="${art.title}">
                        <div class="carousel-overlay">
                            <h3 class="carousel-artwork-title">${art.title}</h3>
                            <p class="carousel-artist">by ${art.artist}</p>
                            <p class="carousel-description">${art.description}</p>
                            <div class="carousel-price">${art.price}</div>
                            <a href="${art.link}" class="carousel-cta">View Artwork</a>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button class="carousel-nav carousel-prev">
                <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button class="carousel-nav carousel-next">
                <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <div class="carousel-indicators"></div>

            <div class="carousel-controls">
                <button class="carousel-control-btn" id="carouselPlayPause">
                    <span class="material-symbols-outlined">pause</span>
                </button>
            </div>

            <div class="carousel-progress">
                <div class="carousel-progress-bar"></div>
            </div>
        </div>

        <div class="carousel-thumbnails"></div>
    `;

    carouselSection.innerHTML = html;
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    generateCarouselHTML();
    
    // Wait a bit for HTML to render
    setTimeout(() => {
        window.artCarousel = new ArtCarousel({
            autoplay: true,
            autoplayDelay: 5000
        });
    }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.artCarousel) {
        window.artCarousel.destroy();
    }
});
