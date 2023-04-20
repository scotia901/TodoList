const ERR_EXIST_ID_MSG = "이미 가입된 아이디입니다.";
const ERR_EXIST_NICKNAME_MSG = "중복된 닉네임 입니다.";
const ERR_INVALIED_ID_MSG = "영어 대소문자 길이 5~20자를 입력해야 합니다.";
const ERR_INVALID_PSWD_MSG = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
const ERR_INVALIED_NICKNAME_MSG = '2-10자 영어, 한글을 사용해야 합니다.'
const ERR_MISMATCH_PSWD_MSG = "비밀번호가 일치하지 않습니다.";
const ERR_INVALID_EMAIL_MSG = "잘못된 이메일 주소입니다.";
const ERR_LIMIT_ID_MSG = "입력하신 이메일로 가입된 아이디가 3개 존재하여 더 이상 가입이 불가능합니다.";
const ERR_FIND_ID_MSG = "알 수 없는 오류로 아이디 찾기에 실패하였습니다. 나중에 다시 시도 해주세요.";
const ERR_MISMATCH_CURRENT_PSWD_MSG = "기존 비밀번호가 일치하지 않습니다.";
const ERR_UNAHTHORIZED_NEW_EMAIL_MSG = '새로운 이메일 인증이 실패하였습니다.';
const ERR_IDENTICAL_EMAIL_MSG = '기존 이메일과 동일한 이메일 주소는 사용이 불가능 합니다.';
const ERR_FAILED_NEW_NiCKNAME_MSG = '새로운 별명으로 변경이 실패되었습니다.';
const ERR_FAILED_DELETE_IMG_MSG = '회원 이미지 삭제에 실패 하였습니다.';
const ERR_FALIED_UPLOAD_IMG_MSG = '알수 없는 오류로 인하여 업로드 실패했습니다.';
const ERR_EXFIRE_CODE_MSG = '인증 코드가 만료되었습니다.';
const ERR_MISMATCH_AUTHCODE_MSG = '인증 코드가 틀렸습니다.';

function appendErrorMsg(elementId, errorMsg) {
    if (!document.getElementById(elementId)) {
        const para = document.createElement("p");
        const warnMsg = document.createTextNode(errorMsg);
        
        para.setAttribute("id", elementId);
        para.setAttribute("class", "error_msg");
        para.appendChild(warnMsg);
        document.getElementById(elementId.substring(0, elementId.length - 10) + "_input_wrap").appendChild(para);
    } else {
        document.getElementById(elementId).textContent = errorMsg;
    }
}

function removeErrorMsg(elementId) {
    if (document.getElementById(elementId)) {
        document.getElementById(elementId).remove();
    }
}

function handleError(error) {
    if (error === 400) {
        alert('잘못된 요청입니다.');
    } else if (error === 401) {
        alert('인증되지 않아 이용할수 없습니다.');
    } else if (error === 403) {
        alert('숨겨진 리소스입니다.');
    } else if (error === 404) {
        alert('리소스를 찾을수 없습니다.');
    } else if (error === 500) {
        alert('서버에 요청을 실패하였습니다.');
    } else {
        console.error(error);
    }
};