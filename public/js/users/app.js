function init() {
    const idInput = document.getElementById("id");
    const pswd1Input = document.getElementById("pswd1");
    const pswd2Input = document.getElementById("pswd2");
    const emailInput = document.getElementById("email");
    const joinBtn = document.getElementById("join_btn");

    if(idInput) {idInput.addEventListener('change', verifyId)};
    if(pswd1Input) {pswd1Input.addEventListener('change', verifyPswd1)};
    if(pswd2Input) {pswd2Input.addEventListener('change', verifyPswd2)};
    if(emailInput) {emailInput.addEventListener('change', verifyEmail)};
    if(joinBtn) {joinBtn.addEventListener('click', join)};
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

function verifyId() {
    const idValue = document.getElementById("id").value;
    const idFormat = /^[\w-]{5,20}$/;

    if(idFormat.test(idValue)) {
        const currentUrl = window.location.href.replaceAll("/", "");
        if(currentUrl.substring(currentUrl.length, currentUrl.length - 9) == "find_pswd") {
            removeErrorMsg("id_error_msg");
        } else {
            var xhr = new XMLHttpRequest();

            xhr.open("get", "/users/join/verify/" + idValue, true);
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    if(this.responseText == "existingUsername") {
                        const errorMsg = "이미 가입된 아이디입니다."
                        appendErrorMsg("id_error_msg", errorMsg);
                    }
                    if(this.responseText == "notExistingUsername") {
                        removeErrorMsg("id_error_msg");
                    }
                }
            };
            xhr.send();
        }
    } else {
        const errorMsg = "영어 대소문자 길이 5~20자를 입력해야 합니다.";
        appendErrorMsg("id_error_msg", errorMsg);
    }
}

function verifyPswd1() {
    const pswd1Value = document.getElementById("pswd1").value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg("pswd1_error_msg");
    } else {
        const errorMsg = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
        appendErrorMsg("pswd1_error_msg", errorMsg);
    }
}

function verifyPswd2() {
    const pswd1Value = document.getElementById("pswd1").value;
    const pswd2Value = document.getElementById("pswd2").value;

    if(pswd1Value == pswd2Value) {
        removeErrorMsg("pswd2_error_msg");
    } else {
        const errorMsg = "비밀번호가 일치하지 않습니다.";
        appendErrorMsg("pswd2_error_msg", errorMsg);
    }
}

function verifyEmail() {
    const emailValue = document.getElementById("email").value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg("email_error_msg");
    } else {
        const errorMsg = "잘못된 이메일 주소입니다.";
        appendErrorMsg("email_error_msg", errorMsg);
    }
}

function join() {
    verifyId();
    verifyPswd1();
    verifyPswd2();
    verifyEmail();

    const idValue = document.getElementById("id").value;
    const pswd1Value = document.getElementById("pswd1").value;
    const emailValue = document.getElementById("email").value;

    if (document.getElementsByClassName("error_msg").length == 0) {
        const params = "username=" + idValue + "&password=" + pswd1Value + "&email=" + emailValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 201) {
                location.href = "/users/join/result";
            }
            if(this.readyState == 4 && this.status == 200) {
                if(this.responseText == 'existingUsername') {
                    const errorMsg = "이미 가입된 아이디입니다."
                    appendErrorMsg("id_error_msg", errorMsg);
                }
                if(this.responseText == 'maxJoinedUsers') {
                    const errorMsg = "입력하신 이메일로 가입된 아이디가 3개 존재하여 더 이상 가입이 불가능합니다.";
                    appendErrorMsg("email_error_msg", errorMsg);
                }
            }
        }
        xhr.open("post", "/users/join/submit", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function findId() {
    verifyEmail();
    const emailValue = document.getElementById("email").value;
    if (document.getElementsByClassName("error_msg").length == 0) {
        const params = "&email=" + emailValue;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 201) {
                location.href = "/users/find_id/results?" + this.responseText;
            }
            if(this.readyState == 4 && this.status == 404) {
                alert("404");
            }
        }
        xhr.open("post", "/users/find_id/send", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function findPswd() {
    verifyEmail();
    verifyId();
    const emailValue = document.getElementById("email").value;
    const idValue = document.getElementById("id").value;
    if (document.getElementsByClassName("error_msg").length == 0) {
        const params = "&id=" + idValue + "&email=" + emailValue;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                location.href = "/users/find_pswd/result?email=" + this.responseText;
            }
            if(this.readyState == 4 && this.status == 404) {
                alert("404");
            }
        }
        xhr.open("post", "/users/find_pswd/send", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}

function changePswd() {
    // verifyPswd1();
    // verifyPswd2();
    const pswd1Value = document.getElementById("pswd1").value;
    const query = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    
    const resetCode = query.code;
    
    const params = "&code=" + encodeURIComponent(resetCode) + "&password=" + pswd1Value;
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200 && this.responseText == "OK") {
            alert("OK");
        }
        if(this.readyState == 4 && this.status == 404) {
            alert("404");
        }
    }
    xhr.open("post", "/users/find_pswd/reset", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send(params);
}