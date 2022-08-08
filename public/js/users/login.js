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
        let errorMsg = "영어 대소문자 길이 5~20자를 입력해야 합니다.";
        appendErrorMsg("id_error_msg", errorMsg);
    }

    if(pswdFormat.test(pswdValue)) {
        removeErrorMsg("pswd_error_msg");
    } else {
        let errorMsg = "8-20자 영어 대소문자, 특수문자, 숫자를 입력해야 합니다.";
        appendErrorMsg("pswd_error_msg", errorMsg);
    }

    if (document.getElementsByClassName("error_msg").length == 0) {
        let params = "username=" + idValue + "&password=" + pswdValue + "&keepLogin=" + keepLoginValue;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                location.href = "/tasks";
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