import mongoose from 'mongoose';

const mongoURI = 'mongodb+srv://admin:admin123!@analizator.rd29ktb.mongodb.net/';

export const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB свързана успешно!');
    } catch (err) {
        console.error('❌ Грешка при връзка с базата:', err.message);
        process.exit(1);
    }
};

const AuditSchema = new mongoose.Schema({
    url: String,
    performance: Number,
    accessibility: Number,
    timestamp: { type: Date, default: Date.now },
    suggestions: Array
});

export const Audit = mongoose.model('Audit', AuditSchema);