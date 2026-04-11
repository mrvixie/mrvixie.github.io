const _0x = {
    k: 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLw==',
    e: atob('aHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS8='),
    d: atob('L2Fzc2V0cy9zZWNyZXRzLmpzb24='),
    r: function(s) { return s.split('').reverse().join(''); },
    x: function(s, k) { 
        let r = ''; 
        for(let i = 0; i < s.length; i++) { 
            r += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length)); 
        } 
        return r; 
    },
    g: function() {
        const p1 = atob(this.k);
        const p2 = atob(this.e);
        const p3 = this.r(this.d);
        return p1 + p2 + p3;
    }
};

const SecretConfig = {
    apiUrl: null,
    token: null,
    init() {
        try {
            const encoded = localStorage.getItem('_cfg');
            if (encoded) {
                const decoded = this._decode(encoded);
                const cfg = JSON.parse(decoded);
                this.apiUrl = cfg.api || _0x.g();
                this.token = cfg.token || null;
            } else {
                this.apiUrl = _0x.g();
            }
        } catch(e) {
            this.apiUrl = _0x.g();
        }
        return this;
    },
    _decode(s) {
        try {
            const arr = s.split('|');
            let result = '';
            for(let i = 0; i < arr.length; i++) {
                let part = atob(arr[i]);
                if(i % 2 === 1) part = _0x.r(part);
                if(i % 3 === 0) part = _0x.x(part, 'vx2k');
                result += part;
            }
            return result;
        } catch(e) {
            return '{}';
        }
    },
    encode(obj) {
        const str = JSON.stringify(obj);
        const parts = [];
        for(let i = 0; i < str.length; i += 3) {
            let chunk = str.substring(i, i + 3);
            if(i % 3 === 0) chunk = _0x.x(chunk, 'vx2k');
            if(i % 2 === 1) chunk = _0x.r(chunk);
            parts.push(btoa(chunk));
        }
        return parts.join('|');
    }
};

SecretConfig.init();

window.SecretConfig = SecretConfig;
window._0x = _0x;
