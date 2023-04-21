let categoryBeforeSearch = '';
let categoryList = [];

async function customFetch(url, options) {
    const csrf_token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    const defaultHeaders = {
        'csrf-token': csrf_token,
        'X-Requested-With': 'XMLHttpRequest'
    };
    const headers = Object.assign({}, defaultHeaders, options.headers);
    return fetch(url, Object.assign({}, options, {
        headers
    }));
}

window.addEventListener('load', async (event) => {
    event.preventDefault();
    const createCategoryBtn = document.getElementById('create-category-button');
    const deleteCategoryBtn = document.getElementsByClassName('delete-category-button')[0];
    const sidebarBtn = document.getElementsByClassName('sidebar-btn');
    const contentBlocker = document.getElementById('content-blocker');
    const categoryPropertyBtn = document.getElementsByClassName('category-property-btn')[0];
    const updateCartegoryNameBtn = document.getElementsByClassName('update-category-name-button')[0];
    const categoryTitleText = document.getElementsByClassName('category-title-text')[0];
    const tasksOrderBtn = document.getElementsByClassName('update-tasks-sort-button')[0];
    const sortOrderBtn = document.getElementsByClassName('sort-order-button')[0];
    const sortTasksBtn = document.querySelectorAll('.tasks-sort-button');
    const initSortBtn = document.getElementsByClassName('clear-sort-button')[0];
    const setThemeBtn = document.querySelectorAll('.set-theme-button');

    setThemeBtn.forEach(element => {
        element.addEventListener('click', async event => {
            try {
                event.stopPropagation();
                const target = event.target;
                const body = {
                    theme: target.classList[1]
                };
                const result = await customFetch('/categories/category/theme', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                if (result.ok) {
                    document.body.dataset.theme = body.theme;
                    const activeTheme = document.querySelector('.set-theme-button.active');
                    if (activeTheme) {
                        activeTheme.classList.remove('active');
                    }
                    target.parentElement.classList.add('active');
                }
            } catch (error) {
                handleError(error);
            }
        });
    });
    initSortBtn.addEventListener('click', initializeTasksSort);
    sortOrderBtn.addEventListener('click', setTasksSortOrder);
    tasksOrderBtn.addEventListener('click', (event) => toggleTasksOrderMenu(event));
    categoryTitleText.addEventListener('click', renameCategory);
    updateCartegoryNameBtn.addEventListener('click', renameCategory);
    categoryPropertyBtn.addEventListener('click', (event) => toggleCategoryDropdownMeun(event));
    createCategoryBtn.addEventListener('click', createCategory);
    deleteCategoryBtn.addEventListener('click', deleteCategory);
    contentBlocker.addEventListener('click', toggleSidebarDisplay);
    for (const element of sidebarBtn) {
        element.addEventListener('click', toggleSidebarDisplay);
    };
    sortTasksBtn.forEach(element => {
        element.addEventListener('click', (event) => updateTasksOrderToCategory(event));
    });

    await getCategoriesByUser();
    await getTasksByUserAndCategory();
    await getTasksCountByCategory();
    await updateContent();
    resizeWidthTasksAndPostTask();
    showContent();
});

function toggleTasksOrderMenu(event) {
    const tasksOrderButton = document.getElementsByClassName('update-tasks-sort-button')[0];
    event.stopPropagation();
    tasksOrderButton.classList.toggle('active');
};

function toggleCategoryDropdownMeun() {
    const categoryPropertyBtn = document.getElementsByClassName('category-property-btn')[0];
    categoryPropertyBtn.classList.toggle('active');
};

function showContent() {
    document.getElementById('tasks').style.display = 'block';
    document.getElementById('bottom-area').style.display = 'block';
};

async function changeCurrentCategory(object, categoryId, categoryName) {
    document.getElementById('tasks').style.display = 'none';
    document.getElementById('bottom-area').style.display = 'none';
    await updateCurrentCategoryToSession(categoryId, categoryName);
    await selectCategory(object);
    await getTasksByUserAndCategory();
    await updateContent();
    resizeWidthTasksAndPostTask();
    showContent();
};

async function selectCategory(object) {
    const activeCategory = document.getElementsByClassName('category active')[0];
    let target = {};

    if (object instanceof Element) {
        target = object;
    } else {
        if (object instanceof PointerEvent || navigator.userAgent.indexOf('Firefox') != -1) {
            target = object.target.tagName == 'SPAN' ? object.target.parentElement : object.target;
        } else {
            if (navigator.userAgent.indexOf('Edg') != -1) {
                target = object.parentElement;
            } else {
                target = object;
            }
        }
    }
    if (activeCategory) activeCategory.classList.remove('active');
    target.classList.add('active');
};

async function getCategoriesByUser() {
    await customFetch('/categories', {
        method: 'GET'
    }).then(async response => {
        if (response.ok) {
            const categories = await response.json();
            const personalCategories = document.getElementById('personal-categories');
            const defaultCategories = document.getElementById('default-categories');
            const currentCategory = await customFetch('/categories/current', {
                method: 'GET'
            }).then(response => {
                return response.json()
            });
            let counter = 0;

            for await (const category of categories) {
                const categoryName = category.name;
                const categoryId = category.id;
                const categoryWrap = document.createElement('li');
                const categoryText = document.createElement('span');

                categoryText.className = 'category-name';
                categoryText.innerText = categoryName;
                categoryWrap.className = 'category';
                categoryWrap.prepend(categoryText);

                if (currentCategory.id == categoryId && currentCategory.name == categoryName) {
                    categoryWrap.classList.add('active');
                }

                categoryWrap.addEventListener('click', async (event) => {
                    await changeCurrentCategory(event, categoryId, categoryName);
                });

                categoryList.push({
                    id: categoryId,
                    element: categoryWrap
                });

                if (counter < 4) {
                    defaultCategories.appendChild(categoryWrap);
                } else {
                    personalCategories.appendChild(categoryWrap);
                }
                counter++;
            }
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

async function getTasksCountByCategory() {
    await customFetch('/tasks/count', {
        method: 'GET'
    }).then(async response => {
        if (response.ok) {
            const tasksCount = await response.json();
            const allTasksCountBy = tasksCount.allTasksCountBy;
            const personalCategoriesCount = tasksCount.personalCategories;

            for (const countData of personalCategoriesCount) {
                const category = categoryList.filter(category => category.id == countData.CategoryId);

                if (category[0].element.children.length == 2) {
                    const countElement = category[0].element.lastChild;

                    if (countData.count > 0) {
                        countElement.innerText = countData.count;
                    } else {
                        countElement.remove();
                    }
                } else {
                    const spanElement = document.createElement('span');
                    spanElement.className = 'category tasks-count';
                    spanElement.innerText = countData.count;
                    category[0].element.appendChild(spanElement);
                }
            }

            for (const [key, value] of Object.entries(allTasksCountBy)) {
                let categoryName = '';

                switch (key) {
                    case 'today':
                        categoryName = '오늘 할 일';
                        break;
                    case 'importance':
                        categoryName = '중요';
                        break;
                    case 'planed':
                        categoryName = '계획된 일정';
                        break;
                    default:
                        break;
                }

                const category = categoryList.filter(category => category.element.parentElement.id === 'default-categories' && category.element.firstChild.innerText === categoryName);
                if (category[0].element.children.length == 2) {
                    const countElement = category[0].element.lastChild;

                    if (value > 0) {
                        countElement.innerText = value;
                    } else {
                        countElement.remove();
                    }
                } else {
                    if (value > 0) {
                        const spanElement = document.createElement('span');
                        spanElement.className = 'category tasks-count';
                        spanElement.innerText = value;
                        category[0].element.appendChild(spanElement);
                    }
                }
            }
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

window.addEventListener('resize', async () => {
    resizeWidthTasksAndPostTask();
});

window.addEventListener('click', (event) => {
    // 드롭다운 메뉴 중복 열림 방지
    const activeTaskDropdownMenu = document.getElementsByClassName('show-dropdown-menu-button active')[0];
    const activeCategoryMenu = document.getElementsByClassName('category-property-btn active')[0];
    const tasksSortBtn = document.getElementsByClassName('update-tasks-sort-button')[0];
    if (activeTaskDropdownMenu != undefined && activeTaskDropdownMenu.contains(event.target) == false) activeTaskDropdownMenu.classList.remove('active');
    if (activeCategoryMenu != undefined && activeCategoryMenu.contains(event.target) == false) {
        activeCategoryMenu.classList.remove('active');
        tasksSortBtn.classList.remove('active');
    }
});

function createCategory() {
    const categoryName = document.getElementById('create-category-name');
    const body = {
        name: categoryName.value
    };

    customFetch('/categories/category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(async response => {
        if (response.ok) {
            const personalCategories = document.getElementById('personal-categories');
            const liElemelnt = document.createElement('li');
            const spanElement = document.createElement('span');
            const categoryData = await response.json();

            spanElement.className = 'category-name';
            spanElement.innerText = categoryName.value;
            liElemelnt.className = 'category';
            liElemelnt.appendChild(spanElement);
            liElemelnt.addEventListener('click', async (event) => {
                await changeCurrentCategory(event, categoryData.id, categoryData.name);
            });
            personalCategories.appendChild(liElemelnt);
            categoryName.value = '';
            categoryList.push({id: categoryData.id, element: liElemelnt});
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

async function updateCurrentCategoryToSession(categoryId, categoryName) {
    const body = {
        categoryId: categoryId,
        categoryName: categoryName
    };

    await customFetch('/categories/current', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(async response => {
        if (!response.ok) throw response.status;
    }).catch(error => {
        handleError(error);
    });
};

async function getTasksByUserAndCategory() {
    await customFetch('/tasks', {
        method: 'GET'
    }).then(async response => {
        if (response.ok) {
            const tasks = await response.json();
            await reformatToHtml(tasks);
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

function postTask() {
    const taskText = document.getElementById("post-task-msg").value;
    const body = {
        taskText: taskText
    };
    const currentCategory = document.getElementsByClassName('category active')[0].firstChild;

    if (!taskText) return;
    if (currentCategory.parentElement.parentElement.id == 'default-categories') {
        if (currentCategory.innerText == '오늘 할 일' || currentCategory.innerText == '계획된 일정') {
            const deadline = new Date();
            deadline.setHours(0, 0, 0, 0);
            Object.assign(body, {
                deadline: deadline
            });
        }

        if (currentCategory.innerText == '중요') {
            const importance = true;
            Object.assign(body, {
                importance: importance
            });
        }
    }

    customFetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(async response => {
        if (response.ok) {
            const ul = document.getElementsByClassName('incomplete-ul')[0];
            const tasks = await response.json();

            ul.prepend(await reformatTask(tasks));
            document.getElementById("post-task-msg").value = "";
            getTasksCountByCategory();
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });

};

function viewUserInfo() {
    location.href = "/users/profile";
};

function logout() {
    customFetch('/users/logout', {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            location.href = "/";
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

function resizeWidthTasksAndPostTask() {
    const threshold = 750;
    const margin = 82;
    const marginWithSidebar = 282;
    const innerWidth = document.documentElement.clientWidth;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const tasks = document.getElementsByClassName('task-lists');
    const postTask = document.getElementById('post-todo');

    if (innerWidth < threshold) {
        const width = innerWidth + scrollbarWidth - margin;
        tasks[0].style.width = width + 'px';
        tasks[1].style.width = width + 'px';
        postTask.style.width = width + 'px';
    } else {
        const width = innerWidth + scrollbarWidth - marginWithSidebar;
        tasks[0].style.width = width + 'px';
        tasks[1].style.width = width + 'px';
        postTask.style.width = width + 'px';
    }
};

async function searchTasks() {
    try {
        const term = document.getElementById("search-text").value;
        const activeCurrentCategory = document.getElementsByClassName('category active')[0];
        if (term) {
            await customFetch('/tasks/search/' + term, {
                method: 'GET'
            }).then(async response => {
                if (response.ok) {
                    const tasks = await response.json();

                    document.getElementById('tasks').style.display = 'none';
                    document.getElementById('bottom-area').style.display = 'none';
                    document.getElementsByClassName("category-title-text")[0].innerText = "검색 결과";
                    if (activeCurrentCategory) {
                        activeCurrentCategory.classList.remove('active');
                        const category = categoryList.filter(category => category.element == activeCurrentCategory);
                        categoryBeforeSearch = category[0];
                        document.body.dataset.theme = 'cornflowerblue';
                        document.getElementsByClassName('category-property-btn')[0].classList.toggle('hide');
                    }

                    await reformatToHtml(tasks);
                    resizeWidthTasksAndPostTask();
                    document.getElementById('tasks').style.display = 'block';
                } else {
                    throw response.status;
                }
            }).catch(error => {
                handleError(error);
            });
        } else {
            if (activeCurrentCategory == undefined) {
                document.getElementsByClassName('category-property-btn')[0].classList.toggle('hide');
                await changeCurrentCategory(categoryBeforeSearch.element, categoryBeforeSearch.id, categoryBeforeSearch.element.firstChild.innerText);
            }
        }
    } catch (error) {
        alert(error);
    }
};

async function deleteCategory() {
    const activeCategory = document.getElementsByClassName('category active')[0];
    if (activeCategory || activeCategory.parentElement.id == 'personal-categories') {
        if (confirm("카테고리를 삭제 하시겠습니까?")) {
            await customFetch('/categories/category', {
                method: 'DELETE'
            }).then(async response => {
                if (response.ok) {
                    categoryList = categoryList.filter(category => category.element !== activeCategory);
                    activeCategory.remove();
                    await changeCurrentCategory(categoryList[0].element, categoryList[0].id, '작업');
                } else {
                    throw response.status;
                }
            }).catch(error => {
                handleError(error);
            });
        }
    }
};

async function updateContent() {
    const activeCategory = document.getElementsByClassName('category active')[0];
    const categoryTitle = document.getElementsByClassName('category-title')[0];
    const currentCategory = await customFetch('/categories/current', {
        method: 'GET'
    }).then(response => {
        return response.json()
    });
    const theme = document.getElementsByClassName('theme-color ' + currentCategory.theme)[0];
    const previousCategory = document.querySelector('.set-theme-button.active');

    if (activeCategory) {
        categoryTitle.firstChild.innerText = activeCategory.firstChild.innerText;
    } else {
        categoryTitle.firstChild.innerText = categoryBeforeSearch.firstChild.innerText;
    }
    if (!activeCategory || activeCategory.parentNode.id == 'personal-categories') {
        categoryTitle.classList.add('personal-category');
    } else {
        categoryTitle.classList.remove('personal-category');
    }

    if (previousCategory) previousCategory.classList.remove('active');

    if (!currentCategory.theme) {
        document.querySelector('.theme-color.cornflowerblue').parentElement.classList.add('active');
        document.body.dataset.theme = 'cornflowerblue';
    } else {
        document.body.dataset.theme = currentCategory.theme;
        theme.parentElement.classList.add('active');
    }
};

async function renameCategory() {
    const categoryTitle = document.getElementsByClassName('category-title')[0];
    const categoryTitleText = document.getElementsByClassName('category-title-text')[0];
    const input = document.createElement("input");
    const form = document.createElement("form");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const font = '30px bold';
    const inputMinWidth = 10;

    if (categoryTitle.classList.contains('personal-category')) {
        form.setAttribute('action', '#');
        form.setAttribute('onsubmit', 'return false');
        form.setAttribute('class', 'category-title personal-category');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'rename-category');
        input.style.padding = '7px';
        form.style.padding = '0px';
        input.style.font = font;
        input.style.width = Math.min(categoryTitle.getBoundingClientRect().width, categoryTitleText.getBoundingClientRect().width) + inputMinWidth + "px";
        input.value = categoryTitle.innerText;
        form.appendChild(input);
        categoryTitle.replaceWith(form);
        input.focus();
        input.select();

        input.addEventListener('input', () => {
            ctx.font = font;
            input.style.width = Math.max(categoryTitle.getBoundingClientRect().width, ctx.measureText(input.value).width) + inputMinWidth + "px";
        });
        input.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') input.blur();
            if (e.key == 'Escape') {
                input.removeEventListener('focusout', updateCategoryName);
                form.replaceWith(categoryTitle);
            }
        });
        input.addEventListener('focusout', updateCategoryName);

        function updateCategoryName() {
            if (!input.value || input.value == categoryTitle.firstChild.innerText) {
                form.replaceWith(categoryTitle);
            } else {
                const body = {
                    categoryName: input.value
                };
                customFetch('/categories/category', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }).then(response => {
                    if (response.ok) {
                        categoryTitle.firstChild.innerText = input.value;
                        document.getElementsByClassName('category active')[0].firstChild.innerText = input.value;
                        input.removeEventListener('focusout', updateCategoryName);
                        form.replaceWith(categoryTitle);
                    } else {
                        throw response.status
                    }
                }).catch(error => {
                    handleError(error);
                });
            }
        }
    }
};

function toggleSidebarDisplay() {
    const sidebar = document.getElementsByClassName('sidebar')[0];
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
};

function updateTasksOrderToCategory(element) {
    const sortBtn = element.target.tagName === 'SPAN' ? element.target.parentNode : element.target;
    const sortType = sortBtn.classList[1].slice(5);
    const body = {
        sortType: sortType
    };

    customFetch('/categories/category/sort', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (response.ok) {
            sortTasks(sortType);
            const sortOrder = document.getElementsByClassName('sort-order-contianer')[0];
            const tasksOrderButton = document.getElementsByClassName('update-tasks-sort-button')[0];

            sortOrder.classList.add('active');
            sortOrder.firstChild.dataset.sortType = sortType;
            sortOrder.firstChild.lastChild.innerText = sortBtn.lastChild.innerText + '순으로' + ' 정렬하기';
            tasksOrderButton.classList.toggle('active');
        } else {
            throw response.status;
        }
    }).catch(error => {
        handleError(error);
    });
};

async function sortTasks(sortType) {
    const taskLists = document.querySelectorAll('.task-lists');
    const sortOrder = document.querySelector('.sort-order-button').classList[1];
    let sortedTasks = new Array();

    taskLists.forEach(element => {
        switch (sortType) {
            case 'importance':
                sortedTasks = Array.from(element.children).sort((a, b) => {
                    const nameA = a.childNodes[1].innerText.toUpperCase();
                    const nameB = b.childNodes[1].innerText.toUpperCase();
                    const importanceA = a.children[2].value;
                    const importanceB = b.children[2].value;

                    if (importanceA < importanceB) {
                        if (sortOrder == 'descending') return 1;
                        return -1;
                    } else if (importanceA > importanceB) {
                        if (sortOrder == 'descending') return -1;
                        return 1;
                    } else {
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    }
                });
                break;

            case 'deadline':
                sortedTasks = Array.from(element.children).sort((elementA, elementB) => {
                    const nameA = elementA.childNodes[1].innerText.toUpperCase();
                    const nameB = elementB.childNodes[1].innerText.toUpperCase();
                    const deadlineA = getDeadlineDateFromTask(elementA);
                    const deadlineB = getDeadlineDateFromTask(elementB);

                    if (deadlineA == null && deadlineB != null) {
                        return 1;
                    } else if (deadlineA != null && deadlineB == null) {
                        return -1;
                    } else if (deadlineA < deadlineB) {
                        if (sortOrder == 'descending') return 1;
                        return -1;
                    } else if (deadlineA > deadlineB) {
                        if (sortOrder == 'descending') return -1;
                        return 1;
                    } else {
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    }
                });
                break;

            case 'createdAt':
                sortedTasks = Array.from(element.children).sort((elementA, elementB) => {
                    const nameA = elementA.childNodes[1].innerText.toUpperCase();
                    const nameB = elementB.childNodes[1].innerText.toUpperCase();

                    if (elementA.dataset.createdAt < elementB.dataset.createdAt) {
                        if (sortOrder == 'descending') return 1;
                        return -1;
                    } else if (elementA.dataset.createdAt > elementB.dataset.createdAt) {
                        if (sortOrder == 'descending') return -1;
                        return 1;
                    } else {
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    }
                });
                break;

            case 'name':
                sortedTasks = Array.from(element.children).sort((elementA, elementB) => {
                    const nameA = elementA.childNodes[1].innerText.toUpperCase();
                    const nameB = elementB.childNodes[1].innerText.toUpperCase();
                    if (nameA < nameB) {
                        if (sortOrder == 'descending') return 1;
                        return -1;
                    }
                    if (nameA > nameB) {
                        if (sortOrder == 'descending') return -1;
                        return 1;
                    }
                    return 0;
                });
                break;
            default:
                break;
        }

        element.textContent = '';
        sortedTasks.map(item => element.appendChild(item));
    });
};

function setTasksSortOrder() {
    const sortOrderBtn = document.getElementsByClassName('sort-order-button')[0];
    const sortOrderIcon = sortOrderBtn.firstChild;
    const sortOrderText = sortOrderBtn.classList[1] == 'ascending' ? 'descending' : 'ascending';
    const sortType = sortOrderBtn.dataset.sortType;

    sortOrderBtn.classList.replace(sortOrderBtn.classList[1], sortOrderText);
    sortOrderIcon.className = sortOrderIcon.className == 'fa fa-long-arrow-up' ? 'fa fa-long-arrow-down' : 'fa fa-long-arrow-up';
    sortTasks(sortType);
};

function reverseTasksSort(sortType) {
    const taskLists = document.querySelectorAll('.task-lists');
    let sortedTasks = new Array();

    taskLists.forEach(element => {
        switch (sortType) {
            case 'importance':
                sortedTasks = Array.from(element.children).sort(reverseImportance);
                break;
            case 'deadline':
                sortedTasks = Array.from(element.children).sort(reverseDeadline);
                break;

            default:
                sortedTasks = [].slice.call(element.children).reverse();
                break;
        }

        element.textContent = '';
        sortedTasks.map(item => element.appendChild(item));
    });
};

function getDeadlineDateFromTask(element) {
    if (element.children[5].childNodes.length > 0) {
        if (element.children[5].firstChild.className == 'deadline-text-wrap') {
            return element.children[5].firstChild.dataset.deadlineDate;
        } else {
            return null;
        }
    }
};

function initializeTasksSort() {
    const sortOrderContainer = document.getElementsByClassName('sort-order-contianer')[0];
    sortOrderContainer.classList.remove('active');
};