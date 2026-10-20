import nodemailer from 'nodemailer'

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return false
    }

    const smtpPort = Number(process.env.SMTP_PORT) || 587

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text
    })

    return true
  } catch (error) {
    return false
  }
}

export { sendEmail }
