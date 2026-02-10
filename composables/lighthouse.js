import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { connectDB, Audit } from './database.js'; // Импортираме връзката и модела

async function runAudit(url) {
    try {
        // 1. Свързваме се с MongoDB Atlas
        await connectDB();

        // 2. Стартираме Chrome
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        const options = { logLevel: 'info', output: 'json', port: chrome.port };
        
        console.log(`🚀 Стартиране на одит за: ${url}...`);
        const runnerResult = await lighthouse(url, options);
        const reportJson = runnerResult.lhr;

        // 3. Извличаме топ препоръките (Opportunities)
        const suggestions = Object.values(reportJson.audits)
            .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 1)
            .map(audit => ({
                title: audit.title,
                description: audit.description.replace(/\[Learn more\]\(.*\)\./g, ''), // Почистваме линковете
                savingsMs: audit.details.overallSavingsMs || 0,
                savingsBytes: audit.details.overallSavingsBytes || 0
            }))
            .sort((a, b) => b.savingsMs - a.savingsMs)
            .slice(0, 5); // Вземаме само топ 5

        // 4. Подготвяме документа за базата данни
        const auditData = new Audit({
            url: reportJson.finalUrl,
            performance: reportJson.categories.performance.score * 100,
            accessibility: reportJson.categories.accessibility.score * 100,
            suggestions: suggestions,
            // Добавяме и метриките, ако решиш да ги вкараш в схемата по-късно
            metrics: {
                lcp: reportJson.audits['largest-contentful-paint'].displayValue,
                tbt: reportJson.audits['total-blocking-time'].displayValue
            }
        });

        // 5. Записваме в MongoDB
        const savedAudit = await auditData.save();
        
        console.log('\n--- Одитът е завършен и записан в Atlas! ---');
        console.log(`ID на документа: ${savedAudit._id}`);
        console.log(`Performance Score: ${savedAudit.performance}`);
        console.log(`Намерени предложения: ${savedAudit.suggestions.length}`);

        await chrome.kill();
        
        // Затваряме връзката, за да не виси процеса
        process.exit(0);

    } catch (error) {
        console.error('❌ Възникна грешка:', error);
        process.exit(1);
    }
}

runAudit('https://julliany.com/');