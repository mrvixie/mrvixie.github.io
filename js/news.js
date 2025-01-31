// Получаем шаблон модального окна
var modalTemplate = document.getElementById("modalTemplate");

// Получаем кнопку, которая открывает модальное окно
var openModalBtn = document.getElementById("openModalBtn");

// Получаем элемент <span>, который закрывает модальное окно
var closeBtn = modalTemplate.getElementsByClassName("close")[0];

// Когда пользователь нажимает на кнопку, открывается модальное окно с динамическим содержимым
openModalBtn.onclick = function() {
  var title = this.getAttribute("data-title");
  var imgSrc = this.getAttribute("data-img");
  var description = this.getAttribute("data-description");

  modalTemplate.getElementsByClassName("modal-title")[0].innerText = title;
  modalTemplate.getElementsByClassName("modal-img")[0].src = imgSrc;
  modalTemplate.getElementsByClassName("modal-description")[0].innerText = description;

  modalTemplate.style.display = "block";
}

// Когда пользователь нажмет на <span> (x), закрывается модальное окно
closeBtn.onclick = function() {
  modalTemplate.style.display = "none";
}

// Когда пользователь нажимает в любом месте за пределами модального окна, закройте его
window.onclick = function(event) {
  if (event.target == modalTemplate) {
    modalTemplate.style.display = "none";
  }
}
