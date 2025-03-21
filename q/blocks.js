const blocks = [
    {
        name: 'bank_vn',
        code: `{# Код для внесения денег в банк #}
{% set money = member.getAttribute('money') %}
{% require arguments.get(1) returning 'Использование: !положить <кол-во>' %}
{% require number(arguments.get(1)) returning 'Это не число' %}
{% require arguments.get(1) > 0 returning '**Вы не можете положить отрицательную сумму в банк**' %}
{% set abank = arguments.get(1) %}
{% set mbank = member.getAttribute('money').value %}
{% if mbank < abank %}
{% return '**У вас недостаточно денег на балансе**' %}
{% else %}
{% if mbank >= abank %}
{% do member.getAttribute('money').decrement(abank) %}
{% do member.getAttribute('bank').increment(abank) %}
**Вы успешно положили: *{{abank}}* монет в банк**
{% endif %}{% endif %}`,
        extra: "Данные о транзакциях и банке",
        label: "Блок 1 - Нажмите кнопку, чтобы копировать или просмотреть"
    },
    {
        text: "Пример текста для копирования из Блока 2",
        extra: "Второстепенные данные блока 2",
        label: "Блок 2 - Нажмите кнопку, чтобы копировать или просмотреть"
    },
    {
        text: "Другой пример текста для копирования из Блока 3",
        extra: "Скрытые данные блока 3",
        label: "Блок 3 - Нажмите кнопку, чтобы копировать или просмотреть"
    }
];
