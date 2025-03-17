const blocks = [
    {
        codet: 'Заголовок',
        coded: 'Описание',
        name: 'bank_vn',
        code: `{# Код для внесения денег в банк #}
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
    div.setAttribute('data-textt', block.codet);
    div.setAttribute('data-textd', block.coded);
    div.setAttribute('data-text', block.code || block.text);
    div.setAttribute('data-extra', block.extra || '');
    div.setAttribute('data-title', block.name || '');
    div.innerHTML = `
        ${block.label}
        <br>
        <button class="copy-button">Скачать</button>
        <button class="view-button">Просмотреть</button>
    `;
    container.appendChild(div);
});

// Обработчик для кнопок "Копировать"
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const block = button.parentElement;
        const text = block.getAttribute('data-textt') + '\n\n' + block.getAttribute('data-textd') + '\n\n' + block.getAttribute('data-text') + '\n\nDeliVix © Mr_Vixie & ZoLiryzik';
        const title = block.getAttribute('data-title');

        // Создание текстового файла
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `code_jb_${title}_.txt`;

        // Запуск скачивания
        link.click();

        // Освобождение памяти
        URL.revokeObjectURL(link.href);
    });
});

// Обработчик для кнопок "Просмотреть"
document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', () => {
        const block = button.parentElement;
        const textContent = block.getAttribute('data-text');
        const textt = block.getAttribute('data-textt');
        const textd = block.getAttribute('data-textd');
        // Проверяем, что текст есть
        if (textContent) {
            // Создаем новую вкладку
            const newTab = window.open('', '_blank');

            if (newTab) {
                // Оформляем содержимое новой страницы #f4f4f4
                const pageTemplate = `
                    <!DOCTYPE html>
                    <html lang="ru">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Содержимое блока</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                                line-height: 1.6;
                            }
                            pre {
                                background: #000000;
                                padding: 15px;
                                border: 1px solid #ccc;
                                overflow-x: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Содержимое блока</h1>
                        <h2>${textt}</h2>
                        <h2>${textd}</h2>
                        <pre>${textContent}</pre>
                    </body>
                    </html>
                `;

                // Записываем содержимое и закрываем документ
                newTab.document.write(pageTemplate);
                newTab.document.close();
            } else {
                alert('Браузер заблокировал открытие новой вкладки.');
            }
        } else {
            alert('Нет данных для отображения.');
        }
    });
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
