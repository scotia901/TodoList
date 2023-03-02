async function reformatToHtml(taskData) {
    try {
        const tasks = taskData;
        const tasksDivElement = document.getElementById('tasks');
        const incompleteUlElement = document.createElement('ul');
        const completedTasksBtnElment = document.createElement('button');
        const completedUlElement = document.createElement('ul');
        let incompleteTasks = new String();
        let completedTasks = new String();
        let completedCount = 0;
        let incompleteCount = 0;
    
        incompleteUlElement.className = 'task-lists';
        incompleteUlElement.id = 'incomplete-ul';
        completedTasksBtnElment.innerText = '완료됨';
        completedTasksBtnElment.className = 'complated-tasks-btn';
        completedTasksBtnElment.value = '0';
        completedUlElement.className = 'task-lists';
        completedUlElement.id = 'completed-ul';
        completedUlElement.display = 'block';
            
        for await (const task of tasks) {
            if (task.completed == true) {
                completedCount++
                completedUlElement.appendChild( await reformatTask(task) );
            } else {
                incompleteCount++
                incompleteUlElement.appendChild( await reformatTask(task) );
            }
        }
    
        while (tasksDivElement.firstChild) tasksDivElement.removeChild(tasksDivElement.firstChild);
        tasksDivElement.appendChild(incompleteUlElement);
        tasksDivElement.appendChild(completedTasksBtnElment);
        tasksDivElement.appendChild(completedUlElement);
        /*
        div(id="delete-category-area")
                        button(class="category-icon-area" id="rename-category" onclick="renameCategory()")
                            i(id="edit-icon" class="fa fa-pencil-square")
                        button(class="category-icon-area" id="delete-category" onclick="deleteCategory()")
                            i(id="trash-icon" class="fa fa-trash")
        
        */
    } catch (error) {
        console.error(error);
    }

}

async function reformatTask(taskData) {
    const task = document.createElement('li');
    const taskText = document.createElement('i');    
    const dropdownMenu = document.createElement('ul');
    const inputDeadline = document.createElement('input');
    const additionalInfo = document.createElement('div');
    const buttons = [{
        label: 'toggle-completed-button',
        icon: 'fa fa-sharp fa-regular fa-check button-icon',
        value: taskData.completed,
        description: taskData.completed == '1' ? '작업을 미완료로 표시' : '작업을 완료로 표시',
        function: toggleCompleted
    }, {
        label: 'toggle-impotrance-button',
        icon: taskData.importance == '1' ? 'fa fa-star button-icon' : 'fa fa-star-o button-icon',
        value: taskData.importance,
        description: taskData.importance == '1' ? '중요도 제거' : '중요로 표시',
        function: toggleImportance
    }, {
        label: 'set-deadline-button',
        icon: 'fa fa-calendar button-icon',
        value: taskData.deadline ? taskData.deadline : "",
        description: '기한 설정',
        function: setDeadline
     }, {
        label: 'update-text-button',
        icon: 'fa fa-pencil-square-o button-icon',
        description: '작업 텍스트 수정',
        function: updateText
    }, {
        label: 'delete-task-button',
        icon:  'fa fa-trash-o button-icon',
        description: '작업 삭제',
        function: deleteTask
    }, {
        label: 'show-dropdown-menu-button',
        icon: 'fa fa-bars button-icon',
        description: '드롭다운 메뉴 표시',
        function: toggleDropdownMenu
    }];
    for await (const buttonData of buttons) {
        const button = document.createElement('button');
        const icon = document.createElement('span');
        const name = document.createElement('span');

        button.className = buttonData.label;
        icon.className = buttonData.icon;
        name.className = 'button-description';
        name.innerText = buttonData.description;
        if(buttonData.value != undefined) button.value = buttonData.value;
        
        button.appendChild(icon);
        button.appendChild(name);
        task.appendChild(button);
    }
    
    const taskSubmenuButtons = {
        setDeadlineBtn: task.getElementsByClassName('set-deadline-button')[0],
        updateTextBtn: task.getElementsByClassName('update-text-button')[0],
        deleteTaskBtn: task.getElementsByClassName('delete-task-button')[0]
    };

    for (let i=0; i < task.childElementCount; i++) {
        task.children[i].addEventListener('click', buttons[i].function);
    }
    for await (const [key, button] of Object.entries(taskSubmenuButtons)) {
        const iElement = document.createElement('i');
        button.appendChild(iElement);
    }

    taskSubmenuButtons.setDeadlineBtn.value = '기한 설정';   
    inputDeadline.className = 'input-deadline'; 
    additionalInfo.className = 'additional-information';
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.appendChild(taskSubmenuButtons.setDeadlineBtn);
    dropdownMenu.appendChild(taskSubmenuButtons.updateTextBtn);
    dropdownMenu.appendChild(taskSubmenuButtons.deleteTaskBtn);
    task.className = 'task-container';
    task.id = taskData.id;
    taskText.className = 'task-text';
    taskText.innerText = taskData.text;
    task.insertBefore(taskText, task.children[1]);
    task.getElementsByClassName('show-dropdown-menu-button')[0].appendChild(dropdownMenu);
    task.appendChild(inputDeadline);
    task.appendChild(additionalInfo);
    if (taskData.completed) taskText.classList.add('completed');
    if (taskData.deadline) additionalInfo.appendChild(reformatDate(taskData.deadline));
    
    async function toggleDropdownMenu (event) {
        const dropdownMenuBtn = event.target.tagName == 'SPAN' ? event.target.parentElement : event.target; 
        const activeBtn = document.getElementsByClassName('show-dropdown-menu-button active')
        
        if(activeBtn.length > 0) {
            for await (const button of activeBtn) {
                if(dropdownMenuBtn != button) button.classList.remove('active');
            }
        }

        if(dropdownMenuBtn.classList.contains('active')) {
            dropdownMenuBtn.classList.remove('active');
        } else {
            dropdownMenuBtn.classList.add('active');
        }
    }
    
    function toggleCompleted (event)  {
        const completedUl = document.getElementById('completed-ul');
        const incompleteUl = document.getElementById('incomplete-ul');
        const completedBtn = event.target.tagName == 'SPAN' ? event.target.parentElement : event.target;
        const body = { taskId: taskData.id }
        const taskText = task.getElementsByClassName('task-text')[0];
    
        fetch('/tasks/toggle/completed', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                completedBtn.value ^= 1;
                taskText.classList.toggle('completed');
    
                if(completedBtn.value == 1) {
                    completedUl.appendChild(task);
                } else {
                    incompleteUl.appendChild(task);
                }
            } else {
                throw new Error('Network response was not ok.');
            }
        }).catch(error => {
            console.error(error);
        });
    };
    
    function deleteTask () {
        if(confirm('작업을 삭제 하시겠습니까?')) {
            const body = { taskId: taskData.id }
        
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
        }
    };
    
    function updateText () {
        const taskTextInput = prompt("수정할 내용을 입력해 주세요.");
        if(!taskTextInput) return;
        const body = { taskId: taskData.id, taskText: taskTextInput }
        const taskText = task.children[1]
        
        fetch('/tasks/update/text', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                taskText.innerText = taskTextInput;
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    };
    
    function toggleImportance (event) {
        const toggleImportanceBtn = event.target.tagName == 'SPAN' ? event.target.parentElement : event.target;
        const starIcon = toggleImportanceBtn.firstChild;
        const body = { taskId: taskData.id }
        fetch('/tasks/toggle/importance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                toggleImportanceBtn.value ^= 1;
                starIcon.className = toggleImportanceBtn.value == 1 ? 'fa fa-star' : 'fa fa-star-o';
            } else {
                throw new Error('Network response was not ok.')
            }
        }).catch(error => {
            console.error(error);
        });
    };

    function setDeadline () {
        inputDeadline.style.display = 'block';
        inputDeadline.focus();
        inputDeadline.style.display = 'none';
    }

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

    $( inputDeadline ).datepicker({
        currentText: '오늘',
        closeText: "닫기",
        showOn: 'focus',
        showButtonPanel: true,
        beforeShow: function( input ) {
            setTimeout(function() {
                var buttonPane = $( input )
                    .datepicker( 'widget' )
                    .find( '.ui-datepicker-buttonpane' );
    
                $( "<button>", {
                    text: '지우기',
                    click: function() {
                        $.datepicker._clearDate( input );
                    }
                }).appendTo( buttonPane ).addClass('ui-datepicker-clear ui-state-default ui-priority-primary ui-corner-all');
            }, 1 );
        },
        onChangeMonthYear: function( year, month, instance ) {
            setTimeout(function() {
                var buttonPane = $( instance )
                    .datepicker( 'widget' )
                    .find( '.ui-datepicker-buttonpane' );
    
                $( "<button>", {
                    text: "지우기",
                    click: function() {
                        $.datepicker._clearDate( instance.input );
                    }
                }).appendTo( buttonPane ).addClass('ui-datepicker-clear ui-state-default ui-priority-primary ui-corner-all');
            }, 1 );
        }
    }).on('input change', async function (event) {
        const taskDeadline = event.target.value != '' ? new Date(event.target.value) : '0000-00-00';
        const body = { taskId: taskData.id, taskDeadline: taskDeadline };

        fetch('/tasks/update/deadline', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                const reformatedDate = reformatDate(taskDeadline);
                const additionalInfo = event.target.parentElement.lastElementChild;
                
                if(reformatedDate == null) {
                    additionalInfo.firstChild.remove();
                } else if(!additionalInfo.firstChild) {
                    additionalInfo.prepend(reformatedDate);
                } else {
                    additionalInfo.firstChild.replaceWith(reformatedDate);
                }
                $( inputDeadline ).hide();
            } else {
                throw new Error('Network response was not ok.');
            }
        }).catch(error => {
            console.error(error);
        });

    $( inputDeadline ).hide();
    });

    return Promise.resolve(task);
}

function reformatDate(date) {
    if(date != '0000-00-00') {
        const deadline  = new Date(date);
        const today = new Date();
        const tomorrow = new Date();
        let reformatedDate = new String();
        const deadlineText = document.createElement('div');
        const calendarIcon = document.createElement('span');

        deadlineText.className = 'deadline-text';
        calendarIcon.className = 'calendar-icon';
        calendarIcon.className = 'fa fa-calendar text-icon';
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
        
        deadlineText.innerText = reformatedDate;
        deadlineText.prepend(calendarIcon);
    
        return deadlineText;
    } else {
        return null;
    }


}

