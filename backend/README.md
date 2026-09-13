# Life Gym — Backend

Небольшой Node.js/Express бэкенд для приёма заявок с сайта (запись на тренировку, оплата абонемента, пробная тренировка). Заявки сохраняются в JSON-файл (`backend/data/leads.json`, без нативных зависимостей — не требует компиляции и одинаково ставится на любом сервере) и дублируются уведомлением в Telegram. Позже это можно заменить/дополнить реальной CRM — формат заявки (`source`, `name`, `phone`, `email`, `comment`, `planName`, `planDuration`, `planAmount`, `paymentMethod`, UTM-метки) уже спроектирован под это.

## Возможности

- `POST /api/leads` — приём заявки с сайта (публичный, с rate-limit 10 заявок / 10 минут с одного IP).
- `GET /api/leads` — список заявок (только с `x-admin-key`), фильтры `?source=` и `?status=`.
- `PATCH /api/leads/:id/status` — смена статуса заявки: `new` → `contacted` → `converted`/`rejected` (только с `x-admin-key`).
- `GET /api/health` — health-check.
- `/admin` — простая HTML-страница со списком заявок и сменой статуса (спрашивает admin-ключ один раз, хранит в sessionStorage).
- Уведомление в Telegram при каждой новой заявке (если заданы `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`).
- Может сам раздавать статический сайт (`index.html`, `css/`, `js/`, `images/`) — тогда фронтенд и API живут на одном домене/порту и CORS вообще не нужен.

## Локальный запуск

```bash
cd backend
npm install
cp .env.example .env
# отредактируйте .env — минимум ADMIN_API_KEY
npm run dev
```

Откройте `http://localhost:3000` — увидите сайт (если `STATIC_SITE_DIR=..` в `.env`, как по умолчанию) и `http://localhost:3000/admin` для списка заявок.

## Переменные окружения

См. [.env.example](.env.example) — там описан каждый параметр. Обязательно смените `ADMIN_API_KEY` на длинную случайную строку (`openssl rand -hex 32`).

### Настройка Telegram-уведомлений

1. Напишите [@BotFather](https://t.me/BotFather) → `/newbot` → получите токен → `TELEGRAM_BOT_TOKEN`.
2. Добавьте бота в чат/группу, куда должны падать заявки, отправьте туда любое сообщение.
3. Откройте `https://api.telegram.org/bot<TOKEN>/getUpdates`, найдите `"chat":{"id": ...}` → `TELEGRAM_CHAT_ID`.

Без этих переменных бэкенд продолжит работать и сохранять заявки в БД — просто не будет слать уведомления.

## Деплой на VPS

Пример для Ubuntu-сервера с уже установленным Node.js 18+.

```bash
# на сервере
git clone <ваш репозиторий> lifegym
cd lifegym/backend
npm install --omit=dev
cp .env.example .env
nano .env   # заполнить ADMIN_API_KEY, TELEGRAM_*, при необходимости PORT

# запуск через PM2 (держит процесс живым, автоперезапуск)
npm install -g pm2
pm2 start src/server.js --name lifegym-backend
pm2 save
pm2 startup   # выполнить команду, которую покажет pm2, чтобы автозапуск работал после reboot
```

По умолчанию (`STATIC_SITE_DIR=..`) этот же процесс раздаёт и сам сайт — то есть отдельный веб-сервер для фронтенда не нужен, только nginx как reverse proxy для HTTPS:

```nginx
server {
    listen 80;
    server_name lifegym-uralsk.kz www.lifegym-uralsk.kz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Дальше `sudo certbot --nginx -d lifegym-uralsk.kz -d www.lifegym-uralsk.kz` для бесплатного HTTPS (Let's Encrypt).

Если фронтенд вместо этого хостится отдельно (Netlify/Vercel/GitHub Pages) — поставьте `STATIC_SITE_DIR=` (пусто) в `.env`, а в `ALLOWED_ORIGINS` впишите домен фронтенда, чтобы прошёл CORS. На фронтенде тогда нужно поменять `LEAD_API_URL` в `js/main.js` на полный URL бэкенда (`https://api.lifegym-uralsk.kz/api/leads`).

## Бэкап данных

Все заявки лежат в одном файле `backend/data/leads.json` (не коммитится в git, см. `.gitignore` — там телефоны и email реальных людей). Проще всего бэкапить cron-джобой:

```bash
0 3 * * * cp /path/to/lifegym/backend/data/leads.json /path/to/backups/leads-$(date +\%F).json
```

## Путь к CRM

Когда дойдёте до реальной CRM (amoCRM, Bitrix24 и т.п.):

- Либо добавьте в `src/routes/leads.js` вызов вебхука CRM сразу после `insertLead` (по аналогии с `notifyTelegram`).
- Либо настройте в CRM импорт по расписанию через `GET /api/leads`.
- Если объём заявок вырастет настолько, что JSON-файл станет неудобен — замените реализацию функций в `src/db.js` (`insertLead`/`listLeads`/`updateLeadStatus`/...) на настоящую БД (Postgres/SQLite); остальной код их не касается, обращается только к этим функциям.

Схема заявки (`src/db.js`) уже содержит источник, контакты, тариф, способ оплаты и UTM-метки — этого обычно достаточно для маппинга в поля лида большинства CRM.
