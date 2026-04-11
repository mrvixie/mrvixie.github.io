const SecureAuth = {
    _hash: null,
    _password: null,
    
    async init() {
        await ConfigLoader.init();
        this._hash = this._generateHash();
        this._password = ConfigLoader.getAdminPassword();
        return this;
    },
    
    _generateHash() {
        const str = navigator.userAgent + screen.width + screen.height + new Date().getFullYear();
        let hash = 0;
        for(let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },
    
    verify(input) {
        if(input.length !== 39) return false;
        
        const parts = this._password.split('---');
        if(parts.length === 2) {
            const base = parts[0];
            const check = parts[1];
            const expected = this._decrypt(check, this._hash);
            return input === base + expected;
        }
        
        return input === this._password;
    },
    
    _decrypt(str, key) {
        let result = '';
        for(let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    },
    
    getValidPassword() {
        const parts = this._password.split('---');
        if(parts.length === 2) {
            const base = parts[0];
            const check = parts[1];
            const expected = this._decrypt(check, this._hash);
            return base + expected;
        }
        return this._password;
    },
    
    login(password) {
        if(this.verify(password)) {
            localStorage.setItem('_tk', btoa(this._hash + ':' + Date.now()));
            return true;
        }
        return false;
    },
    
    isLoggedIn() {
        const tk = localStorage.getItem('_tk');
        if(!tk) return false;
        
        try {
            const [hash, time] = atob(tk).split(':');
            const age = Date.now() - parseInt(time);
            return hash === this._hash && age < 7 * 24 * 60 * 60 * 1000;
        } catch(e) {
            return false;
        }
    },
    
    logout() {
        localStorage.removeItem('_tk');
    }
};

window.SecureAuth = SecureAuth;
