// Подключение blocks.js
import { blocks } from 'https://mrvixie.github.io/q/blocks.js';

// Ваш существующий код
const container = document.getElementById('container');

// Создание блоков
blocks.forEach(block => {
    const div = document.createElement('div');
    div.className = 'block';
    div.setAttribute('data-text', block.code || block.text);
    div.setAttribute('data-extra', block.extra);
    div.setAttribute('data-title', block.name);
    div.innerHTML = `
        ${block.label}
        <button class="copy-button">Копировать</button>
        <button class="view-button">Просмотреть</button>
    `;
    container.appendChild(div);
});

// Остальной код взаимодействия


document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function() {
        const block = button.parentElement;
        const text = block.getAttribute('data-text');

        // Создание текстового файла
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'copied_text.txt';

        // Запуск скачивания
        link.click();

        // Освобождение памяти
        URL.revokeObjectURL(link.href);
    });
});

document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', function() {
        const block = button.parentElement;
        const text = block.getAttribute('data-text');

        // Открытие модального окна
        document.getElementById('modal-content').textContent = text;
        document.getElementById('modal').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
    });
});

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
});

document.getElementById('modal-overlay').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
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
