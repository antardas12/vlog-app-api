import nodemailer from "nodemailer"

const createTrasnporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL,
            pass: process.env.APP_PASSWORD
        }
    })
}

const prepareMailOptons = (to, subject, text,html) => {
    return {
        from: process.env.MAIL,
        to: to,
        subject: subject,
        text: text,
        html : html
    }
}

export const sendMail = async (to, subject, text,html) => {
    const transporter = createTrasnporter();
    const mailOptons = prepareMailOptons(to, subject, text,html);

    try {
        const info = await transporter.sendMail(mailOptons);
        console.log("email send", info.response)
        return info.response;
    } catch (error) {
        console.log('Error sending email:', error);
        return { success: false, error: error.message };
    }


}