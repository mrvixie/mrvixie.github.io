// Блоки добавлять тут
// text: код JB
// extra: Типо теги поиска по ним можно найти данный блок
// label Заголовок модатьного окна
const blocks = [
    {
        name: "банкㅤㅤㅤㅤㅤㅤㅤ ‏ внести",
        text: `{# Код для внесения денег в банк #}
{% set money = member.getAttribute('money') %}
{% require arguments.get(1) returning 'Использование: !положить <кол-во>' %}
{% require number(arguments.get(1)) returning 'Это не число' %}
{% require arguments.get(1) > 0 returning '**Вы не можете положить отрицательную сумму в банк**' %}
{% set abank = arguments.get(1) %}
{% set mbank = member.getAttribute('money').value %}
{% if mbank < abank %}
{% return '**У вас недостаточно денег на балансе**' %}
{% else %}
{% if mbank >= abank %}
{% do member.getAttribute('money').decrement(abank) %}
{% do member.getAttribute('bank').increment(abank) %}
**Вы успешно положили: *{{abank}}* монет в банк**
{% endif %}{% endif %}`,
        extra: "Данные о транзакциях и банке",
        label: "Блок 1 - Нажмите кнопку, чтобы копировать или просмотреть"
    },
    {
        text: "Пример текста для копирования из Блока 2",
        extra: "Второстепенные данные блока 2",
        label: "Блок 2 - Нажмите кнопку, чтобы копировать или просмотреть"
    },
    {
        text: "Другой пример текста для копирования из Блока 3",
        extra: "Скрытые данные блока 3",
        label: "Блок 3 - Нажмите кнопку, чтобы копировать или просмотреть"
    }
];

const container = document.getElementById('container');

// Создание блоков
blocks.forEach(block => {
    const div = document.createElement('div');
    div.className = 'block';
    div.setAttribute('data-text', block.text);
    div.setAttribute('data-name', block.name);
    div.setAttribute('data-extra', block.extra);
    div.innerHTML = `
        ${block.label}
        <br><button class="copy-button">Копировать</button>
        <button class="view-button">Просмотреть</button>
    `;
    container.appendChild(div);
});

document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function() {
        const block = button.parentElement;
        const text = block.getAttribute('data-text');
        const name = block.getAttribute('data-name')
        // Создание текстового файла
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name}.txt`;

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
