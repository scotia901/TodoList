function init() {
    const currentEmail = document.getElementById("current_email");
    const newEmail = document.getElementById("new_email");
    const currentPswd = document.getElementById("current_pswd");
    const newPswd1 = document.getElementById("new_pswd1");
    const newPswd2 = document.getElementById("new_pswd2");
    const sendAuthBtn = document.getElementById("send_code_btn");
    const auth_btn = document.getElementById("auth_btn");

    if(sendAuthBtn) sendAuthBtn.addEventListener('click', sendCode);
    if(currentEmail) currentEmail.addEventListener('change', verifyCurrentEmail);
    if(newEmail) newEmail.addEventListener('change', verifyNewEmail);
    if(currentPswd) currentPswd.addEventListener('change', verifyCurrentPswd);
    if(newPswd1) newPswd1.addEventListener('change', verifyNewPswd1);
    if(newPswd2) newPswd2.addEventListener('change', verifyNewPswd2);
    if(auth_btn) auth_btn.addEventListener('click', authenticateCode);
}

window.onload = function() {
    init();
};

function appendErrorMsg(elementId, errorMsg) {
    if (!document.getElementById(elementId)) {
        const para = document.createElement("p");
        para.setAttribute("id", elementId);
        para.setAttribute("class", "error_msg");
        const warnMsg = document.createTextNode(errorMsg);
        para.appendChild(warnMsg);
        document.getElementById(elementId.substring(0, elementId.length - 10) + "_input_area").appendChild(para);
    } else {
        document.getElementById(elementId).textContent = errorMsg;
    }
}

function removeErrorMsg(elementId) {
    if (document.getElementById(elementId)) {
        document.getElementById(elementId).remove();
    }
}

function verifyCurrentEmail() {
    const emailValue = document.getElementById("current_email").value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg("current_email_error_msg");
    } else {
        const errorMsg = "잘못된 이메일 주소입니다.";
        appendErrorMsg("current_email_error_msg", errorMsg);
    }
}

function verifyNewEmail() {
    const emailValue = document.getElementById("new_email").value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg("new_email_error_msg");
    } else {
        const errorMsg = "잘못된 이메일 주소입니다.";
        appendErrorMsg("new_email_error_msg", errorMsg);
    }
}

function verifyCurrentPswd() {
    const pswd1Value = document.getElementById("current_pswd").value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg("current_pswd_error_msg");
    } else {
        const errorMsg = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
        appendErrorMsg("current_pswd_error_msg", errorMsg);
    }
}

function verifyNewPswd1() {
    const pswd1Value = document.getElementById("new_pswd1").value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg("new_pswd1_error_msg");
    } else {
        const errorMsg = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
        appendErrorMsg("new_pswd1_error_msg", errorMsg);
    }
}

function verifyNewPswd2() {
    const pswd1Value = document.getElementById("new_pswd1").value;
    const pswd2Value = document.getElementById("new_pswd2").value;

    if(pswd1Value == pswd2Value) {
        removeErrorMsg("new_pswd2_error_msg");
    } else {
        const errorMsg = "비밀번호가 일치하지 않습니다.";
        appendErrorMsg("new_pswd2_error_msg", errorMsg);
    }
}


function sendCode() {
    verifyNewEmail();
    if (document.getElementsByClassName("error_msg").length == 0) {
        const newEmailValue = document.getElementById("new_email").value;
        let params = "email=" + newEmailValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                const authCode = document.getElementById("auth_code_row");
                authCode.style.display = "block";
                alert("새로운 이메일로 인증 번호가 전송 되었습니다.")
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open("post", "send_code", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function authenticateCode() {
    if (document.getElementsByClassName("error_msg").length == 0) {
        const codeValue = document.getElementById("auth_code").value;
        const newEmailValue = document.getElementById("new_email").value;
        let params = "email=" + newEmailValue +"&code=" + codeValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                const auth = document.getElementById("auth_code");
                const newEmail = document.getElementById("new_email");
                document.getElementById("auth_btn").disabed = true;
                document.getElementById("send_code_btn").disabed = true;
                
                const boxBgColor = "rgb(230,230,230)";
                const boxFontColor = "rgb(230,230,230)";

                newEmail.disabed = true;
                newEmail.style.backgroundColor = boxBgColor;
                newEmail.style.color = boxFontColor;
                auth.disabed = true;
                auth.style.backgroundColor = boxBgColor;
                auth.style.color = boxFontColor;
                alert("이메일 인증이 완료되었습니다.")
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open("post", "auth_code", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

const changeBtn = document.getElementById("change_btn");

changeBtn.addEventListener('click', changeEmail);

function changeEmail() {
    verifyCurrentEmail();
    verifyNewEmail();
    if(isAuthCode && document.getElementsByClassName("error_msg").length == 0) {
        const codeValue = document.getElementById("auth_code").value;
        let params = "currentEmail" + currentEmailValue +"newEmail" + newEmailValue + "&code=" + codeValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert("새로운 이메일로 변경이 완료되었습니다.")
                location.href = "/";
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open("post", "send_code", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function editPswd() {
    verifyCurrentPswd();
    verifyNewPswd1();
    verifyNewPswd2();
}

