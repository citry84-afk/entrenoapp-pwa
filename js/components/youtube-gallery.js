// EntrenoApp - YouTube Gallery Component
// Componente reutilizable para mostrar videos de YouTube

class YouTubeGallery {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'youtube-gallery',
            apiKey: config.apiKey || '',
            channelId: config.channelId || '',
            channelUrl: config.channelUrl || '',
            maxVideos: config.maxVideos || 12,
            featuredVideos: config.featuredVideos || [],
            theme: config.theme || 'default',
            autoPlay: config.autoPlay !== undefined ? config.autoPlay : false,
            showThumbnails: config.showThumbnails !== undefined ? config.showThumbnails : true,
            ...config
        };
        
        this.videos = [];
        this.currentVideoIndex = 0;
        this.currentCategory = 'all';
        
        this.init();
    }
    
    async init() {
        await this.loadVideos();
        this.render();
        this.setupEventListeners();
    }
    
    async loadVideos() {
        try {
            if (this.config.apiKey && this.config.channelId) {
                this.videos = await this.fetchVideosFromAPI();
            } else if (this.config.featuredVideos.length > 0) {
                this.videos = await this.fetchVideoDetails(this.config.featuredVideos);
            } else {
                this.videos = this.getPlaceholderVideos();
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.videos = this.getPlaceholderVideos();
        }
    }
    
    async fetchVideosFromAPI() {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.config.apiKey}&channelId=${this.config.channelId}&part=snippet,id&order=date&maxResults=${this.config.maxVideos}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description.substring(0, 100) + '...',
            category: 'all',
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt
        }));
    }
    
    async fetchVideoDetails(videoIds) {
        const promises = videoIds.map(async (videoId) => {
            const url = `https://www.googleapis.com/youtube/v3/videos?key=${this.config.apiKey}&id=${videoId}&part=snippet,statistics`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                return {
                    id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description.substring(0, 100) + '...',
                    category: 'all',
                    thumbnail: item.snippet.thumbnails.high.url,
                    publishedAt: item.snippet.publishedAt,
                    views: item.statistics.viewCount
                };
            }
            return null;
        });
        
        const results = await Promise.all(promises);
        return results.filter(video => video !== null);
    }
    
    getPlaceholderVideos() {
        return [
            {
                id: 'dQw4w9WgXcQ',
                title: 'Tutorial de Fitness en Casa',
                description: 'Aprende ejercicios efectivos sin equipamiento',
                category: 'fitness',
                thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`
            }
        ];
    }
    
    render() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error('Container not found:', this.config.containerId);
            return;
        }
        
        const videos = this.getVideosByCategory();
        
        container.innerHTML = `
            <div class="youtube-gallery-container">
                <div class="youtube-gallery-header">
                    <h2>📺 Videos de EntrenoApp</h2>
                    ${this.config.channelUrl ? `
                        <a href="${this.config.channelUrl}" target="_blank" class="youtube-subscribe-btn">
                            Suscribirse al Canal
                        </a>
                    ` : ''}
                </div>
                
                ${this.getFeaturedVideos().length > 0 ? `
                    <div class="youtube-gallery-featured">
                        <div class="featured-video">
                            <iframe 
                                src="https://www.youtube.com/embed/${this.getFeaturedVideos()[0].id}?${this.config.autoPlay ? 'autoplay=1&' : ''}rel=0&modestbranding=1"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                        ${this.getFeaturedVideos().length > 1 ? `
                            <div class="featured-controls">
                                <button class="featured-prev-btn">◀</button>
                                <span class="featured-counter">1 / ${this.getFeaturedVideos().length}</span>
                                <button class="featured-next-btn">▶</button>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="youtube-gallery-grid">
                    ${videos.map(video => `
                        <div class="youtube-video-card" data-video-id="${video.id}">
                            ${this.config.showThumbnails ? `
                                <div class="youtube-thumbnail">
                                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                                    <div class="youtube-play-icon">
                                        <svg viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                            ` : ''}
                            <div class="youtube-video-info">
                                <h3 class="youtube-video-title">${video.title}</h3>
                                <p class="youtube-video-description">${video.description}</p>
                                ${video.views ? `
                                    <div class="youtube-video-meta">
                                        <span>👁️ ${this.formatViews(video.views)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.renderStyles();
    }
    
    renderStyles() {
        if (document.getElementById('youtube-gallery-styles')) {
            return; // Ya están los estilos
        }
        
        const styles = document.createElement('style');
        styles.id = 'youtube-gallery-styles';
        styles.textContent = `
            .youtube-gallery-container {
                padding: 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .youtube-gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .youtube-gallery-header h2 {
                color: #667eea;
                font-size: 2rem;
            }
            
            .youtube-subscribe-btn {
                background: linear-gradient(135deg, #ff0000, #cc0000);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: transform 0.3s;
            }
            
            .youtube-subscribe-btn:hover {
                transform: scale(1.05);
                color: white;
            }
            
            .youtube-gallery-featured {
                margin-bottom: 30px;
            }
            
            .featured-video {
                position: relative;
                width: 100%;
                padding-top: 56.25%;
                background: #000;
                border-radius: 15px;
                overflow: hidden;
            }
            
            .featured-video iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            .featured-controls {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin-top: 15px;
            }
            
            .featured-controls button {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
 😀
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.3s;
                width: 45px;
                height: 45px;
            }
            
            .featured-controls button:hover {
                background: #5568d3;
                transform: scale(1.1);
            }
            
            .featured-counter {
                color: #666;
                font-weight: bold;
            }
            
            .youtube-gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .youtube-video-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .youtube-video-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }
            
            .youtube-thumbnail {
                position: relative;
                width: 100%;
                padding-top: 56.25%;
                background: #000;
                overflow: hidden;
            }
            
            .youtube-thumbnail img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .youtube-play-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 70px;
                height: 70px;
                background: rgba(255,0,0,0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .youtube-play-icon svg {
                width: 30px;
                height: 30px;
            }
            
            .youtube-video-card:hover .youtube-play-icon {
                background: #ff0000;
                transform: translate(-50%, -50%) scale(1.1);
            }
            
            .youtube-video-info {
                padding: 15px;
            }
            
            .youtube-video-title {
                color: #333;
                font-size: 1.1rem;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .youtube-video-description {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 10px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .youtube-video-meta {
                display: flex;
                justify-content: space-between;
                color: #999;
                font-size: 0.85rem;
            }
            
            @media (max-width: 768px) {
                .youtube-gallery-header {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .youtube-gallery-header h2 {
                    font-size: 1.5rem;
                }
                
                .youtube-gallery-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupEventListeners() {
        // Event listeners para las tarjetas de video
        document.querySelectorAll('.youtube-video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.videoId;
                this.playVideo(videoId);
            });
        });
        
        // Controles del featured video
        const prevBtn = document.querySelector('.featured-prev-btn');
        const nextBtn = document.querySelector('.featured-next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousFeaturedVideo());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextFeaturedVideo());
        }
    }
    
    playVideo(videoId) {
        // Si tenemos videos destacados, cambiar al video en el slider
        const featured = this.getFeaturedVideos();
        if (featured.length > 0) {
            const index = featured.findIndex(v => v.id === videoId);
            if (index !== -1) {
                this.currentVideoIndex = index;
                this.updateFeaturedVideo();
            }
        }
        
        // Track en Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'video_play', {
                'video_id': videoId,
                'event_category': 'youtube',
                'event_label': 'gallery'
            });
        }
    }
    
    previousFeaturedVideo() {
        const featured = this.getFeaturedVideos();
        if (featured.length > 0) {
            this.currentVideoIndex = (this.currentVideoIndex - 1 + featured.length) % featured.length;
            this.updateFeaturedVideo();
        }
    }
    
    nextFeaturedVideo() {
        const featured = this.getFeaturedVideos();
        if (featured.length > 0) {
            this.currentVideoIndex = (this.currentVideoIndex + 1) % featured.length;
            this.updateFeaturedVideo();
        }
    }
    
    updateFeaturedVideo() {
        const featured = this.getFeaturedVideos();
        if (featured.length > 0) {
            const video = featured[this.currentVideoIndex];
            const iframe = document.querySelector('.featured-video iframe');
            const counter = document.querySelector('.featured-counter');
            
            if (iframe) {
                iframe.src = `https://www.youtube.com/embed/${video.id}?${this.config.autoPlay ? 'autoplay=1&' : ''}rel=0&modestbranding=1`;
            }
            
            if (counter) {
                counter.textContent = `${this.currentVideoIndex + 1} / ${featured.length}`;
            }
        }
    }
    
    getFeaturedVideos() {
        return this.config.featuredVideos.length > 0 ? 
            this.videos.filter(v => this.config.featuredVideos.includes(v.id)) : 
            this.videos.slice(0, 3);
    }
    
    getVideosByCategory() {
        if (this.currentCategory === 'all') {
            return this.videos;
        }
        return this.videos.filter(v => v.category === this.currentCategory);
    }
    
    formatViews(views) {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    }
}

// Exportar para uso global
window.YouTubeGallery = YouTubeGallery;

console.log('✅ YouTubeGallery component loaded');
