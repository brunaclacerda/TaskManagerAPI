const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: 'brunaclacerda@gmail.com',
        subject: 'Welcome',
        text: `Thank you ${name} for signing up in the app Task manager`    
    })
}

const sendUserDeletedEmail = async (name, email) => {
    await sgMail.send({
        to: email,
        from: 'brunaclacerda@gmail.com',
        subject: 'We will miss you!',
        text: ` ${name} we are sorry to hear that you are leaving us.`    
    })

}


module.exports = {
    sendWelcomeEmail, 
    sendUserDeletedEmail
}

