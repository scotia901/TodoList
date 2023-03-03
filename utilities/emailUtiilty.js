const nodemailer = require('nodemailer');

const mailOptions = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
}

async function sendMailToJoinUser(toEmail, code) {
    try {
        const subject = "Todo 가입 인증 메일"
        const content = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.user_id} 님이 가입을 요청 하셨습니다.</div><br>
        아래의 버튼을 누르시면 가입이 완료됩니다.<br><br>
        <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/join/auth?&code=${encodeURIComponent(this.code)}">
        가입 완료하기</a>`;
        const transport = nodemailer.createTransport(this.mailOptions);

        await transport.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: toEmail,
            subject: subject,
            html: content
        });
        transport.close();
        console.log(error);
    } catch (error) {
        throw "Mail send failed"
    }
}

async function sendMailToResetPassword(toEmail, code) {
    try {
        const subject = "ToDo 비밀번호 변경 메일";
        const content = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.user_id} 님이 비밀번호 초기화를 요청하였습니다.</div><br>
                비밀번호 변경을 원하시면 아래의 버튼 클릭하시고 비밀번호를 변경하여 주세요.<br><br>
                <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/find_pswd/auth?&code=${encodeURIComponent(this.code)}">
                비밀번호 변경하기</a>`;
        const transport = nodemailer.createTransport(mailOptions);

        await transport.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: toEmail,
            subject: subject,
            html: content
        });
        transport.close();
    } catch (error) {
        console.log(error);
        throw "Mail send failed"
    }
}

async function sendMailToUpdateUser(toEmail, code) {
    try {
        constsubject = "Todo 회원 정보 변경 메일"
        constcontent = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.user_id} 님이 회원 정보 변견을 요청 하셨습니다.</div><br>
        아래의 5자리 숫자를 인증코드 창에 넣으셔서 인증을 완료해주세요..<br><br>
        <a>${this.code}</a>`;
        const transport = nodemailer.createTransport(this.mailOptions);

        await transport.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: toEmail,
            subject: subject,
            html: content
        });
        transport.close();
    } catch (error) {
        console.log(error);
        throw "Mail send failed"
    }
}

module.exports = Mailer;