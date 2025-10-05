// Premium Gallery JavaScript - Fixed and Enhanced
class PremiumGallery {
    constructor() {
        // Get all elements
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.searchInput = document.getElementById('searchInput');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxDescription = document.getElementById('lightboxDescription');
        this.closeBtn = document.getElementById('closeBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.currentIndex = 0;
        this.zoomLevel = 1;
        this.likes = new Set();
        this.currentFilter = 'all';
        this.visibleItems = Array.from(this.galleryItems);
        
        this.init();
    }

    init() {
        // Hide loading screen
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.style.display = 'none';
            }
        }, 1500);

        // Initialize gallery item clicks and likes
        this.galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const likeBtn = item.querySelector('.like-btn');
            
            if (img) {
                img.addEventListener('click', () => this.openLightbox(index));
            }
            
            if (likeBtn) {
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleLike(index, likeBtn);
                });
            }
        });

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterImages(btn.dataset.filter);
                this.setActiveFilter(btn);
            });
        });

        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchImages(e.target.value);
            });
        }

        // Lightbox controls
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeLightbox());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevImage());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextImage());
        if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.lightbox && this.lightbox.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape': this.closeLightbox(); break;
                    case 'ArrowLeft': this.prevImage(); break;
                    case 'ArrowRight': this.nextImage(); break;
                }
            }
        });

        // Click outside to close
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Initialize animations
        this.initializeAnimations();

        // Initial stats update
        this.updateStats();
    }

    updateStats() {
        const totalEl = document.getElementById('totalImages');
        const visibleEl = document.getElementById('visibleImages');
        
        if (totalEl) totalEl.textContent = this.galleryItems.length;
        if (visibleEl) visibleEl.textContent = this.visibleItems.length;
    }

    searchImages(query) {
        const searchTerm = query.toLowerCase().trim();
        
        // Reset filter to 'all' when searching
        if (searchTerm) {
            this.setActiveFilter(document.querySelector('[data-filter="all"]'));
        }
        
        this.visibleItems = [];
        
        this.galleryItems.forEach((item) => {
            const titleEl = item.querySelector('h3');
            const descEl = item.querySelector('p');
            
            if (!titleEl || !descEl) return;
            
            const title = titleEl.textContent.toLowerCase();
            const description = descEl.textContent.toLowerCase();
            const category = item.dataset.category ? item.dataset.category.toLowerCase() : '';
            const tags = item.dataset.tags ? item.dataset.tags.toLowerCase() : '';
            
            let matches = false;
            
            if (!searchTerm) {
                matches = true;
            } else {
                matches = title.includes(searchTerm) ||
                         description.includes(searchTerm) ||
                         category.includes(searchTerm) ||
                         tags.includes(searchTerm);
            }
            
            if (matches) {
                item.classList.remove('hidden');
                item.classList.add('visible');
                item.style.display = 'block';
                this.visibleItems.push(item);
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
                item.style.display = 'none';
            }
        });
        
        this.updateStats();
        
        // Show search feedback
        if (searchTerm && this.visibleItems.length === 0) {
            this.showNotification('No images found matching your search');
        }
    }

    filterImages(filter) {
        this.currentFilter = filter;
        
        // Clear search when filtering
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchImages('');
        }
        
        this.visibleItems = [];
        
        this.galleryItems.forEach((item) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.classList.remove('hidden');
                item.classList.add('visible');
                item.style.display = 'block';
                this.visibleItems.push(item);
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
                item.style.display = 'none';
            }
        });
        
        this.updateStats();
    }

    setActiveFilter(activeBtn) {
        if (!activeBtn) return;
        
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    openLightbox(index) {
        if (!this.galleryItems[index]) {
            console.error('Gallery item not found at index:', index);
            return;
        }
        
        this.currentIndex = index;
        this.zoomLevel = 1;
        
        const item = this.galleryItems[index];
        const img = item.querySelector('img');
        const title = item.querySelector('h3');
        const description = item.querySelector('p');
        
        if (!img || !title || !description) {
            console.error('Required elements not found in gallery item');
            return;
        }
        
        if (!this.lightbox || !this.lightboxImg || !this.lightboxTitle || !this.lightboxDescription) {
            console.error('Lightbox elements not found');
            return;
        }
        
        // Set image and content
        this.lightboxImg.src = img.src;
        this.lightboxImg.alt = img.alt;
        this.lightboxImg.style.transform = 'scale(1)';
        this.lightboxTitle.textContent = title.textContent;
        this.lightboxDescription.textContent = description.textContent;
        
        // Show lightbox
        this.lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add active class with slight delay for animation
        requestAnimationFrame(() => {
            this.lightbox.classList.add('active');
        });
        
        // Update visible items for navigation (only show current filter/search results)
        this.updateLightboxNavigation();
    }

    updateLightboxNavigation() {
        // Filter visible items for navigation
        const visibleIndices = this.visibleItems.map((item, idx) => {
            const globalIdx = Array.from(this.galleryItems).indexOf(item);
            return globalIdx;
        });
        
        // Find current index in visible
        const currentVisibleIndex = visibleIndices.indexOf(this.currentIndex);
        
        // Prev/Next will cycle through visible only
        this.prevBtn.style.display = this.visibleItems.length > 1 ? 'block' : 'none';
        this.nextBtn.style.display = this.visibleItems.length > 1 ? 'block' : 'none';
    }

    closeLightbox() {
        if (!this.lightbox) return;
        
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset zoom
        this.zoomLevel = 1;
        if (this.lightboxImg) {
            this.lightboxImg.style.transform = 'scale(1)';
        }
        
        setTimeout(() => {
            this.lightbox.style.display = 'none';
        }, 300);
    }

    prevImage() {
        if (this.visibleItems.length === 0) return;
        
        const visibleIndices = this.visibleItems.map(item => 
            Array.from(this.galleryItems).indexOf(item)
        );
        const currentVisibleIndex = visibleIndices.indexOf(this.currentIndex);
        
        this.currentIndex = visibleIndices[
            currentVisibleIndex > 0 ? currentVisibleIndex - 1 : visibleIndices.length - 1
        ];
        
        this.updateLightboxImage();
    }

    nextImage() {
        if (this.visibleItems.length === 0) return;
        
        const visibleIndices = this.visibleItems.map(item => 
            Array.from(this.galleryItems).indexOf(item)
        );
        const currentVisibleIndex = visibleIndices.indexOf(this.currentIndex);
        
        this.currentIndex = visibleIndices[
            currentVisibleIndex < visibleIndices.length - 1 ? currentVisibleIndex + 1 : 0
        ];
        
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const item = this.galleryItems[this.currentIndex];
        if (!item) return;
        
        const img = item.querySelector('img');
        const title = item.querySelector('h3');
        const description = item.querySelector('p');
        
        if (!img || !title || !description) return;
        
        if (this.lightboxImg) {
            this.lightboxImg.style.opacity = '0';
            setTimeout(() => {
                this.lightboxImg.src = img.src;
                this.lightboxImg.style.opacity = '1';
                this.lightboxImg.style.transform = `scale(${this.zoomLevel})`;
            }, 150);
        }
        
        if (this.lightboxTitle) this.lightboxTitle.textContent = title.textContent;
        if (this.lightboxDescription) this.lightboxDescription.textContent = description.textContent;
    }

    toggleLike(index, btn) {
        const icon = btn.querySelector('i');
        const isLiked = this.likes.has(index);
        
        if (isLiked) {
            this.likes.delete(index);
            if (icon) icon.className = 'far fa-heart';
            btn.style.color = '';
            btn.classList.remove('liked');
        } else {
            this.likes.add(index);
            if (icon) icon.className = 'fas fa-heart';
            btn.style.color = '#ff6b6b';
            btn.classList.add('liked');
            // Create floating hearts animation
            this.createFloatingHearts(btn);
        }
        
        // Enhanced heart animation
        btn.style.animation = 'heartBeat 0.6s ease-in-out';
        setTimeout(() => {
            btn.style.animation = '';
        }, 600);
    }

    createFloatingHearts(btn) {
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.cssText = `
                position: absolute;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                animation: floatHeart 2s ease-out forwards;
                left: ${Math.random() * 40}px;
                top: ${Math.random() * 20}px;
            `;
            btn.parentElement.appendChild(heart);
            setTimeout(() => heart.remove(), 2000);
        }
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
        this.updateZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
        this.updateZoom();
    }

    updateZoom() {
        if (this.lightboxImg) {
            this.lightboxImg.style.transform = `scale(${this.zoomLevel})`;
            this.lightboxImg.style.transition = 'transform 0.3s ease';
        }
    }

    downloadImage() {
        if (this.lightboxImg && this.lightboxImg.src) {
            const link = document.createElement('a');
            link.href = this.lightboxImg.src;
            link.download = `gallery-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Image download started!');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    initializeAnimations() {
        // Add entrance animations to gallery items
        this.galleryItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PremiumGallery();
});

// Add notification styles dynamically if needed
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 15px 20px;
        border-radius: 20px;
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);