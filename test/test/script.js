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
            <td><img src="${item.image}" alt="${item.title}"></td>
            <td>
                <button class="copy-btn" onclick="copyCode(${index})">Скопировать</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Копирование кода в буфер обмена
function copyCode(index) {
    const codeToCopy = window.data[index].code;
    const tempInput = document.createElement('textarea');
    tempInput.value = codeToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Код скопирован в буфер обмена!');
}

// Функция поиска
function searchTable() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const filteredData = window.data.filter(item => 
        item.title.toLowerCase().includes(searchInput) || 
        item.description.toLowerCase().includes(searchInput)
    );
    populateTable(filteredData);
}
