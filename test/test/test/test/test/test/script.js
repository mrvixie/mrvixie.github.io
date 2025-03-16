// Загружаем данные из JSON и добавляем их в таблицу
fetch("data.json")
    .then(response => response.json())
    .then(data => {
        populateTable(data);
        window.data = data; // Сохраняем данные для поиска
    })
    .catch(error => console.error("Ошибка загрузки JSON:", error));

// Добавление строк в таблицу
function populateTable(data) {
    const tableBody = document.getElementById("codeTable").querySelector("tbody");
    tableBody.innerHTML = ""; // Очистка таблицы
    data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.description}</td>
            <td>
                <button class="copy-btn" onclick="openModal(event, ${index})">Подробнее</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Поиск и отображение результатов
function searchAndDisplay() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const filteredData = window.data.filter(item => 
        item.title.toLowerCase().includes(searchInput) || 
        item.description.toLowerCase().includes(searchInput)
    );
    populateTable(filteredData);
}

// Открытие модального окна под кнопкой
function openModal(event, index) {
    const modal = document.getElementById("modal");
    const button = event.target;
    const selectedItem = window.data[index];

    // Устанавливаем содержимое модального окна
    document.getElementById("modalTitle").innerText = selectedItem.title;
    document.getElementById("modalDescription").innerText = selectedItem.description;
    document.getElementById("modalImage").src = selectedItem.image;
    document.getElementById("modalCode").innerText = selectedItem.code;

    // Располагаем модальное окно под кнопкой
    const buttonRect = button.getBoundingClientRect();
    modal.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    modal.style.left = `${buttonRect.left + window.scrollX}px`;
    modal.style.display = "block";
}

// Копирование кода из модального окна
function copyModalCode() {
    const codeToCopy = document.getElementById("modalCode").innerText;
    const tempInput = document.createElement('textarea');
    tempInput.value = codeToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Код скопирован в буфер обмена!');
}

// Закрытие модального окна при клике вне
window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal");
    if (event.target !== modal && !modal.contains(event.target)) {
        modal.style.display = "none";
    }
});
