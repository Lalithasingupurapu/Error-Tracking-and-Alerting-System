const simulateErrors = async () => {
    const API_URL = 'http://localhost:5000/api/errors';

    console.log("Testing ETS Ingestion API...\n");

    // 1. Simulate a minor warning
    console.log("Sending a MINOR error...");
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appName: "Frontend-React-App",
                message: "Image failed to load on homepage.",
                stackTrace: "at Image.onload (frontend/src/components/Hero.jsx:42:12)",
                severity: "low"
            })
        });
        console.log("✅ Minor error sent successfully.\n");
    } catch (e) {
        console.error("❌ Failed to send minor error:", e.message);
    }

    // Wait a bit to simulate realistic gaps
    await new Promise(r => setTimeout(r, 2000));

    // 2. Simulate a CRITICAL crash
    console.log("Sending a CRITICAL error (This should trigger an email!)...");
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appName: "Payment-Gateway",
                message: "Stripe API Key is invalid! All payments are failing.",
                stackTrace: "Error: Invalid API Key\n    at Stripe.charge (backend/services/payment.js:15:22)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)",
                severity: "critical"
            })
        });
        console.log("✅ Critical error sent successfully. Check your server console for the email link!\n");
    } catch (e) {
        console.error("❌ Failed to send critical error:", e.message);
    }
};

simulateErrors();
