# Life Gym Website

Современный, production-ready сайт для премиального спортивного зала Life Gym в Уральске.

## 🎨 Brand Design

**Цветовая палитра:**
- Основной черный: `#000000`
- Основной белый: `#FFFFFF` 
- Акцентный красный: `#E60000`

**Типографика:**
- Шрифт: Inter (Google Fonts)
- Стиль: Заглавные, рубленые, современные
- Веса: 300-900

**Визуальный стиль:**
- Premium / Sport
- Минималистичный, но смелый
- Высокий контраст
- Профессиональный и энергичный

## 📁 Структура проекта

```
lifegym/
├── index.html              # Главная страница
├── css/
│   ├── main.css           # Основные стили
│   └── responsive.css     # Адаптивные стили
├── js/
│   └── main.js            # JavaScript функционал
├── data/
│   └── content.json       # Контент сайта (для легкого редактирования)
├── images/                # Папка для изображений
└── logo.jpg              # Логотип
```

## 🚀 Быстрый старт

### Локальный запуск

Просто откройте `index.html` в браузере:

```bash
# На macOS
open index.html

# На Windows
start index.html

# На Linux
xdg-open index.html
```

### Локальный сервер (рекомендуется)

Для лучшего опыта используйте локальный сервер:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (если установлен)
npx serve

# PHP
php -S localhost:8000
```

Затем откройте `http://localhost:8000` в браузере.

## 📝 Редактирование контента

### Основные изменения

Большинство контента можно редактировать непосредственно в `index.html`.

### Структурированные данные

Для легкого редактирования текстового контента используйте `data/content.json`:

```json
{
  "gym": {
    "name": "Life Gym",
    "tagline": "1300м² спорта и комфорта"
  },
  "contact": {
    "address": "Уральск, мкр. Женис 1А",
    "phone": "+7 (XXX) XXX-XX-XX"
  }
}
```

### Изображения

Изображения уже интегрированы в сайт! Все фотографии загружены из Unsplash (бесплатные стоковые фото):

**Установленные изображения:**
- `hero-bg.jpg` - Фон hero секции
- `about-main.jpg` - Фото в секции "О зале"
- `gallery-*.jpg` - 8 фотографий для галереи
- `trainer-*.jpg` - 4 фотографии тренеров
- `map-placeholder.jpg` - Заглушка для карты

**Для замены на реальные фото зала:**
1. Поместите реальные фотографии в папку `images/`
2. Замените соответствующие файлы, сохранив те же имена
3. Или обновите пути в `index.html`

**Примечание:** Все текущие изображения — бесплатные стоковые фото с Unsplash. Для production версии рекомендуется заменить на реальные фотографии вашего зала.

### Цены

Найдите секцию `#prices` в `index.html` и замените placeholder-ы цен:

```html
<div class="pricing-price">
    <span class="pricing-amount">15 000 ₸</span>
</div>
```

### Телефон

Вставлен демо-номер `+7 (711) 123-45-67`. Замените на реальный:

```html
<p class="contact-text">+7 (711) 123-45-67</p>
```

Найдите и замените в двух местах:
1. Секция "Контакты" (строка ~513)
2. Footer (строка ~592)

## 🎯 Секции сайта

1. **Hero** - Главный экран с призывом к действию
2. **О зале** - Концепция и статистика
3. **Услуги** - Направления тренировок
4. **Преимущества** - Ключевые конкурентные преимущества
5. **Галерея** - Фотографии зала (асимметричная сетка)
6. **Тренеры** - Команда тренеров
7. **Цены** - Абонементы и услуги
8. **Отзывы** - Отзывы клиентов
9. **Instagram** - Интеграция с Instagram
10. **Контакты** - Адрес, карта, телефон
11. **Footer** - Навигация и контакты

## 🔧 Технические особенности

### CSS
- CSS Variables для легкой кастомизации
- Mobile-first подход
- Flexbox и Grid layouts
- Smooth animations и transitions
- Оптимизированная производительность

### JavaScript
- Mobile menu
- Smooth scroll
- Scroll animations (Intersection Observer)
- Active navigation state
- Accessibility improvements
- Performance optimizations

### SEO
- Semantic HTML5
- Meta tags
- Open Graph metadata
- Proper heading hierarchy
- Alt text placeholders

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus states
- Reduced motion support
- High contrast mode support

## 📱 Адаптивность

Сайт полностью адаптивен и поддерживает:

- 📱 Mobile (< 576px)
- 📱 Tablet (576px - 992px)
- 💻 Desktop (992px - 1200px)
- 🖥️ Large Desktop (> 1200px)

## 🎨 Кастомизация

### Изменение цветов

Отредактируйте CSS переменные в `css/main.css`:

```css
:root {
    --color-red: #E60000;        /* Основной акцентный цвет */
    --color-black: #000000;      /* Основной черный */
    --color-white: #FFFFFF;      /* Основной белый */
}
```

### Изменение шрифтов

Замените Google Fonts в `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

И обновите в `css/main.css`:

```css
:root {
    --font-family: 'Your Font', sans-serif;
}
```

## 📊 Placeholder-ы

Следующие элементы помечены как placeholder-ы и требуют замены на реальные данные:

- Телефон: `+7 (XXX) XXX-XX-XX`
- Цены: `Уточнить`
- Отзывы: Имена клиентов
- Изображения: Все placeholder-изображения
- Карта: Placeholder карты

## 🔍 SEO Optimization

### Meta tags
Убедитесь, что мета-теги в `index.html` содержат актуальную информацию:

```html
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
```

### Local SEO
Для лучшего локального поиска:

1. Добавьте бизнес в Google My Business
2. Включите адрес и телефон в footer
3. Добавьте schema.org разметку (опционально)

## 🚀 Deployment

### Static hosting
Сайт можно развернуть на любом статическом хостинге:

- **Netlify**: Drag & drop папку
- **Vercel**: Import project
- **GitHub Pages**: Push и настройка
- **Firebase Hosting**: `firebase deploy`

### Custom domain
После деплоя настройте custom domain в DNS настройках хостинга.

## 📈 Performance

Сайт оптимизирован для производительности:

- Минимальный CSS (без фреймворков)
- Оптимизированный JavaScript
- Lazy loading для изображений
- Debounced scroll handlers
- CSS animations вместо JS где возможно

## 🛠️ Browser Support

- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 TODO перед запуском

- [x] Заменить все placeholder-ы изображений на реальные фото ✅
- [x] Обновить телефон на реальный номер ✅ (использован демо-номер)
- [ ] Указать реальные цены
- [ ] Заменить placeholder-ы отзывов на реальные
- [ ] Интегрировать реальную карту (Google Maps)
- [ ] Добавить аналитику (Google Analytics и т.д.)
- [ ] Настроить форму заявки (если нужна)
- [ ] Проверить все ссылки
- [ ] Тестировать на реальных устройствах
- [ ] Оптимизировать изображения

## 📞 Контакты для изменений

Для изменения контента свяжитесь с администратором или отредактируйте файлы напрямую.

---

**Создано с ❤️ для Life Gym Uralsk**