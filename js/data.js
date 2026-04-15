const AppData = {
    profile: {
        name: "VIXIE",
        fullName: "Виктор",
        age: 19,
        role: "Developer & Designer",
        location: "Россия",
        timezone: "UTC+3",
        status: "online",
        bio: function() {
            return `Привет! Меня зовут **${this.name}**, мне ${this.age} лет, и я увлекаюсь дизайном, созданием ботов и сайтов. Ранее я занимался программированием в **Juniper Bot**, а сейчас планирую делать видеоролики-гайды по Juniper на моем YouTube канале **ZoLiryzik**.`;
        },
        social: {
            discord: "vixie#0001",
            telegram: "@vixie_dev",
            youtube: "@ZoLiryzik",
            github: "mrvixie"
        }
    },

    skills: [
        { name: "Python", level: 95, icon: "python", color: "#3776AB" },
        { name: "JavaScript", level: 88, icon: "javascript", color: "#F7DF1E" },
        { name: "Discord.js", level: 92, icon: "discord", color: "#5865F2" },
        { name: "HTML/CSS", level: 90, icon: "html", color: "#E34F26" },
        { name: "UI/UX Дизайн", level: 85, icon: "design", color: "#dc2626" },
        { name: "Figma", level: 82, icon: "figma", color: "#F24E1E" },
        { name: "React", level: 75, icon: "react", color: "#61DAFB" },
        { name: "Node.js", level: 78, icon: "nodejs", color: "#339933" },
        { name: "SQL", level: 70, icon: "database", color: "#4479A1" },
        { name: "Git", level: 85, icon: "git", color: "#F05032" }
    ],

    timeline: [
        { year: 2024, title: "Основание VIXIE Studio", description: "Запуск собственной студии разработки" },
        { year: 2023, title: "Juniper Bot Team", description: "Работа в команде разработки Juniper Bot" },
        { year: 2022, title: "YouTube канал", description: "Запуск канала ZoLiryzik с гайдами" },
        { year: 2021, title: "Первые проекты", description: "Начало карьеры фрилансера" },
        { year: 2019, title: "Начало пути", description: "Первые шаги в программировании" }
    ],

    services: [
        {
            id: 1,
            title: "Разработка Discord ботов",
            description: "Создание многофункциональных Discord ботов с использованием discord.js, Python или других технологий.",
            price: "от 3 000 ₽",
            features: [
                "Настройка команд и slash-команд",
                "Система модерации",
                "Автоматизация процессов",
                "Интеграция с API",
                "База данных"
            ],
            icon: "bot",
            popular: true
        },
        {
            id: 2,
            title: "Веб-дизайн",
            description: "Создание уникального и современного дизайна для вашего сайта или веб-приложения.",
            price: "от 5 000 ₽",
            features: [
                "UI/UX дизайн",
                "Адаптивная вёрстка",
                "Интерактивные элементы",
                "Анимации и переходы",
                "Figma макеты"
            ],
            icon: "design"
        },
        {
            id: 3,
            title: "UI/UX Дизайн",
            description: "Проектирование пользовательских интерфейсов для мобильных и веб-приложений.",
            price: "от 7 000 ₽",
            features: [
                "Исследование пользователей",
                "Прототипирование",
                "Дизайн интерфейса",
                "Дизайн-система",
                "Документация"
            ],
            icon: "ui"
        },
        {
            id: 4,
            title: "Разработка Telegram ботов",
            description: "Создание умных Telegram ботов для автоматизации и бизнеса.",
            price: "от 2 500 ₽",
            features: [
                "Команды и inline-режим",
                "Оплата через бот",
                "Админ-панель",
                "Рассылки",
                "Интеграции"
            ],
            icon: "telegram"
        },
        {
            id: 5,
            title: "Консультация",
            description: "Помощь в решении технических вопросов и советы по вашему проекту.",
            price: "от 1 500 ₽/час",
            features: [
                "Аудит кода",
                "Оптимизация",
                "Архитектура",
                "Технические советы",
                "Code review"
            ],
            icon: "consultation"
        },
        {
            id: 6,
            title: "Создание логотипа",
            description: "Разработка уникального логотипа для вашего бренда или проекта.",
            price: "от 2 000 ₽",
            features: [
                "Уникальный дизайн",
                "Несколько вариантов",
                "Исходные файлы",
                "Разные форматы",
                "Брендбук"
            ],
            icon: "logo"
        }
    ],

    portfolio: [
        {
            id: 1,
            title: "ZoLiryzik",
            category: "bot",
            description: "YouTube канал с гайдами по Juniper Bot и разработке Discord ботов",
            image: "zoliryzik.jpg",
            link: "#",
            featured: true
        },
        {
            id: 2,
            title: "Fatory Server",
            category: "design",
            description: "Дизайн Discord сервера для игрового сообщества",
            image: "fatory.jpg",
            link: "#"
        },
        {
            id: 3,
            title: "ModBot Pro",
            category: "bot",
            description: "Продвинутый бот для модерации с AI функциями",
            image: "modbot.jpg",
            link: "#"
        },
        {
            id: 4,
            title: "Portfolio Website",
            category: "web",
            description: "Персональный сайт-портфолио для дизайнера",
            image: "portfolio.jpg",
            link: "#"
        },
        {
            id: 5,
            title: "Music Dashboard",
            category: "web",
            description: "Веб-панель управления музыкальным ботом",
            image: "music.jpg",
            link: "#"
        },
        {
            id: 6,
            title: "Game Store UI",
            category: "design",
            description: "Интерфейс магазина игровых аккаунтов",
            image: "store.jpg",
            link: "#"
        }
    ],

    shop: [
        {
            id: 1,
            title: "Discord бот \"Moderator\"",
            category: "bots",
            description: "Готовый бот для модерации с настраиваемыми командами",
            price: 2990,
            oldPrice: 4990,
            image: "mod-bot.jpg",
            badge: "Хит продаж",
            features: ["50+ команд", "AutoMod", "Логи", "Ticket система"]
        },
        {
            id: 2,
            title: "Шаблон портфолио",
            category: "templates",
            description: "Современный шаблон сайта-портфолио на HTML/CSS/JS",
            price: 1490,
            image: "portfolio-template.jpg",
            features: ["Адаптивный", "Тёмная тема", "Анимации", "Легко настроить"]
        },
        {
            id: 3,
            title: "Набор иконок (500+)",
            category: "assets",
            description: "Коллекция современных иконок для интерфейсов",
            price: 990,
            image: "icons.jpg",
            features: ["SVG формат", "Разные стили", "Figma файл", "PNG набор"]
        },
        {
            id: 4,
            title: "Курс по Discord.js",
            category: "courses",
            description: "Видеокурс по созданию Discord ботов с нуля",
            price: 4990,
            oldPrice: 7990,
            image: "discord-course.jpg",
            badge: "Новинка",
            features: ["20+ уроков", "Исходный код", "Поддержка", "Сертификат"]
        },
        {
            id: 5,
            title: "Telegram бот \"Shop\"",
            category: "bots",
            description: "Бот для интернет-магазина с корзиной и оплатой",
            price: 3990,
            image: "shop-bot.jpg",
            features: ["Каталог товаров", "Корзина", "Оплата", "Админка"]
        },
        {
            id: 6,
            title: "UI Kit \"Neon\"",
            category: "assets",
            description: "Компоненты интерфейса в неоновом стиле",
            price: 1990,
            image: "neon-kit.jpg",
            features: ["Figma", "100+ компонентов", "Тёмная тема", "Анимации"]
        }
    ],

    blog: [
        {
            id: 1,
            title: "Как создать Discord бота за 10 минут",
            category: "Tutorial",
            excerpt: "Пошаговое руководство по созданию простого Discord бота с использованием discord.js",
            content: "В этой статье мы разберём...",
            image: "bot-tutorial.jpg",
            date: "2024-03-15",
            author: "VIXIE",
            readTime: "10 мин",
            featured: true
        },
        {
            id: 2,
            title: "Топ-10 плагинов для Figma",
            category: "Design",
            excerpt: "Обзор лучших плагинов, которые ускорят вашу работу в Figma",
            content: "Figma - это мощный инструмент...",
            image: "figma-plugins.jpg",
            date: "2024-03-10",
            author: "VIXIE",
            readTime: "5 мин"
        },
        {
            id: 3,
            title: "Оптимизация кода Python",
            category: "Programming",
            excerpt: "Практические советы по улучшению производительности Python кода",
            content: "Python - отличный язык...",
            image: "python-opt.jpg",
            date: "2024-03-05",
            author: "VIXIE",
            readTime: "8 мин"
        },
        {
            id: 4,
            title: "Тренды веб-дизайна 2024",
            category: "Design",
            excerpt: "Какие стили и технологии будут популярны в веб-дизайне в этом году",
            content: "Дизайн постоянно меняется...",
            image: "web-trends.jpg",
            date: "2024-02-28",
            author: "VIXIE",
            readTime: "7 мин"
        }
    ],

    juniper: [
        {
            id: 1,
            title: "Настройка Juniper Bot",
            type: "video",
            description: "Полное руководство по настройке Juniper Bot на вашем Discord сервере",
            content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            command: "!juniper setup",
            date: "2024-03-12"
        },
        {
            id: 2,
            title: "Система модерации",
            type: "article",
            description: "Как настроить автоматическую модерацию с помощью Juniper",
            content: "Автоматическая модерация...",
            command: "!mod enable",
            date: "2024-03-08"
        },
        {
            id: 3,
            title: "Настройка приветствий",
            type: "article",
            description: "Создание красивых приветственных сообщений",
            content: "Приветственные сообщения...",
            command: "!welcome set",
            date: "2024-03-01"
        },
        {
            id: 4,
            title: "Создание ролей",
            type: "article",
            description: "Автоматическое управление ролями участников",
            content: "Система ролей...",
            command: "!role create",
            date: "2024-02-25"
        }
    ],

    commands: [
        { command: "!juniper setup", description: "Настройка бота на сервере" },
        { command: "!mod enable", description: "Включение модерации" },
        { command: "!welcome set [сообщение]", description: "Настройка приветствия" },
        { command: "!ticket create", description: "Создание тикета" },
        { command: "!level enable", description: "Включение системы уровней" },
        { command: "!music play [url]", description: "Воспроизведение музыки" },
        { command: "!economy balance", description: "Проверить баланс" },
        { command: "!poll create", description: "Создать опрос" }
    ],

    gallery: [
        { id: 1, title: "Discord Server Design", category: "Design", image: "gallery/1.jpg" },
        { id: 2, title: "Bot Dashboard", category: "Web", image: "gallery/2.jpg" },
        { id: 3, title: "Mobile App UI", category: "UI/UX", image: "gallery/3.jpg" },
        { id: 4, title: "Landing Page", category: "Web", image: "gallery/4.jpg" },
        { id: 5, title: "Logo Collection", category: "Branding", image: "gallery/5.jpg" },
        { id: 6, title: "E-commerce Design", category: "Web", image: "gallery/6.jpg" },
        { id: 7, title: "Game Interface", category: "Gaming", image: "gallery/7.jpg" },
        { id: 8, title: "Dashboard Dark", category: "Web", image: "gallery/8.jpg" }
    ],

    orders: [],

    cart: {
        items: [],
        total: 0
    },

    settings: {
        siteName: "VIXIE Studio",
        siteDescription: "Найди что-нибудь для себя",
        discordLink: "https://discord.gg/example",
        youtubeLink: "https://youtube.com/@zoliryzik",
        telegramLink: "https://t.me/vixie_dev"
    }
};

window.AppData = AppData;
