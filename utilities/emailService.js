const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 8px 8px 0 0;">
                                <img src="https://your-logo-url.com/logo.png" alt="Logo" style="width: 150px; height: auto; margin-bottom: 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Email Verification</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                    Hello,<br><br>
                                    Thank you for registering! Please use the verification code below to complete your registration:
                                </p>
                                
                                <!-- Verification Code Box -->
                                <div style="background-color: #f3f4f6; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <h2 style="color: #4f46e5; letter-spacing: 8px; margin: 0; font-size: 32px; font-weight: 700;">
                                        ${code}
                                    </h2>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin-top: 24px;">
                                    This code will expire in <span style="color: #ef4444; font-weight: 600;">10 minutes</span>.
                                </p>
                                
                                <div style="margin: 40px 0; text-align: center;">
                                    <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                        Verify Email Address
                                    </div>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0;">
                                    If you didn't request this verification code, please ignore this email or contact support if you have concerns.
                                </p>
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                        This is an automated message, please do not reply.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Send verification email error:', error);
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    sendVerificationEmail
};