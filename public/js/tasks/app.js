window.addEventListener('load', async (e) => {
    e.preventDefault();
    await getTasksByUserAndCategory();
    await toggleCompletedTasks();
    await setCategory();
    await setDeadline();
    await resizeTasks();
    await renameCategory();
    // await getTasksCount();
});

async function getTasksByUserAndCategory() {
    const xhr = new XMLHttpRequest();
    // const body = "&taskId=" + taskId;

    xhr.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.status);
            
            document.getElementById('tasks').appendChild( await reformatToHtml(this.response) );
            toggleCompletedTasks();
            setDeadline();
        }
    }
    xhr.open("get", "/tasks/work", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

window.addEventListener('resize', async (e) => {
    const contentMarginL = 30;
    const sidebarWidth = 200;
    const threshold = 750;

    if (window.innerWidth < threshold) {
        let sidebar = document.getElementById("sidebar");
        content.style.marginLeft = contentMarginL + "px";
        sidebar.style.display = "none"
    } else {
        let sidebar = document.getElementById("sidebar");
        let content = document.getElementById("content");
        content.style.marginLeft = (sidebarWidth + contentMarginL) + "px";
        sidebar.style.display = "block";
    }
    await resizeTasks();
});

function toggleTaskImportance(taskId) {
    const xhr = new XMLHttpRequest();
    const body = "&taskId=" + taskId;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const taskImportance = document.getElementById(taskId).children[3].children[0];
            taskImportance.value ^= 1;        
            toggleCompletedTasks();
            setDeadline();
        }
    }
    xhr.open("put", "/tasks/toggleImportance", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(body);
}

function toggleTaskCompleted(taskId) {
    const xhr = new XMLHttpRequest();
    const body = "&taskId=" + taskId;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const taskCompleted = document.getElementById(taskId).children[0];
            taskCompleted.value ^= 1;
            console.log(taskCompleted.value);
            toggleCompletedTasks();
            setDeadline();
        }
    }
    xhr.open("put", "/tasks/toggleCompleted", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(body);
}

function incompleteTask(taskId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("tasks").innerHTML = this.responseText;
            toggleCompletedTasks();
            setDeadline();
        }
    }
    xhr.open("put", "/tasks/incomplete/" + taskId, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}

function updateTaskText(taskId) {
    const xhr = new XMLHttpRequest();
    const taskText = prompt("수정할 내용을 입력해 주세요.");
    if (!taskText) { return }
    
    const body = "&taskId=" + taskId + "&taskText=" + taskText
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById(taskId).childNodes[5].innerText = taskText
            toggleCompletedTasks();
            setDeadline();
        }
    }
    xhr.open("put", "/tasks/update/text", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(body);
}

function postTask() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
            const ul = document.getElementById('incomplete_ul');
            const li = document.createElement('li');
            const postedTask = JSON.parse(this.response)

            ul.prepend(await reformatTask(postedTask));

            // li.innerHTML = ;
            // ul.insertBefore(li, ul.firstChild);
            document.getElementById("post_task_msg").value = "";
            toggleCompletedTasks();
            setDeadline();
            resizeTasks();
        }
    }

    const taskText = document.getElementById("post_task_msg").value;
    const body = "&taskText=" + taskText;

    if (!taskText) { return }
    xhr.open("post", "/tasks", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(body);
}

function deleteTask(taskId) {
    try {
        if(confirm("정말로 삭제 하시겠습니까?")) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById(taskId).parentElement.remove();
                    toggleCompletedTasks();
                    setDeadline();
                } else if (this.status == 400) {
                    throw this.responseText;
                }
            }
            const body = "&taskId=" + taskId;
            xhr.open("delete", "/tasks/delete", true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send(body);
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
        if (this.readyState == 4 && this.status == 204) {
        location.href = "/";
        }
    }
    xhr.open("delete", "/users/logout", true);
    xhr.send();
}

async function resizeTasks() {
    const threshold = 750;
    const margin = 82;
    const marginWithSidebar = 282;
    if (window.innerWidth < threshold) {
        let taskBoxWidth = window.innerWidth - margin;
        document.getElementById("post_todo").style.width = taskBoxWidth + "px";
    } else {
        let taskBoxWidth = window.innerWidth - marginWithSidebar;
        document.getElementById("post_todo").style.width = taskBoxWidth + "px";
    }

}

async function toggleCompletedTasks() {
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

function searchTasks() {
    try {
        const text = document.getElementById("search_text").value;
        if(text) { 
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = async function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById('tasks').innerHTML = await reformatToHtml(this.response);
                    document.getElementById("category_title").innerText = "검색 결과"
                    if(document.getElementById("today_area")) document.getElementById("today_area").style.display = "none"
                    document.querySelector('[style]').style.backgroundColor = "rgb(220, 220, 220)";
                    setDeadline();
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
        const params = new URL(document.location).searchParams;
        const id = params.get("id");
        if(id) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert("카테고리를 삭제 하였습니다.");
                    location.href = "/tasks/today";
                } else if (this.status == 400) {
                    alert("카테고리 삭제에 실패하였습니다.");
                }
            }
            xhr.open("delete", "/tasks/category" + "?id=" + id, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send();
        }
    }
}

async function setCategory() {
    const params = new URL(document.location).searchParams;
    const id = params.get("id");
    const bgColor = "rgb(210, 210, 210)";
    const seleCat = "selected_category";
    if(!id) {
        let title = document.getElementById("category_title");
        Array.from(document.getElementById("common_categories").childNodes).forEach((element) => {
            if(element.childNodes[0].innerText == title.innerText) {
                element.style.backgroundColor = bgColor;
                element.id = seleCat;
            }
        });
    } else {
        Array.from(document.getElementById("personal_categories").childNodes).forEach((element) => {
            if(element.childNodes[0].href == document.location.href) {
                element.style.backgroundColor = bgColor;
                element.id = seleCat;
            }
        });
    }
}

async function renameCategory() {
    const params = new URL(document.location).searchParams;
    const id = params.get("id");
    if(id) {
        document.getElementById("category_title").addEventListener('click', () => {
            let category = document.getElementById("category_title");
            let form = document.createElement("form");
            let input = document.createElement("input");
            let inputWidth = Math.max(Math.min(category.getBoundingClientRect().width, document.querySelector('h1').getBoundingClientRect().width) - 15, 40) + "px";
            form.setAttribute('action', '#');
            form.setAttribute('onsubmit', 'return false');
            input.setAttribute('type', 'text');
            input.setAttribute('id', "rename_category");
            input.style.font = "30px bold";
            input.style.padding = "5px";
            input.style.width = inputWidth;
            input.value = category.innerText;
            form.appendChild(input);
            category.replaceWith(form);
            input.focus();
            input.select();

            input.addEventListener('input', (e) => {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                ctx.font = "30px bold"; // 카테고리 제목 폰트 스타일 참조하도록 만들기
                let text = input.value;
                input.style.width = Math.min(document.getElementById("title").getBoundingClientRect().width - 15, ctx.measureText(text).width) + "px";
            });
            input.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case "Enter":
                        input.blur();
                        break;
                        
                    case "Escape":
                        input.removeEventListener('focusout', send);
                        form.replaceWith(category);
                        break;
                
                    default:
                        break;
                }
            });
            input.addEventListener('focusout', send);

            function send() {
                if(!input.value || input.value == category.innerText) {
                    form.replaceWith(category);
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            category.innerText = input.value;
                            document.getElementById('selected_category').innerText = input.value;
                            form.replaceWith(category);
                        } else if (this.readyState == 4 && this.status == 400) {
                            alert("알수 없는 오류로 변경 실패하였습니다.")
                            //오류 알림후 무한 반복됨
                            location.href = "/tasks/category?id=" + id;
                        }
                    }
                    xhr.open("put", "/tasks/category/" + id + "/" + input.value, true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    xhr.send();
                }
            };
        });
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

async function setDeadline() {
    const clearText =  "지우기";
    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });

    $( ".deadline" ).datepicker({
        currentText: '오늘',
        closeText: "닫기",
        showButtonPanel: true,
        beforeShow: function( input ) {
            setTimeout(function() {
                var buttonPane = $( input )
                    .datepicker( "widget" )
                    .find( ".ui-datepicker-buttonpane" );
    
                $( "<button>", {
                    text: clearText,
                    click: function() {
                        $.datepicker._clearDate( input );
                    }
                }).appendTo( buttonPane ).addClass("ui-datepicker-clear ui-state-default ui-priority-primary ui-corner-all");
            }, 1 );
        },
        onChangeMonthYear: function( year, month, instance ) {
            setTimeout(function() {
                var buttonPane = $( instance )
                    .datepicker( "widget" )
                    .find( ".ui-datepicker-buttonpane" );
    
                $( "<button>", {
                    text: clearText,
                    click: function() {
                        $.datepicker._clearDate( instance.input );
                    }
                }).appendTo( buttonPane ).addClass("ui-datepicker-clear ui-state-default ui-priority-primary ui-corner-all");
            }, 1 );
        }
    }).on("input change", function(e) {
        const xhr = new XMLHttpRequest();
        const taskId = $(this).parent().parent().attr("id");
        let taskDeadline = e.target.value
        if(e.target.value == "") taskDeadline = "0000-00-00";
        const body = "&taskId=" + taskId + "&taskDeadline=" + taskDeadline

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const deadlineTextElement = document.getElementById(taskId).children[4].children['deadline_text'];
                deadlineTextElement.replaceWith(this.responseText);
                setDeadline();
            }
        }
        xhr.open("put", "/tasks/updateDeadline", true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(body);
    });
}



async function getTasksCount() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            
            response.forEach(element => {
                try {
                    var work = document.querySelector('.category_name[href="/tasks/work"]');
                    var importance = document.querySelector('.category_name[href="/tasks/import"]');
                    var plan = document.querySelector('.category_name[href="/tasks/plan"]');
                    var today = document.querySelector('.category_name[href="/tasks/today"]');
                    var aTag = document.createElement('a');
                    aTag.className = "tasks_count";

                    if(element.count > 0) {
                        switch (element.name) {
                            case work.innerHTML:
                                aTag.innerHTML = element.count;
                                work.parentElement.appendChild(aTag);
                                break;
                            case importance.innerHTML:
                                aTag.innerHTML = element.count;
                                importance.parentElement.appendChild(aTag);
                                break;
                            case plan.innerHTML:
                                aTag.innerHTML = element.count;
                                plan.parentElement.appendChild(aTag);
                                break;
                            case today.innerHTML:
                                aTag.innerHTML = element.count;
                                today.parentElement.appendChild(aTag);
                                break;
                            default:
                                aTag.innerHTML = element.count;
                                document.querySelector(`.category_name[href="/tasks/category?id=${element.name}"]`).parentElement.appendChild(aTag);
                                break;
                            }
                    }
                } catch (error) {
                    
                }
            });
        }
    }
    xhr.open("get", "/tasks/count/", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send();
}