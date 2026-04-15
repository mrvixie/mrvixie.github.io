class App {
    constructor() {
        this.currentSection = 'home';
        this.navItems = [];
        this.cart = [];
        this.isLoading = true;
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.selectedCreator = null;
    }

    async init() {
        this.initHeader();
        this.initTheme();
        this.initSwipe();
        this.initSearch();
        this.initForms();
        this.initSnake();
        this.initFloatingObjects();
        
        const data = await DataLoader.load();
        if (data) {
            this.renderAll(data);
            DataLoader.onUpdate((newData) => this.renderAll(newData));
        }
        
        this.hideLoader();
    }

    initFloatingObjects() {
        const container = document.getElementById('floating-objects');
        if (!container) return;

        const colors = [
            'rgba(220, 38, 38, 0.03)',
            'rgba(185, 28, 28, 0.03)',
            'rgba(239, 68, 68, 0.03)'
        ];

        for (let i = 0; i < 8; i++) {
            const obj = document.createElement('div');
            obj.className = 'floating-object';
            
            const size = 30 + Math.random() * 60;
            const x = Math.random() * 90;
            const y = Math.random() * 80 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = 30 + Math.random() * 30;
            const delay = Math.random() * -40;
            const animations = ['float1', 'float2', 'float3'];
            const anim = animations[Math.floor(Math.random() * animations.length)];

            obj.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                background: ${color};
                animation: ${anim} ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
            `;

            container.appendChild(obj);
        }
    }

    initGlassBlur() {
        const container = document.getElementById('glass-blur-container');
        if (!container) return;

        let updateTimeout;
        const updateBlur = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                container.innerHTML = '';
                const glassPanels = document.querySelectorAll('.glass-panel, .glass-card, .glass-strong, .sidebar, .main-header');
                glassPanels.forEach(panel => {
                    if (panel.offsetParent === null) return;
                    const rect = panel.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;
                    const blur = document.createElement('div');
                    blur.className = 'glass-blur';
                    blur.style.cssText = `
                        left: ${rect.left - 20}px;
                        top: ${rect.top - 20}px;
                        width: ${rect.width + 40}px;
                        height: ${rect.height + 40}px;
                    `;
                    container.appendChild(blur);
                });
            }, 50);
        };

        updateBlur();
        window.addEventListener('scroll', updateBlur);
        window.addEventListener('resize', updateBlur);
        
        const observer = new MutationObserver(updateBlur);
        observer.observe(document.getElementById('main-content') || document.body, {
            childList: true,
            subtree: true
        });
    }

    initHeader() {
        const header = document.getElementById('main-header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 100);
        });

        document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
            const nav = document.getElementById('main-nav');
            const toggle = document.getElementById('mobile-menu-toggle');
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        document.getElementById('nav-list')?.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const nav = document.getElementById('main-nav');
                const toggle = document.getElementById('mobile-menu-toggle');
                nav.classList.remove('active');
                toggle.classList.remove('active');
            }
        });

        let touchStartY = 0;
        let touchStartX = 0;
        let inactivityTimer;
        
        const closeMenu = () => {
            const nav = document.getElementById('main-nav');
            const toggle = document.getElementById('mobile-menu-toggle');
            nav.classList.remove('active');
            toggle.classList.remove('active');
        };
        
        const openMenu = () => {
            const nav = document.getElementById('main-nav');
            const toggle = document.getElementById('mobile-menu-toggle');
            nav.classList.add('active');
            toggle.classList.add('active');
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(closeMenu, 5000);
        };
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;
            
            const nav = document.getElementById('main-nav');
            const isMenuOpen = nav.classList.contains('active');
            
            if (window.innerWidth <= 1200) {
                if (isMenuOpen && Math.abs(deltaY) > 50) {
                    closeMenu();
                } else if (!isMenuOpen && touchStartY < 250 && deltaY > 80 && Math.abs(deltaX) < Math.abs(deltaY)) {
                    openMenu();
                }
            }
        }, { passive: true });
    }

    initTheme() {
        const saved = Utils.storage.get('theme', 'dark');
        document.documentElement.dataset.theme = saved;

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            const current = document.documentElement.dataset.theme;
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            Utils.storage.set('theme', next);
        });
    }

    initSwipe() {
        const nav = document.getElementById('nav-list');
        if (!nav) return;

        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.nav-list')) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX) return;
            
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) this.nextNav();
                else this.prevNav();
            }
            
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }

    nextNav() {
        const idx = this.navItems.findIndex(n => n.dataset.section === this.currentSection);
        if (idx < this.navItems.length - 1) {
            this.navigateTo(this.navItems[idx + 1].dataset.section);
        }
    }

    prevNav() {
        const idx = this.navItems.findIndex(n => n.dataset.section === this.currentSection);
        if (idx > 0) {
            this.navigateTo(this.navItems[idx - 1].dataset.section);
        }
    }

    initSearch() {
        const modal = document.getElementById('search-modal');
        document.getElementById('search-toggle')?.addEventListener('click', () => {
            modal.classList.add('active');
            document.getElementById('search-input')?.focus();
        });
        document.getElementById('search-close')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    initForms() {
        document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            Components.toast('Сообщение отправлено!', 'success');
            e.target.reset();
        });
    }

    initSnake() {
        const canvas = document.getElementById('snake-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 0, dy = 0;
        let score = 0;
        let gameOver = false;
        const gridSize = 20;

        const placeFood = () => {
            food = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
        };

        const draw = () => {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#22c55e';
            snake.forEach(segment => {
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            });

            if (gameOver) {
                ctx.fillStyle = 'white';
                ctx.font = '30px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over! Score: ' + score, canvas.width/2, canvas.height/2);
            }
        };

        const update = () => {
            if (gameOver) return;
            
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            if (head.x < 0 || head.x >= canvas.width/gridSize || head.y < 0 || head.y >= canvas.height/gridSize) {
                gameOver = true;
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score++;
                placeFood();
            } else {
                snake.pop();
            }
        };

        const gameLoop = () => {
            update();
            draw();
            if (!gameOver) setTimeout(gameLoop, 100);
        };

        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': if (dy === 0) {dx=0; dy=-1;} break;
                case 'ArrowDown': if (dy === 0) {dx=0; dy=1;} break;
                case 'ArrowLeft': if (dx === 0) {dx=-1; dy=0;} break;
                case 'ArrowRight': if (dx === 0) {dx=1; dy=0;} break;
            }
        });

        let touchStartX = 0, touchStartY = 0;
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        canvas.addEventListener('touchend', (e) => {
            const tdx = e.changedTouches[0].clientX - touchStartX;
            const tdy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(tdx) > Math.abs(tdy)) {
                if (tdx > 0 && dx === 0) {dx=1; dy=0;}
                else if (tdx < 0 && dx === 0) {dx=-1; dy=0;}
            } else {
                if (tdy > 0 && dy === 0) {dx=0; dy=1;}
                else if (tdy < 0 && dy === 0) {dx=0; dy=-1;}
            }
        }, { passive: true });

        dx = 1;
        dy = 0;

        window.gameSnake = () => {
            document.getElementById('not-found-page').style.display = 'flex';
            gameLoop();
        };
    }

    renderAll(data) {
        window.currentData = data;
        this.renderLogo(data);
        this.renderNav(data);
        this.renderHero(data);
        this.renderAbout(data);
        this.renderServices(data);
        this.renderPortfolio(data);
        this.renderKlondike(data);
        this.renderBlog(data);
        this.renderJuniper(data);
        this.renderGallery(data);
        this.renderContact(data);
        this.renderFooter(data);
        this.renderStats(data);
        this.updateMeta(data);
    }

    renderLogo(data) {
        const logoContainer = document.getElementById('site-logo');
        const siteName = document.getElementById('site-name');
        if (siteName) siteName.textContent = data.profile?.name || 'VIXIE';
        
        logoContainer.innerHTML = `
            <svg viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" rx="20" fill="${data.theme?.primary_color || '#dc2626'}"/>
                <path d="M30 35L50 20L70 35L50 50L30 35Z" fill="white"/>
                <path d="M30 65L50 80L70 65" stroke="white" stroke-width="5" stroke-linecap="round"/>
                <path d="M30 50L50 65L70 50" stroke="white" stroke-width="5" stroke-linecap="round"/>
            </svg>
        `;

        const loaderLogo = document.getElementById('loader-logo');
        if (loaderLogo) loaderLogo.innerHTML = logoContainer.innerHTML;
    }

    renderNav(data) {
        const navList = document.getElementById('nav-list');
        const indicator = document.getElementById('mobile-nav-indicator');
        
        const sections = [
            { id: 'home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', label: 'Главная' },
            { id: 'about', icon: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>', label: 'Обо мне' },
            { id: 'services', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>', label: 'Услуги' },
            { id: 'portfolio', icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', label: 'Портфолио' },
            { id: 'shop', icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72"/>', label: 'Магазин' },
            { id: 'blog', icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>', label: 'Блог' },
            { id: 'juniper', icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', label: 'Juniper' },
            { id: 'contact', icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', label: 'Контакты' },
            { id: 'creators', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', label: 'Создатели' }
        ];

        navList.innerHTML = sections.map(s => `
            <li class="nav-item" data-section="${s.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${s.icon}</svg>
                <span class="nav-label">${s.label}</span>
            </li>
        `).join('');

        indicator.innerHTML = sections.map((s, i) => `
            <div class="indicator-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');

        this.navItems = navList.querySelectorAll('.nav-item');
        
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.section === 'about') {
                    this.selectedCreator = null;
                }
                this.navigateTo(item.dataset.section);
            });
        });
    }

    renderHero(data) {
        const hero = document.getElementById('hero-content');
        const profile = data.profile || {};
        const about = data.about || {};
        
        hero.innerHTML = `
            <div class="hero-badge">
                <span class="badge-icon"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                <span class="badge-text">${profile.role || 'Developer & Designer'}</span>
            </div>
            <h1 class="hero-title">
                <span class="title-line">Найди</span>
                <span class="title-line accent">что-нибудь</span>
                <span class="title-line">для себя</span>
            </h1>
            <p class="hero-description">
                Привет! Я <strong>${profile.name || 'VIXIE'}</strong> — ${profile.role || 'разработчик и дизайнер'}. 
                Превращаю идеи в работающие продукты с 2019 года.
            </p>
            <div class="hero-actions">
                <button class="btn btn-primary btn-light" data-section="services">
                    <span>Мои услуги</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <button class="btn btn-secondary btn-outline-glow" data-section="portfolio">
                    <span>Смотреть работы</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg>
                </button>
            </div>
        `;

        hero.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.section));
        });
    }

    renderAbout(data) {
        const pageContent = document.getElementById('page-content');
        const creator = this.selectedCreator;
        
        const about = data.about || {};
        let skills = data.skills || [];
        let timeline = about.timeline || [];
        let profile = data.profile || {};
        let stats = data.stats || {};
        let bio = about.bio || [];
        
        if (creator) {
            profile = {
                name: creator.name,
                full_name: creator.full_name || creator.name,
                role: creator.role,
                age: creator.age,
                location: creator.location,
                socials: creator.socials,
                status: creator.status
            };
            skills = creator.skills || [];
            timeline = creator.timeline || [];
            stats = creator.stats || {};
            bio = creator.bio ? [creator.bio] : [];
        }
        
        const processBioTemplate = (template, vars) => {
            let result = template;
            Object.keys(vars).forEach(key => {
                result = result.replace(new RegExp(`%${key}%`, 'g'), vars[key]);
            });
            return result;
        };
        
        const processedBio = bio;

        const existingSection = document.getElementById('section-about');
        if (existingSection) {
            existingSection.querySelector('.profile-name').textContent = profile.name || 'VIXIE';
            existingSection.querySelector('.profile-role').textContent = profile.role || 'Developer';
            existingSection.querySelector('.card-content').innerHTML = processedBio.map(p => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');
            const statValues = existingSection.querySelectorAll('.profile-stat-value');
            if (statValues[0]) statValues[0].textContent = stats.projects?.value || 0;
            if (statValues[1]) statValues[1].textContent = stats.clients?.value || 0;
            if (statValues[2]) statValues[2].textContent = stats.experience?.value || 0;
            if (statValues[3]) statValues[3].textContent = stats.awards?.value || 0;
            existingSection.querySelector('.skills-grid').innerHTML = skills.map(s => `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${s.name}</span>
                        <span class="skill-level">${s.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width:${s.level}%;background:${s.color}"></div>
                    </div>
                </div>
            `).join('');

            existingSection.querySelector('.timeline').innerHTML = timeline.map(t => `
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <span class="timeline-year">${t.year}</span>
                        <h4>${t.title}</h4>
                        <p>${t.description}</p>
                    </div>
                </div>
            `).join('');
            return;
        }

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-about';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                        <span>Обо мне</span>
                    </div>
                    <h2 class="section-title">Познакомимся?</h2>
                </div>
                
                <div class="about-grid">
                    <div class="about-card about-profile">
                        <div class="profile-image-container">
                            <div class="profile-image">
                                <svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#1a1a2e"/><circle cx="100" cy="80" r="40" fill="${creator?.color || '#dc2626'}" opacity="0.3"/><text x="100" y="160" text-anchor="middle" fill="white" font-family="Space Grotesk" font-size="24">${profile.name || 'VIXIE'}</text></svg>
                            </div>
                            <div class="profile-status" style="border-color:${this.parseStatusColor(profile.status)};color:${this.parseStatusColor(profile.status)}">
                                <span class="status-indicator" style="background:${this.parseStatusColor(profile.status)}"></span>
                                ${profile.status?.text || 'Онлайн'}
                            </div>
                        </div>
                        <h3 class="profile-name">${profile.name || 'VIXIE'}</h3>
                        <p class="profile-role">${profile.role || 'Developer'}</p>
                        <div class="profile-meta">
                            <div class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg><span>${profile.age || 19} лет</span></div>
                            <div class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${profile.location?.country || 'Россия'}</span></div>
                        </div>
                        <div class="profile-stats">
                            <div class="profile-stat-item">
                                <span class="profile-stat-value">${stats.projects?.value || 0}</span>
                                <span class="profile-stat-label">${stats.projects?.label || 'Проектов'}</span>
                            </div>
                            <div class="profile-stat-item">
                                <span class="profile-stat-value">${stats.clients?.value || 0}</span>
                                <span class="profile-stat-label">${stats.clients?.label || 'Клиентов'}</span>
                            </div>
                            <div class="profile-stat-item">
                                <span class="profile-stat-value">${stats.experience?.value || 0}</span>
                                <span class="profile-stat-label">${stats.experience?.label || 'Лет'}</span>
                            </div>
                            <div class="profile-stat-item">
                                <span class="profile-stat-value">${stats.awards?.value || 0}</span>
                                <span class="profile-stat-label">${stats.awards?.label || 'Наград'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-card about-bio">
                        <div class="card-header"><h3>about.md</h3></div>
                        <div class="card-content">
                            ${bio.map(p => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('')}
                        </div>
                    </div>
                    
                    <div class="about-card about-skills">
                        <div class="card-header"><h3>Навыки</h3></div>
                        <div class="skills-grid">
                            ${skills.map(s => `
                                <div class="skill-item">
                                    <div class="skill-header">
                                        <span class="skill-name">${s.name}</span>
                                        <span class="skill-level">${s.level}%</span>
                                    </div>
                                    <div class="skill-bar">
                                        <div class="skill-fill" style="width:${s.level}%;background:${s.color}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="about-card about-timeline">
                        <div class="card-header"><h3>Timeline</h3></div>
                        <div class="timeline">
                            ${timeline.map(t => `
                                <div class="timeline-item">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <span class="timeline-year">${t.year}</span>
                                        <h4>${t.title}</h4>
                                        <p>${t.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    parseStatusColor(status) {
        if (!status || !status.color) return '#22c55e';
        const presetColors = DataLoader.get('status_colors.preset', {});
        return presetColors[status.color] || status.color;
    }

    renderServices(data) {
        const pageContent = document.getElementById('page-content');
        const services = data.services || [];

        const existingSection = document.getElementById('section-services');
        if (existingSection) {
            existingSection.querySelector('.services-grid').innerHTML = services.map(s => this.renderServiceCard(s)).join('');
            return;
        }

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-services';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg><span>Услуги</span></div>
                    <h2 class="section-title">Что я могу для вас сделать</h2>
                </div>
                <div class="services-grid">
                    ${services.map(s => this.renderServiceCard(s)).join('')}
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    renderServiceCard(s) {
        return `
            <div class="service-card" data-animate>
                ${s.popular ? '<span class="popular-badge">Популярное</span>' : ''}
                <div class="service-icon">${this.getServiceIcon(s.icon)}</div>
                <h3 class="service-title">${s.title}</h3>
                <p class="service-description">${s.description}</p>
                <div class="service-price">
                    <span class="price-value">${s.price}</span>
                    <span class="price-label">${s.price_suffix || '₽'}</span>
                </div>
                <div class="service-features">
                    ${(s.features || []).map(f => `<div class="feature-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>${f}</span></div>`).join('')}
                </div>
                <button class="btn btn-primary btn-block btn-light" onclick="app.openOrderModal('${s.title}', ${s.price})">
                    <span>Заказать</span>
                </button>
            </div>
        `;
    }

    getServiceIcon(icon) {
        const icons = {
            bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73v2.27a10 10 0 1 1-4 0V5.73A2 2 0 0 1 12 2z"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>',
            design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>',
            ui: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
            telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>',
            consultation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
        };
        return icons[icon] || icons.design;
    }

    renderPortfolio(data) {
        const pageContent = document.getElementById('page-content');
        const portfolio = data.portfolio || [];

        const existingSection = document.getElementById('section-portfolio');
        if (existingSection) {
            existingSection.querySelector('.portfolio-grid').innerHTML = portfolio.map(p => this.renderPortfolioCard(p)).join('');
            return;
        }

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-portfolio';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg><span>Портфолио</span></div>
                    <h2 class="section-title">Мои работы</h2>
                </div>
                <div class="portfolio-filters">
                    <button class="filter-btn active" data-filter="all">Все</button>
                    <button class="filter-btn" data-filter="bot">Боты</button>
                    <button class="filter-btn" data-filter="design">Дизайн</button>
                    <button class="filter-btn" data-filter="web">Веб</button>
                </div>
                <div class="portfolio-grid">
                    ${portfolio.map(p => this.renderPortfolioCard(p)).join('')}
                </div>
            </div>
        `;

        section.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                section.querySelectorAll('.portfolio-card').forEach(card => {
                    card.style.display = filter === 'all' || card.dataset.category === filter ? 'block' : 'none';
                });
            });
        });

        pageContent.appendChild(section);
    }

    renderPortfolioCard(p) {
        const colors = {bot: '#5865F2', design: '#dc2626', web: '#8b5cf6', software: '#f97316'};
        const color = colors[p.category] || '#dc2626';
        return `
            <div class="portfolio-card" data-category="${p.category}" onclick="app.openPortfolioModal(${p.id})" style="cursor:pointer;">
                <div class="portfolio-card-image" style="background-image: url('${p.image_url}'); background-size: cover; background-position: center;">
                    <div class="portfolio-card-overlay">
                        <span class="view-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </span>
                    </div>
                </div>
                <div class="portfolio-card-content">
                    <span class="portfolio-card-category">${p.category}</span>
                    <h3 class="portfolio-card-title">${p.title}</h3>
                    <p class="portfolio-card-description">${p.description}</p>
                </div>
            </div>
        `;
    }

    openPortfolioModal(id) {
        const data = window.currentData;
        const item = data?.portfolio?.find(p => p.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="content-modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="content-modal-container glass-panel">
                <button class="content-modal-close" onclick="this.closest('.content-modal').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="content-modal-image" style="background-image: url('${item.image_url}'); background-size: cover; background-position: center;"></div>
                <div class="content-modal-content">
                    <span class="content-modal-category">${item.category}</span>
                    <h2 class="content-modal-title">${item.title}</h2>
                    <div class="content-modal-body">${item.content || '<p>' + item.description + '</p>'}</div>
                    ${item.links?.length ? `
                        <div class="content-modal-links">
                            ${item.links.map(l => `<a href="${l.url}" class="btn btn-secondary btn-sm" target="_blank">${l.text}</a>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    renderKlondike(data) {
        const pageContent = document.getElementById('page-content');
        const klondike = data.klondike || [];

        const existingSection = document.getElementById('section-klondike');
        if (existingSection) return;

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-klondike';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg><span>Клондайк</span></div>
                    <h2 class="section-title">Бесплатные материалы</h2>
                    <p class="section-description">Копируй, скачивай, читай — всё бесплатно!</p>
                </div>
                <div class="klondike-grid">
                    ${klondike.map(item => this.renderKlondikeCard(item)).join('')}
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    renderKlondikeCard(item) {
        const typeIcons = {
            copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
            read: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
        };
        const typeLabels = {copy: 'Копировать', download: 'Скачать', read: 'Читать'};
        
        return `
            <div class="klondike-card glass-card" onclick="app.openKlondikeModal(${item.id})" style="cursor:pointer;">
                ${item.badge ? `<span class="klondike-badge">${item.badge}</span>` : ''}
                <div class="klondike-icon">${typeIcons[item.type] || typeIcons.read}</div>
                <div class="klondike-content">
                    <span class="klondike-category">${item.category}</span>
                    <h3 class="klondike-title">${item.title}</h3>
                    <p class="klondike-description">${item.description}</p>
                    ${item.command ? `<code class="klondike-command">${item.command}</code>` : ''}
                </div>
                <div class="klondike-action">
                    <span class="klondike-type-label">${typeLabels[item.type] || 'Открыть'}</span>
                </div>
            </div>
        `;
    }

    openKlondikeModal(id) {
        const data = window.currentData;
        const item = data?.klondike?.find(k => k.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="content-modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="content-modal-container glass-panel">
                <button class="content-modal-close" onclick="this.closest('.content-modal').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="content-modal-content">
                    <span class="content-modal-category">${item.category}</span>
                    <h2 class="content-modal-title">${item.title}</h2>
                    <p class="content-modal-description">${item.description}</p>
                    <div class="klondike-modal-content">
                        ${item.type === 'read' ? item.content : '<pre><code>' + item.content + '</code></pre>'}
                    </div>
                    ${item.command ? `
                        <div class="klondike-modal-action">
                            <code class="command-preview">${item.command}</code>
                            <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText('${item.command}'); this.textContent='Скопировано!'; setTimeout(()=>this.textContent='Копировать',1500)">Копировать</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    renderBlog(data) {
        const pageContent = document.getElementById('page-content');
        const blog = data.blog || [];

        const existingSection = document.getElementById('section-blog');
        if (existingSection) return;

        const featured = blog.find(b => b.featured);
        const others = blog.filter(b => !b.featured);

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-blog';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg><span>Блог</span></div>
                    <h2 class="section-title">Статьи и новости</h2>
                </div>
                <div class="blog-layout">
                    ${featured ? `
                        <div class="blog-featured" onclick="app.openBlogModal(${featured.id})" style="cursor:pointer;">
                            <div class="blog-featured-card">
                                <div class="blog-featured-image" style="background-image: url('${featured.image_url}'); background-size: cover; background-position: center;"></div>
                                <div class="blog-featured-content">
                                    <span class="blog-featured-category">${featured.category}</span>
                                    <h3 class="blog-featured-title">${featured.title}</h3>
                                    <p class="blog-featured-excerpt">${featured.excerpt}</p>
                                    <div class="blog-featured-meta">
                                        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${DataLoader.formatDate(featured.date)}</span>
                                        <span>${featured.read_time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="blog-list">
                        ${others.map(post => `
                            <div class="blog-card" onclick="app.openBlogModal(${post.id})" style="cursor:pointer;">
                                <div class="blog-card-image" style="background-image: url('${post.image_url}'); background-size: cover; background-position: center;"></div>
                                <div class="blog-card-content">
                                    <span class="blog-card-category">${post.category}</span>
                                    <h4 class="blog-card-title">${post.title}</h4>
                                    <span class="blog-card-date">${DataLoader.formatDate(post.date)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    openBlogModal(id) {
        const data = window.currentData;
        const item = data?.blog?.find(b => b.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="content-modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="content-modal-container glass-panel blog-modal">
                <button class="content-modal-close" onclick="this.closest('.content-modal').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="blog-modal-image" style="background-image: url('${item.image_url}'); background-size: cover; background-position: center;"></div>
                <div class="content-modal-content">
                    <span class="content-modal-category">${item.category}</span>
                    <h2 class="content-modal-title">${item.title}</h2>
                    <div class="blog-modal-meta">
                        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${DataLoader.formatDate(item.date)}</span>
                        <span>${item.read_time}</span>
                        <span>${item.author}</span>
                    </div>
                    <div class="content-modal-body blog-content">${item.content}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    renderJuniper(data) {
        const pageContent = document.getElementById('page-content');
        const juniper = data.juniper || [];
        const commands = data.commands || [];

        const existingSection = document.getElementById('section-juniper');
        if (existingSection) return;

        const section = document.createElement('section');
        section.className = 'page-section juniper-section';
        section.id = 'section-juniper';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header juniper-header">
                    <div class="section-badge juniper-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Juniper</span></div>
                    <h2 class="section-title">Juniper Tutorials</h2>
                </div>
                <div class="juniper-grid">
                    ${juniper.map(item => `
                        <div class="juniper-card" onclick="app.openJuniperModal(${item.id})" style="cursor:pointer;">
                            <div class="juniper-card-image" style="background-image: url('${item.image_url}'); background-size: cover; background-position: center;"></div>
                            <div class="juniper-card-content">
                                <span class="juniper-type-badge">${item.type === 'video' ? 'Видео' : 'Статья'}</span>
                                <h3 class="juniper-card-title">${item.title}</h3>
                                <p class="juniper-card-description">${item.description}</p>
                                ${item.command ? `
                                    <code class="juniper-command">${item.command}</code>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="juniper-commands">
                    <h3>Популярные команды</h3>
                    <div class="commands-list">
                        ${commands.map(cmd => `
                            <div class="command-item">
                                <code>${cmd.command}</code>
                                <span>${cmd.description}</span>
                                <button class="btn-copy" data-copy="${cmd.command}">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        section.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await Utils.copyToClipboard(btn.dataset.copy);
                Components.toast('Скопировано!', 'success');
            });
        });

        pageContent.appendChild(section);
    }

    openJuniperModal(id) {
        const data = window.currentData;
        const item = data?.juniper?.find(j => j.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'content-modal';
        
        if (item.type === 'video') {
            modal.innerHTML = `
                <div class="content-modal-backdrop" onclick="this.parentElement.remove()"></div>
                <div class="content-modal-container glass-panel">
                    <button class="content-modal-close" onclick="this.closest('.content-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div class="juniper-modal-video">
                        <iframe src="${item.content}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="content-modal-content">
                        <span class="content-modal-category">Видео</span>
                        <h2 class="content-modal-title">${item.title}</h2>
                        <p class="content-modal-description">${item.description}</p>
                    </div>
                </div>
            `;
        } else {
            modal.innerHTML = `
                <div class="content-modal-backdrop" onclick="this.parentElement.remove()"></div>
                <div class="content-modal-container glass-panel">
                    <button class="content-modal-close" onclick="this.closest('.content-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div class="content-modal-image" style="background-image: url('${item.image_url}'); background-size: cover; background-position: center;"></div>
                    <div class="content-modal-content">
                        <span class="content-modal-category">Статья</span>
                        <h2 class="content-modal-title">${item.title}</h2>
                        <p class="content-modal-description">${item.description}</p>
                        <div class="content-modal-body">${item.content}</div>
                        ${item.command ? `
                            <div class="klondike-modal-action">
                                <code class="command-preview">${item.command}</code>
                                <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText('${item.command}'); this.textContent='Скопировано!'; setTimeout(()=>this.textContent='Копировать',1500)">Копировать</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    renderGallery(data) {
        const pageContent = document.getElementById('page-content');
        const gallery = data.gallery || [];

        const existingSection = document.getElementById('section-gallery');
        if (existingSection) return;

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-gallery';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg><span>Галерея</span></div>
                    <h2 class="section-title">Галерея работ</h2>
                </div>
                <div class="gallery-masonry">
                    ${gallery.map((item, i) => {
                        const colors = ['#dc2626','#5865F2','#8b5cf6','#f97316','#22c55e','#06b6d4'];
                        const color = colors[i % colors.length];
                        return `
                            <div class="gallery-item">
                                <svg viewBox="0 0 400 ${200 + Math.random() * 200}"><rect width="100%" height="100%" fill="#1a1a2e"/><circle cx="50%" cy="40%" r="30%" fill="${color}" opacity="0.2"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-family="Space Grotesk" font-size="16">${item.title}</text></svg>
                                <div class="gallery-item-overlay"><div class="gallery-item-info"><h4>${item.title}</h4><p>${item.category}</p></div></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    renderCreators() {
        const pageContent = document.getElementById('page-content');
        const existingSection = document.getElementById('section-creators');
        if (existingSection) return;

        const creators = DataLoader.get('creators') || [];
        if (!creators.length) return;

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-creators';
        section.innerHTML = `
            <div class="section-container">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Создатели</span></div>
                    <h2 class="section-title">Создатели сайта</h2>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-top: 32px;">
                    ${creators.map((c, i) => `
                        <div class="creator-card" data-creator-id="${c.id}" data-creator-index="${i}" style="background: var(--bg-secondary); padding: 24px; border-radius: 16px; border: 1px solid var(--border); text-align: center; cursor: pointer; transition: all 0.3s;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${c.color}, ${c.color}dd); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white;">${c.icon || c.name[0]}</div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 4px;">${c.name}</h3>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">${c.role || ''}</p>
                            <p style="color: var(--primary); font-size: 0.75rem; margin-top: 8px;">Нажми чтобы узнать больше →</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        pageContent.appendChild(section);
        
        section.querySelectorAll('.creator-card').forEach(card => {
            card.addEventListener('click', () => {
                const creatorId = parseInt(card.dataset.creatorId);
                const creators = DataLoader.get('creators') || [];
                const creator = creators.find(c => c.id === creatorId);
                if (creator) {
                    this.selectedCreator = creator;
                    this.navigateTo('about');
                }
            });
        });
    }

    renderContact(data) {
        const pageContent = document.getElementById('page-content');
        const profile = data.profile || {};

        const existingSection = document.getElementById('section-contact');
        if (existingSection) return;

        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'section-contact';
        section.innerHTML = `
            <div class="section-container contact-centered">
                <div class="section-header">
                    <div class="section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>Контакты</span></div>
                    <h2 class="section-title">Свяжитесь со мной</h2>
                </div>
                <div class="contact-socials-centered">
                        <a href="https://discord.com/users/${profile.socials?.discord || 'vixie#0001'}" class="contact-social-link discord" target="_blank">
                            <div class="contact-social-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 003.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.872-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.25-.188.372-.284a.076.076 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.076.076 0 0 1 .078.01c.12.096.245.19.372.284a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.355.698.765 1.363 1.226 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                            </div>
                            <div class="contact-social-info">
                                <span class="contact-social-label">Discord</span>
                                <span class="contact-social-value">${profile.socials?.discord || 'vixie#0001'}</span>
                            </div>
                            <svg class="contact-social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                        <a href="https://t.me/${(profile.socials?.telegram || '@vixie_dev').replace('@', '')}" class="contact-social-link telegram" target="_blank">
                            <div class="contact-social-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                            </div>
                            <div class="contact-social-info">
                                <span class="contact-social-label">Telegram</span>
                                <span class="contact-social-value">${profile.socials?.telegram || '@vixie_dev'}</span>
                            </div>
                            <svg class="contact-social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                        <a href="https://youtube.com/${profile.socials?.youtube || '@ZoLiryzik'}" class="contact-social-link youtube" target="_blank">
                            <div class="contact-social-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </div>
                            <div class="contact-social-info">
                                <span class="contact-social-label">YouTube</span>
                                <span class="contact-social-value">${profile.socials?.youtube || '@ZoLiryzik'}</span>
                            </div>
                            <svg class="contact-social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                        <a href="https://github.com/${profile.socials?.github || 'mrvixie'}" class="contact-social-link github" target="_blank">
                            <div class="contact-social-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </div>
                            <div class="contact-social-info">
                                <span class="contact-social-label">GitHub</span>
                                <span class="contact-social-value">${profile.socials?.github || 'mrvixie'}</span>
                            </div>
                            <svg class="contact-social-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        `;

        pageContent.appendChild(section);
    }

    renderFooter(data) {
        const footer = document.getElementById('footer-content');
        const profile = data.profile || {};

        footer.innerHTML = `
            <div class="footer-header">
                <div class="footer-logo">
                    <svg viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="#dc2626"/><path d="M30 35L50 20L70 35L50 50L30 35Z" fill="white"/><path d="M30 65L50 80L70 65" stroke="white" stroke-width="5" stroke-linecap="round"/><path d="M30 50L50 65L70 50" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>
                    <span>${data.profile?.name || 'VIXIE'}</span>
                </div>
                <p class="footer-tagline">Найди что-нибудь для себя</p>
            </div>
            <div class="footer-buttons">
                <a href="https://discord.com/users/${profile.socials?.discord || 'vixie#0001'}" target="_blank" class="footer-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 003.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.872-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.25-.188.372-.284a.076.076 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.076.076 0 0 1 .078.01c.12.096.245.19.372.284a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.355.698.765 1.363 1.226 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 006.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                    <span>Discord</span>
                </a>
                <a href="https://t.me/${(profile.socials?.telegram || '@vixie_dev').replace('@', '')}" target="_blank" class="footer-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                    <span>Telegram</span>
                </a>
                <a href="https://youtube.com/${profile.socials?.youtube || '@ZoLiryzik'}" target="_blank" class="footer-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/></svg>
                    <span>YouTube</span>
                </a>
            </div>
            <div class="footer-bottom">
                <span>&copy; ${new Date().getFullYear()} ZoLiryzik & VIXIE</span>
            </div>
        `;

        footer.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.section);
            });
        });
    }

    renderStats(data) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const stats = data.stats || {};
        
        const existingStats = sidebar.querySelector('.stats-grid');
        if (existingStats) {
            const values = existingStats.querySelectorAll('.stat-value');
            const labels = existingStats.querySelectorAll('.stat-label');
            const statKeys = Object.keys(stats);
            
            statKeys.forEach((key, i) => {
                if (values[i]) {
                    values[i].textContent = stats[key].value || 0;
                    labels[i].textContent = stats[key].label || key;
                }
            });
        }
    }

    updateMeta(data) {
        document.title = `${data.meta?.site_name || 'VIXIE'} | ${data.meta?.site_description || 'Найди что-нибудь для себя'}`;
    }

    navigateTo(section) {
        this.currentSection = section;

        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById('hero-section')?.classList.remove('active');

        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        const indicatorDots = document.querySelectorAll('.indicator-dot');
        const navIndex = Array.from(this.navItems).findIndex(n => n.dataset.section === section);
        indicatorDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === navIndex);
        });

        if (section === 'home') {
            document.getElementById('hero-section')?.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        let targetSection = document.getElementById(`section-${section}`);
        
        if (section === 'about') {
            const existingSection = document.getElementById('section-about');
            if (existingSection) existingSection.remove();
            this.renderAbout(DataLoader.data || {});
            targetSection = document.getElementById('section-about');
        }
        
        if (!targetSection) {
            if (section === 'contact') {
                this.renderContact(DataLoader.data || {});
                targetSection = document.getElementById('section-contact');
            }
            if (section === 'creators') {
                this.renderCreators();
                targetSection = document.getElementById('section-creators');
            }
        }

        if (targetSection) {
            targetSection.classList.add('active');
            const headerOffset = 100;
            const top = targetSection.offsetTop - headerOffset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    openOrderModal(service, price) {
        Components.modal({
            title: `Заказать: ${service}`,
            content: `
                <p style="color:var(--text-secondary);margin-bottom:1.5rem">Стоимость: от ${price} ₽</p>
                <form id="order-form-inline">
                    <div class="form-group">
                        <label class="form-label">Ваше имя</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Контакт (Discord/Telegram)</label>
                        <input type="text" class="form-input" name="contact" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Описание проекта</label>
                        <textarea class="form-textarea" name="description" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        <span>Отправить заявку</span>
                    </button>
                </form>
            `,
            size: 'medium'
        });

        document.getElementById('order-form-inline')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            Components.toast('Заявка отправлена!', 'success');
            Components.closeModal();
        });
    }

    addToCart(id) {
        this.cart.push(id);
        Components.toast('Добавлено в корзину', 'success');
    }

    goHome() {
        document.getElementById('not-found-page').style.display = 'none';
        this.navigateTo('home');
    }

    show404() {
        document.getElementById('not-found-page').style.display = 'flex';
        window.gameSnake?.();
    }

    hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }
    }

    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }

    initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15 });

        reveals.forEach(el => revealObserver.observe(el));
    }

    initParallax() {
        if (Utils.isMobile()) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    initCountUp() {
        const countElements = document.querySelectorAll('[data-count]');
        
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    const duration = parseInt(entry.target.dataset.duration) || 2000;
                    this.animateCount(entry.target, target, duration);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        countElements.forEach(el => countObserver.observe(el));
    }

    animateCount(element, target, duration) {
        const start = 0;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * (target - start) + start);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    initLazyLoad() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    initTypewriter() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(el => {
            const text = el.dataset.typewriter;
            const speed = parseInt(el.dataset.speed) || 100;
            let index = 0;
            
            el.textContent = '';
            
            const type = () => {
                if (index < text.length) {
                    el.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                }
            };
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    type();
                    observer.disconnect();
                }
            });
            
            observer.observe(el);
        });
    }

    initClipboard() {
        document.querySelectorAll('[data-clipboard]').forEach(el => {
            el.addEventListener('click', async () => {
                const text = el.dataset.clipboard;
                await Utils.copyToClipboard(text);
                Components.toast('Скопировано в буфер обмена!', 'success');
            });
        });
    }

    initCounter() {
        document.querySelectorAll('[data-counter]').forEach(el => {
            const target = parseInt(el.dataset.counter);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.animateValue(el, 0, target, 1500, (val) => {
                        el.textContent = prefix + val + suffix;
                    });
                    observer.disconnect();
                }
            });
            
            observer.observe(el);
        });
    }

    animateValue(element, start, end, duration, callback) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOut * (end - start) + start);
            
            callback(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    initTabs() {
        document.querySelectorAll('[data-tabs]').forEach(container => {
            const tabs = container.querySelectorAll('[data-tab]');
            const panels = container.querySelectorAll('[data-tab-panel]');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.dataset.tab;
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const panel = container.querySelector(`[data-tab-panel="${target}"]`);
                    if (panel) panel.classList.add('active');
                });
            });
        });
    }

    initAccordion() {
        document.querySelectorAll('[data-accordion]').forEach(accordion => {
            const items = accordion.querySelectorAll('[data-accordion-item]');
            const single = accordion.dataset.accordion === 'single';
            
            items.forEach(item => {
                const header = item.querySelector('[data-accordion-header]');
                const content = item.querySelector('[data-accordion-content]');
                
                header?.addEventListener('click', () => {
                    const isOpen = item.classList.contains('open');
                    
                    if (single && !isOpen) {
                        items.forEach(i => {
                            i.classList.remove('open');
                            const c = i.querySelector('[data-accordion-content]');
                            if (c) c.style.maxHeight = '0';
                        });
                    }
                    
                    if (!isOpen) {
                        item.classList.add('open');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    } else {
                        item.classList.remove('open');
                        content.style.maxHeight = '0';
                    }
                });
            });
        });
    }

    initImageComparison() {
        document.querySelectorAll('[data-image-compare]').forEach(container => {
            const slider = container.querySelector('[data-slider]');
            const before = container.querySelector('[data-before]');
            const after = container.querySelector('[data-after]');
            
            if (!slider || !before || !after) return;
            
            let isDragging = false;
            
            const updateSlider = (x) => {
                const rect = container.getBoundingClientRect();
                let position = (x - rect.left) / rect.width;
                position = Math.max(0, Math.min(1, position));
                
                before.style.clipPath = `inset(0 ${(1 - position) * 100}% 0 0)`;
                slider.style.left = `${position * 100}%`;
            };
            
            slider.addEventListener('mousedown', () => isDragging = true);
            document.addEventListener('mouseup', () => isDragging = false);
            document.addEventListener('mousemove', (e) => {
                if (isDragging) updateSlider(e.clientX);
            });
            
            slider.addEventListener('touchstart', () => isDragging = true);
            document.addEventListener('touchend', () => isDragging = false);
            document.addEventListener('touchmove', (e) => {
                if (isDragging) updateSlider(e.touches[0].clientX);
            });
        });
    }

    initStickyHeader() {
        const header = document.getElementById('main-header');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            if (currentScroll > lastScroll && currentScroll > 500) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    initBackToTop() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
        button.style.cssText = 'position:fixed;bottom:2rem;right:2rem;width:50px;height:50px;background:var(--primary);border:none;border-radius:50%;color:white;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:999;display:flex;align-items:center;justify-content:center;';
        
        document.body.appendChild(button);
        
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        });
    }

    initCustomCursor() {
        if (Utils.isMobile()) return;
        
        const cursor = document.getElementById('cursor-dot');
        const glow = document.getElementById('cursor-glow');
        let cursorX = 0, cursorY = 0;
        let glowX = 0, glowY = 0;
        
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        });
        
        const animateGlow = () => {
            glowX += (cursorX - glowX) * 0.1;
            glowY += (cursorY - glowY) * 0.1;
            
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            
            requestAnimationFrame(animateGlow);
        };
        
        animateGlow();
        
        document.querySelectorAll('a, button, .clickable').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    initPortfolioFilter() {
        document.querySelectorAll('[data-filter-group]').forEach(group => {
            const buttons = group.querySelectorAll('[data-filter]');
            const items = document.querySelectorAll('[data-filter-item]');
            
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.dataset.filter;
                    
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    items.forEach(item => {
                        if (filter === 'all' || item.dataset.category === filter) {
                            item.style.display = '';
                            item.classList.add('animate-in');
                        } else {
                            item.style.display = 'none';
                            item.classList.remove('animate-in');
                        }
                    });
                });
            });
        });
    }

    initLightbox() {
        document.querySelectorAll('[data-lightbox]').forEach(el => {
            el.addEventListener('click', () => {
                const src = el.dataset.lightbox;
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `<img src="${src}" alt=""><button class="lightbox-close">&times;</button>`;
                lightbox.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:pointer;';
                
                lightbox.querySelector('img').style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;';
                lightbox.querySelector('.lightbox-close').style.cssText = 'position:absolute;top:1rem;right:1rem;font-size:2rem;color:white;background:none;border:none;cursor:pointer;';
                
                lightbox.addEventListener('click', () => lightbox.remove());
                document.body.appendChild(lightbox);
            });
        });
    }

    initFormValidation() {
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.addEventListener('submit', (e) => {
                let isValid = true;
                
                form.querySelectorAll('[required]').forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    Components.toast('Пожалуйста, заполните все обязательные поля', 'error');
                }
            });
        });
    }

    initCookieConsent() {
        if (Utils.storage.get('cookie_consent')) return;
        
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <p>Мы используем cookies для улучшения вашего опыта. Продолжая пользоваться сайтом, вы соглашаетесь с нашей политикой конфиденциальности.</p>
            <button class="btn btn-primary btn-sm">Принять</button>
        `;
        banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;padding:1.5rem;background:var(--bg-card);border-top:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:9999;';
        
        banner.querySelector('button').addEventListener('click', () => {
            Utils.storage.set('cookie_consent', 'true');
            banner.remove();
        });
        
        document.body.appendChild(banner);
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    }
}

const app = new App();
app.init();

window.app = app;
window.Components = Components;
window.Utils = Utils;
window.DataLoader = DataLoader;
