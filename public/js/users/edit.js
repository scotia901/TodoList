const ERROR_DEL_IMG_MSG = '회원 이미지 삭제에 실패 하였습니다.';
const ERROR_UPLOAD_IMG_MSG = '알수 없는 오류로 인하여 업로드 실패했습니다.';
const MISMATCH_CODE_MSG = '인증 코드가 틀렸습니다.';
const EXFIRE_CODE_MSG = '인증 코드가 만료되었습니다.';
const ABNORMAL_ACCESS_MSG = '비정상적인 접근입니다.';
const INVALID_EMAIL_MSG = '잘못된 이메일 주소입니다.';
const INVALID_PSWD_MSG = '8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.';
const INVALIED_USERNAME_MSG = '2-10자 영어, 한글을 사용해야 합니다.'
const MISMATCH_PSWD_MSG = '비밀번호가 일치하지 않습니다.';
const SEND_AUTH_TO_NEW_EMAIL_MSG = '새로운 이메일로 인증 번호가 전송 되었습니다.';
const SUCCESS_EMAIL_AUTH_MSG = '이메일 인증이 완료되었습니다.';
const SUCCESS_NEW_EMAIL_MSG = '새로운 이메일로 변경이 완료되었습니다.';
const SUCCESS_NEW_PSWD_MSG = '새로운 비밀번호로 변경이 완료되었습니다.';
const SUCCESS_NEW_USERNAME_MSG = '새로운 별명으로 변경이 완료되었습니다.';
const FAILED_NEW_USERNAME_MSG = '새로운 별명으로 변경이 실패되었습니다.';
var isAuthCode = false;

window.onload = async (event) => {
    event.prevverifyNewPswd1entDefault();
    var imgArea = document.getElementById('upload-img');
    var currentEmail = document.getElementById('current-email');
    var newEmail = document.getElementById('new-email');
    var currentPswd = document.getElementById('current-pswd');
    var newPswd1 = document.getElementById('new-pswd1');
    var newPswd2 = document.getElementById('new-pswd2');
    var sendAuthBtn = document.getElementById('send-code-btn');
    var authBtn = document.getElementById('auth-btn');
    var backBtn = document.getElementById('back-btn');
    var changeEmailBtn = document.getElementById('change-email-btn');

    if(currentEmail) currentEmail.addEventListener('change', verifyCurrentEmail);
    if(newEmail) newEmail.addEventListener('change', verifyNewEmail);
    if(currentPswd) currentmsgPswd.addEventListener('change', verifyCurrentPswd);
    if(newPswd1) newPswd1.addEventListener('change', verifyNewPswd1);
    if(newPswd2) newPswd2.addEventListener('change', verifyNewPswd2);
    if(sendAuthBtn) sendAuthBtn.addEventListener('click', sendCode);
    if(authBtn) authBtn.addEventListener('click', authenticateCode);
    if(backBtn) backBtn.addEventListener('click', goTasks);
    if(changeEmailBtn) changeEmailBtn.addEventListener('click', changeEmail);
    if(imgArea) document.getElementById('upload-img').addEventListener('change', uploadFile);
}

function appendErrorMsg(elementId, errorMsg) {
    if (!document.getElementById(elementId)) {
        const para = document.createElement('p');
        para.setAttribute('id', elementId);
        para.setAttribute('class', 'error-msg');
        const warnMsg = document.createTextNode(errorMsg);
        para.appendChild(warnMsg);
        document.getElementById(elementId.substring(0, elementId.length - 10) + '-inputarea').appendChild(para);
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
    const emailValue = document.getElementById('current-email').value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg('current-email-error-msg');
    } else {
        const errorMsg = INVALID_EMAIL_MSG;
        appendErrorMsg('current-email-error-msg', errorMsg);
    }
}

function verifyNewEmail() {
    const emailValue = document.getElementById('new-email').value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg('new-email-error-msg');
    } else {
        const errorMsg = INVALID_EMAIL_MSG;
        appendErrorMsg('new-email-error-msg', errorMsg);
    }
}

function verifyCurrentPswd() {
    const pswd1Value = document.getElementById('current-pswd').value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg('current-pswd-error-msg');
    } else {
        const errorMsg = INVALID_PSWD_MSG;
        appendErrorMsg('current-pswd-error-msg', errorMsg);
    }
}

function verifyNewPswd1() {
    const pswd1Value = document.getElementById('new-pswd1').value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg('new-pswd1-error-msg');
    } else {
        const errorMsg = INVALID_PSWD_MSG;
        appendErrorMsg('new-pswd1-error-msg', errorMsg);
    }
}

function verifyNewPswd2() {
    const pswd1Value = document.getElementById('new-pswd1').value;
    const pswd2Value = document.getElementById('new-pswd2').value;

    if(pswd1Value == pswd2Value) {
        removeErrorMsg('new-pswd2-error-msg');
    } else {
        const errorMsg = MISMATCH_PSWD_MSG;
        appendErrorMsg('new-pswd2-error-msg', errorMsg);
    }
}


function sendCode() {
    verifyNewEmail();

    if (document.getElementsByClassName('error-msg').length == 0) {
        let sendCodeBtn = document.getElementById('send-code-btn');
        
        const params = 'email=' + document.getElementById('new-email').value;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                document.body.style.cursor = 'default';
                let authCodeArea = document.getElementById('auth-code-row');
                let authCodeInput = document.getElementById('auth-code');

                alert(SEND_AUTH_TO_NEW_EMAIL_MSG);
                sendCodeBtn.disabled = false;
                authCodeInput.value = ''
                authCodeArea.style.display = 'block';
                
            }
            if(this.readyState == 4 && this.status == 400) {
                document.body.style.cursor = 'default';
                sendCodeBtn.disabled = false;
                alert('error');
            }
            if(this.readyState >= 1 && this.readyState <= 3) {
                document.body.style.cursor = 'wait';
                sendCodeBtn.disabled = true;
            }
        }

        xhr.open('post', 'send-code', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    }
}

function authenticateCode() {
    if (document.getElementsByClassName('error-msg').length == 0) {
        const params = 'email=' + document.getElementById('new-email').value + 
                     '&code=' + document.getElementById('auth-code').value;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                const auth = document.getElementById('auth-code');
                const newEmail = document.getElementById('new-email');
                const sendCodeBtn = document.getElementById('send-code-btn');
                const authBtn = document.getElementById('auth-btn');
                const boxBgColor = 'rgb(230,230,230)';
                const boxFontColor = 'rgb(0,0,0)';
                
                alert(SUCCESS_EMAIL_AUTH_MSG);
                isAuthCode = true;
                sendCodeBtn.disabled = true;
                sendCodeBtn.style.background = boxBgColor;
                sendCodeBtn.style.pointerEvents = 'none';
                authBtn.disabled = true;
                authBtn.style.background = boxBgColor;
                authBtn.style.pointerEvents = 'none';
                newEmail.disabled = true;
                newEmail.style.backgroundColor = boxBgColor;
                newEmail.style.color = boxFontColor;
                auth.disabled = true;
                auth.style.backgroundColor = boxBgColor;
                auth.style.color = boxFontColor;
            }
            if(this.readyState == 4 && this.status == 400) {
                if(this.responseText == 'not match code') alert(MISMATCH_CODE_MSG);
                if(this.responseText == 'code is expired') alert(EXFIRE_CODE_MSG);
            }
        }
        xhr.open('post', 'auth-code', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    }
}

function changeEmail() {
    verifyCurrentEmail();
    verifyNewEmail();
    if(isAuthCode && document.getElementsByClassName('error-msg').length == 0) {
        const params = 'currentEmail=' + document.getElementById('current-email').value + 
                     '&newEmail=' + document.getElementById('new-email').value + 
                     '&code=' + document.getElementById('auth-code').value;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert(SUCCESS_NEW_EMAIL_MSG);
                location.href = '/users/profile';
            }
            if(this.readyState == 4 && this.status == 400) {
                if(this.responseText == 'not match code') alert(MISMATCH_CODE_MSG);
                if(this.responseText == 'abnormal access') alert(ABNORMAL_ACCESS_MSG);
            }
        }
        xhr.open('put', 'email/change', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    }
}

function changePswd() {
    verifyCurrentPswd();
    verifyNewPswd1();
    verifyNewPswd2();

    if(document.getElementsByClassName('error-msg').length == 0) {
        const params = 'currentPswd=' + document.getElementById('current-pswd').value + 
                     '&newPswd=' + document.getElementById('new-pswd1').value;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert(SUCCESS_NEW_PSWD_MSG)
                location.href = '/users/profile';
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
        }
        xhr.open('put', 'pswd/change', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    }
}

function goTasks() {
    location.href = '/users/profile';
}

async function changeUsername() {
    let username = document.getElementById('username');
    let form = document.createElement('form');
    let renameInput = document.createElement('input');
    let cancelBtn = document.createElement('button');
    let changeBtn = document.createElement('button');
    let editNicknameBtn = document.getElementById('edit-nickname-btn');
    let usernameArea = document.getElementById('edit-nick-area');
    cancelBtn.setAttribute('id', 'cancel-btn');
    cancelBtn.innerText = '취소';
    changeBtn.setAttribute('id', 'change-btn');
    changeBtn.innerText = '변경';
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return false');
    renameInput.setAttribute('type', 'text');
    renameInput.setAttribute('id', 'rename');
    renameInput.style.fontSize = '18px';
    renameInput.style.width = '100px';
    renameInput.style.height = '28px';
    renameInput.value = username.innerText;

    usernameArea.removeChild(editNicknameBtn);
    form.appendChild(renameInput);
    form.appendChild(cancelBtn);
    form.appendChild(changeBtn);
    username.replaceWith(form);
    renameInput.focus();
    renameInput.select();

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        form.replaceWith(username);
        usernameArea.appendChild(editNicknameBtn);
    });

    changeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await send();
    });

    renameInput.addEventListener('keydown', async (e) => {
        switch (e.key) {
            case 'Enter':
                await send();
                break;
                
            case 'Escape':
                form.replaceWith(username);
                usernameArea.appendChild(editNicknameBtn);
                break;
        
            default:
                break;
        }
    });

    async function send() {
        if(!renameInput.value || renameInput.value == username.innerText) {
            form.replaceWith(username);
            usernameArea.appendChild(editNicknameBtn);
        } else {
            const usernameFormat = /^[\w|가-힣]{2,10}$/
            if (usernameFormat.test(renameInput.value) == true) {
                const params = 'username=' + renameInput.value;
                alert(params)
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert(SUCCESS_NEW_USERNAME_MSG)
                        username.innerText = renameInput.value;
                        form.replaceWith(username);
                        usernameArea.appendChild(editNicknameBtn);
                    } else if (this.readyState == 4 && this.status == 400) {
                        alert(FAILED_NEW_USERNAME_MSG);
                        form.replaceWith(username);
                        usernameArea.appendChild(editNicknameBtn);
                    }
                }
                xhr.open('put', '/users/profile/edit/username', true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send(params);
            } else {
                alert(INVALIED_USERNAME_MSG);
            }
        }
    }
}

function deleteSnsUser() {
    
}