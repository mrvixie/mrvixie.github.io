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
            <td>
                <a href="${item.code}" target="_blank" class="link-btn">Перейти</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Фильтрация строк таблицы по поисковому запросу
document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const rows = document.querySelectorAll("#codeTable tbody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const matches = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(query));
        row.style.display = matches ? "" : "none";
    });
});