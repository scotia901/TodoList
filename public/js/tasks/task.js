async function reformatToHtml(taskData) {
    try {
        const tasks = taskData;
        const tasksDivElement = document.getElementById('tasks');
        const incompleteUlElement = document.createElement('ul');
        const completedTasksBtnElement = document.createElement('button');
        const completedUlElement = document.createElement('ul');
        const completedTasksBtnDiv = document.createElement('div');
        const completedTasksBtnWrap = document.createElement('span');
        const completedTasksBtnIcon = document.createElement('span');
        const completedTasksCount = document.createElement('span');
        let completedCount = 0;

        for await (const task of tasks) {
            if (task.completed == true) {
                completedCount++
                completedUlElement.appendChild( await reformatTask(task) );
            } else {
                incompleteUlElement.appendChild( await reformatTask(task) );
            }
        }

        incompleteUlElement.className = 'task-lists incomplete-ul';
        completedTasksBtnDiv.className = 'completed-tasks-btn-container';
        completedTasksBtnElement.className = 'completed-tasks-btn';
        completedTasksBtnWrap.className = 'completed-tasks-btn-wrap';
        completedTasksBtnWrap.innerText = '완료됨';
        completedTasksBtnIcon.className = 'fa fa-light fa-angle-right';
        completedTasksCount.innerText = completedCount;
        completedTasksCount.className = 'completed-tasks-count-text';
        if(completedCount == '0') completedTasksBtnDiv.classList.add('hidden');

        completedUlElement.className = 'task-lists completed-ul hidden';
        completedUlElement.display = 'block';
        
        while (tasksDivElement.firstChild) tasksDivElement.removeChild(tasksDivElement.firstChild);
        completedTasksBtnDiv.appendChild(completedTasksBtnElement);
        tasksDivElement.appendChild(incompleteUlElement);
        tasksDivElement.appendChild(completedTasksBtnDiv);
        tasksDivElement.appendChild(completedUlElement);
        completedTasksBtnWrap.prepend(completedTasksBtnIcon);
        completedTasksBtnWrap.append(completedTasksCount);
        completedTasksBtnElement.appendChild(completedTasksBtnWrap);

        completedTasksBtnElement.addEventListener('click', () => {
            completedTasksBtnDiv.classList.toggle('active');
            document.getElementsByClassName('completed-ul')[0].classList.toggle('hidden');
            completedTasksBtnIcon.classList.toggle('fa-rotate-90');
        });
    } catch (error) {
        console.error(error);
    }
}

async function reformatTask(taskData) {
    const activeCategory = document.getElementsByClassName('category active')[0];
    const activeCategoryName = document.getElementsByClassName('category-title-text')[0].innerText;
    const task = document.createElement('li');
    const taskText = document.createElement('i');
    const taskTextWrap = document.createElement('div');
    const dropdownMenu = document.createElement('ul');
    const inputDeadline = document.createElement('input');
    const additionalInfo = document.createElement('div');
    const splitDot = document.createElement('div');
    const buttons = [{
        label: 'toggle-completed-button',
        icon: 'fa fa-sharp fa-regular fa-check button-icon',
        value: taskData.completed,
        description: taskData.completed == '' ? '작업을 미완료로 표시' : '작업을 완료로 표시',
        function: toggleCompleted
    }, {
        label: 'toggle-impotrance-button',
        icon: taskData.importance == '1' ? 'fa fa-star button-icon' : 'fa fa-star-o button-icon',
        value: taskData.importance,
        description: taskData.importance == '1' ? '중요도 제거' : '중요로 표시',
        function: toggleImportance
    }, {
        label: 'set-deadline-button submenu',
        icon: 'fa fa-calendar button-icon',
        value: taskData.deadline ? taskData.deadline : "",
        description: '기한 설정',
        function: setDeadline
     }, {
        label: 'update-text-button submenu',
        icon: 'fa fa-pencil-square-o button-icon',
        description: '작업 텍스트 수정',
        function: updateText
    }, {
        label: 'delete-task-button submenu',
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

    inputDeadline.className = 'input-deadline'; 
    additionalInfo.className = 'additional-information';

    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.appendChild(taskSubmenuButtons.setDeadlineBtn);
    dropdownMenu.appendChild(taskSubmenuButtons.updateTextBtn);
    dropdownMenu.appendChild(taskSubmenuButtons.deleteTaskBtn);
    
    taskText.className = 'task-text';

    if (taskData.completed) taskText.classList.add('completed');

    taskTextWrap.className = 'task-text-wrap';
    taskTextWrap.appendChild(taskText);

    task.className = 'task-container';
    task.dataset.createdAt = taskData.createdAt;
    task.insertBefore(taskTextWrap, task.children[1]);
    task.getElementsByClassName('show-dropdown-menu-button')[0].appendChild(dropdownMenu);
    task.appendChild(inputDeadline);
    task.appendChild(additionalInfo);

    splitDot.innerText = '·';
    splitDot.className = 'split-dot';
    splitDot.classList.add('hide');

    additionalInfo.appendChild(splitDot);
    if (taskData.deadline) additionalInfo.prepend(reformatDate(taskData.deadline));

    if(!activeCategory && activeCategoryName == '검색 결과') {
        const categoryName = document.createElement('span');
        const categoryNameWrap = document.createElement('div');
        const searchWord = document.getElementById('search-text').value;

        taskText.innerHTML = taskData.text.replace(searchWord, '<b>' + searchWord + '</b>');;
        categoryName.innerText = taskData['Category.name'] == null ? '작업' : taskData['Category.name'];
        categoryName.className = 'task-category-name'
        categoryNameWrap.className = 'task-category-warp';
        categoryNameWrap.appendChild(categoryName);
        additionalInfo.appendChild(categoryNameWrap);
    } else if (activeCategory.classList.length == 2) {
        if (activeCategory.firstChild.innerText != '작업' && activeCategory.parentElement.id == 'default-categories') {
            const categoryName = document.createElement('span');
            const categoryNameWrap = document.createElement('div');
            
            taskText.innerText = taskData.text;
            categoryName.innerText = taskData['Category.name'] == null ? '작업' : taskData['Category.name'];
            categoryName.className = 'task-category-name'
            categoryNameWrap.className = 'task-category-warp';
            categoryNameWrap.appendChild(categoryName);
            additionalInfo.appendChild(categoryNameWrap);
        } else {
            taskText.innerText = taskData.text;
        }
    }
    if(additionalInfo.children.length == 3) splitDot.classList.remove('hide');
    
    async function toggleDropdownMenu (event) {
        const dropdownMenuBtn = event.target.tagName == 'SPAN' ? event.target.parentElement : event.target; 
        const activeBtn = document.getElementsByClassName('show-dropdown-menu-button active');
        
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
        const completedUl = document.getElementsByClassName('completed-ul')[0];
        const incompleteUl = document.getElementsByClassName('incomplete-ul')[0];
        const completedCount = document.getElementsByClassName('completed-tasks-count-text')[0];
        const completedTasksBtnContainer = document.getElementsByClassName('completed-tasks-btn-container')[0];
        const activeCategory = document.getElementsByClassName('category active')[0];
        const completedBtn = event.target.tagName == 'SPAN' ? event.target.parentElement : event.target;
        const taskText = task.getElementsByClassName('task-text')[0];
        const body = { taskId: taskData.id }
    
        fetch('/tasks/toggle/completed', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                completedBtn.value ^= 1;
                taskText.classList.toggle('completed');
    
                if(completedBtn.value == 1) {
                    completedUl.appendChild(task);
                    completedCount.innerText = new Number(completedCount.innerText) + 1;
                    if(completedCount.innerText == '1') completedTasksBtnContainer.classList.remove('hidden');
                } else {
                    incompleteUl.appendChild(task);
                    completedCount.innerText = new Number(completedCount.innerText) - 1;
                    if(completedCount.innerText == '0') completedTasksBtnContainer.classList.add('hidden');
                }
                
                if(activeCategory.children.length == 2) {
                    if(incompleteUl.children.length == 0) {
                        activeCategory.lastChild.remove();
                    } else {
                        activeCategory.lastChild.innerText = incompleteUl.children.length;
                    }
                } else {
                    const spanElement = document.createElement('span');
                    spanElement.className = 'category tasks-count';
                    spanElement.innerText = incompleteUl.children.length;
                    activeCategory.appendChild(spanElement);
                }
            } else {
                throw response.status;
            }
        }).catch(error => {
            console.error(error);
        });
    };
    
    function deleteTask () {
        if(confirm('작업을 삭제 하시겠습니까?')) {
            const body = { taskId: taskData.id };
            fetch('/tasks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(body)
            }).then(response => {
                if(response.ok) {
                    task.remove();
                    getTasksCountByCategory();
                } else {
                    throw response.status;
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
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                taskText.innerText = taskTextInput;
            } else {
                throw response.status;
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
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                const activeCategory = document.getElementsByClassName('category active')[0];
                toggleImportanceBtn.value ^= 1;
                starIcon.className = toggleImportanceBtn.value == 1 ? 'fa fa-star button-icon' : 'fa fa-star-o button-icon';

                if(activeCategory.firstChild.classList.contains('importance')) {
                    event.target.parentElement.parentElement.remove();
                }
                
                getTasksCountByCategory();
            } else {
                throw response.status;
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
        const taskDeadline = event.target.value != '' ? event.target.value : '0000-00-00';
        const body = { taskId: taskData.id, taskDeadline: taskDeadline };

        fetch('/tasks/update/deadline', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if(response.ok) {
                const reformatedDate = reformatDate(taskDeadline);
                const additionalInfo = event.target.parentElement.lastElementChild;
            
                if(reformatedDate == null) {
                    if(additionalInfo.firstChild) {
                        if(additionalInfo.firstChild.className == 'deadline-text-wrap') {
                            additionalInfo.firstChild.remove();
                        }
                    }
                } else {
                    if(additionalInfo.firstChild) {
                        if(additionalInfo.firstChild.className == 'deadline-text-wrap') {
                            additionalInfo.firstChild.replaceWith(reformatedDate);
                        } else {
                            additionalInfo.prepend(reformatedDate);
                        }
                    } else {
                        additionalInfo.appendChild(reformatedDate);                    }
                }

                if(additionalInfo.children.length == 3){
                    splitDot.classList.remove('hide');
                } else {
                    splitDot.classList.add('hide');
                }

                $( inputDeadline ).hide();
                getTasksCountByCategory();
            } else {
                throw response.status;
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
        const deadlineText = document.createElement('div');
        const calendarIcon = document.createElement('span');
        let reformatedDate = new String();

        deadlineText.className = 'deadline-text-wrap';
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

        deadlineText.dataset.deadlineDate = date;
        deadlineText.innerText = reformatedDate;
        deadlineText.prepend(calendarIcon);
    
        return deadlineText;
    } else {
        return null;
    }
}