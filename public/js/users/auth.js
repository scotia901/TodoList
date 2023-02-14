const ERR_EXIST_ID_MSG = "이미 가입된 아이디입니다.";
const ERR_INVALIED_ID_MSG = "영어 대소문자 길이 5~20자를 입력해야 합니다.";
const ERR_INVALID_PSWD_MSG = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
const ERR_MISMATCH_PSWD_MSG = "비밀번호가 일치하지 않습니다.";
const ERR_INVALID_EMAIL_MSG = "잘못된 이메일 주소입니다.";
const ERR_LIMIT_ID_MSG = "입력하신 이메일로 가입된 아이디가 3개 존재하여 더 이상 가입이 불가능합니다.";
const ERR_FIND_ID_MSG = "알 수 없는 오류로 아이디 찾기에 실패하였습니다. 나중에 다시 시도 해주세요.";
const ERR_NAME_FORMAT_MSG = "특수 문자를 제외한 영어, 한글 2~10자를 입력해야 합니다.";

function init() {
    const idInput = document.getElementById("id");
    const nameInput = document.getElementById("name");
    const pswd1Input = document.getElementById("pswd1");
    const pswd2Input = document.getElementById("pswd2");
    const emailInput = document.getElementById("email");
    const joinBtn = document.getElementById("join_btn");

    if(idInput) {idInput.addEventListener('change', verifyId)};
    if(nameInput) {nameInput.addEventListener('change', verifyName)};
    if(pswd1Input) {pswd1Input.addEventListener('change', verifyPswd1)};
    if(pswd2Input) {pswd2Input.addEventListener('change', verifyPswd2)};
    if(emailInput) {emailInput.addEventListener('change', verifyEmail)};
    if(joinBtn) {joinBtn.addEventListener('click', join)};
}

window.onload = (e) => {
    e.preventDefault();
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
        if(window.location.pathname == "/users/find_pswd" || window.location.pathname == "/users/login") {
            removeErrorMsg("id_error_msg");
        } else {
            var xhr = new XMLHttpRequest();

            xhr.open("get", "/users/join/verify/" + idValue, true);
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    if(this.responseText == "existinguser_id") {
                        appendErrorMsg("id_error_msg", ERR_EXIST_ID_MSG);
                    }
                    if(this.responseText == "notExistinguser_id") {
                        removeErrorMsg("id_error_msg");
                    }
                }
            };
            xhr.send();
        }
    } else if(idValue.length != 0) {
        appendErrorMsg("id_error_msg", ERR_INVALIED_ID_MSG);
    }
}

function verifyName() {
    const nameValue = document.getElementById("name").value;
    const nameFormat = /^[가-힣|\d]{2,10}$/;
    const find_pswdFormat = /find_pswd/;

    if(nameFormat.test(nameValue)) {
        if(find_pswdFormat.test(window.location.href)) {
            removeErrorMsg("name_error_msg");
        } else {
            var xhr = new XMLHttpRequest();

            xhr.open("get", "/users/join/verify/" + nameValue, true);
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    if(this.responseText == "existinguser_id") {
                        appendErrorMsg("id_error_msg", ERR_EXIST_ID_MSG);
                    }
                    if(this.responseText == "notExistinguser_id") {
                        removeErrorMsg("name_error_msg");
                    }
                }
            };
            xhr.send();
        }
    } else {
        appendErrorMsg("name_error_msg", ERR_NAME_FORMAT_MSG);
    }
}

function verifyPswd1() {
    const pswd1Value = document.getElementById("pswd1").value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg("pswd1_error_msg");
    } else {
        appendErrorMsg("pswd1_error_msg", ERR_PSWD_MSG);
    }
}

function verifyPswd2() {
    const pswd1Value = document.getElementById("pswd1").value;
    const pswd2Value = document.getElementById("pswd2").value;

    if(pswd1Value == pswd2Value) {
        removeErrorMsg("pswd2_error_msg");
    } else {
        appendErrorMsg("pswd2_error_msg", ERR_MISMATCH_PSWD_MSG);
    }
}

function verifyEmail() {
    const emailValue = document.getElementById("email").value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg("email_error_msg");
    } else {
        appendErrorMsg("email_error_msg", ERR_INVALID_EMAIL_MSG);
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
        const params = "user_id=" + idValue + "&password=" + pswd1Value + "&email=" + emailValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 201) {
                location.href = "/users/join/result";
            }
            if(this.readyState == 4 && this.status == 200) {
                if(this.responseText == 'existinguser_id') {
                    appendErrorMsg("id_error_msg", ERR_EXIST_ID_MSG);
                }
                if(this.responseText == 'maxJoinedUsers') {
                    appendErrorMsg("email_error_msg", ERR_LIMIT_ID_MSG);
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
                location.href = "/users/find_id/results?userId=" + this.json;
            } else if(this.readyState == 4 && this.status == 200) {
                location.href = "/users/find_id/results?userId=" + this.json;
            }
            if(this.readyState == 4 && this.status == 400) {
                alert(ERR_FIND_ID_MSG);
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

function login() {
    let idValue = document.getElementById("id").value;
    let pswdValue = document.getElementById("pswd").value;
    let keepLoginValue = document.getElementById("keep_login").checked;
    let idFormat = /^[\w-]{5,20}$/;
    let pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    function appendErrorMsg(elementId, errorMsg) {
        if (!document.getElementById(elementId)) {
            let para = document.createElement("p");
            para.setAttribute("id", elementId);
            para.setAttribute("class", "error_msg");
            let warnMsg = document.createTextNode(errorMsg);
            para.appendChild(warnMsg);
            document.getElementById(elementId.substring(0, elementId.length - 10) + "_input_area").appendChild(para);
        }
    }

    function removeErrorMsg(elementId) {
        if (document.getElementById(elementId)) {
            document.getElementById(elementId).remove();
        }
    }

    if(idFormat.test(idValue)) {
        removeErrorMsg("id_error_msg");
    } else {
        let errorMsg = ERR_INVALIED_ID_MSG;
        appendErrorMsg("id_error_msg", errorMsg);
    }

    if(pswdFormat.test(pswdValue)) {
        removeErrorMsg("pswd_error_msg");
    } else {
        let errorMsg = ERR_INVALID_PSWD_MSG;
        appendErrorMsg("pswd_error_msg", errorMsg);
    }

    if (document.getElementsByClassName("error_msg").length == 0) {
        let params = "user_id=" + idValue + "&password=" + pswdValue + "&keepLogin=" + keepLoginValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                location.href = "/tasks/today";
            }
            if(xhr.readyState == 4 && xhr.status == 404) {
                alert("아이디 또는 비밀번호가 일치 하지 않습니다.");
            }
        }

        xhr.open("post", "/users/login", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(params);
    }
}