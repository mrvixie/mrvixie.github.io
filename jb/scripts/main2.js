// Массив с категориями, URL, ключевыми словами и полями Decrement
const items = [
    {
        category: "Устройство на работу",
        url: ["https://example.com/job", "https://example.com/application"],
        keywords: "устройство работа шахтёр проверка вакансии",
        codes: [
            {
                name: "Проверка устройства на работу шахтёром",
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
        url: ["https://example.com/work-termination", "https://example.com/application1"],
        keywords: "работа завершение увольнение шахтёр",
        codes: [
            {
                name: "Проверка устройства на работу шахтёром",
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
    const resultsContainer = document.getElementById("results");

    // Отображение текста по умолчанию
    function resetResults() {
        resultsContainer.innerHTML = '<p>Введите ключевое слово, URL или ссылку, чтобы начать поиск.</p>'; console.log('Введите ключевое слово, URL или ссылку, чтобы начать поиск.')
    }

    // Функция отображения результатов
    function displayResults(query) {
        const filteredItems = items.filter(item =>
            item.url.toLowerCase() === query || // Строгий поиск полного URL
            item.category.toLowerCase().includes(query) ||
            item.keywords.toLowerCase().includes(query) || // Поиск по ключевым словам
            item.codes.some(code => 
                code.name.toLowerCase().includes(query) || 
                code.decrement.toLowerCase().includes(query) || 
                code.content.toLowerCase().includes(query)
            )
        );

        resultsContainer.innerHTML = filteredItems.length > 0
            ? filteredItems.map(item => `
                <div class="block">
                    <h3>${item.category}</h3>
                    <p><strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>
                    <p><strong>Ключевые слова:</strong> ${item.keywords}</p>
                    ${item.codes.map(code => `<br>
                        <h4>${code.name}</h4>
                        <p><strong>Описание:</strong> ${code.decrement}</p>
                        <pre>${code.content}</pre>
                        <button class="copy-btn" onclick="copyToClipboard(this)">Копировать</button>
                    <br><br>`).join('')}
                </div><br>
            `).join('')
            : '<p>Ничего не найдено.</p>'; if (filteredItems.length <= 0) {const query = searchInput.value.toLowerCase().trim(); console.log('Ничего не найдено.' + '\nВы вводили в поиск: ' + query);} if (filteredItems.length > 0) {const query = searchInput.value.toLowerCase().trim(); console.log('Найдено: ' + query)}
    }

    // Функция для копирования текста в буфер обмена
    window.copyToClipboard = (button) => {
        const preElement = button.previousElementSibling.previousElementSibling; // Находим элемент <pre>
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

    // Автоматический поиск по мере ввода
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            displayResults(query);
        } else {
            resetResults();
        }
    });
});


