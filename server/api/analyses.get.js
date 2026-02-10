import { Audit, connectDB } from '../database.js';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const rawLimit = Number.parseInt(query.limit, 10);
    const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 200);

    await connectDB();
    const audits = await Audit.find({}, { __v: 0 })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

    return {
        audits: audits.map((audit) => ({
            ...audit,
            _id: audit._id.toString()
        }))
    };
});
