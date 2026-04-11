const Components = {
    toastContainer: null,

    init() {
        this.toastContainer = document.getElementById('toast-container');
    },

    toast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <p class="toast-message">${message}</p>
            </div>
            <div class="toast-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.closeToast(toast);
        });

        setTimeout(() => {
            this.closeToast(toast);
        }, duration);

        return toast;
    },

    closeToast(toast) {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    modal(config) {
        const { id, title, content, size = 'normal', onClose } = config;
        const modal = document.getElementById(id);
        
        if (!modal) return;

        modal.querySelector('.modal-content').className = `modal-content ${size === 'large' ? 'modal-large' : ''}`;
        modal.querySelector('.modal-header h3').textContent = title;
        modal.querySelector('.modal-body').innerHTML = content;
        modal.classList.add('active');

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const closeModal = () => {
            modal.classList.remove('active');
            if (onClose) onClose();
        };

        closeBtn.onclick = closeModal;
        overlay.onclick = closeModal;

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    confirm(config) {
        return new Promise((resolve) => {
            const { title, message, confirmText = 'Подтвердить', cancelText = 'Отмена', type = 'danger' } = config;

            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content confirm-modal" style="max-width: 400px;">
                    <div class="modal-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('[data-action="cancel"]').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            modal.querySelector('[data-action="confirm"]').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };

            modal.querySelector('.modal-overlay').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });
    },

    loadingButton(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.classList.add('btn-loading');
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<span class="btn-text" style="opacity:0">Отправка...</span>';
        } else {
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.innerHTML = button.dataset.originalText;
        }
    },

    progressBar(container, options = {}) {
        const { value = 0, max = 100, color = 'var(--primary)', height = '8px', animated = true } = options;
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.height = height;
        
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = '0%';
        fill.style.background = color;
        
        bar.appendChild(fill);
        container.appendChild(bar);

        if (animated) {
            setTimeout(() => {
                fill.style.width = `${(value / max) * 100}%`;
            }, 100);
        } else {
            fill.style.width = `${(value / max) * 100}%`;
        }

        return {
            element: bar,
            fill,
            setValue: (val) => {
                fill.style.width = `${(val / max) * 100}%`;
            }
        };
    },

    tabs(container, options = {}) {
        const { onChange } = options;
        const tabs = container.querySelectorAll('.admin-tab');
        const contentId = container.dataset.content;
        const content = document.getElementById(contentId);

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (onChange) onChange(tab.dataset.tab);
            });
        });
    },

    accordion(element, options = {}) {
        const { singleOpen = true, onChange } = options;
        const items = element.querySelectorAll('.accordion-item');

        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                if (singleOpen) {
                    items.forEach(i => {
                        i.classList.remove('active');
                        i.querySelector('.accordion-content').style.maxHeight = '0';
                    });
                }

                if (!isOpen) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    item.classList.remove('active');
                    content.style.maxHeight = '0';
                }

                if (onChange) onChange(item, !isOpen);
            });
        });
    },

    dropdown(trigger, options = {}) {
        const { onChange } = options;
        const menu = trigger.querySelector('.dropdown-menu');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            trigger.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            trigger.classList.remove('active');
        });

        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                if (onChange) onChange(item.dataset.value);
                trigger.classList.remove('active');
            });
        });
    },

    tooltip(element, text, position = 'top') {
        element.setAttribute('data-tooltip', text);
        element.style.position = 'relative';
    },

    skeleton(element, loading = true) {
        if (loading) {
            element.classList.add('skeleton');
        } else {
            element.classList.remove('skeleton');
        }
    },

    badge(element, text, type = 'primary') {
        element.innerHTML = `<span class="badge badge-${type}">${text}</span>`;
    },

    avatar(element, src, size = 40) {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        element.innerHTML = '';
        element.appendChild(img);
    },

    card(config) {
        const { image, title, description, meta, actions, badge } = config;
        
        let html = '';
        
        if (image) {
            html += `<div class="card-image"><img src="${image}" alt="${title}"></div>`;
        }
        
        html += '<div class="card-content">';
        
        if (badge) {
            html += `<span class="card-badge">${badge}</span>`;
        }
        
        if (title) {
            html += `<h3 class="card-title">${title}</h3>`;
        }
        
        if (description) {
            html += `<p class="card-description">${description}</p>`;
        }
        
        if (meta) {
            html += '<div class="card-meta">';
            if (meta.date) {
                html += `<span class="card-date">${meta.date}</span>`;
            }
            if (meta.category) {
                html += `<span class="badge">${meta.category}</span>`;
            }
            html += '</div>';
        }
        
        if (actions && actions.length) {
            html += '<div class="card-actions">';
            actions.forEach(action => {
                html += `<button class="btn btn-sm ${action.class || 'btn-secondary'}" data-action="${action.action}">${action.label}</button>`;
            });
            html += '</div>';
        }
        
        html += '</div>';

        return html;
    },

    pagination(config) {
        const { current, total, onChange } = config;
        const container = document.createElement('div');
        container.className = 'pagination';

        let html = '';

        if (current > 1) {
            html += `<button class="pagination-btn prev" data-page="${current - 1}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>`;
        }

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                html += `<button class="pagination-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === current - 2 || i === current + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        if (current < total) {
            html += `<button class="pagination-btn next" data-page="${current + 1}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>`;
        }

        container.innerHTML = html;

        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (onChange) onChange(page);
            });
        });

        return container;
    },

    progressCircle(config) {
        const { value = 0, size = 100, strokeWidth = 8, color = 'var(--primary)', bgColor = 'var(--bg-secondary)' } = config;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (value / 100) * circumference;
        
        svg.innerHTML = `
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${bgColor}" stroke-width="${strokeWidth}"/>
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size/2} ${size/2})"/>
        `;
        
        return svg;
    },

    slider(config) {
        const { container, items = [], options = {} } = config;
        const {
            autoplay = false,
            interval = 5000,
            loop = true,
            dots = true,
            arrows = true
        } = options;

        let currentIndex = 0;
        let autoplayTimer = null;

        container.innerHTML = `
            <div class="slider-wrapper">
                <div class="slider-track">${items.map((item, i) => `<div class="slider-slide" data-index="${i}">${item}</div>`).join('')}</div>
                ${arrows ? '<button class="slider-arrow slider-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button><button class="slider-arrow slider-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>' : ''}
                ${dots ? '<div class="slider-dots">' + items.map((_, i) => `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`).join('') + '</div>' : ''}
            </div>
        `;

        const track = container.querySelector('.slider-track');
        const slides = container.querySelectorAll('.slider-slide');

        const updateSlider = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            container.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        const nextSlide = () => {
            currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : (loop ? 0 : currentIndex);
            updateSlider();
        };

        const prevSlide = () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? slides.length - 1 : 0);
            updateSlider();
        };

        container.querySelector('.slider-next')?.addEventListener('click', nextSlide);
        container.querySelector('.slider-prev')?.addEventListener('click', prevSlide);
        container.querySelectorAll('.slider-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                updateSlider();
            });
        });

        if (autoplay) {
            autoplayTimer = setInterval(nextSlide, interval);
            container.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
            container.addEventListener('mouseleave', () => {
                autoplayTimer = setInterval(nextSlide, interval);
            });
        }

        return {
            next: nextSlide,
            prev: prevSlide,
            goTo: (index) => {
                currentIndex = index;
                updateSlider();
            },
            destroy: () => {
                if (autoplayTimer) clearInterval(autoplayTimer);
            }
        };
    },

    carousel(config) {
        const { container, items = [], options = {} } = config;
        const { visibleItems = 4, gap = 20, autoplay = false, interval = 5000 } = options;

        let currentIndex = 0;
        let autoplayTimer = null;

        container.innerHTML = `
            <div class="carousel-container">
                <div class="carousel-track">${items.map((item, i) => `<div class="carousel-item" data-index="${i}">${item}</div>`).join('')}</div>
            </div>
        `;

        const track = container.querySelector('.carousel-track');
        const carouselItems = container.querySelectorAll('.carousel-item');

        const updateCarousel = () => {
            const offset = currentIndex * (100 / visibleItems + gap / 100);
            track.style.transform = `translateX(-${offset}%)`;
        };

        const nextCarousel = () => {
            if (currentIndex < carouselItems.length - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
        };

        const prevCarousel = () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        };

        container.querySelector('.carousel-next')?.addEventListener('click', nextCarousel);
        container.querySelector('.carousel-prev')?.addEventListener('click', prevCarousel);

        if (autoplay) {
            autoplayTimer = setInterval(nextCarousel, interval);
        }

        return {
            next: nextCarousel,
            prev: prevCarousel,
            destroy: () => {
                if (autoplayTimer) clearInterval(autoplayTimer);
            }
        };
    },

    timeline(config) {
        const { container, items = [], direction = 'vertical' } = config;

        container.innerHTML = `
            <div class="timeline timeline-${direction}">
                ${items.map((item, i) => `
                    <div class="timeline-item">
                        <div class="timeline-marker">
                            <div class="timeline-dot"></div>
                            ${i < items.length - 1 ? '<div class="timeline-line"></div>' : ''}
                        </div>
                        <div class="timeline-content">
                            ${item.date ? `<span class="timeline-date">${item.date}</span>` : ''}
                            ${item.title ? `<h4 class="timeline-title">${item.title}</h4>` : ''}
                            ${item.description ? `<p class="timeline-description">${item.description}</p>` : ''}
                            ${item.image ? `<img src="${item.image}" alt="" class="timeline-image">` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    filter(config) {
        const { container, groups = [], items = [] } = config;

        container.innerHTML = `
            <div class="filter-controls">
                ${groups.map(group => `
                    <div class="filter-group">
                        ${group.map(item => `
                            <button class="filter-btn" data-filter="${item.value}">${item.label}</button>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="filter-results">
                ${items.map(item => `
                    <div class="filter-item" data-category="${item.category}">
                        ${item.content}
                    </div>
                `).join('')}
            </div>
        `;

        const buttons = container.querySelectorAll('.filter-btn');
        const filterItems = container.querySelectorAll('.filter-item');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                filterItems.forEach(item => {
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

        return {
            getActive: () => container.querySelector('.filter-btn.active')?.dataset.filter,
            reset: () => {
                buttons.forEach(b => b.classList.remove('active'));
                buttons[0]?.classList.add('active');
                filterItems.forEach(item => {
                    item.style.display = '';
                    item.classList.add('animate-in');
                });
            }
        };
    },

    chart(config) {
        const { container, type = 'bar', data = [], options = {} } = config;
        const { width = 400, height = 300, colors = ['#dc2626', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'] } = options;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.length - 20;

        if (type === 'bar') {
            data.forEach((item, i) => {
                const barHeight = (item.value / Math.max(...data.map(d => d.value))) * chartHeight;
                const x = padding + i * (chartWidth / data.length) + 10;
                const y = height - padding - barHeight;

                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(x, y, barWidth, barHeight);

                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);
                ctx.fillText(item.value, x + barWidth / 2, y - 10);
            });
        } else if (type === 'line') {
            const points = data.map((item, i) => ({
                x: padding + i * (chartWidth / (data.length - 1)),
                y: height - padding - (item.value / Math.max(...data.map(d => d.value))) * chartHeight
            }));

            ctx.beginPath();
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 2;
            points.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();

            points.forEach((point, i) => {
                ctx.fillStyle = colors[0];
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (type === 'pie') {
            const total = data.reduce((sum, item) => sum + item.value, 0);
            let startAngle = 0;

            data.forEach((item, i) => {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                const endAngle = startAngle + sliceAngle;

                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.moveTo(width / 2, height / 2);
                ctx.arc(width / 2, height / 2, chartHeight / 2, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();

                startAngle = endAngle;
            });
        }

        return { canvas, ctx };
    },

    countdown(config) {
        const { container, targetDate, onComplete } = config;
        let timer = null;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                clearInterval(timer);
                container.innerHTML = '<span class="countdown-complete">Время вышло!</span>';
                if (onComplete) onComplete();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            container.innerHTML = `
                <div class="countdown-item"><span class="countdown-value">${days}</span><span class="countdown-label">дней</span></div>
                <div class="countdown-item"><span class="countdown-value">${hours}</span><span class="countdown-label">часов</span></div>
                <div class="countdown-item"><span class="countdown-value">${minutes}</span><span class="countdown-label">минут</span></div>
                <div class="countdown-item"><span class="countdown-value">${seconds}</span><span class="countdown-label">секунд</span></div>
            `;
        };

        updateCountdown();
        timer = setInterval(updateCountdown, 1000);

        return {
            destroy: () => clearInterval(timer)
        };
    },

    progressRing(config) {
        const { container, value = 0, size = 100, strokeWidth = 10, color = 'var(--primary)', bgColor = 'var(--bg-secondary)' } = config;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (value / 100) * circumference;

        svg.innerHTML = `
            <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${bgColor}" stroke-width="${strokeWidth}"/>
            <circle class="progress-ring-fill" cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size/2} ${size/2})"/>
        `;

        container.appendChild(svg);

        return {
            setValue: (val) => {
                const offset = circumference - (val / 100) * circumference;
                svg.querySelector('.progress-ring-fill').style.strokeDashoffset = offset;
            },
            element: svg
        };
    },

    videoPlayer(config) {
        const { container, src, poster = '', options = {} } = config;
        const { autoplay = false, controls = true, loop = false } = options;

        container.innerHTML = `
            <div class="video-player">
                <video ${autoplay ? 'autoplay' : ''} ${loop ? 'loop' : ''} ${controls ? '' : 'controlsList="nodownload"'}>
                    <source src="${src}" type="video/mp4">
                </video>
                ${controls ? `
                    <div class="video-controls">
                        <button class="video-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
                        <div class="video-progress"><div class="video-progress-bar"></div></div>
                        <span class="video-time">0:00 / 0:00</span>
                        <button class="video-mute"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>
                        <button class="video-fullscreen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/></svg></button>
                    </div>
                ` : ''}
            </div>
        `;

        const video = container.querySelector('video');
        const playBtn = container.querySelector('.video-play');
        const progressBar = container.querySelector('.video-progress-bar');
        const timeDisplay = container.querySelector('.video-time');

        playBtn?.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            } else {
                video.pause();
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            }
        });

        video?.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = progress + '%';
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        });

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        return { video, play: () => video?.play(), pause: () => video?.pause() };
    },

    masonry(config) {
        const { container, items = [], columns = 3, gap = 20 } = config;

        container.style.cssText = `display:grid;grid-template-columns:repeat(${columns}, 1fr);gap:${gap}px;`;

        const columnHeights = new Array(columns).fill(0);

        items.forEach((item, i) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = item;
            const element = wrapper.firstElementChild;
            
            container.appendChild(element);

            requestAnimationFrame(() => {
                const height = element.offsetHeight;
                const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
                
                element.style.gridColumn = shortestColumn + 1;
                element.style.gridRow = `span ${Math.ceil(height / gap)}`;
                columnHeights[shortestColumn] += height + gap;
            });
        });
    }
};

window.Components = Components;
