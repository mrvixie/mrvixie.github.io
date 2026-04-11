class APIManager {
    constructor() {
        this.baseURL = 'https://api.mr-vixie.su';
        this.token = Utils.storage.get('admin_token') || null;
        this.isAdmin = false;
    }

    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                mode: 'cors'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async healthCheck() {
        try {
            return await this.request('/api/health');
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    async login(password) {
        try {
            const data = await this.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: 'admin', password })
            });

            if (data.success) {
                this.token = data.token;
                this.isAdmin = true;
                Utils.storage.set('admin_token', this.token);
            }

            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.token = null;
        this.isAdmin = false;
        Utils.storage.remove('admin_token');
    }

    async getPosts(category = null) {
        try {
            const query = category ? `?category=${category}` : '';
            const data = await this.request(`/api/posts${query}`);
            return data.posts || [];
        } catch (error) {
            console.error('Get posts error:', error);
            return [];
        }
    }

    async getPost(id) {
        try {
            const data = await this.request(`/api/posts/${id}`);
            return data;
        } catch (error) {
            console.error('Get post error:', error);
            return null;
        }
    }

    async createPost(postData) {
        try {
            const data = await this.request('/api/admin/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
            return data;
        } catch (error) {
            console.error('Create post error:', error);
            throw error;
        }
    }

    async updatePost(id, postData) {
        try {
            const data = await this.request(`/api/admin/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
            return data;
        } catch (error) {
            console.error('Update post error:', error);
            throw error;
        }
    }

    async deletePost(id) {
        try {
            const data = await this.request(`/api/admin/posts/${id}`, {
                method: 'DELETE'
            });
            return data;
        } catch (error) {
            console.error('Delete post error:', error);
            throw error;
        }
    }

    async getOrders() {
        try {
            const data = await this.request('/api/admin/orders');
            return data.orders || [];
        } catch (error) {
            console.error('Get orders error:', error);
            return [];
        }
    }

    async createOrder(orderData) {
        try {
            const data = await this.request('/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return data;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const data = await this.request(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            return data;
        } catch (error) {
            console.error('Update order error:', error);
            throw error;
        }
    }

    async getShopItems() {
        try {
            const data = await this.request('/api/shop');
            return data.items || [];
        } catch (error) {
            console.error('Get shop items error:', error);
            return [];
        }
    }

    async createShopItem(itemData) {
        try {
            const data = await this.request('/api/admin/shop', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
            return data;
        } catch (error) {
            console.error('Create shop item error:', error);
            throw error;
        }
    }

    async deleteShopItem(id) {
        try {
            const data = await this.request(`/api/admin/shop/${id}`, {
                method: 'DELETE'
            });
            return data;
        } catch (error) {
            console.error('Delete shop item error:', error);
            throw error;
        }
    }

    async getGallery() {
        try {
            const data = await this.request('/api/gallery');
            return data.items || [];
        } catch (error) {
            console.error('Get gallery error:', error);
            return [];
        }
    }

    async addGalleryItem(itemData) {
        try {
            const data = await this.request('/api/admin/gallery', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
            return data;
        } catch (error) {
            console.error('Add gallery item error:', error);
            throw error;
        }
    }

    async deleteGalleryItem(id) {
        try {
            const data = await this.request(`/api/admin/gallery/${id}`, {
                method: 'DELETE'
            });
            return data;
        } catch (error) {
            console.error('Delete gallery item error:', error);
            throw error;
        }
    }

    async getSettings() {
        try {
            const data = await this.request('/api/admin/settings');
            return data;
        } catch (error) {
            console.error('Get settings error:', error);
            return {};
        }
    }

    async saveSettings(settings) {
        try {
            const data = await this.request('/api/admin/settings', {
                method: 'POST',
                body: JSON.stringify(settings)
            });
            return data;
        } catch (error) {
            console.error('Save settings error:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const data = await this.request('/api/admin/stats');
            return data;
        } catch (error) {
            console.error('Get stats error:', error);
            return {};
        }
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseURL}/api/upload`, {
                method: 'POST',
                headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
                body: formData
            });

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    checkAuth() {
        if (this.token) {
            this.isAdmin = true;
            return true;
        }
        return false;
    }
}

const api = new APIManager();
window.api = api;
