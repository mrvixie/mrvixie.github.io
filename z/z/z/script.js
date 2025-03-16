let guides = [];

fetch('guides.json')
  .then(response => response.json())
  .then(data => {
    guides = data;
    renderGuides();
  })
  .catch(error => console.error('Ошибка загрузки JSON:', error));

function renderGuides() {
  const container = document.getElementById('guide-container');
  container.innerHTML = ''; // Очистка перед рендерингом

  guides.forEach((guide, index) => {
    const guideElement = document.createElement('article');
    guideElement.className = 'guide';
    guideElement.setAttribute('data-title', guide.title.toLowerCase());
    
    guideElement.innerHTML = `
      <h2>${guide.description}</h2>
      <pre><code id="code-snippet-${index}">${guide.code}</code></pre>
      <button onclick="copyToClipboard('code-snippet-${index}')">Скопировать код</button>
    `;
    container.appendChild(guideElement);
  });
}

function copyToClipboard(id) {
  const codeElement = document.getElementById(id);
  const text = codeElement.innerText;

  navigator.clipboard.writeText(text).then(() => {
    alert('Код скопирован!');
  }).catch(err => {
    console.error('Ошибка копирования', err);
  });
}

function filterGuides() {
  const searchInput = document.getElementById('search-bar').value.toLowerCase();
  const guideElements = document.querySelectorAll('.guide');

  guideElements.forEach(guide => {
    const title = guide.getAttribute('data-title');
    guide.style.display = title.includes(searchInput) ? '' : 'none';
  });
}
