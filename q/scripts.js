const blocks = [
    {
        text: "Пример текста для копирования из Блока 2",
        extra: "Второстепенные данные блока 2",
        label: "Блок 2 - Нажмите ссылку, чтобы перейти",
        link: "https://example.com/block2"
    },
    {
        text: "Пример текста для копирования из Блока 2",
        extra: "Второстепенные данные блока 2",
        label: "Блок 2 - Нажмите ссылку, чтобы перейти",
        link: "https://example.com/block2"
    },
    {
        text: "Другой пример текста для копирования из Блока 3",
        extra: "Скрытые данные блока 3",
        label: "Блок 3 - Нажмите ссылку, чтобы перейти",
        link: "https://example.com/block3"
    }
];

const container = document.getElementById('container');

// Создание блоков
blocks.forEach(block => {
    const div = document.createElement('div');
    div.className = 'block';
    div.setAttribute('data-textt', block.codet || '');
    div.setAttribute('data-textd', block.coded || '');
    div.setAttribute('data-text', block.text || '');
    div.setAttribute('data-extra', block.extra || '');
    div.setAttribute('data-title', block.name || '');
    div.innerHTML = `
        ${block.label}
        <br>
        <a href="${block.link}" target="_blank" class="link-button">Перейти</a>
    `;
    container.appendChild(div);
});

// Реализация поиска по скрытым данным (data-extra)
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.block').forEach(block => {
        const text = block.getAttribute('data-text').toLowerCase();
        const extra = block.getAttribute('data-extra').toLowerCase();
        if (text.includes(query) || extra.includes(query) || query === "") {
            block.classList.remove('hidden');
        } else {
            block.classList.add('hidden');
        }
    });
});