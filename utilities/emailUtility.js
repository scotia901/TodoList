require('dotenv').config();
const nodemailer = require('nodemailer');
const { SERVER_HOST, ADMIN_EMAIL } = process.env;
const mailOptions = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
}
const transport = nodemailer.createTransport(mailOptions);

module.exports = {
    sendJoinUserEmail: async (username, email, token) => {
        try {
            const subject = "Todo 가입 인증 메일"
            const content = `<div>${SERVER_HOST} 에서 ${username} 님이 가입을 요청 하셨습니다.</div><br>
                            아래의 버튼을 누르시면 가입이 완료됩니다.<br><br>
                            <a href="${SERVER_HOST}/auth/join?&token=${encodeURIComponent(token)}">
                            가입 완료하기</a>`;
            const result = await transport.sendMail({
                from: "noreply@scotia901-jeonghwan.com",
                to: email,
                subject: subject,
                html: content
            });
            transport.close();
            return result;
        } catch (error) {
            throw error;
        }
    },

    sendResetPasswordMail: async (username, email, token) => {
        try {
            const subject = "ToDo 비밀번호 변경 메일";
            const content = `<div>${SERVER_HOST} 에서 ${username} 님이 비밀번호 초기화를 요청하였습니다.</div><br>
                            비밀번호 변경을 원하시면 아래의 버튼 클릭하시고 비밀번호를 변경하여 주세요.<br><br>
                            <a href="${SERVER_HOST}/auth/password?&token=${encodeURIComponent(token)}">
                            비밀번호 변경하기</a>`;
            const result = await transport.sendMail({
                from: ADMIN_EMAIL,
                to: email,
                subject: subject,
                html: content
            });
            transport.close();
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    sendUpdateUserMail: async (email, code) => {
        try {
            const subject = "Todo 회원 정보 변경 메일"
            const content = `<div>${SERVER_HOST} 에서 이메일 주소 변경 요청 하셨습니다.</div><br>
                            아래의 5자리 숫자를 인증코드 창에 넣으셔서 인증을 완료해주세요..<br><br>
                            <div><span>${code}</span></div>`;
            const result = await transport.sendMail({
                from: ADMIN_EMAIL,
                to: email,
                subject: subject,
                html: content
            });
            transport.close();
            return result;
        } catch (error) {
            throw error;
        }
    }
};