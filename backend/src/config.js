import 'dotenv/config';

export const config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    adminApiKey: process.env.ADMIN_API_KEY || '',
    staticSiteDir: process.env.STATIC_SITE_DIR || '',
};
