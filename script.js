// ==================== КОНФИГУРАЦИЯ ====================
const API_BASE_URL = 'https://api.mr-vixie.su'; // Твой API сервер 217.154.212.188

// ==================== API МЕНЕДЖЕР ====================
class APIManager {
    constructor() {
        this.token = localStorage.getItem('admin_token') || null;
    }
console.log(this.token);
    async request(endpoint, options = {}) {
        const url = API_BASE_URL + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Добавляем токен для админ-запросов
        if (this.token && endpoint.includes('/admin/')) {
            headers['Authorization'] = 'Bearer ' + this.token;
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

    // Аутентификация через GET запрос
    async authGET(password) {
        try {
            const data = await this.request(`/api/admin/auth?pass=${encodeURIComponent(password)}`);
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Аутентификация через POST запрос
    async authPOST(password) {
        try {
            const data = await this.request('/api/admin/auth', {
                method: 'POST',
                body: JSON.stringify({ password })
            });
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Получение постов
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

    // Добавление поста (админ)
    async addPost(postData) {
        try {
            const data = await this.request('/api/admin/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
            return data;
        } catch (error) {
            console.error('Add post error:', error);
            throw error;
        }
    }

    // Удаление поста (админ)
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

    // Создание заказа
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

    // Получение заказов (админ)
    async getOrders() {
        try {
            const data = await this.request('/api/admin/orders');
            return data.orders || [];
        } catch (error) {
            console.error('Get orders error:', error);
            return [];
        }
    }

    // Получение настроек (админ)
    async getSettings() {
        try {
            const data = await this.request('/api/admin/settings');
            return data;
        } catch (error) {
            console.error('Get settings error:', error);
            return {};
        }
    }

    // Сохранение настроек (админ)
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

    // Получение статистики (админ)
    async getStats() {
        try {
            const data = await this.request('/api/admin/stats');
            return data;
        } catch (error) {
            console.error('Get stats error:', error);
            return {};
        }
    }

    // Проверка здоровья API
    async healthCheck() {
        try {
            const data = await this.request('/api/health');
            return data;
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let apiManager = new APIManager();
let adminAccessGranted = false;

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--primary-red)'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Скопировано в буфер!', 'success');
    });
}

function downloadSoftware(filename) {
    showNotification(`Начинается загрузка: ${filename}`, 'info');
}

// ==================== ФУНКЦИИ РЕНДЕРИНГА ====================
async function renderPortfolio() {
    const container = document.getElementById('portfolio-grid');
    if (!container) return;

    try {
        const portfolio = await apiManager.getPosts('portfolio');
        
        if (portfolio.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">Портфолио пока пусто</p>';
            return;
        }

        container.innerHTML = portfolio.map(post => `
            <div class="card">
                <div class="card-image">
                    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="200" fill="#222222"/>
                        <text x="50%" y="50%" text-anchor="middle" fill="#dc2626" font-family="Unbounded" font-size="24">${post.title}</text>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                    <div class="card-meta">
                        <span class="card-date">${post.date}</span>
                        <button class="card-button" onclick="viewProject(${post.id})">
                            Подробнее
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
        container.innerHTML = '<p style="color: var(--danger); text-align: center;">Ошибка загрузки</p>';
    }
}

async function renderDesign() {
    const container = document.getElementById('design-grid');
    if (!container) return;

    try {
        const design = await apiManager.getPosts('design');
        
        if (design.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">Дизайнов пока нет</p>';
            return;
        }

        container.innerHTML = design.map(post => `
            <div class="card">
                <div class="card-image">
                    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="200" fill="#2d2d2d"/>
                        <circle cx="100" cy="100" r="60" fill="#dc2626" opacity="0.3"/>
                        <circle cx="200" cy="100" r="40" fill="#ef4444" opacity="0.3"/>
                        <circle cx="300" cy="100" r="50" fill="#b91c1c" opacity="0.3"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                    <div class="card-meta">
                        <span class="card-date">${post.date}</span>
                        <button class="card-button" onclick="viewProject(${post.id})">
                            Смотреть
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки дизайнов:', error);
        container.innerHTML = '<p style="color: var(--danger); text-align: center;">Ошибка загрузки</p>';
    }
}

async function renderWindows() {
    const container = document.getElementById('windows-grid');
    if (!container) return;

    try {
        const windows = await apiManager.getPosts('windows');
        
        if (windows.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">Софтов пока нет</p>';
            return;
        }

        container.innerHTML = windows.map(post => `
            <div class="card">
                <div class="card-image">
                    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="200" fill="#0078d7" opacity="0.2"/>
                        <path d="M100,100 L150,70 L250,130 L300,100" stroke="#0078d7" stroke-width="4" fill="none"/>
                        <circle cx="100" cy="100" r="15" fill="#0078d7"/>
                        <circle cx="300" cy="100" r="15" fill="#0078d7"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                    <div class="card-meta">
                        <span class="card-date">${post.date}</span>
                        <button class="card-button" onclick="downloadSoftware('${post.title}')">
                            ${post.price === 0 ? 'Скачать бесплатно' : `Купить за ${post.price} ₽`}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки софтов:', error);
        container.innerHTML = '<p style="color: var(--danger); text-align: center;">Ошибка загрузки</p>';
    }
}

async function renderJuniper() {
    const container = document.getElementById('juniper-grid');
    if (!container) return;

    try {
        const juniper = await apiManager.getPosts('juniper');
        
        if (juniper.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">Juniper материалы пока не добавлены</p>';
            return;
        }

        container.innerHTML = juniper.map(post => `
            <div class="card">
                ${post.content && post.type === 'video' ? `
                    <div class="video-wrapper">
                        <iframe src="${post.content}" title="${post.title}" allowfullscreen></iframe>
                    </div>
                ` : `
                    <div class="card-image">
                        <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="200" fill="#1a1a1a"/>
                            <circle cx="200" cy="100" r="60" fill="#f97316" opacity="0.3"/>
                            <text x="50%" y="50%" text-anchor="middle" fill="#f97316" font-family="Unbounded" font-size="24">${post.title}</text>
                        </svg>
                    </div>
                `}
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                    ${post.command ? `
                        <div class="command-box">
                            <code>${post.command}</code>
                            <button class="copy-button" onclick="copyToClipboard('${post.command}')">Копировать</button>
                        </div>
                    ` : ''}
                    <div class="card-meta">
                        <span class="card-date">${post.date}</span>
                        ${post.content ? `
                            <button class="card-button" onclick="${post.type === 'video' ? `window.open('${post.content}', '_blank')` : `viewProject(${post.id})`}">
                                ${post.type === 'video' ? 'Смотреть видео' : 'Подробнее'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки Juniper:', error);
        container.innerHTML = '<p style="color: var(--danger); text-align: center;">Ошибка загрузки</p>';
    }
}

async function renderPartners() {
    const container = document.getElementById('partners-grid');
    if (!container) return;

    try {
        const partners = await apiManager.getPosts('partners');
        
        if (partners.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">Партнёры пока не добавлены</p>';
            return;
        }

        container.innerHTML = partners.map(post => `
            <div class="card">
                <div class="card-image">
                    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="200" fill="#1a1a1a"/>
                        <circle cx="200" cy="100" r="60" fill="#dc2626" opacity="0.1"/>
                        <text x="50%" y="50%" text-anchor="middle" fill="#e5e5e5" font-family="Unbounded" font-size="20">${post.title}</text>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                    <div class="card-meta">
                        ${post.content ? `
                            <button class="card-button" onclick="window.open('${post.content}', '_blank')">
                                Присоединиться
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки партнёров:', error);
        container.innerHTML = '<p style="color: var(--danger); text-align: center;">Ошибка загрузки</p>';
    }
}

// ==================== ФУНКЦИЯ ПРОВЕРКИ ПАРОЛЯ ====================
async function checkAdminPassword() {
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput.value;
    const errorElement = document.getElementById('admin-login-error');
    
    // Сброс ошибки
    errorElement.classList.remove('show');
    errorElement.textContent = '';
    
    // Проверка длины
    if (password.length !== 39) {
        errorElement.textContent = `Пароль должен содержать ровно 39 символов (сейчас: ${password.length})`;
        errorElement.classList.add('show');
        return;
    }
    
    try {
        // Пробуем оба метода аутентификации
        let result;
        
        // Сначала пробуем POST метод (основной)
        result = await apiManager.authPOST(password);
        
        if (!result.success) {
            // Пробуем GET метод как запасной вариант
            result = await apiManager.authGET(password);
        }
        
        if (result.success) {
            // Успешная авторизация
            adminAccessGranted = true;
            apiManager.token = result.token || 'admin_token_12345';
            localStorage.setItem('admin_token', apiManager.token);
            
            // Анимация успеха
            passwordInput.style.borderColor = 'var(--success)';
            passwordInput.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
            
            setTimeout(() => {
                hideAdminLogin();
                showAdminPanel();
                showNotification('✓ Доступ к админ-панели разрешен!', 'success');
            }, 500);
        } else {
            // Ошибка аутентификации
            errorElement.textContent = result.error || 'Неверный пароль';
            errorElement.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();
            
            // Анимация ошибки
            passwordInput.style.borderColor = 'var(--danger)';
            passwordInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
            passwordInput.style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        }
    } catch (error) {
        console.error('Auth error:', error);
        errorElement.textContent = 'Ошибка соединения с сервером';
        errorElement.classList.add('show');
    }
}

// ==================== ФУНКЦИИ ДЛЯ АДМИН-ПАНЕЛИ ====================
function showAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.getElementById('admin-password').focus();
}

function hideAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
}

function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    const adminNavButton = document.getElementById('admin-nav-button');
    
    if (!adminPanel || !adminNavButton) return;
    
    adminPanel.classList.add('active');
    adminNavButton.style.display = 'flex';
    adminNavButton.classList.add('active');
    
    // Анимация появления
    adminPanel.style.opacity = '0';
    adminPanel.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        adminPanel.style.transition = 'all 0.5s ease';
        adminPanel.style.opacity = '1';
        adminPanel.style.transform = 'translateY(0)';
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Загружаем контент админ-панели
    showAdminTab('posts');
}

function toggleAdminPanel() {
    if (!adminAccessGranted) {
        showAdminLogin();
        return;
    }
    
    const adminPanel = document.getElementById('admin-panel');
    const adminNavButton = document.getElementById('admin-nav-button');
    
    if (adminPanel.classList.contains('active')) {
        adminPanel.classList.remove('active');
        adminNavButton.classList.remove('active');
        showSection('home');
    } else {
        showSection('admin-panel');
        adminPanel.classList.add('active');
        adminNavButton.classList.add('active');
    }
}

async function showAdminTab(tabId) {
    if (!adminAccessGranted) {
        showAdminLogin();
        return;
    }
    
    // Обновляем активные табы
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.admin-tab[onclick*="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const content = document.getElementById('admin-content');
    if (!content) return;
    
    let html = '';
    
    try {
        switch(tabId) {
            case 'posts':
                const posts = await apiManager.getPosts();
                html = `
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Управление постами (${posts.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${posts.map(post => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-dark); border-radius: 8px; border: 1px solid var(--border-color);">
                                <div>
                                    <h4 style="color: var(--text-light); margin-bottom: 0.25rem;">${post.title}</h4>
                                    <p style="color: var(--text-gray); font-size: 0.9rem;">${post.category} • ${post.date} • ID: ${post.id}</p>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="card-button" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--warning);" onclick="editPost(${post.id})">Изменить</button>
                                    <button class="card-button" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--danger);" onclick="deletePost(${post.id})">Удалить</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'add-post':
                html = `
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Добавить новый пост</h3>
                    <form id="add-post-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Название</label>
                            <input type="text" class="form-input" id="post-title" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Описание</label>
                            <textarea class="form-textarea" id="post-description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Категория</label>
                            <select class="form-input" id="post-category" required>
                                <option value="">Выберите категорию</option>
                                <option value="portfolio">Портфолио</option>
                                <option value="design">Дизайн</option>
                                <option value="windows">Для Windows</option>
                                <option value="juniper">Juniper</option>
                                <option value="partners">Партнёры</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Тип контента</label>
                            <select class="form-input" id="post-type">
                                <option value="image">Изображение</option>
                                <option value="video">Видео</option>
                                <option value="link">Ссылка</option>
                                <option value="software">Софт</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL контента (для видео/ссылок)</label>
                            <input type="text" class="form-input" id="post-content" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Команда (для Juniper)</label>
                            <input type="text" class="form-input" id="post-command" placeholder="!mod setup">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Цена (для софта)</label>
                            <input type="number" class="form-input" id="post-price" value="0" min="0">
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="card-button" style="background: var(--text-gray);" onclick="resetPostForm()">Сбросить</button>
                            <button type="submit" class="card-button">Добавить пост</button>
                        </div>
                    </form>
                `;
                break;
                
            case 'orders':
                const orders = await apiManager.getOrders();
                html = `
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Заказы от клиентов (${orders.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${orders.length > 0 ? orders.map(order => `
                            <div style="padding: 1rem; background: var(--bg-dark); border-radius: 8px; border: 1px solid var(--border-color); border-left: 4px solid ${order.status === 'new' ? 'var(--warning)' : order.status === 'inProgress' ? 'var(--primary-red)' : 'var(--success)'};">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <h4 style="color: var(--text-light); margin-bottom: 0.5rem;">${order.service}</h4>
                                        <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 0.5rem;"><strong>Клиент:</strong> ${order.name}</p>
                                        <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 0.5rem;"><strong>Контакты:</strong> ${order.contact}</p>
                                        <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 0.5rem;">${order.description}</p>
                                        <p style="color: var(--text-gray); font-size: 0.8rem;">${new Date(order.date).toLocaleString('ru-RU')}</p>
                                    </div>
                                    <div style="margin-left: 1rem;">
                                        <span style="padding: 0.25rem 0.75rem; background: ${order.status === 'new' ? 'var(--warning)' : order.status === 'inProgress' ? 'var(--primary-red)' : 'var(--success)'}; color: white; border-radius: 4px; font-size: 0.8rem;">
                                            ${order.status === 'new' ? 'Новый' : order.status === 'inProgress' ? 'В работе' : 'Завершён'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p style="color: var(--text-gray); text-align: center;">Заказов пока нет</p>'}
                    </div>
                `;
                break;
                
            case 'settings':
                const settings = await apiManager.getSettings();
                html = `
                    <h3 style="margin-bottom: 1rem; color: var(--text-light);">Настройки сайта</h3>
                    <form id="settings-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Название сайта</label>
                            <input type="text" class="form-input" id="site-name" value="${settings.siteName || 'DVX Studio'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Описание</label>
                            <textarea class="form-textarea" id="site-description">${settings.siteDescription || 'Креативные решения для ваших проектов'}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Discord ссылка</label>
                            <input type="text" class="form-input" id="discord-link" value="${settings.discordLink || 'https://discord.gg/example'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">YouTube канал</label>
                            <input type="text" class="form-input" id="youtube-link" value="${settings.youtubeLink || 'https://youtube.com/@zoliryzik'}">
                        </div>
                        <div style="display: flex; justify-content: flex-end;">
                            <button type="submit" class="card-button">Сохранить настройки</button>
                        </div>
                    </form>
                `;
                break;
        }
    } catch (error) {
        html = `
            <div style="padding: 2rem; text-align: center; color: var(--danger);">
                <h3>Ошибка загрузки данных</h3>
                <p>${error.message}</p>
                <button class="card-button" onclick="showAdminTab('${tabId}')">Повторить</button>
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    // Инициализация форм
    if (tabId === 'add-post') {
        const form = document.getElementById('add-post-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await addNewPost();
            };
        }
    }
    
    if (tabId === 'settings') {
        const form = document.getElementById('settings-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await saveSettings();
            };
        }
    }
}

// ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С ПОСТАМИ ====================
async function addNewPost() {
    const postData = {
        title: document.getElementById('post-title').value,
        description: document.getElementById('post-description').value,
        category: document.getElementById('post-category').value,
        type: document.getElementById('post-type').value,
        content: document.getElementById('post-content').value || '',
        command: document.getElementById('post-command').value || '',
        price: parseInt(document.getElementById('post-price').value) || 0,
        date: new Date().toISOString().split('T')[0]
    };
    
    try {
        await apiManager.addPost(postData);
        showNotification('Пост успешно добавлен!', 'success');
        resetPostForm();
        showAdminTab('posts');
    } catch (error) {
        showNotification('Ошибка добавления поста: ' + error.message, 'error');
    }
}

function resetPostForm() {
    const form = document.getElementById('add-post-form');
    if (form) form.reset();
}

async function deletePost(id) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    try {
        await apiManager.deletePost(id);
        showNotification('Пост удалён!', 'success');
        showAdminTab('posts');
    } catch (error) {
        showNotification('Ошибка удаления поста: ' + error.message, 'error');
    }
}

function editPost(id) {
    // В демо-версии просто показываем сообщение
    showNotification('Функция редактирования в разработке', 'info');
}

async function saveSettings() {
    const settings = {
        siteName: document.getElementById('site-name').value,
        siteDescription: document.getElementById('site-description').value,
        discordLink: document.getElementById('discord-link').value,
        youtubeLink: document.getElementById('youtube-link').value
    };
    
    try {
        await apiManager.saveSettings(settings);
        showNotification('Настройки сохранены!', 'success');
    } catch (error) {
        showNotification('Ошибка сохранения настроек: ' + error.message, 'error');
    }
}

// ==================== ФУНКЦИИ ДЛЯ ЗАКАЗОВ ====================
function openOrderModal(service) {
    document.getElementById('order-service').value = service;
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
    document.getElementById('order-form').reset();
}

async function submitOrder(event) {
    event.preventDefault();
    
    const orderData = {
        service: document.getElementById('order-service').value,
        name: document.getElementById('order-name').value,
        contact: document.getElementById('order-contact').value,
        description: document.getElementById('order-description').value
    };
    
    try {
        await apiManager.createOrder(orderData);
        showNotification('Заказ отправлен! Я свяжусь с вами в течение 24 часов.', 'success');
        closeOrderModal();
    } catch (error) {
        showNotification('Ошибка отправки заказа: ' + error.message, 'error');
    }
}

// ==================== ФУНКЦИИ НАВИГАЦИИ ====================
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Показать выбранную секцию
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Обновить активное меню
    document.querySelectorAll('.header-nav--element').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.leftmenu-categories--element').forEach(el => {
        el.classList.remove('active');
    });
    
    // Обновить активную кнопку в хедере
    const activeNav = Array.from(document.querySelectorAll('.header-nav--element')).find(el => {
        const linkText = el.querySelector('a')?.textContent?.toLowerCase() || '';
        return linkText.includes(sectionId.toLowerCase()) ||
            (sectionId === 'home' && linkText === 'главная') ||
            (sectionId === 'windows' && linkText === 'софты') ||
            (sectionId === 'admin-panel' && linkText === 'админ');
    });
    
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Обновить активную категорию в левом меню
    const activeCategory = Array.from(document.querySelectorAll('.leftmenu-categories--element')).find(el => {
        const linkText = el.querySelector('a')?.textContent?.toLowerCase() || '';
        return linkText.includes(sectionId.toLowerCase());
    });
    
    if (activeCategory) {
        activeCategory.classList.add('active');
    }
    
    // Скрыть админ-панель если она открыта и мы переходим в другую секцию
    if (sectionId !== 'admin-panel' && adminAccessGranted) {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('active');
        }
        
        const adminNavButton = document.getElementById('admin-nav-button');
        if (adminNavButton) {
            adminNavButton.classList.remove('active');
        }
    }
    
    // Загрузить данные для секции
    loadSectionData(sectionId);
}

async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'portfolio':
            await renderPortfolio();
            break;
        case 'design':
            await renderDesign();
            break;
        case 'windows':
            await renderWindows();
            break;
        case 'juniper':
            await renderJuniper();
            break;
        case 'partners':
            await renderPartners();
            break;
        case 'home':
            // Загружаем последние проекты на главной
            try {
                const posts = await apiManager.getPosts();
                const recentPosts = posts.slice(0, 3);
                // Можно обновить главную страницу если нужно
            } catch (error) {
                console.error('Ошибка загрузки главной:', error);
            }
            break;
    }
}

// ==================== ФУНКЦИИ ДЛЯ КНОПКИ ВСТАВКИ ====================
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const passwordInput = document.getElementById('admin-password');
        
        // Устанавливаем значение
        const clippedText = text.length > 39 ? text.substring(0, 39) : text;
        passwordInput.value = clippedText;
        
        // Триггерим событие input
        const inputEvent = new Event('input', { bubbles: true });
        passwordInput.dispatchEvent(inputEvent);
        
        showNotification(`Вставлено ${clippedText.length} символов`, 'success');
    } catch (error) {
        showNotification('Не удалось получить доступ к буферу обмена', 'error');
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DVX Studio загружен');
    
    // Проверяем доступность API
    try {
        const health = await apiManager.healthCheck();
        console.log('API Status:', health.status);
        
        if (health.status !== 'ok') {
            showNotification('API сервер недоступен', 'warning');
        }
    } catch (error) {
        console.error('API недоступен:', error);
        showNotification('Не удалось подключиться к серверу', 'error');
    }
    
    // Инициализация формы заказа
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
    
    // Закрытие модальных окон
    document.getElementById('order-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeOrderModal();
    });
    
    document.getElementById('admin-login-modal')?.addEventListener('click', function(e) {
        if (e.target === this) hideAdminLogin();
    });
    
    // Горячие клавиши для админки
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            showAdminLogin();
        }
    });
    
    // Проверяем есть ли токен в localStorage
    const token = localStorage.getItem('admin_token');
    if (token) {
        apiManager.token = token;
        adminAccessGranted = true;
        document.getElementById('admin-nav-button').style.display = 'flex';
    }
    
    // Загружаем начальные данные для главной страницы
    await loadSectionData('home');
});

// ==================== УТИЛИТЫ ====================
function viewProject(id) {
    // В демо-версии просто показываем сообщение
    showNotification('Просмотр проекта (в разработке)', 'info');
}

// Глобальные функции для HTML
window.showSection = showSection;
window.toggleAdminPanel = toggleAdminPanel;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.copyToClipboard = copyToClipboard;
window.downloadSoftware = downloadSoftware;
window.viewProject = viewProject;
window.pasteFromClipboard = pasteFromClipboard;
window.checkAdminPassword = checkAdminPassword;
window.showAdminTab = showAdminTab;
window.resetPostForm = resetPostForm;
window.deletePost = deletePost;

window.editPost = editPost;

