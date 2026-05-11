const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load our new Mongoose Error Blueprint!
const ErrorLog = require('./models/ErrorLog');
const { sendCriticalErrorAlert } = require('./services/alertService');

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 1. Basic Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Online', message: 'ETS Ingestion API is running smoothly!' });
});

// 2. The INGESTION endpoint
app.post('/api/errors', async (req, res) => {
    try {
        const errorPayload = req.body;
        
        // 1. Check if this exact unresolved error already exists
        const existingError = await ErrorLog.findOne({
            appName: errorPayload.appName,
            message: errorPayload.message,
            status: { $ne: 'resolved' } // Group with unresolved or investigating
        });

        if (existingError) {
            // 2. If it exists, just update the occurrences and timestamp
            existingError.occurrences += 1;
            existingError.timestamp = Date.now();
            await existingError.save();
            
            console.log(`🚨 [ALERT] Grouped Error: ${errorPayload.message} (Occurrences: ${existingError.occurrences})`);
            
            return res.status(200).json({ message: 'Error grouped securely in Database', error_id: existingError._id });
        }

        // 3. Otherwise, create a brand new error log
        const newError = new ErrorLog({
            appName: errorPayload.appName,
            message: errorPayload.message,
            stackTrace: errorPayload.stackTrace,
            severity: errorPayload.severity || 'medium' // Accept severity or default to medium
        });

        // Save it permanently to MongoDB!
        await newError.save();

        console.log(`🚨 [ALERT] Saved New Error to Database: ${errorPayload.message} (Severity: ${newError.severity})`);
        
        // Trigger Email Alert if Critical!
        if (newError.severity === 'critical') {
            await sendCriticalErrorAlert(newError);
        }

        res.status(201).json({ message: 'Error saved securely to Database', error_id: newError._id });

    } catch (err) {
        console.error("Failed to save error:", err);
        res.status(500).json({ error: 'Failed to save error log. Did you pass the right data?' });
    }
});

// 3. GET all errors (for the Dashboard)
app.get('/api/errors', async (req, res) => {
    try {
        // Fetch all errors, sorted by newest first
        const errors = await ErrorLog.find().sort({ timestamp: -1 });
        res.status(200).json(errors);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch errors' });
    }
});

// 4. PUT update an error's status (e.g., mark as resolved)
app.put('/api/errors/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedError = await ErrorLog.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true } // Return the updated document
        );
        
        if (!updatedError) return res.status(404).json({ error: 'Error not found' });
        
        res.status(200).json(updatedError);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update error status' });
    }
});

// 3. Connect to MongoDB and Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
        console.log("🟡 No MONGO_URI found in .env. Starting an in-memory MongoDB for testing...");
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("🟢 Successfully connected to MongoDB!");
        app.listen(PORT, () => {
            console.log(`=============================================`);
            console.log(`🚀 ETS Backend Server is running on port ${PORT}`);
            console.log(`📡 Ready to receive errors on POST http://localhost:${PORT}/api/errors`);
            console.log(`=============================================`);
        });
    } catch (err) {
        console.error("🔴 Failed to connect to MongoDB.", err);
    }
};

startServer();
