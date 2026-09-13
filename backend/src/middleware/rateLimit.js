import rateLimit from 'express-rate-limit';

export const leadsRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много заявок с этого адреса. Попробуйте позже.' },
});
