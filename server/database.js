import mongoose from 'mongoose';

const defaultMongoUri = 'mongodb+srv://admin:admin123!@analizator.rd29ktb.mongodb.net/';

export const connectDB = async () => {
    const config = useRuntimeConfig();
    const mongoURI = config.mongoUri || process.env.MONGODB_URI || defaultMongoUri;

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        await mongoose.connect(mongoURI);
        return mongoose.connection;
    } catch (err) {
        console.error('❌ Грешка при връзка с базата:', err.message);
        throw err;
    }
};

const AuditSchema = new mongoose.Schema({
    url: String,
    performance: Number,
    accessibility: Number,
    timestamp: { type: Date, default: Date.now },
    suggestions: [
        {
            title: String,
            description: String,
            savingsMs: Number,
            savingsBytes: Number
        }
    ],
    metrics: {
        lcp: String,
        tbt: String
    }
});

export const Audit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
