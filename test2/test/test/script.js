// Загружаем данные из JSON и добавляем их в таблицу
fetch("data.json")
    .then(response => response.json())
    .then(data => {
        populateTable(data);
        window.data = data; // Сохраняем данные
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
                <button id="btn-${index}" class="copy-btn" onclick="openModal(${index})">Подробнее</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Открытие модального окна
function openModal(index) {
    const modal = document.getElementById("modal");
    const selectedItem = window.data[index];

    // Устанавливаем содержимое модального окна
    document.getElementById("modalTitle").innerText = selectedItem.title;
    document.getElementById("modalDescription").innerText = selectedItem.description;
    document.getElementById("modalImage").src = selectedItem.image;
    document.getElementById("modalCode").innerText = selectedItem.code;

    modal.classList.remove("hidden");
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
    if (!modal.contains(event.target) && !event.target.classList.contains("copy-btn")) {
        modal.classList.add("hidden");
    }
});