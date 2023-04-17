const ERR_EXIST_ID_MSG = "이미 가입된 아이디입니다.";
const ERR_EXIST_NICKNAME_MSG = "중복된 닉네임 입니다.";
const ERR_INVALIED_ID_MSG = "영어 대소문자 길이 5~20자를 입력해야 합니다.";
const ERR_INVALID_PSWD_MSG = "8-20자 영어 대소문자, 특수문자, 숫자를 사용해야 합니다.";
const ERR_MISMATCH_PSWD_MSG = "비밀번호가 일치하지 않습니다.";
const ERR_INVALID_EMAIL_MSG = "잘못된 이메일 주소입니다.";
const ERR_LIMIT_ID_MSG = "입력하신 이메일로 가입된 아이디가 3개 존재하여 더 이상 가입이 불가능합니다.";
const ERR_FIND_ID_MSG = "알 수 없는 오류로 아이디 찾기에 실패하였습니다. 나중에 다시 시도 해주세요.";
const ERR_NICKNAME_FORMAT_MSG = "특수 문자를 제외한 영어, 한글 2~10자를 입력해야 합니다.";
const ERR_MISMATCH_CURRENT_PSWD_MSG = "기존 비밀번호가 일치하지 않습니다.";

function appendErrorMsg(elementId, errorMsg) {
    if (!document.getElementById(elementId)) {
        const para = document.createElement("p");
        const warnMsg = document.createTextNode(errorMsg);
        
        para.setAttribute("id", elementId);
        para.setAttribute("class", "error_msg");
        para.appendChild(warnMsg);
        console.log(elementId.substring(0, elementId.length - 10) + "_input_wrap")
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