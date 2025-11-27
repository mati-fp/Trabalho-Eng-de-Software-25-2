const nodemailer = require('nodemailer');

async function createTestAccount() {
    try {
        const account = await nodemailer.createTestAccount();

        console.log('Credentials obtained, add this to your .env file:');
        console.log('--------------------------------------------------');
        console.log(`MAIL_HOST=${account.smtp.host}`);
        console.log(`MAIL_PORT=${account.smtp.port}`);
        console.log(`MAIL_USER=${account.user}`);
        console.log(`MAIL_PASSWORD=${account.pass}`);
        console.log(`MAIL_FROM=noreply@example.com`);
        console.log('--------------------------------------------------');
        console.log(`View emails at: ${nodemailer.getTestMessageUrl({ ...account, ...account.smtp })} (Wait, this is for messages)`);
        console.log(`Login to Ethereal: https://ethereal.email/login`);
    } catch (err) {
        console.error('Failed to create a testing account. ' + err.message);
    }
}

createTestAccount();
