// Массив с категориями, URL, ключевыми словами и полями Decrement
const items = [
    {
        category: "Устройство на работу",
        url: "https://example.com/job",
        codes: [
            {
                name: "Проверка устройства на работу шахтёром",
                keywords: "устройство работа шахтёр проверка",
                decrement: "Уменьшение доступных вакансий на 1 после устройства.",
                content: `{% if member.getAttribute('miner') == '1' %}
Вы уже устроены на работу шахтёром
{% else %} 
{% do member.getAttribute('commands').increment(1) %}
{% do member.getAttribute('miner').increment(1) %}
Вы успешно устроились на работу шахтёром
{% endif %}`
            },
            {
                name: "Работа шахтёром в шахте",
                keywords: "шахтёр работа шахта заработок",
                decrement: "Списание энергии на выполнение шахтёрских задач.",
                content: `{% if member.getAttribute('miner') == '1' %}
{% set rand2 = random(10, 110) %}
{% do member.getAttribute('money').increment(rand2) %}
Вы успешно заработали {{rand2}} монет в шахте!
{% else %}
Вы не работаете
{% endif %}`
            },
            {
                name: "Увольнение с работы шахтёром",
                keywords: "увольнение шахтёр работа",
                decrement: "Обнуление статуса шахтёра.",
                content: `{% if member.getAttribute('miner') == 0 %}
{% return "**Вы не устроены на работу шахтёром**" %}
{% else %} 
{% do member.getAttribute('miner').update(0) %}
Вы успешно уволились с работы шахтёр 
{% endif %}`
            }
        ]
    },
    {
        category: "Работа и увольнение",
        url: "https://example.com/work-termination",
        codes: [
            {
                name: "Проверка устройства на работу шахтёром",
                keywords: "устройство проверка шахтёр",
                decrement: "Уменьшение вакансий шахтёров после устройства.",
                content: `{% if member.getAttribute('miner') == '1' %}
Вы уже устроены на работу шахтёром
{% else %} 
{% do member.getAttribute('commands').increment(1) %}
{% do member.getAttribute('miner').increment(1) %}
Вы успешно устроились на работу шахтёром
{% endif %}`
            },
            {
                name: "Работа шахтёром в шахте",
                keywords: "шахта работа шахтёр деньги",
                decrement: "Списание ресурсов на выполнение работы в шахте.",
                content: `{% if member.getAttribute('miner') == '1' %}
{% set rand2 = random(10, 110) %}
{% do member.getAttribute('money').increment(rand2) %}
Вы успешно заработали {{rand2}} монет в шахте!
{% else %}
Вы не работаете
{% endif %}`
            },
            {
                name: "Увольнение с работы шахтёром",
                keywords: "увольнение работа завершение шахтёр",
                decrement: "Обнуление количества задействованных работников.",
                content: `{% if member.getAttribute('miner') == 0 %}
{% return "**Вы не устроены на работу шахтёром**" %}
{% else %} 
{% do member.getAttribute('miner').update(0) %}
Вы успешно уволились с работы шахтёр 
{% endif %}`
            }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.querySelector(".close");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resultsContainer = document.getElementById("results");

    // Отображение текста по умолчанию
    function resetResults() {
        resultsContainer.innerHTML = '<p>Введите ключевое слово или ссылку, чтобы начать поиск.</p>';
    }

    // Функция отображения результатов
    function displayResults(query) {
        const filteredItems = items.filter(item =>
            item.category.toLowerCase().includes(query) ||
            item.codes.some(code => 
                code.name.toLowerCase().includes(query) || 
                code.keywords.toLowerCase().includes(query) || 
                code.content.toLowerCase().includes(query) || 
                code.decrement.toLowerCase().includes(query)
            )
        );

        resultsContainer.innerHTML = filteredItems.length > 0
            ? filteredItems.map(item => `
                <div class="block">
                    <h3>${item.category}</h3>
                    <p><strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>
                    ${item.codes.map(code => `
                        <h4>${code.name}</h4>
                        <p><strong>Ключевые слова:</strong> ${code.keywords}</p>
                        <p><strong>Decrement:</strong> ${code.decrement}</p>
                        <pre>${code.content}</pre>
                        <button class="copy-btn" onclick="copyToClipboard(this)">Копировать</button>
                    `).join('')}
                </div>
            `).join('')
            : '<p>Ничего не найдено.</p>';
    }

    // Функция для копирования текста в буфер обмена
    window.copyToClipboard = (button) => {
        const preElement = button.previousElementSibling.previousElementSibling.previousElementSibling; // Находим элемент <pre>
        const textToCopy = preElement.textContent;

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Текст успешно скопирован!");
        }).catch(err => {
            alert("Ошибка копирования: " + err);
        });
    };

    // Открытие модального окна
    openModal.addEventListener("click", () => {
        modal.style.display = "block";
        resetResults(); // Устанавливаем начальный текст
    });

    // Закрытие модального окна
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Событие поиска
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            displayResults(query);
        } else {
            resetResults();
        }
    });
});
