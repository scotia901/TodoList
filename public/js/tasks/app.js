window.addEventListener('resize', resizeTasks);
window.addEventListener('load', (e) => {
    e.preventDefault();
    toggleCompletedTasks();
    setCategory();
    resizeTasks();
});

function toggleImportance(taskId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
        }
    }
    xhr.open("put", "/tasks/mark/" + taskId, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function completeTask(taskId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
        }
    }
    xhr.open("put", "/tasks/complete/" + taskId, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function incompleteTask(taskId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
        }
    }
    xhr.open("put", "/tasks/incomplete/" + taskId, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function editTask(taskId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
        }
    }
    let taskDescription = prompt("수정할 내용을 입력해 주세요.");
    if (!taskDescription) { return }
    xhr.open("put", "/tasks/edit/" + taskId + "/" + taskDescription, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function postTask() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("post_task_msg").value = "";
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
        }
    }
    let taskDescription = document.getElementById("post_task_msg").value;
    let category = document.getElementById("category_title").innerText;
    if (!taskDescription && !category) { return }
    xhr.open("post", "/tasks/post/" + category + "/" + taskDescription, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function deleteTask(taskId) {
    try {
        if(confirm("정말로 삭제 하시겠습니까?")) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("tasks").innerHTML = this.responseText;
                    toggleCompletedTasks();
                } else if (this.status == 400) {
                    throw this.responseText;
                }
            }
            xhr.open("delete", "/tasks/delete/" + taskId, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send();
        }
    } catch (error) {
        alert(error);
    }
}

function viewUserInfo() {
    location.href = "/users/profile";
}

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        location.href = "/";
        }
    }
    xhr.open("delete", "/users/logout", true);
    xhr.send();
}

function resizeTasks() {
    const marginR = 282;
    let taskBoxWidth = window.innerWidth - marginR;
    taskBoxWidth.toString();
    document.getElementById("post_todo").style.width = taskBoxWidth + "px";
}

function toggleCompletedTasks() {
    const samesite = "samesite=lax"
    if(!getCookie("toggle")) document.cookie = "toggle=none;" + samesite
    if(document.getElementById("completed_title_area")) {
        document.getElementById("completed_ul").style.display = getCookie("toggle");
        document.getElementById("completed_title_area").addEventListener('click', () => {
            let compltedUl = document.getElementById("completed_ul");
            const display = compltedUl.style.display;
    
            if(display == "none") {
                compltedUl.style.display = "block";
                document.cookie = "toggle=" + "block;" + samesite;
            } else if(display == "block") {
                compltedUl.style.display = "none";
                document.cookie = "toggle=" + "none;" + samesite;
            } else {
                compltedUl.style.display = "block";
                document.cookie = "toggle=" + "block;" + samesite;
            }
        });
    }
};

function setCategory() {
    Array.from(document.getElementsByClassName("category_btn")).forEach((element) => {
        if(!getCookie("category")) {
            document.cooke = "category=[오늘 할 일, lax]";
        }
        
        if(element.textContent == document.getElementById("category_title").innerText) {
            element.style.backgroundColor  = "rgb(210, 210, 210)";
        }
        element.addEventListener('click', () => {

            document.cookie = "category=" + encodeURI(element.textContent) + ";samesite=lax";
            location.href = "/tasks";
        })
    });
};

function searchTasks() {
    try {
        const text = document.getElementById("search_text").value;
        if(text) { 
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("tasks").innerHTML = this.responseText;
                    document.getElementById("category_title").innerText = "검색 결과"
                    if(document.getElementById("today_area")) document.getElementById("today_area").style.display = "none"
                    document.querySelector('[style]').style.backgroundColor = "rgb(220, 220, 220)";
                    
                }
            }
            xhr.open("get", "/tasks/search/" + text, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send();
        }
    } catch (error) {
        alert(error);
    }
}

function addCategory() {
    try {
        const listName = document.getElementById("new_list_name").value;
        if(listName) { 
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                location.reload();
                }
            }
            xhr.open("post", "/tasks/category/" + listName, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send();
        }
    } catch (error) {
        alert(error);
    }
}

function deleteCategory() {
    if(confirm("카테고리를 삭제 하시겠습니까?")) {
        const name = document.getElementById("category_title").innerText;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                location.reload();
            } else if (this.status == 400) {
                // throw alert(this.responseText);
            }
        }
        xhr.open("delete", "/tasks/category/" + name, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send();
    }
}

function getCookie(name) {
    try {
        return document.cookie
        .split('; ')
        .find(row => row.startsWith(name))
        .split('=')[1];
    } catch {
        return null;
    }
}