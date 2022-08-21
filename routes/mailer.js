const nodemailer = require('nodemailer');

class Mailer {
    constructor () {
        this.mailOptions = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }
        this.type;
        this.email;
        this.username;
        this.code;
        this.subject;
        this.content;
    }

    makeForm() {
        try {
            switch (this.type) {
                case "resetPswd":
                    this.subject = "ToDo 비밀번호 변경 메일";
                    this.content = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.username} 님이 비밀번호 초기화를 요청하였습니다.</div><br>
                    비밀번호 변경을 원하시면 아래의 버튼 클릭하시고 비밀번호를 변경하여 주세요.<br><br>
                    <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/find_pswd/reset?&code=${encodeURIComponent(this.code)}">
                    비밀번호 변경하기</a>`;
                    break;
                case "authJoin":
                    this.subject = "Todo 가입 인증 메일"
                    this.content = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.username} 님이 가입을 요청 하셨습니다.</div><br>
                    아래의 버튼을 누르시면 가입이 완료됩니다.<br><br>
                    <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/join/auth?&code=${encodeURIComponent(this.code)}">
                    가입 완료하기</a>`;
                    break;
                case "authEdit":
                    this.subject = "Todo 회원 정보 변경 메일"
                    this.content = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${this.username} 님이 회원 정보 변견을 요청 하셨습니다.</div><br>
                    아래의 5자리 숫자를 인증코드 창에 넣으셔서 인증을 완료해주세요..<br><br>
                    <a>${this.code}</a>`;
                    break;
            
                default:
                    throw 'Unknow mail type';
            }
        } catch (error) {
            throw error;
        }
    }

    async send() {
        try {
            const transport = nodemailer.createTransport(this.mailOptions);

            await transport.sendMail({
                from: process.env.ADMIN_EMAIL,
                to: this.email,
                subject: this.subject,
                html: this.content
            });
            transport.close();
        } catch (error) {
            throw "Mail send failed"
        }
    }
}

module.exports = Mailer;