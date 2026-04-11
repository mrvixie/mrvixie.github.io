const ConfigLoader = {
    secrets: null,
    rawUrl: null,
    
    async init() {
        const baseRepo = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets';
        this.rawUrl = baseRepo + '/secrets.json';
        
        try {
            const response = await fetch(this.rawUrl);
            if (response.ok) {
                this.secrets = await response.json();
                return this.secrets;
            }
        } catch(e) {
            console.log('Using default config');
        }
        
        this.secrets = this._getDefaults();
        return this.secrets;
    },
    
    _getDefaults() {
        return {
            admin_password: this._genPassword(),
            api_endpoint: SecretConfig.apiUrl,
            features: {
                maintenance_mode: false,
                registration_enabled: true,
                shop_enabled: true
            }
        };
    },
    
    _genPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let pass = '';
        for(let i = 0; i < 39; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    },
    
    getAdminPassword() {
        return this.secrets?.admin_password || 'DEFAULT_PASS_39_CHARS_HERE_________0';
    },
    
    getApiEndpoint() {
        return this.secrets?.api_endpoint || SecretConfig.apiUrl;
    }
};

window.ConfigLoader = ConfigLoader;
