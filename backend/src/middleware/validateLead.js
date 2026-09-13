const VALID_SOURCES = new Set(['try-gym', 'booking', 'payment']);
const PHONE_RE = /^[\+]?7?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(req, res, next) {
    const body = req.body || {};
    const errors = [];

    if (!VALID_SOURCES.has(body.source)) {
        errors.push(`source must be one of: ${[...VALID_SOURCES].join(', ')}`);
    }
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push('name must be at least 2 characters');
    }
    if (typeof body.phone !== 'string' || !PHONE_RE.test(body.phone.trim())) {
        errors.push('phone is not a valid phone number');
    }
    if (body.email && (typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim()))) {
        errors.push('email is not valid');
    }

    if (errors.length) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}
