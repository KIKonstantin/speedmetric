import { Audit, connectDB } from '../database.js';
import { runPageSpeedAudit } from '../utils/pagespeed.js';

const normalizeUrl = (value) => {
    let parsed;
    try {
        parsed = new URL(value);
    } catch {
        parsed = new URL(`https://${value}`);
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw createError({ statusCode: 400, statusMessage: 'URL must start with http:// or https://' });
    }

    return parsed.toString();
};

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const incomingUrl = body?.url?.trim();

    if (!incomingUrl) {
        throw createError({ statusCode: 400, statusMessage: 'Missing url' });
    }

    const url = normalizeUrl(incomingUrl);

    await connectDB();
    const data = await runPageSpeedAudit(url);
    const savedAudit = await Audit.create(data);

    return {
        audit: {
            ...savedAudit.toObject({ versionKey: false }),
            _id: savedAudit._id.toString()
        }
    };
});
