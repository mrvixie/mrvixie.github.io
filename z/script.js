// Загрузка данных из JSON
document.addEventListener("DOMContentLoaded", loadCodes);

function loadCodes() {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const codeList = document.getElementById('codeList');
            data.codes.forEach(code => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><strong>${code.title}</strong> - ${code.description}</span>
                    <button onclick="showModal('${code.title}', '${code.description}', '${code.code.replace(/'/g, "\\'")}')">Действие</button>
                `;
                codeList.appendChild(li);
            });
        })
        .catch(error => console.error('Ошибка загрузки JSON:', error));
}

// Отображение модального окна
function showModal(title, description, code) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = description;
    document.getElementById('modalCode').innerText = code;
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

// Копирование кода в буфер обмена
function copyCode() {
    const codeText = document.getElementById('modalCode').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        alert('Код скопирован!');
    });
}

// Предпросмотр кода в новом окне
function previewCode() {
    const codeText = document.getElementById('modalCode').innerText;
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`<pre>${codeText}</pre>`);
    previewWindow.document.title = 'Предпросмотр кода';
    previewWindow.document.close();
}

// Фильтрация списка кодов
function filterCodes() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const codeList = document.getElementById('codeList').getElementsByTagName('li');

    for (let item of codeList) {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(searchInput) ? '' : 'none';
    }
}
