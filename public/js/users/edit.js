const ERROR_DEL_IMG_MSG = '회원 이미지 삭제에 실패 하였습니다.';
const ERROR_UPLOAD_IMG_MSG = '알수 없는 오류로 인하여 업로드 실패했습니다.';
const MISMATCH_CODE_MSG = '인증 코드가 틀렸습니다.';
const EXFIRE_CODE_MSG = '인증 코드가 만료되었습니다.';
const ABNORMAL_ACCESS_MSG = '비정상적인 접근입니다.';
const INVALID_EMAIL_MSG = '잘못된 이메일 주소입니다.';
const INVALID_PSWD_MSG = '8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.';
const INVALIED_NiCKNAME_MSG = '2-10자 영어, 한글을 사용해야 합니다.'
const MISMATCH_PSWD_MSG = '비밀번호가 일치하지 않습니다.';
const SEND_AUTH_TO_NEW_EMAIL_MSG = '새로운 이메일로 인증 번호가 전송 되었습니다.';
const SUCCESS_EMAIL_AUTH_MSG = '이메일 인증이 완료되었습니다.';
const SUCCESS_NEW_EMAIL_MSG = '새로운 이메일로 변경이 완료되었습니다.';
const SUCCESS_NEW_PSWD_MSG = '새로운 비밀번호로 변경이 완료되었습니다.';
const SUCCESS_NEW_NiCKNAME_MSG = '새로운 별명으로 변경이 완료되었습니다.';
const FAILED_NEW_NiCKNAME_MSG = '새로운 별명으로 변경이 실패되었습니다.';
const UNAHTHORIZED_NEW_EMAIL_MSG = '새로운 이메일 인증이 완료되지 않았습니다.';
const IDENTICAL_EMAIL_MSG = '기존 이메일과 동일한 이메일 주소는 사용이 불가능 합니다.';
var isAuthCode = false;

window.addEventListener('load', (event) => {
    event.preventDefault();
    const updateNicknameBtn = document.getElementById('update-nickname-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const deleteSnsUserBtn = document.getElementById('delete-sns-user-btn');
    const currentEmail = document.getElementById('current_email');
    const newEmail = document.getElementById('new_email');
    const sendAuthEmailBtn = document.getElementById('send_code_btn');
    const AuthUpdateEmailBtn = document.getElementById('auth_btn');
    const updateEmailBtn = document.getElementById('submit_email_btn');
    const currentPswd = document.getElementById('current_pswd');
    const newPswd1 = document.getElementById('new_pswd1');
    const newPswd2 = document.getElementById('new_pswd2');
    const updatePswdBtn = document.getElementById('submit_pswd_btn');
    // const authBtn = document.getElementById('auth-btn');
    const backBtn = document.getElementById('back_btn');
    const deleteUserBtn = document.getElementById('delete-user-btn');


    if (currentEmail) currentEmail.addEventListener('change', verifyCurrentEmail);
    if (newEmail) newEmail.addEventListener('change', verifyNewEmail);
    if (sendAuthEmailBtn) sendAuthEmailBtn.addEventListener('click', sendCode);
    if (AuthUpdateEmailBtn) AuthUpdateEmailBtn.addEventListener('click', authenticateCode);
    if (updateEmailBtn) updateEmailBtn.addEventListener('click', updateEmail);
    if (backBtn) backBtn.addEventListener('click', getProfilePage);
    if (updateNicknameBtn) updateNicknameBtn.addEventListener('click', changeNickname);
    if (resetPasswordBtn) resetPasswordBtn.addEventListener('click', resetPassword);
    if (deleteSnsUserBtn) deleteSnsUserBtn.addEventListener('click', deleteSnsUser);
    if (currentPswd) currentPswd.addEventListener('change', verifyCurrentPswd);
    if (newPswd1) newPswd1.addEventListener('change', verifyNewPswd1);
    if (newPswd2) newPswd2.addEventListener('change', verifyNewPswd2);
    if (updatePswdBtn) updatePswdBtn.addEventListener('click', updatePswd);
    if (deleteUserBtn) deleteUserBtn.addEventListener('click', deleteUser);
    // if(authBtn) authBtn.addEventListener('click', authenticateCode);
});

function deleteUser() {
    const isConfirm = confirm('정말로 탈퇴 하시겠습니까?');
    
    if(isConfirm) {
        fetch('/users/delete/user',{
            method: 'DELETE'
        }).then(response => {
            if(response.ok) {
                alert('회원 탈퇴에 성공하였습니다.');
                window.location.href = '/users/login';
            }
        }).catch(error => {
            alert('알수 없는 오류로 인하여 탈퇴에 실패하였습니다.');
            console.error(error);
        });
    }
}

function verifyCurrentEmail() {
    const emailValue = document.getElementById('current_email').value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailFormat.test(emailValue)) {
        removeErrorMsg('current_email_error_msg');
    } else {
        appendErrorMsg('current_email_error_msg', INVALID_EMAIL_MSG);
    }
}

async function verifyNewEmail() {
    const newEmailValue = document.getElementById('new_email').value;
    const currentEmailValue = document.getElementById('current_email').value;
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(emailFormat.test(newEmailValue)) {
        if(currentEmailValue != newEmailValue) {
            removeErrorMsg('new_email_error_msg');
        } else {
            appendErrorMsg('new_email_error_msg', IDENTICAL_EMAIL_MSG);
        }
    } else {
        appendErrorMsg('new_email_error_msg', INVALID_EMAIL_MSG);
    }
}

function verifyCurrentPswd() {
    const pswd1Value = document.getElementById('current_pswd').value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg('current_pswd_error_msg');
    } else {
        const errorMsg = INVALID_PSWD_MSG;
        appendErrorMsg('current_pswd_error_msg', errorMsg);
    }
}

function verifyNewPswd1() {
    const pswd1Value = document.getElementById('new_pswd1').value;
    const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;

    if(pswdFormat.test(pswd1Value)) {
        removeErrorMsg('new_pswd1_error_msg');
    } else {
        const errorMsg = INVALID_PSWD_MSG;
        appendErrorMsg('new_pswd1_error_msg', errorMsg);
    }
}

function verifyNewPswd2() {
    const pswd1Value = document.getElementById('new_pswd1').value;
    const pswd2Value = document.getElementById('new_pswd2').value;

    if(pswd1Value == pswd2Value) {
        removeErrorMsg('new_pswd2_error_msg');
    } else {
        const errorMsg = MISMATCH_PSWD_MSG;
        appendErrorMsg('new_pswd2_error_msg', errorMsg);
    }
}


async function sendCode() {
    const sendCodeBtn = document.getElementById('send_code_btn');
    verifyNewEmail();

    if (document.getElementsByClassName('error-msg').length == 0) {
        const params = 'newEmail=' + document.getElementById('new_email').value + '&currentEmail=' + document.getElementById('current_email').value;
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if(this.readyState == 4) {
                if(this.status == 200) {
                    document.body.style.cursor = 'default';
                    const authCodeArea = document.getElementById('auth_code_row');
                    const authCodeInput = document.getElementById('auth_code');
    
                    alert(SEND_AUTH_TO_NEW_EMAIL_MSG);
                    sendCodeBtn.disabled = false;
                    authCodeInput.value = ''
                    authCodeArea.style.display = 'block';
                    sendCodeBtn.classList.remove('waiting_send');
                }
                if(this.status == 500 || this.status == 401) {
                    document.body.style.cursor = 'default';
                    sendCodeBtn.disabled = false;
                    sendCodeBtn.classList.remove('waiting_send');
                    alert('error');
                }
            }

            if(this.readyState >= 1 && this.readyState <= 3) {
                sendCodeBtn.disabled = true;
                sendCodeBtn.classList.add('waiting_send');
            }
        }

        xhr.open('post', '/auth/code', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    } else {
        sendCodeBtn.disabled = false;
        sendCodeBtn.classList.remove('waiting_send');
    }
}

async function authenticateCode() {
    if (document.getElementsByClassName('error-msg').length == 0) {
        const query = 'email=' + document.getElementById('new_email').value + 
                     '&code=' + document.getElementById('auth_code').value;

        await fetch('/auth/code?' + query).then(response => {
            if(response.ok) {
                const auth = document.getElementById('auth_code');
                const currentEmail = document.getElementById('current_email');
                const newEmail = document.getElementById('new_email');
                const sendCodeBtn = document.getElementById('send_code_btn');
                const authBtn = document.getElementById('auth_btn');
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
                currentEmail.disabled = true;
                currentEmail.style.backgroundColor = boxBgColor;
                currentEmail.style.color = boxFontColor;
                newEmail.disabled = true;
                newEmail.style.backgroundColor = boxBgColor;
                newEmail.style.color = boxFontColor;
                auth.disabled = true;
                auth.style.backgroundColor = boxBgColor;
                auth.style.color = boxFontColor;
            }
        }).catch(error => {
            console.error(error);
        });
    }
}

function updateEmail() {
    verifyCurrentEmail();
    verifyNewEmail();

    if(document.getElementsByClassName('error_msg').length == 0) {
        if(isAuthCode) {
            const xhr = new XMLHttpRequest();
            const params = 'email=' + document.getElementById('new_email').value;
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
            xhr.open('put', '/users/update/email', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send(params);
        } else {
            alert(UNAHTHORIZED_NEW_EMAIL_MSG);
        }
    }

}

function updatePswd() {
    verifyCurrentPswd();
    verifyNewPswd1();
    verifyNewPswd2();

    if(document.getElementsByClassName('error_msg').length == 0) {
        const params = 'currentPswd=' + document.getElementById('current_pswd').value + 
                     '&newPswd=' + document.getElementById('new_pswd1').value;
        const xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                alert(SUCCESS_NEW_PSWD_MSG);
                getProfilePage();
            }
            if(this.readyState == 4 && this.status == 400) {
                alert('error');
            }
            if(this.readyState == 4 && this.status == 401) {
                appendErrorMsg('current_pswd_error_msg', '기존 비밀번호가 일치하지 않습니다.');
            }
        }
        xhr.open('put', '/users/update/pswd', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(params);
    }
}

function getProfilePage() {
    location.href = '/users/profile';
}

function changeNickname() {
    const nickname = document.getElementById('nickname');
    const form = document.createElement('form');
    const nicknameInput = document.createElement('input');
    const cancelBtn = document.createElement('button');
    const changeBtn = document.createElement('button');
    const editNicknameBtn = document.getElementById('update-nickname-btn');
    const nicknameArea = document.getElementById('update-nickname-area');
    cancelBtn.setAttribute('id', 'cancel-btn');
    cancelBtn.innerText = '취소';
    cancelBtn.className = 'button';
    changeBtn.setAttribute('id', 'change-btn');
    changeBtn.innerText = '변경';
    changeBtn.className = 'button';
    form.setAttribute('action', '#');
    form.className = 'update-nickname'
    form.setAttribute('onsubmit', 'return false');
    form.style.display = 'contents';
    nicknameInput.setAttribute('type', 'text');
    nicknameInput.setAttribute('id', 'update-nickname-input');
    nicknameInput.value = nickname.innerText;

    nicknameArea.removeChild(editNicknameBtn);
    form.appendChild(nicknameInput);
    form.appendChild(changeBtn);
    form.appendChild(cancelBtn);
    nickname.replaceWith(form);
    nicknameInput.focus();
    nicknameInput.select();

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        form.replaceWith(nickname);
        nicknameArea.appendChild(editNicknameBtn);
    });

    changeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await send();
    });

    nicknameInput.addEventListener('keydown', async (e) => {
        switch (e.key) {
            case 'Escape':
                form.replaceWith(nickname);
                nicknameArea.appendChild(editNicknameBtn);
                break;
        
            default:
                break;
        }
    });

    async function send() {
        if(!nicknameInput.value || nicknameInput.value == nickname.innerText) {
            form.replaceWith(nickname);
            nicknameArea.appendChild(editNicknameBtn);
        } else {
            const nicknameFormat = /^[\w|가-힣]{2,10}$/
            if (nicknameFormat.test(nicknameInput.value) == true) {
                const params = 'nickname=' + nicknameInput.value;
                const xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert(SUCCESS_NEW_NiCKNAME_MSG);
                        nickname.innerText = nicknameInput.value;
                        form.replaceWith(nickname);
                        nicknameArea.appendChild(editNicknameBtn);
                        if(document.getElementsByClassName('profile-image has-image-file')[0] == undefined) {
                            createDefaultProfileImg();
                        }
                    } else if (this.readyState == 4 && this.status == 400) {
                        alert(FAILED_NEW_NiCKNAME_MSG);
                        form.replaceWith(nickname);
                        nicknameArea.appendChild(editNicknameBtn);
                    }
                }
                xhr.open('put', '/users/profile/edit/nickname', true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send(params);
            } else {
                alert(INVALIED_NiCKNAME_MSG);
            }
        }
    }
}

async function resetPassword() {
    const body = {password: password};

    await fetch('/users/find/pswd/reset', {
        method: 'PUT',
        body: JSON.stringify(body)
    }).then(response => {
        if(response.ok) {
            alert('비밀번호 변경이 완료되었습니다.');
            window.location.href = '/';
        }
    }).catch(error => {
        console.error(error);
    })
}

async function deleteSnsUser() {
    const answerToDeleteSnsUser = confirm('SNS 계정 연동을 해제 하시겠습니까?');
    
    if(answerToDeleteSnsUser === true) {
        await fetch('/users/delete/snsuser', {
            method: 'DELETE'
        }).then(async response => {
            if(response.ok) {
                const url = await response.text();
                window.location.href = url;
            }
        }).catch(error => {
            alert(error);
        });
    }
}