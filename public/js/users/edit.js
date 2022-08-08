var isAuthCode = false;

function init() {
    var currentEmail = document.getElementById("current_email");
    var newEmail = document.getElementById("new_email");
    var currentPswd = document.getElementById("current_pswd");
    var newPswd1 = document.getElementById("new_pswd1");
    var newPswd2 = document.getElementById("new_pswd2");
    var sendAuthBtn = document.getElementById("send_code_btn");
    var authBtn = document.getElementById("auth_btn");
    var backBtn = document.getElementById("back_btn");
    var changeEmailBtn = document.getElementById("change_email_btn");
    // var changePswdBtn = document.getElementById("change_pswd_btn");

    if(currentEmail) currentEmail.addEventListener('change', verifyCurrentEmail);
    if(newEmail) newEmail.addEventListener('change', verifyNewEmail);
    if(currentPswd) currentPswd.addEventListener('change', verifyCurrentPswd);
    if(newPswd1) newPswd1.addEventListener('change', verifyNewPswd1);
    if(newPswd2) newPswd2.addEventListener('change', verifyNewPswd2);
    if(sendAuthBtn) sendAuthBtn.addEventListener('click', sendCode);
    if(authBtn) authBtn.addEventListener('click', authenticateCode);
    if(backBtn) backBtn.addEventListener('click', backToTasks);
    if(changeEmailBtn) changeEmailBtn.addEventListener('click', changeEmail);
    // if(changePswdBtn) changePswdBtn.addEventListener('click', changePswd);
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
        let newEmailValue = document.getElementById("new_email").value;
        let sendCodeBtn = document.getElementById("send_code_btn");
        let params = "email=" + newEmailValue;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                let authCodeArea = document.getElementById("auth_code_row");
                let authCodeInput = document.getElementById("auth_code");
                alert("새로운 이메일로 인증 번호가 전송 되었습니다.");
                sendCodeBtn.disabled = false;
                authCodeInput.value = ""
                authCodeArea.style.display = "block";
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
            if(this.readyState >= 1 && this.readyState <= 3) {
                sendCodeBtn.disabled = true;
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
                const send_btn = document.getElementById("send_code_btn");
                const auth_btn = document.getElementById("auth_btn");
                const boxBgColor = "rgb(230,230,230)";
                const boxFontColor = "rgb(0,0,0)";
                
                alert("이메일 인증이 완료되었습니다.");
                isAuthCode = true;
                send_btn.disabled = true;
                send_btn.style.background = boxBgColor;
                send_btn.style.pointerEvents = "none";
                auth_btn.disabled = true;
                auth_btn.style.background = boxBgColor;
                auth_btn.style.pointerEvents = "none";
                newEmail.disabled = true;
                newEmail.style.backgroundColor = boxBgColor;
                newEmail.style.color = boxFontColor;
                auth.disabled = true;
                auth.style.backgroundColor = boxBgColor;
                auth.style.color = boxFontColor;
            }
            if(this.readyState == 4 && this.status == 400 && this.responseText == "not match code") {
                alert("이메일 인증 번호가 틀렸습니다.");
            }
        }
        xhr.open("post", "auth_code", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function changeEmail() {
    verifyCurrentEmail();
    verifyNewEmail();
    if(isAuthCode && document.getElementsByClassName("error_msg").length == 0) {
        let codeValue = document.getElementById("auth_code").value;
        let currentEmailValue = document.getElementById("current_email").value;
        let newEmailValue = document.getElementById("new_email").value;
        let params = "currentEmail=" + currentEmailValue +"&newEmail=" + newEmailValue + "&code=" + codeValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert("새로운 이메일로 변경이 완료되었습니다.")
                location.href = "/users/profile";
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open("put", "email/change", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function changePswd() {
    verifyCurrentPswd();
    verifyNewPswd1();
    verifyNewPswd2();
    if(document.getElementsByClassName("error_msg").length == 0) {
        let currentPswdValue = document.getElementById("current_pswd").value;
        let newPswdValue = document.getElementById("new_pswd1").value;
        let params = "currentPswd=" + currentPswdValue +"&newPswd=" + newPswdValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert("새로운 비밀번호로 변경이 완료되었습니다.")
                location.href = "/users/profile";
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open("put", "pswd/change", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function backToTasks() {
    location.href = "/users/profile";
}