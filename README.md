# VIXIE Studio - Секретные данные

## Структура

```
assets/
├── secrets.json    # Секретные данные (приватный репозиторий)
└── config.js      # Загрузчик конфигурации
```

## Настройка

### 1. Создайте секретный репозиторий на GitHub

Создайте приватный репозиторий (например `vixie-secrets`) и добавьте туда файл `secrets.json`:

```json
{
    "admin_password": "ВАШ_РЕАЛЬНЫЙ_ПАРОЛЬ_39_СИМВОЛОВ_____ABC",
    "api_endpoint": "https://ваш-api-сервер.com"
}
```

### 2. Обновите config.js

В файле `assets/config.js` замените:
```javascript
const baseRepo = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets';
```

На ваши реальные данные:
```javascript
const baseRepo = 'https://raw.githubusercontent.com/vixie/vixie-secrets/main/assets';
```

### 3. Загрузите секреты

Загрузите `secrets.json` в приватный репозиторий и сделайте его публичным (или используйте Private Repository с правильными настройками).

### 4. Установите пароль

В файле `secrets.json` установите пароль для админ-панели (39 символов):
```
"admin_password": "abCdEfGh1234567890AbCdEfGh1234567890XyZ"
```

## Безопасность

- `secrets.json` должен быть в приватном репозитории
- URL в `config.js` можно обфусцировать через base64
- Пароль в JSON зашифрован через XOR с динамическим ключом

## Альтернатива - GitHub Gist

Если не хотите создавать репозиторий, используйте GitHub Gist:

1. Создайте секретный Gist
2. Получите его raw URL
3. Обновите `config.js`
