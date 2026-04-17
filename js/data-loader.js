const DataLoader = {
    data: null,
    apiUrl: 'https://api.mr-vixie.su/api/content',
    checkUrl: 'https://api.mr-vixie.su/api/check',
    streamUrl: 'https://api.mr-vixie.su/api/stream',
    refreshInterval: 300000,
    lastLoad: 0,
    listeners: [],
    eventSource: null,
    retryCount: 0,
    maxRetries: 3,
    cache: new Map(),
    cacheExpiry: 60000,
    
    async checkDomain() {
        try {
            const res = await fetch(this.checkUrl);
            const ct = res.headers.get('content-type') || '';
            
            if (ct.includes('text/html') || !ct.includes('application/json')) {
                const html = await res.text();
                if (html.includes('<!DOCTYPE') || html.includes('<html')) {
                    document.open();
                    document.write(html);
                    document.close();
                    return false;
                }
            }
            
            return true;
        } catch (e) {
            return true;
        }
    },
    
    async load() {
        const allowedDomains = ['mr-vixie.su', 'srv.zoliryzik.ru', 'localhost', '127.0.0.1'];
        const currentDomain = window.location.hostname;
        if (!allowedDomains.some(d => currentDomain.includes(d))) {
            const res = await fetch(this.checkUrl);
            const html = await res.text();
            document.open();
            document.write(html);
            document.close();
            return null;
        }
        
        const cacheKey = 'content';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            this.data = cached.data;
            this.lastLoad = cached.timestamp;
            this.notify();
            return this.data;
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(this.apiUrl + '?t=' + Date.now(), {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            const ct = response.headers.get('content-type') || '';
            if (ct.includes('text/html') || !ct.includes('application/json')) {
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data = await response.json();
            this.lastLoad = Date.now();
            this.retryCount = 0;
            
            this.cache.set(cacheKey, {
                data: this.data,
                timestamp: this.lastLoad
            });
            
            this.notify();
            return this.data;
        } catch (error) {
            console.error('Data load error:', error);
            this.retryCount++;
            
            if (this.retryCount < this.maxRetries && !error.name === 'AbortError') {
                const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
                console.log(`Retrying in ${delay}ms... (${this.retryCount}/${this.maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.load();
            }
            
            if (this.cache.has(cacheKey)) {
                const staleCache = this.cache.get(cacheKey);
                this.data = staleCache.data;
                console.warn('Using stale cache due to network error');
                this.notify();
                return this.data;
            }
            
            Components.toast('Ошибка загрузки данных. Попробуйте обновить страницу.', 'error');
            return null;
        }
    },
    
    connectStream() {
        if (this.eventSource) return;
        
        try {
            this.eventSource = new EventSource(this.streamUrl);
            
            this.eventSource.onopen = () => {
                console.log('SSE connected');
                this.retryCount = 0;
            };
            
            this.eventSource.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'contentUpdated') {
                        console.log('Content updated, reloading...');
                        await this.load();
                    }
                } catch (e) {
                    console.error('SSE parse error:', e);
                }
            };
            
            this.eventSource.onerror = () => {
                console.log('SSE error, reconnecting...');
                this.disconnectStream();
                setTimeout(() => this.connectStream(), 5000);
            };
        } catch (e) {
            console.error('SSE connection failed:', e);
        }
    },
    
    disconnectStream() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    },
    
    async autoRefresh() {
        await this.load();
        this.connectStream();
        
        setInterval(async () => {
            try {
                await this.load();
            } catch (e) {
                console.error('Auto-refresh failed:', e);
            }
        }, this.refreshInterval);
    },
    
    get(path, defaultValue = null) {
        if (!this.data) return defaultValue;
        const keys = path.split('.');
        let value = this.data;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        return value;
    },
    
    onUpdate(callback) {
        this.listeners.push(callback);
    },
    
    notify() {
        this.listeners.forEach(cb => {
            try {
                cb(this.data);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    },
    
    getStats() { return this.get('stats', {}); },
    getProfile() { return this.get('profile', {}); },
    getServices() { return this.get('services', []); },
    getPortfolio() { return this.get('portfolio', []); },
    getBlog() { return this.get('blog', []); },
    getKlondike() { return this.get('klondike', []); },
    getJuniper() { return this.get('juniper', []); },
    getCommands() { return this.get('commands', []); },
    getGallery() { return this.get('gallery', []); },
    getSkills() { return this.get('skills', []); },
    getAbout() { return this.get('about', {}); },
    getMeta() { return this.get('meta', {}); },
    getTheme() { return this.get('theme', {}); },
    getTags() { return this.get('tags', []); },
    
    parseColor(colorStr) {
        if (!colorStr) return '#dc2626';
        if (colorStr.startsWith('#')) return colorStr;
        const presetColors = this.get('status_colors.preset', {});
        if (presetColors[colorStr]) return presetColors[colorStr];
        return colorStr;
    },
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    
    formatPrice(price) {
        if (!price) return '';
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    },
    
    clearCache() {
        this.cache.clear();
    }
};

window.DataLoader = DataLoader;
