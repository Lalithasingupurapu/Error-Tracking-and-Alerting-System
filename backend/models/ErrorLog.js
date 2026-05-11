const mongoose = require('mongoose');

// ============================================================================
// MONGOOSE SCHEMA
// This is where Mongoose shines! Instead of learning complex MongoDB syntax, 
// we just define a normal Javascript object that acts as a blueprint.
// Every error that comes into our system MUST follow this strict blueprint.
// ============================================================================

const errorLogSchema = new mongoose.Schema({
    appName: {
        type: String,
        required: true,
        default: 'Unknown App'       // e.g., "Frontend-React-App" or "Payment-Gateway"
    },
    message: {
        type: String,
        required: true,              // The actual error: e.g., "ReferenceError: x is not defined"
    },
    stackTrace: {
        type: String,
        required: false              // The detailed code file and line number where it crashed
    },
    status: {
        type: String,
        enum: ['unresolved', 'investigating', 'resolved'], // A built-in status tracker!
        default: 'unresolved'
    },
    occurrences: {
        type: Number,
        default: 1
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    timestamp: {
        type: Date,
        default: Date.now            // Automatically saves the exact moment the crash happened
    }
});

// Compile the schema into a powerful Model that we can use to query the database
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;
