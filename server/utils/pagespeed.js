const cleanDescription = (description = '') =>
    description.replace(/\[Learn more\]\(.*?\)\.?/g, '').trim();

const scoreToPercent = (score) =>
    typeof score === 'number' ? Math.round(score * 100) : null;

export const runPageSpeedAudit = async (url) => {
    const config = useRuntimeConfig();
    const query = {
        url,
        strategy: 'mobile',
        category: ['performance', 'accessibility']
    };

    if (config.pagespeedApiKey || process.env.PAGESPEED_API_KEY) {
        query.key = config.pagespeedApiKey || process.env.PAGESPEED_API_KEY;
    }

    const response = await $fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
        query
    });

    const report = response?.lighthouseResult;
    if (!report) {
        throw createError({ statusCode: 502, statusMessage: 'Invalid response from PageSpeed API' });
    }

    const suggestions = Object.values(report.audits || {})
        .filter((audit) => audit?.details?.type === 'opportunity' && typeof audit?.score === 'number' && audit.score < 1)
        .map((audit) => ({
            title: audit.title,
            description: cleanDescription(audit.description),
            savingsMs: audit.details?.overallSavingsMs || 0,
            savingsBytes: audit.details?.overallSavingsBytes || 0
        }))
        .sort((a, b) => b.savingsMs - a.savingsMs)
        .slice(0, 5);

    return {
        url: report.finalUrl,
        performance: scoreToPercent(report.categories?.performance?.score),
        accessibility: scoreToPercent(report.categories?.accessibility?.score),
        suggestions,
        metrics: {
            lcp: report.audits?.['largest-contentful-paint']?.displayValue || null,
            tbt: report.audits?.['total-blocking-time']?.displayValue || null
        }
    };
};
