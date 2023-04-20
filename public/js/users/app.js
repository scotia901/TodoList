function init() {
    const idInput = document.getElementById("id");
    const nameInput = document.getElementById("nickname");
    const pswdInput = document.getElementById("pswd");
    const pswd1Input = document.getElementById("pswd1");
    const pswd2Input = document.getElementById("pswd2");
    const emailInput = document.getElementById("email");
    const joinBtn = document.getElementById("join_btn");
    
    if (idInput) { idInput.addEventListener('change', verifyId) };
    if (nameInput) { nameInput.addEventListener('change', verifyNickname) };
    if (pswdInput) { pswdInput.addEventListener('change', verifyPswd) };
    if (pswd1Input) { pswd1Input.addEventListener('change', verifyPswd1) };
    if (pswd2Input) { pswd2Input.addEventListener('change', verifyPswd2) };
    if (emailInput) { emailInput.addEventListener('change', verifyEmail) };
    if (joinBtn) { joinBtn.addEventListener('click', join) };
}

window.onload = (e) => {
    e.preventDefault();
    init();
};

async function verifyId() {
    const idValue = document.getElementById("id").value;
    const idFormat = /^[\w-]{5,20}$/;

    if(idFormat.test(idValue)) {
        if(window.location.pathname == "/users/find/pswd" || window.location.pathname == "/users/login") {
            removeErrorMsg("id_error_msg");
        } else {
            fetch('/users/username/' + idValue, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'fetch'
                }
            }).then(async response => {
                if(response.ok) {
                    const user = await response.json();
                    if(user == true) {
                        appendErrorMsg("id_error_msg", ERR_EXIST_ID_MSG);
                    }
                    if(user == false) {
                        removeErrorMsg("id_error_msg");
                    }
                }
            }).catch(error => {
                console.error(error);
            });
        }
    } else {
        appendErrorMsg("id_error_msg", ERR_INVALIED_ID_MSG);
    }
}

async function verifyNickname() {
    const nicknameValue = document.getElementById("nickname").value;
    const nicknameFormat = /^[가-힣|\d|\w-]{2,10}$/;
    const find_pswdFormat = /find_pswd/;
    
    if(nicknameFormat.test(nicknameValue)) {
        if(find_pswdFormat.test(window.location.href)) {
            removeErrorMsg("nickname_error_msg");
        } else {
            fetch('/users/nickname/' + nicknameValue, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'fetch'
                }
            }).then(async response => {
                if(response.ok) {
                    const user = await response.json();
                    if(user == true) {
                        appendErrorMsg("nickname_error_msg", ERR_EXIST_NICKNAME_MSG);
                    }
                    if(user == false) {
                        removeErrorMsg("nickname_error_msg");
                    }
                }
            }).catch(error => {
                console.error(error);
            });
        }
    } else {
        appendErrorMsg("nickname_error_msg", ERR_INVALIED_NICKNAME_MSG);
    }
}

function verifyPswd() {
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;
    const pswdValue = document.getElementById("pswd").value;
    if(pswdFormat.test(pswdValue)) {
        removeErrorMsg("pswd_error_msg");
    } else {
        appendErrorMsg("pswd_error_msg", ERR_INVALID_PSWD_MSG);
    }
}

function verifyPswd1() {
    const pswd1Value = document.getElementById("pswd1").value;
    const pswd2Value = document.getElementById("pswd2").value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg("pswd1_error_msg");
        if(pswd1Value == pswd2Value || pswd2Value.length == 0) {
            removeErrorMsg("pswd2_error_msg");
        } else {
            appendErrorMsg("pswd2_error_msg", ERR_MISMATCH_PSWD_MSG);
        }
    } else {
        appendErrorMsg("pswd1_error_msg", ERR_INVALID_PSWD_MSG);
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

async function join() {
    await verifyId();
    await verifyNickname();
    verifyPswd1();
    verifyPswd2();
    verifyEmail();

    if (document.getElementsByClassName("error_msg").length == 0) {
        const idValue = document.getElementById("id").value;
        const nicknameValue = document.getElementById("nickname").value;
        const pswd1Value = document.getElementById("pswd1").value;
        const emailValue = document.getElementById("email").value;
        const body = "username=" + idValue + "&nickname=" + encodeURI(nicknameValue) + "&password=" + pswd1Value + "&email=" + emailValue;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 201) {
                location.href = "/users/join/result";
            } else if(this.readyState == 4 && this.status == 200) {
                if(this.responseText == 'joinedUser') {
                    appendErrorMsg("id_error_msg", ERR_EXIST_ID_MSG);
                } else if(this.responseText == 'limitJoinedEmail') {
                    appendErrorMsg("email_error_msg", ERR_LIMIT_ID_MSG);
                } else {
                    showMessageToAuth(this.responseText);
                }
            } else if(this.readyState == 4 && this.status == 500) {
                alert(this.responseText);
            }
        }
        xhr.open("post", "/users/join", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(body);
    }
}

function findId() {
    verifyEmail();
    const emailValue = document.getElementById("email").value;
    if (document.getElementsByClassName("error_msg").length == 0) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                if(this.response.length != 0) {
                    const formElement = document.getElementById('main').firstChild;
                    const divElement = document.createElement('div');
                    const usernameWrap = document.createElement('div');
                    const buttonElement = document.createElement('button');
                    const buttonDivElement = document.createElement('div');
                    const usernameJson = JSON.parse(this.response);
                    usernameWrap.className = 'username-wrap';
    
                    usernameJson.forEach(element => {
                        const divElement = document.createElement('div');
                        const spanElement = document.createElement('span');
    
                        divElement.className = 'find username';
                        spanElement.innerText = element.name;
                        usernameWrap.appendChild(divElement);
                        divElement.appendChild(spanElement);
                    });
                    buttonDivElement.className = 'main_page_btn_wrap';
                    buttonElement.href = '/';
                    buttonElement.innerText = '확인';
                    buttonElement.id = 'button';
                    buttonElement.className = 'main_page_btn';
                    buttonElement.addEventListener('click', () => window.location.href = '/');
                    buttonDivElement.appendChild(buttonElement);
                    divElement.appendChild(usernameWrap);
                    divElement.appendChild(buttonDivElement);
                    formElement.replaceWith(divElement);
                } else {
                    alert('해당 이메일로 가입된 유저가 존재 하지 않습니다. 이메일을 다시 확인해주세요.')
                }
            }
        }
        xhr.open("get", "/users/find/id/" + emailValue, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send();
    }
}

function findPswd() {
    verifyEmail();
    verifyId();

    if (document.getElementsByClassName("error_msg").length == 0) {
        const emailValue = document.getElementById("email").value;
        const idValue = document.getElementById("id").value;
        const input = document.getElementsByTagName('input');
        const xhr = new XMLHttpRequest();

        for (const element of input) element.disabled = 'true';
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                if(this.responseText == 'notJoinedUser') {
                    alert('해당 아이디로 가입된 유저가 존재 하지 않습니다. 아이디 또는 이메일을 다시 확인해주세요.')
                    for (const element of input) element.removeAttribute('disabled');
                } else {
                    showMessageToAuth(this.responseText);
                }
            }
        }
        xhr.open("get", "/users/find/pswd/" + idValue + "/"  + emailValue, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send();
    }
}

function changePswd() {
    if(document.getElementsByClassName("error_msg").length == 0) {
        const pswd1Value = document.getElementById("pswd1").value;
        const token = encodeURIComponent(window.location.search.slice(7));
        const params = "&password=" + pswd1Value + "&token=" + token;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200 && this.responseText == "OK") {
                alert('비밀번호 재설정을 완료되었습니다.');
                window.location.href = '/users/login';
            }
            if(this.readyState == 4 && this.status == 404) {
                alert('인증시간이 만료되었거나 알수 없는 오류로 인하여 비밀번호 재설정을 실패하였습니다. ');
            }
        }
        xhr.open("put", "/users/find/pswd/reset", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(params);
    }
}

function login() {
    verifyPswd();
    verifyId();

    if (document.getElementsByClassName("error_msg").length == 0) {
        const idValue = document.getElementById("id").value;
        const pswdValue = document.getElementById("pswd").value;
        const keepLoginValue = document.getElementById("keep_login").checked;
        const recaptcha = grecaptcha.getResponse();
        const params = "username=" + idValue + "&password=" + pswdValue + "&keepLogin=" + keepLoginValue + "&recaptcha=" + recaptcha;
        const xhr = new XMLHttpRequest();
        if(recaptcha == '') {
            document.querySelector('.g-recaptcha').classList.remove('hidden');
        } else {
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4 && xhr.status == 200 && xhr.responseText == 'ok') {
                    location.href = "/";
                }
                if(xhr.readyState == 4 && xhr.status == 200 && xhr.responseText == 'notJoinedUser') {
                    alert("존재하지 않는 유저 입니다.");
                    grecaptcha.reset();
                }
                if(xhr.readyState == 4 && xhr.status == 200 && xhr.responseText == 'notMatchedPassword') {
                    alert("비밀번호가 일치 하지 않습니다.");
                    grecaptcha.reset();
                }
                if(xhr.readyState == 4 && xhr.status == 401) {
                    alert("reCAPTCHA 인증에 실패하였습니다.");
                    grecaptcha.reset();
                }
            }
            xhr.open("post", "/users/login", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(params);
        }
    }
}

function showMessageToAuth(email) {
    const formElement = document.getElementById('main').firstChild;
    const divElement = document.createElement('div');
    const pElement = document.createElement('p');
    const emailJson = JSON.parse(email);
    const text = `<p>인증 메일이 ${emailJson.email}으로 전송되었습니다.</p><p>인증 절차를 완료해 주세요.</p>`;
    const buttonElement = document.createElement('button');
    const buttonDivElement = document.createElement('div');

    pElement.innerHTML = text;
    buttonDivElement.className = 'main_page_btn_wrap';
    buttonElement.href = '/';
    buttonElement.innerText = '확인';
    buttonElement.className = 'main_page_btn';
    buttonElement.addEventListener('click', () => window.location.href = '/');
    buttonDivElement.appendChild(buttonElement);
    divElement.appendChild(pElement);
    divElement.appendChild(buttonDivElement);
    formElement.replaceWith(divElement);
}