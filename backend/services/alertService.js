const nodemailer = require('nodemailer');

// Ethereal is a fake SMTP service perfect for testing!
// It doesn't actually send emails to real inboxes, but generates a link to view the email.
async function createTransporter() {
    // Generate a test account on the fly
    let testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
        },
    });
}

const sendCriticalErrorAlert = async (errorLog) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: '"ETS Monitor 🚨" <alerts@ets-monitor.com>', 
            to: "devteam@mycompany.com", // In a real app, this would be a real email
            subject: `🔥 CRITICAL ERROR in ${errorLog.appName}`, 
            text: `A critical error has occurred.\n\nApp: ${errorLog.appName}\nMessage: ${errorLog.message}\nTime: ${errorLog.timestamp}\n\nPlease check the ETS Dashboard.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ff4444; border-radius: 8px;">
                    <h2 style="color: #ff4444;">🚨 Critical Error Alert</h2>
                    <p><strong>App:</strong> ${errorLog.appName}</p>
                    <p><strong>Message:</strong> ${errorLog.message}</p>
                    <p><strong>Time:</strong> ${errorLog.timestamp}</p>
                    <hr/>
                    <p style="font-size: 12px; color: #555;"><strong>Stack Trace:</strong></p>
                    <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto;">${errorLog.stackTrace || 'No stack trace provided.'}</pre>
                    <br/>
                    <a href="http://localhost:5173" style="background: #ff4444; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View in Dashboard</a>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log("==========================================================");
        console.log("📧 CRITICAL ALERT EMAIL SENT!");
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("==========================================================");

    } catch (error) {
        console.error("Failed to send alert email:", error);
    }
};

module.exports = { sendCriticalErrorAlert };
