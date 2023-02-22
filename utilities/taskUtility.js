async function reformatToHtml(taskData) {
    const category = true;
    const tasks = JSON.parse(taskData);
    const ul = document.createElement('ul');
    ul.className = "tasks_lists";
    
    // const incompleteUl = ul'<ul class="task_lists" id="incomplete_ul">';
    const incompleteUl = document.createElement('ul');
    incompleteUl.className = 'task_lists';
    incompleteUl.id = 'incomplete_ul';

    const completedUl = document.createElement('ul');
    completedUl.className = 'task_lists';
    completedUl.id = 'completed_ul';
    completedUl.display = 'block';
    // const completedUl = '<ul class="task_lists" id="completed_ul" style="display: block;">';
    let htmlFormat = new String();;
    let incompleteTasks = new String();
    let completedTasks = new String();
    let completedCount = 0;
    let incompleteCount = 0;
    
    for await (const task of tasks) {
        if (task.completed == true) {
            completedCount++
            completedTasks += await reformatTask(task, completedCount);
        } else {
            incompleteCount++
            incompleteUl.appendChild( await reformatTask(task, incompleteCount) );
        }
    }

    const completed_title = (completedCount > 0 )?
                            `<div id="completed_title_area">
                            <a id="completed_title">완료됨 ${completedCount}</a></div>`
                            : "";

    if(category == false) {
        ul.appendChild(incompleteTasks);

        htmlFormat = '<ul class="task_lists">' + incompleteTasks + completedTasks + '</ul>'; 
    } else {
        console.log(incompleteUl)
        // incompleteUl.appendChild(incompleteTasks);
        htmlFormat = incompleteUl + incompleteTasks + '</ul>' + completed_title + completedUl + completedTasks + "</ul>";
    }

    return incompleteUl;
}

async function reformatTask(task, count) {

    let result = new String();
    const deadlineHtml = task.deadline ? await reformatDate(task.deadline) : null;
    const li = document.createElement('li');
    const categoryName = document.createElement('a');
    const taskText = document.createElement('a');
    const completedCheckbox = document.createElement('button');
    const taskImportance = document.createElement('button');
    const taskDeadline = document.createElement('button');
    const updateTaskTextBtn = document.createElement('button');
    const deleteTaskBtn = document.createElement('button');
    const barsBtn = document.createElement('button');
    
    li.className = 'items';
    li.id = task.id;

    categoryName.innerText = "작업";
    categoryName.className = "task_category_name";

    completedCheckbox.type = 'checkbox';    
    completedCheckbox.className = 'completed_checkboxes';
    completedCheckbox.id = 'completed_checkbox';
    completedCheckbox.value = task.completed;

    taskText.className = 'task_text';
    taskText.id = 'task_text';
    taskText.innerText = task.text;

    taskImportance.className = 'fa fa-star-o';
    taskImportance.ariaHidden = 'true';
    taskImportance.id = 'task_importance';
    taskImportance.value = task.importance;

    taskDeadline.className = 'fa fa-calendar';
    taskDeadline.ariaHidden = 'true';
    taskDeadline.id = 'task_deadline';
    taskDeadline.value =  task.deadline? task.deadline : ""

    updateTaskTextBtn.className = 'fa fa-pencil-square-o';
    updateTaskTextBtn.ariaHidden = 'true';
    updateTaskTextBtn.id = 'update_task_text';
    updateTaskTextBtn.value =  task.deadline? task.deadline : ""
    
    deleteTaskBtn.className = 'fa fa-trash-o';
    deleteTaskBtn.ariaHidden = 'true';
    deleteTaskBtn.id = 'delete_task';

    barsBtn.className = 'fa fa-bars';
    barsBtn.ariaHidden = 'true';
    barsBtn.id = 'delete_task';
    barsBtn.value =  task.deadline? task.deadline : ""

    li.appendChild(completedCheckbox);
    li.appendChild(taskText);
    li.appendChild(taskDeadline);
    li.appendChild(taskImportance);
    li.appendChild(updateTaskTextBtn);
    li.appendChild(deleteTaskBtn);
    li.appendChild(barsBtn);

    completedCheckbox.addEventListener('click', (event) => {
        const task = event.target.parentElement;
        const taskCompleted = event.target;
        const body = { taskId: task.id }

        fetch('/tasks/toggle/completed', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                taskCompleted.value ^= 1;
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    });


    deleteTaskBtn.addEventListener('click', (event) => {
        const task = event.target.parentElement;
        const body = { taskId: task.id }

        fetch('/tasks/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                task.remove();
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    });

    updateTaskTextBtn.addEventListener('click', (event) => {
        const taskText = prompt("수정할 내용을 입력해 주세요.");
        if(!taskText) return;

        const task = event.target.parentElement;
        const body = { taskId: task.id, taskText: taskText }

        fetch('/tasks/update/text', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                task.children['task_text'].innerText = taskText;
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    });

    taskImportance.addEventListener('click', (event) => {
        const task = event.target.parentElement;
        const taskImportance = event.target;
        const body = { taskId: task.id }

        fetch('/tasks/toggle/importance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                taskImportance.value ^= 1;
                const starIcon = taskImportance.value == 1 ? 'fa fa-star' : 'fa fa-star-o';
                taskImportance.className = starIcon;
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    });


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

    $( '.deadline' ).datepicker({
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
        xhr.open("put", "/tasks/update/deadline", true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(body);
    });

    return Promise.resolve(li);
}

async function appednChildren() {
    
}

async function reformatDate(date) {
    const today = new Date();
    const deadline  = new Date(date);
    const tomorrow = new Date();
    let reformatedDate = new String();
    const deadlineTextDiv = document.createElement('div');
    const deadlineTextA = document.createElement('a');
    const calendarIcon = document.createElement('a');

    deadlineTextDiv.id = 'deadline_text';
    deadlineTextA.id = 'deadline_text';
    calendarIcon.id = 'calendar_icon';
    calendarIcon.class = 'fa fa-calendar';
    calendarIcon.ariaHidden = 'true';
    tomorrow.setDate(tomorrow.getDate() + 1);

    if(deadline.getFullYear() == today.getFullYear() && deadline.getMonth() == today.getMonth() && deadline.getDate() == today.getDate()) {
        reformatedDate = "오늘";
    } else if(deadline.getFullYear() == tomorrow.getFullYear() && deadline.getMonth() == tomorrow.getMonth() && deadline.getDate() == tomorrow.getDate()) {
        reformatedDate =  "내일";
    } else if(deadline.getFullYear() == today.getFullYear()) {
        const date = deadline.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        reformatedDate = date;
    } else {
        const date = deadline.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        reformatedDate = date;
    }
    
    deadlineTextA.innerText = reformatDate;
    deadlineTextDiv.appendChild(calendarIcon);
    deadlineTextDiv.appendChild(deadlineTextA);

    return Promise.resolve(deadlineTextDiv);
}

