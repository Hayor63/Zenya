import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import config from "config";

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  otp?: string;
  text?: string;
  fullName: string;
}

const sendEmail = async ({
  from,
  to,
  subject,
  text,
  otp,
  fullName,
}: EmailOptions) => {
  // Mailgen setup
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Zenya",
      link: "https://zenya.com",
    },
  });

  // Email content
  const email = {
    body: {
      name: fullName,
      intro: text || (otp ? `Your OTP is: ${otp}` : "Welcome to Zenya!"),
      outro: "Need help? Just reply to this email, we'd love to help.",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  try {
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: config.get<string>("brevoHost"),
      port: config.get<number>("brevoPort"),
      secure: config.get<number>("brevoPort") === 465,
      auth: {
        user: config.get<string>("userMailLogin"),
        pass: config.get<string>("brevoMailkey"),
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: emailText,
      html: emailBody,
    });

    return { success: true, msg: "Email sent successfully" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error sending email:", error.message);
    } else {
      console.error("Unknown error sending email:", error);
    }
    return { success: false, msg: "Failed to send email" };
  }
};

export default sendEmail;
