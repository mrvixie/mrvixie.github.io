// Загружаем данные из JSON и добавляем их в таблицу
fetch("data.json")
    .then(response => response.json())
    .then(data => populateTable(data))
    .catch(error => console.error("Ошибка загрузки JSON:", error));

// Добавление строк в таблицу
function populateTable(data) {
    const tableBody = document.getElementById("codeTable").querySelector("tbody");
    data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.description}</td>
            ${item.code}
            <td><button class="copy-btn" onclick="copyCode('code${index}')">Скопировать</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Копирование кода в буфер обмена
function copyCode(id) {
    const codeElement = document.getElementById(id);
    const tempInput = document.createElement('textarea');
    tempInput.value = codeElement.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Код скопирован в буфер обмена!');
}
