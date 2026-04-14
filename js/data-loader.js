const DataLoader = {
    data: null,
    apiUrl: 'https://api.mr-vixie.su/api/content',
    streamUrl: 'https://api.mr-vixie.su/api/stream',
    refreshInterval: 300000,
    lastLoad: 0,
    listeners: [],
    eventSource: null,
    
    async load() {
        try {
            const response = await fetch(this.apiUrl + '?t=' + Date.now());
            if (!response.ok) throw new Error('Failed to load data');
            this.data = await response.json();
            this.lastLoad = Date.now();
            this.notify();
            return this.data;
        } catch (error) {
            console.error('Data load error:', error);
            return null;
        }
    },
    
    connectStream() {
        if (this.eventSource) return;
        
        this.eventSource = new EventSource(this.streamUrl);
        
        this.eventSource.onopen = () => {
            console.log('SSE connected');
        };
        
        this.eventSource.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'contentUpdated') {
                    console.log('Content updated, reloading...');
                    await this.load();
                }
            } catch (e) {}
        };
        
        this.eventSource.onerror = () => {
            console.log('SSE error, reconnecting...');
            this.eventSource.close();
            this.eventSource = null;
            setTimeout(() => this.connectStream(), 5000);
        };
    },
    
    async autoRefresh() {
        await this.load();
        this.connectStream();
        setInterval(async () => {
            await this.load();
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
        this.listeners.forEach(cb => cb(this.data));
    },
    
    getStats() { return this.get('stats', {});},
    getProfile() { return this.get('profile', {});},
    getServices() { return this.get('services', []);},
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
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
};

window.DataLoader = DataLoader;


