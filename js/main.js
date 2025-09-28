// Audibry Audio Marketplace - Main JavaScript
class AudioMarketplace {
    constructor() {
        this.isPlaying = false;
        this.currentAudio = null;
        this.waveformAnimations = new Map();
        this.init();
    }

    init() {
        this.setupWaveforms();
        this.setupAudioControls();
        this.setupSearch();
        this.setupNavigation();
        this.setupAnimations();
    }

    // Waveform Visualization
    setupWaveforms() {
        const waveforms = document.querySelectorAll('.waveform, .waveform-mini');
        
        waveforms.forEach((canvas, index) => {
            this.drawWaveform(canvas, index);
        });
    }

    drawWaveform(canvas, seed = 0) {
        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Generate pseudo-random waveform data
        const points = Math.floor(width / 3);
        const waveData = this.generateWaveformData(points, seed);
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 1)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        
        // Draw waveform bars
        const barWidth = width / points;
        
        waveData.forEach((value, i) => {
            const barHeight = (value * height) / 2;
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            // Draw bar
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }

    generateWaveformData(points, seed) {
        const data = [];
        let value = 0.5;
        
        for (let i = 0; i < points; i++) {
            // Create pseudo-random but consistent waveform
            const random = Math.sin(seed + i * 0.1) * Math.cos(seed + i * 0.05);
            value += (random - value) * 0.1;
            value = Math.max(0.1, Math.min(0.9, value));
            data.push(value);
        }
        
        return data;
    }

    // Audio Controls
    setupAudioControls() {
        // Main hero play button
        const heroPlayBtn = document.getElementById('play-preview');
        if (heroPlayBtn) {
            heroPlayBtn.addEventListener('click', () => {
                this.togglePlay(heroPlayBtn, 'hero-preview');
            });
        }

        // Mini play buttons
        const miniPlayBtns = document.querySelectorAll('.btn-play-mini');
        miniPlayBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay(btn, `audio-${index}`);
            });
        });

        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.btn--primary');
        addToCartBtns.forEach(btn => {
            if (btn.textContent.includes('Add to Cart')) {
                btn.addEventListener('click', (e) => {
                    this.addToCart(e.target);
                });
            }
        });
    }

    togglePlay(button, audioId) {
        const playIcon = button.querySelector('svg path');
        
        if (this.currentAudio === audioId && this.isPlaying) {
            // Stop playing
            this.isPlaying = false;
            this.currentAudio = null;
            
            // Change icon back to play
            playIcon.setAttribute('d', 'M8 5v14l11-7z');
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            this.stopWaveformAnimation(audioId);
        } else {
            // Start playing
            if (this.currentAudio && this.isPlaying) {
                // Stop current audio first
                this.stopWaveformAnimation(this.currentAudio);
                
                // Reset previous button
                const prevButton = document.querySelector(`[data-audio="${this.currentAudio}"]`);
                if (prevButton) {
                    const prevIcon = prevButton.querySelector('svg path');
                    prevIcon.setAttribute('d', 'M8 5v14l11-7z');
                }
            }
            
            this.isPlaying = true;
            this.currentAudio = audioId;
            
            // Change icon to pause
            playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
            button.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            button.setAttribute('data-audio', audioId);
            
            this.startWaveformAnimation(audioId);
            
            // Simulate audio ending after 30 seconds
            setTimeout(() => {
                if (this.currentAudio === audioId) {
                    this.togglePlay(button, audioId);
                }
            }, 30000);
        }
    }

    startWaveformAnimation(audioId) {
        const waveform = audioId === 'hero-preview' 
            ? document.getElementById('waveform-preview')
            : document.querySelectorAll('.waveform-mini')[parseInt(audioId.split('-')[1])];
        
        if (!waveform) return;
        
        let progress = 0;
        const animate = () => {
            if (this.currentAudio === audioId && this.isPlaying) {
                progress += 0.01;
                this.updateWaveformProgress(waveform, progress);
                
                if (progress < 1) {
                    this.waveformAnimations.set(audioId, requestAnimationFrame(animate));
                }
            }
        };
        
        animate();
    }

    stopWaveformAnimation(audioId) {
        if (this.waveformAnimations.has(audioId)) {
            cancelAnimationFrame(this.waveformAnimations.get(audioId));
            this.waveformAnimations.delete(audioId);
        }
    }

    updateWaveformProgress(canvas, progress) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Add progress overlay
        const progressWidth = width * progress;
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, progressWidth, height);
        ctx.restore();
    }

    addToCart(button) {
        const originalText = button.textContent;
        
        // Visual feedback
        button.textContent = 'Added!';
        button.style.background = 'linear-gradient(135deg, #00d4aa 0%, #00a085 100%)';
        button.disabled = true;
        
        // Create cart animation
        this.createCartAnimation(button);
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
    }

    createCartAnimation(button) {
        const rect = button.getBoundingClientRect();
        const cartItem = document.createElement('div');
        
        cartItem.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            z-index: 9999;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        document.body.appendChild(cartItem);
        
        // Animate to top right (simulated cart position)
        setTimeout(() => {
            cartItem.style.top = '20px';
            cartItem.style.right = '20px';
            cartItem.style.left = 'auto';
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'scale(0.5)';
        }, 100);
        
        // Remove element after animation
        setTimeout(() => {
            document.body.removeChild(cartItem);
        }, 1000);
    }

    // Search Functionality
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        const filterSelect = document.querySelector('.filter-select');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(() => this.performSearch(e.target.value), 300)();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
    }

    performSearch(query) {
        const audioCards = document.querySelectorAll('.audio-card');
        
        audioCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            const searchText = [title, ...tags].join(' ');
            
            if (query === '' || searchText.includes(query.toLowerCase())) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    }

    filterByCategory(category) {
        const audioCards = document.querySelectorAll('.audio-card');
        
        audioCards.forEach(card => {
            const cardCategory = card.querySelector('.audio-meta').textContent.split('•')[0].trim();
            
            if (category === 'All Categories' || cardCategory === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Navigation
    setupNavigation() {
        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav__link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header background on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    }

    // Animations
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.category-card, .feature, .audio-card');
        animateElements.forEach(el => observer.observe(el));

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });
    }
}

// Audio Format Information
const AUDIO_FORMATS = {
    WAV: {
        description: 'Uncompressed, professional quality',
        quality: '96kHz/24-bit',
        size: 'Large file size',
        compatibility: 'Universal compatibility'
    },
    FLAC: {
        description: 'Lossless compression',
        quality: '96kHz/24-bit',
        size: 'Medium file size',
        compatibility: 'Professional software'
    },
    AIFF: {
        description: 'Apple professional format',
        quality: '96kHz/24-bit',
        size: 'Large file size',
        compatibility: 'Mac/Pro Audio'
    }
};

// Sample audio data for demonstration
const SAMPLE_AUDIO_DATA = [
    {
        title: "Urban Rain Ambience",
        category: "Ambience",
        duration: "3:24",
        price: 12,
        tags: ["rain", "urban", "atmosphere"],
        quality: "96kHz/24-bit",
        description: "Professional field recording of urban rainfall with subtle traffic ambience"
    },
    {
        title: "Footsteps on Gravel",
        category: "Foley",
        duration: "0:45",
        price: 8,
        tags: ["footsteps", "gravel", "walking"],
        quality: "96kHz/24-bit",
        description: "Clean foley recording of various walking paces on gravel surface"
    },
    {
        title: "Ethereal Texture Pad",
        category: "Texture",
        duration: "2:15",
        price: 15,
        tags: ["ethereal", "ambient", "pad"],
        quality: "96kHz/24-bit",
        description: "Atmospheric texture perfect for meditation and ambient productions"
    },
    {
        title: "Industrial Impact",
        category: "Sound Effect",
        duration: "0:12",
        price: 6,
        tags: ["impact", "industrial", "metal"],
        quality: "96kHz/24-bit",
        description: "Powerful industrial impact sound with metallic resonance"
    }
];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const marketplace = new AudioMarketplace();
    
    // Add some demo functionality
    console.log('Audibry Audio Marketplace loaded successfully!');
    console.log('Available audio formats:', AUDIO_FORMATS);
    console.log('Sample audio library:', SAMPLE_AUDIO_DATA);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioMarketplace;
}