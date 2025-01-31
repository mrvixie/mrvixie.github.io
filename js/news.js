/*
THIS CODE BY zoliryzik
*/
const boxProducts = document.getElementById("news");
/*
ЗАПОЛНИТЕЛИ УСЛУГ 
*/

const p1 = [
    {
        "TITLE": "ПК диагностика",
        "LORE": "Компьютерная диагностика автомобиля, адаптация дросселя и др.",
        "SUM": "от 500 ₽",
        "IMG": "img/products/1.jpg",
        "TEXTBTN": "Подробнее",
        "URLBTN": "./index.html",
        "IDBTN": "myBtn",  
    }
]
const owner = [
    {
        "name": "ZoLiryzik and MrVixie",
        "URL": "https://zoliryzik.github.io",
        "SUM": "от 500 ₽",
        "IMG": "img/products/pustota.png",
        "TEXTBTN": "Подробнее",
        "URLBTN": "./index.html",
    }
]
/*
Добавление баннеров 
*/
for (let indexOne = 0; indexOne < p1.length; indexOne++) {
/* 
Переменные зависят от Кол-ва баннеров
*/
    const elementProduct = p1[indexOne];


    
    const elementowner = owner[indexOne];   
/*
Вывод в консоли
*/
    console.log('Site by '+elementowner.name +' for ExpressAuto\nЛичный сайт: ' + elementowner.URL );
/*
ВЫВОД УСЛУГ НЕ ТРОГАТЬ 
*/  
            const p11 = "    <div class='container'><div class='card'><figure class='card__poster'><img class='card-poster__image' src='"+elementProduct.IMG+"?w=800&amp;h=500&amp;fit=crop' alt='poster'></figure><div class='card__databox'><h3 class='card-databox__heading'>"+ elementProduct.TITLE +"</h3><div class='card-databox__description'>"+ elementProduct.LORE +"</div><div class='card-databox__description'><h1>"+elementProduct.SUM+"</h1></div><button class='button' id="+elementProduct.IDBTN+">"+ elementProduct.TEXTBTN +"</button></div></div>"
            

            boxProducts.innerHTML += p11;
}
