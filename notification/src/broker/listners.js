import sendEmail from '../email.js';
import broker from './broker.js'


export default async function listener() {
    await broker.subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
        console.log("✅✅✅ DATA RECEIVED! ✅✅✅", data);

        // Email send
        const emailHTMLTemplate = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #333333; margin-bottom: 20px;">Welcome to Our Site 🎉</h1>
                    <p style="font-size: 16px; color: #555555;">
                        Dear <strong>${data.fullName?.firstName || ''} ${data.fullName?.lastName || ''}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                        Thank you for creating an account with us.
                        We are excited to have you as a part of our community.
                    </p>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                        Your account has been successfully created.
                        You can now explore our website and enjoy our services.
                    </p>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                        If you have any questions, feel free to contact our support team.
                    </p>
                    <p style="font-size: 16px; color: #555555; margin-top: 30px;">
                        Best regards,<br />
                        <strong>The Team</strong>
                    </p>
                </div>
            </div>
        `;

        // await sendEmail(data.email, "Welcome to our Service", "Thank you for registering with us", emailHTMLTemplate)
    })


    await broker.subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
        console.log("payment created mail ",data);
        
        const emailHTMLTemplate = `
        <h1>Payment Initiated</h1>
        <p>Dear ${data.username},</p>
        <p>Your payment of ${data.currency} ${data.amount} for the order ID: ${data.orderId} has been initiated.</p>
        <p>We will notify you once the payment is completed.</p>
        <p>Best regards,<br/>The Team</p>
        `;
        // await sendEmail(data.email, "Payment Initiated", "Your payment is being processed", emailHTMLTemplate);
    })

    await broker.subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
        console.log("payment completed mail: ",data);
        
        const emailHTMLTemplate = `
        <h1>Payment Successful!</h1>
        <p>Dear ${data.username},</p>
        <p>We have received your payment of ${data.currency} ${data.amount} for the order ID: ${data.orderId}.</p>
        <p>Thank you for your purchase!</p>
        <p>Best regards,<br/>The Team</p>
        `;
        // await sendEmail(data.email, "Payment Successful", "We have received your payment", emailHTMLTemplate);
    })

    //send mail to user when payment failed
    await broker.subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
        console.log("Payment Failed email: ",data);
        
        const emailHTMLTemplate = `
        <h1>Payment Failed</h1>
        <p>Dear ${data.username},</p>
        <p>Unfortunately, your payment for the order ID: ${data.orderId} has failed.</p>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br/>The Team</p>
        `;
        // await sendEmail(data.email, "Payment Failed", "Your payment could not be processed", emailHTMLTemplate);
    })

    await broker.subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
        console.log("Product created email :",data);
        
        const emailHTMLTemplate = `
        <h1>New Product Available!</h1>
        <p>Dear ${data.username},</p>
        <p>Check it out and enjoy exclusive launch offers!</p>
        <p>Best regards,<br/>The Team</p>
        `;
        // await sendEmail(data.email, "New Product Launched", "Check out our latest product", emailHTMLTemplate);
    })

}