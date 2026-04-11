class NotificationsManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxVisible = 5;
    }

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, options = {}) {
        const {
            type = 'info',
            duration = 5000,
            title = '',
            icon = true,
            closable = true,
            actions = []
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.dataset.id = Date.now();

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        let html = '';
        
        if (icon) {
            html += `<div class="toast-icon">${icons[type]}</div>`;
        }

        html += '<div class="toast-content">';
        
        if (title) {
            html += `<div class="toast-title">${title}</div>`;
        }
        
        html += `<div class="toast-message">${message}</div>`;
        
        if (actions.length > 0) {
            html += '<div class="toast-actions">';
            actions.forEach(action => {
                html += `<button class="toast-action" data-action="${action.action}">${action.label}</button>`;
            });
            html += '</div>';
        }
        
        html += '</div>';

        if (closable) {
            html += `<div class="toast-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </div>`;
        }

        toast.innerHTML = html;

        if (closable) {
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.hide(toast.dataset.id);
            });
        }

        actions.forEach(action => {
            const btn = toast.querySelector(`[data-action="${action.action}"]`);
            if (btn) {
                btn.addEventListener('click', () => {
                    action.callback();
                    this.hide(toast.dataset.id);
                });
            }
        });

        this.container.appendChild(toast);
        this.notifications.push({ id: toast.dataset.id, element: toast });

        if (this.notifications.length > this.maxVisible) {
            const oldest = this.notifications.shift();
            this.hide(oldest.id);
        }

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast.dataset.id);
            }, duration);
        }

        return toast.dataset.id;
    }

    hide(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const toast = notification.element;
        toast.classList.remove('show');
        toast.classList.add('toast-exit');

        setTimeout(() => {
            toast.remove();
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 300);
    }

    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    clear() {
        this.notifications.forEach(n => {
            n.element.classList.add('toast-exit');
            setTimeout(() => n.element.remove(), 300);
        });
        this.notifications = [];
    }
}

class DragAndDrop {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            onDragStart: () => {},
            onDragMove: () => {},
            onDragEnd: () => {},
            handle: null,
            limit: null,
            ...options
        };
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        this.init();
    }

    init() {
        const target = this.options.handle ? this.element.querySelector(this.options.handle) : this.element;
        
        target.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        target.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(e) {
        e.preventDefault();
        this.startDrag(e.clientX, e.clientY);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        this.moveDrag(e.clientX, e.clientY);
    }

    onMouseUp() {
        this.endDrag();
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        this.moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }

    onTouchEnd() {
        this.endDrag();
    }

    startDrag(x, y) {
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
        this.element.classList.add('dragging');
        this.options.onDragStart({ x, y });
    }

    moveDrag(x, y) {
        if (!this.isDragging) return;
        
        let deltaX = x - this.startX;
        let deltaY = y - this.startY;

        if (this.options.limit) {
            const rect = this.element.getBoundingClientRect();
            const parentRect = this.element.parentElement.getBoundingClientRect();
            
            if (this.options.limit.horizontal !== false) {
                const maxX = (this.options.limit.maxX || parentRect.width - rect.width) / 2;
                deltaX = Math.max(-maxX, Math.min(maxX, deltaX));
            }
            
            if (this.options.limit.vertical !== false) {
                const maxY = (this.options.limit.maxY || parentRect.height - rect.height) / 2;
                deltaY = Math.max(-maxY, Math.min(maxY, deltaY));
            }
        }

        this.currentX = x;
        this.currentY = y;
        
        this.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this.options.onDragMove({ x: deltaX, y: deltaY, startX: x, startY: y });
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.element.classList.remove('dragging');
        this.options.onDragEnd({ 
            x: this.currentX - this.startX, 
            y: this.currentY - this.startY 
        });
    }

    reset() {
        this.element.style.transform = '';
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
    }
}

class Slider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            autoplay: true,
            autoplayInterval: 5000,
            speed: 500,
            loop: true,
            pagination: true,
            navigation: true,
            effect: 'slide',
            ...options
        };
        this.currentIndex = 0;
        this.slides = [];
        this.isAnimating = false;
        this.autoplayTimer = null;
        
        this.init();
    }

    init() {
        this.slides = Array.from(this.container.children);
        if (this.slides.length === 0) return;

        this.container.classList.add('slider-container');
        this.slides.forEach((slide, index) => {
            slide.classList.add('slider-slide');
            slide.dataset.index = index;
        });

        if (this.options.navigation) {
            this.createNavigation();
        }

        if (this.options.pagination) {
            this.createPagination();
        }

        if (this.options.autoplay) {
            this.startAutoplay();
        }

        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());

        this.updateSlide();
    }

    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'slider-navigation';
        nav.innerHTML = `
            <button class="slider-prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
            <button class="slider-next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        `;

        this.container.appendChild(nav);

        nav.querySelector('.slider-prev').addEventListener('click', () => this.prev());
        nav.querySelector('.slider-next').addEventListener('click', () => this.next());
    }

    createPagination() {
        const pagination = document.createElement('div');
        pagination.className = 'slider-pagination';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => this.goTo(index));
            pagination.appendChild(dot);
        });

        this.container.appendChild(pagination);
        this.pagination = pagination;
    }

    updateSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else if (index === this.getPrevIndex()) {
                slide.classList.add('prev');
            } else if (index === this.getNextIndex()) {
                slide.classList.add('next');
            }
        });

        if (this.pagination) {
            this.pagination.querySelectorAll('.slider-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }

        setTimeout(() => {
            this.isAnimating = false;
        }, this.options.speed);
    }

    goTo(index) {
        if (this.isAnimating) return;
        if (index < 0) index = this.options.loop ? this.slides.length - 1 : 0;
        if (index >= this.slides.length) index = this.options.loop ? 0 : this.slides.length - 1;
        this.currentIndex = index;
        this.updateSlide();
    }

    next() {
        this.goTo(this.getNextIndex());
    }

    prev() {
        this.goTo(this.getPrevIndex());
    }

    getNextIndex() {
        return this.currentIndex + 1 >= this.slides.length 
            ? (this.options.loop ? 0 : this.currentIndex)
            : this.currentIndex + 1;
    }

    getPrevIndex() {
        return this.currentIndex - 1 < 0
            ? (this.options.loop ? this.slides.length - 1 : this.currentIndex)
            : this.currentIndex - 1;
    }

    startAutoplay() {
        if (!this.options.autoplay) return;
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => this.next(), this.options.autoplayInterval);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    destroy() {
        this.stopAutoplay();
        this.container.classList.remove('slider-container');
        this.slides.forEach(slide => {
            slide.classList.remove('slider-slide', 'active', 'prev', 'next');
        });
    }
}

class Tabs {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            defaultTab: 0,
            animation: true,
            animationSpeed: 300,
            onChange: () => {},
            ...options
        };
        this.tabs = [];
        this.panels = [];
        this.activeIndex = this.options.defaultTab;
        
        this.init();
    }

    init() {
        const tabList = this.container.querySelector('.tabs-list');
        const panels = this.container.querySelectorAll('.tab-panel');
        
        if (tabList) {
            this.tabs = Array.from(tabList.children);
        } else {
            this.tabs = Array.from(this.container.querySelectorAll('[data-tab]'));
        }

        this.panels = Array.from(panels);

        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.activate(index));
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.activate(index);
                }
            });
        });

        this.activate(this.activeIndex);
    }

    activate(index) {
        if (index < 0 || index >= this.tabs.length) return;

        this.tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
            tab.setAttribute('aria-selected', i === index);
        });

        this.panels.forEach((panel, i) => {
            if (this.options.animation) {
                panel.style.opacity = '0';
                panel.style.display = i === index ? 'block' : 'none';
                setTimeout(() => {
                    panel.style.opacity = '1';
                }, 50);
            } else {
                panel.style.display = i === index ? 'block' : 'none';
            }
        });

        this.activeIndex = index;
        this.options.onChange(index, this.tabs[index], this.panels[index]);
    }

    getActiveIndex() {
        return this.activeIndex;
    }

    getActiveTab() {
        return this.tabs[this.activeIndex];
    }

    getActivePanel() {
        return this.panels[this.activeIndex];
    }

    next() {
        const nextIndex = (this.activeIndex + 1) % this.tabs.length;
        this.activate(nextIndex);
    }

    prev() {
        const prevIndex = (this.activeIndex - 1 + this.tabs.length) % this.tabs.length;
        this.activate(prevIndex);
    }
}

class Modal {
    constructor(options = {}) {
        this.options = {
            id: 'modal-' + Date.now(),
            title: '',
            content: '',
            size: 'medium',
            closable: true,
            closeOnOverlay: true,
            closeOnEscape: true,
            showCloseButton: true,
            animation: true,
            onOpen: () => {},
            onClose: () => {},
            ...options
        };
        this.isOpen = false;
        this.element = null;
        
        this.create();
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.id = this.options.id;
        this.element.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-dialog modal-${this.options.size}">
                ${this.options.showCloseButton ? `
                    <button class="modal-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                ` : ''}
                ${this.options.title ? `
                    <div class="modal-header">
                        <h3>${this.options.title}</h3>
                    </div>
                ` : ''}
                <div class="modal-body">
                    ${this.options.content}
                </div>
            </div>
        `;

        document.body.appendChild(this.element);

        if (this.options.closable) {
            this.element.querySelector('.modal-close')?.addEventListener('click', () => this.close());
        }

        if (this.options.closeOnOverlay) {
            this.element.querySelector('.modal-overlay')?.addEventListener('click', () => this.close());
        }

        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleEscape.bind(this));
        }
    }

    handleEscape(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        
        if (this.options.animation) {
            this.element.classList.add('modal-animating');
            requestAnimationFrame(() => {
                this.element.classList.add('active');
            });
        } else {
            this.element.classList.add('active');
        }
        
        document.body.style.overflow = 'hidden';
        this.options.onOpen();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.options.animation) {
            this.element.classList.remove('active');
            setTimeout(() => {
                this.element.classList.remove('modal-animating');
            }, 300);
        } else {
            this.element.classList.remove('active');
        }
        
        document.body.style.overflow = '';
        this.options.onClose();
    }

    setContent(content) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = content;
        }
    }

    setTitle(title) {
        const header = this.element.querySelector('.modal-header h3');
        if (header) {
            header.textContent = title;
        }
    }

    destroy() {
        this.close();
        this.element.remove();
    }

    static confirm(options) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: options.title || 'Подтверждение',
                content: `
                    <p>${options.message || 'Вы уверены?'}</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" data-action="cancel">${options.cancelText || 'Отмена'}</button>
                        <button class="btn btn-primary" data-action="confirm">${options.confirmText || 'Подтвердить'}</button>
                    </div>
                `,
                closable: false
            });

            modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                modal.destroy();
                resolve(false);
            });

            modal.element.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                modal.destroy();
                resolve(true);
            });

            modal.open();
        });
    }

    static alert(options) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: options.title || 'Внимание',
                content: `
                    <p>${options.message || ''}</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" data-action="ok">${options.okText || 'ОК'}</button>
                    </div>
                `,
                closable: false
            });

            modal.element.querySelector('[data-action="ok"]').addEventListener('click', () => {
                modal.destroy();
                resolve(true);
            });

            modal.open();
        });
    }
}

class FormValidator {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.options = {
            validateOnBlur: true,
            validateOnChange: true,
            validateOnSubmit: true,
            stopOnFirstError: false,
            ...options
        };
        this.errors = new Map();
        this.rules = new Map();
        
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.setAttribute('novalidate', 'true');

        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', (e) => {
                if (!this.validate()) {
                    e.preventDefault();
                }
            });
        }

        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.registerInput(input);
        });
    }

    registerInput(input) {
        const rules = this.parseRules(input);
        if (rules.length === 0) return;

        this.rules.set(input.name || input.id, rules);

        if (this.options.validateOnBlur) {
            input.addEventListener('blur', () => this.validateField(input));
        }

        if (this.options.validateOnChange) {
            input.addEventListener('change', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (this.errors.has(input.name || input.id)) {
                    this.validateField(input);
                }
            });
        }
    }

    parseRules(input) {
        const rules = [];
        const dataRules = input.dataset.rules;
        
        if (dataRules) {
            dataRules.split('|').forEach(rule => {
                const [name, param] = rule.split(':');
                rules.push({ name, param });
            });
        }

        if (input.required) {
            rules.push({ name: 'required' });
        }

        if (input.type === 'email') {
            rules.push({ name: 'email' });
        }

        if (input.minLength) {
            rules.push({ name: 'minLength', param: input.minLength });
        }

        if (input.maxLength) {
            rules.push({ name: 'maxLength', param: input.maxLength });
        }

        if (input.pattern) {
            rules.push({ name: 'pattern', param: input.pattern });
        }

        return rules;
    }

    validateField(input) {
        const name = input.name || input.id;
        const rules = this.rules.get(name) || [];
        const value = input.value;
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const result = this.validateRule(input, rule, value);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        if (isValid) {
            this.clearError(input);
            this.errors.delete(name);
        } else {
            this.showError(input, errorMessage);
            this.errors.set(name, errorMessage);
        }

        return isValid;
    }

    validateRule(input, rule, value) {
        const validators = {
            required: () => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    return { valid: input.checked, message: 'Это поле обязательно' };
                }
                return { valid: value.trim().length > 0, message: 'Это поле обязательно' };
            },
            email: () => {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return { valid: !value || re.test(value), message: 'Введите корректный email' };
            },
            minLength: () => {
                return { 
                    valid: !value || value.length >= parseInt(rule.param), 
                    message: `Минимальная длина: ${rule.param} символов` 
                };
            },
            maxLength: () => {
                return { 
                    valid: !value || value.length <= parseInt(rule.param), 
                    message: `Максимальная длина: ${rule.param} символов` 
                };
            },
            pattern: () => {
                const re = new RegExp(rule.param);
                return { valid: !value || re.test(value), message: 'Неверный формат' };
            },
            number: () => {
                return { valid: !value || !isNaN(value), message: 'Введите число' };
            },
            min: () => {
                return { 
                    valid: !value || parseFloat(value) >= parseFloat(rule.param), 
                    message: `Минимальное значение: ${rule.param}` 
                };
            },
            max: () => {
                return { 
                    valid: !value || parseFloat(value) <= parseFloat(rule.param), 
                    message: `Максимальное значение: ${rule.param}` 
                };
            },
            url: () => {
                try {
                    new URL(value);
                    return { valid: true, message: '' };
                } catch {
                    return { valid: !value, message: 'Введите корректный URL' };
                }
            }
        };

        const validator = validators[rule.name];
        if (validator) {
            return validator();
        }

        return { valid: true, message: '' };
    }

    showError(input, message) {
        this.clearError(input);
        
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = message;
        
        input.classList.add('error');
        input.parentNode.appendChild(error);
    }

    clearError(input) {
        input.classList.remove('error');
        const error = input.parentNode.querySelector('.form-error');
        if (error) {
            error.remove();
        }
    }

    validate() {
        let isValid = true;
        let firstError = null;

        this.rules.forEach((rules, name) => {
            const input = this.form.querySelector(`[name="${name}"]`) || this.form.querySelector(`#${name}`);
            if (input && !this.validateField(input)) {
                isValid = false;
                if (!firstError) {
                    firstError = input;
                }
                if (this.options.stopOnFirstError) {
                    return false;
                }
            }
        });

        if (firstError) {
            firstError.focus();
        }

        return isValid;
    }

    getErrors() {
        return Object.fromEntries(this.errors);
    }

    hasErrors() {
        return this.errors.size > 0;
    }

    clear() {
        this.errors.clear();
        const errorInputs = this.form.querySelectorAll('.error');
        errorInputs.forEach(input => this.clearError(input));
    }
}

window.NotificationsManager = NotificationsManager;
window.DragAndDrop = DragAndDrop;
window.Slider = Slider;
window.Tabs = Tabs;
window.Modal = Modal;
window.FormValidator = FormValidator;
