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
                <button class="copy-btn" onclick="openModal(${index})">Подробнее</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Поиск и отображение результата под кнопкой "Подробнее"
function searchAndDisplay() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const filteredData = window.data.filter(item => 
        item.title.toLowerCase().includes(searchInput) || 
        item.description.toLowerCase().includes(searchInput)
    );

    // Показываем результат под кнопкой, если найден один элемент
    const filteredResult = document.getElementById("filteredResult");
    if (filteredData.length === 1) {
        const item = filteredData[0];
        filteredResult.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <img src="${item.image}" alt="${item.title}">
            <button class="copy-btn" onclick="copyText('${item.code}')">Скопировать код</button>
        `;
        filteredResult.style.display = "block";
    } else {
        filteredResult.style.display = "none"; // Скрываем блок
    }

    // Обновляем таблицу
    populateTable(filteredData);
}

// Копирование текста
function copyText(code) {
    const tempInput = document.createElement('textarea');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Код скопирован в буфер обмена!');
}

// Открытие модального окна
function openModal(index) {
    const modal = document.getElementById("modal");
    const selectedItem = window.data[index];

    document.getElementById("modalTitle").innerText = selectedItem.title;
    document.getElementById("modalDescription").innerText = selectedItem.description;
    document.getElementById("modalImage").src = selectedItem.image;
    document.getElementById("modalCode").innerText = selectedItem.code;

    modal.style.display = "block";
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}
