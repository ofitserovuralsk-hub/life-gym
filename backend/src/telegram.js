import { config } from './config.js';

const SOURCE_LABELS = {
    'try-gym': 'Пробная тренировка',
    booking: 'Запись на тренировку',
    payment: 'Оплата абонемента',
};

export async function notifyTelegram(lead) {
    if (!config.telegramBotToken || !config.telegramChatId) return;

    const lines = [
        `🔔 Новая заявка: ${SOURCE_LABELS[lead.source] || lead.source}`,
        `Имя: ${lead.name}`,
        `Телефон: ${lead.phone}`,
    ];

    if (lead.email) lines.push(`Email: ${lead.email}`);
    if (lead.plan_name) lines.push(`Тариф/тренировка: ${lead.plan_name}`);
    if (lead.plan_duration) lines.push(`Срок/время: ${lead.plan_duration}`);
    if (lead.plan_amount) lines.push(`Сумма: ${lead.plan_amount}`);
    if (lead.payment_method) lines.push(`Способ оплаты: ${lead.payment_method}`);
    if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
    if (lead.utm_source) {
        lines.push(`UTM: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')}`);
    }
    lines.push(`ID заявки: #${lead.id}`);

    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: config.telegramChatId, text: lines.join('\n') }),
        });

        if (!response.ok) {
            console.error('Telegram notify failed:', response.status, await response.text());
        }
    } catch (err) {
        console.error('Telegram notify error:', err);
    }
}
