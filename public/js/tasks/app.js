window.addEventListener('load', async (event) => {
    event.preventDefault();
    const createCategoryBtn = document.getElementById('create-category-button');
    const deleteCategoryBtn = document.getElementsByClassName('delete-category-button')[0];
    createCategoryBtn.addEventListener('click', createCategory);
    deleteCategoryBtn.addEventListener('click', deleteCategory);
    // const nickname
    await makeDefaultUserImg(document.getElementById('nickname').innerText);
    await getCategoriesByUser();
    await getCommonCategoryTasks();
    await getTasksByUserAndCategory();
    // await getTasksCount();
    await renameCategory();
    await resizeTasks();
    updateCategoryTitle();
});

async function getCommonCategoryTasks() {
    const commonCategories = document.getElementById('common-categories').children;
    
    for await (const category of commonCategories) {
        const categoryName = category.firstChild.innerText;

        category.addEventListener('click', async (event) => {
            await changeCurrentCategory(event, null, categoryName);
        });
    }
}

async function changeCurrentCategory (event, categoryId, categoryName) {
    await updateCurrentCategoryToSession(categoryId, categoryName);
    await getTasksByUserAndCategory();
    selectCategory(event);
    updateCategoryTitle();
    resizeTasks();
}

function sample() {
    sampleA();
}

function sampleA () {
    try {
        sampleB (a , (err) => {
            if(err) throw ('Error');
        });
    } catch (error) {
        console.log(error);
    }
    function sampleB (int , callback) {
        if("number"  == typeof int) {
            callback(err);
        } else {
            callback(null);
        }
    }
}

function selectCategory(object) {
    const activeCategory = document.getElementsByClassName('category active')[0];
    let target = {};
    if(object instanceof PointerEvent) {
        target = object.target.tagName == 'SPAN' ? object.target.parentElement : object.target;
    } else {
        target = object.parentElement;
    }

    if(activeCategory) activeCategory.classList.remove('active');
    target.classList.add('active');
}

async function getCategoriesByUser() {
    await fetch('/categories', {
        method: 'GET'
    }).then(async response => {
        if(response.ok) {
            const categories = await response.json();
            const personalCategories = document.getElementById('personal-categories');
            const currentCategory = await fetch('/categories/current').then(async response => { return Promise.resolve(await response.json())});

            for await (const category of categories) {
                const categoryName = category.name;
                const categoryId = category.id;
                const liElemelnt = document.createElement('li');
                const spanElement = document.createElement('span');

                spanElement.className = 'category-name';
                spanElement.innerText = categoryName;
                liElemelnt.className = 'category';
                liElemelnt.appendChild(spanElement);
                liElemelnt.addEventListener('click', async (event) => {
                    await changeCurrentCategory(event, categoryId, categoryName);
                });

                if(currentCategory.id == categoryId && currentCategory.name == categoryName) {
                    liElemelnt.classList.add('active');
                } else {
                    switch (currentCategory.name) {
                        case '오늘 할 일':
                            document.getElementsByClassName('category-name today')[0].parentElement.classList.add('active');
                            break;
                        case '중요':
                            document.getElementsByClassName('category-name importance')[0].parentElement.classList.add('active');
                            break;
                        case '계획된 일정':
                            document.getElementsByClassName('category-name planed')[0].parentElement.classList.add('active');
                            break;
                        case '작업':
                            document.getElementsByClassName('category-name work')[0].parentElement.classList.add('active');
                            break;
                        default:
                            break;
                    }
                }

                personalCategories.appendChild(liElemelnt);
            }
        } else {
            throw new Error('Network response was not ok.');
        }
    }).catch(error => {
        console.error(error);
    });
};

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

window.addEventListener('click', (event) => {
    const target = event.target
    const activeDropdownMenu = document.getElementsByClassName('show-dropdown-menu-button active')[0];
    if(activeDropdownMenu != undefined && activeDropdownMenu.contains(event.target) == false) activeDropdownMenu.classList.remove('active');
});

function createCategory() {
    const categoryName = document.getElementById('create-category-name');
    const body = { name: categoryName.value };
    
    fetch('/categories/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async response => {
        if(response.ok) {
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
        } else {
            throw new Error('Network response was not ok.');
        }
    }).catch(error => {
        console.error(error);
    });
}

async function updateCurrentCategoryToSession (categoryId, categoryName) {
    const body = { categoryId: categoryId, categoryName: categoryName }
    await fetch('/categories/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async response => {
        if(response.ok) {

        } else {
            throw new Error('Network response was not ok.');
        }
    })
};

async function getTasksByUserAndCategory() {
    await fetch('/tasks/category', {
        method: 'GET'
    }).then(async response => {
        if(response.ok) {
            const tasks = await response.json();
            await reformatToHtml(tasks);
        } else {
            throw new Error('Network response was not ok.');
        }
    }).catch(error => {
        console.error(error);
    });
}

async function postTask() {
    const taskText = document.getElementById("post-task-msg").value;
    const body = { taskText: taskText }
    if (!taskText) { return }

    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(async response => {
        if(response.ok) {
            const ul = document.getElementById('incomplete-ul');
            const li = document.createElement('li');
            const tasks = await response.json();

            ul.prepend(await reformatTask(tasks));

            document.getElementById("post-task-msg").value = "";
        } else {
            throw new Error('Network response was not ok.');
        }
    }).catch(error => {
        console.error(error);
    });

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
    const innerWidth = document.body.clientWidth || document.documentElement.clientWidth;
    if (innerWidth < threshold) {
        let taskBoxWidth = innerWidth - margin;
        document.getElementById("post-todo").style.width = taskBoxWidth + "px";
    } else {
        let taskBoxWidth = innerWidth - marginWithSidebar;
        document.getElementById("post-todo").style.width = taskBoxWidth + "px";
    }

}

async function searchTasks() {
    try {
        const term = document.getElementById("search-text").value;
        const activeCurrentCategory = document.getElementsByClassName('category active')[0];
        if(term) { 
            await fetch('/tasks/search/' + term, {
                method: 'GET'
            }).then(async response => {
                if(response.ok) {
                    const tasks = await response.json();
                    await reformatToHtml(tasks);
                    document.getElementById("category-title").innerText = "검색 결과";
                    if(activeCurrentCategory) activeCurrentCategory.classList.remove('active');
                } else {
                    throw new Error('Network response was not ok.');
                }
            }).catch(error => {
                console.error(error);
            });
        } else {
            await changeCurrentCategory(event, null, categoryName);
        }
    } catch (error) {
        alert(error);
    }
}

async function deleteCategory() {
    const activeCategory = document.getElementsByClassName('category active')[0];
    if(activeCategory || activeCategory.parentElement.id == 'personal-categories') {
        if(confirm("카테고리를 삭제 하시겠습니까?")) {
            await fetch('/categories/category', {
                method: 'DELETE'
            }).then(async response => {
                if(response.ok) {
                    const workCategory = document.getElementsByClassName('category-name work')[0];
                    await getTasksByUserAndCategory();
                    activeCategory.remove();
                    updateCategoryTitle();
                    activeCurrentCategory(workCategory);
                } else {
                    throw new Error('Network response was not ok.');
                }
            }).catch(error => {
                console.error(error);
            });
        }
    }
}

async function getCurrentCategory() {
    fetch('/api/category/current', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        if(response.ok) {
            const personalCategories = document.getElementById('personal-categories');
            const li = document.createElement('li');
            li.className = 'category';
            li.innerText = categoryName.value;
            personalCategories.appendChild(li)
            categoryName.value = '';
        } else {
            throw new Error('Network response was not ok.')
        }
    }).catch(error => {
        console.error(error);
    });

    const params = new URL(document.location).searchParams;
    const id = params.get("id");
    const bgColor = "rgb(210, 210, 210)";
    if(!id) {
        let title = document.getElementById("category-title");
        Array.from(document.getElementById("common-categories").childNodes).forEach((element) => {
            if(element.childNodes[0].innerText == title.innerText) {
                element.style.backgroundColor = bgColor;
                element.classList.add('active');
            }
        });
    } else {
        Array.from(document.getElementById("personal-categories").childNodes).forEach((element) => {
            if(element.childNodes[0].href == document.location.href) {
                element.style.backgroundColor = bgColor;
                element.id = seleCat;
            }
        });
    }
}

async function updateCategoryTitle() {
    const activeCategory = document.getElementsByClassName('category active')[0];
    const categoryTitle = document.getElementsByClassName('category-title')[0];

    categoryTitle.firstChild.innerText = activeCategory.firstChild.innerText;    
    if(!activeCategory || activeCategory.parentNode.id == 'personal-categories') {
        categoryTitle.classList.add('personal-category');
    } else {
        categoryTitle.classList.remove('personal-category');
    }
}

async function renameCategory() {
    const categoryTitle = document.getElementsByClassName('category-title')[0];
    const categoryTitleText = document.getElementsByClassName('category-title-text')[0];
    const input = document.createElement("input");
    const form = document.createElement("form");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const font = '30px bold';
    const inputMinWidth = 10;
    
    categoryTitle.addEventListener('click', async () =>  {
        if(categoryTitle.classList.contains('personal-category')) {
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
                ctx.font = font; // 카테고리 제목 폰트 스타일 참조하도록 만들기
                input.style.width = Math.max(categoryTitle.getBoundingClientRect().width, ctx.measureText(input.value).width) + inputMinWidth + "px";
            });
            input.addEventListener('keydown', (e) => {
                if(e.key == 'Enter') input.blur();
                if(e.key == 'Escape') {
                    input.removeEventListener('focusout', send);
                    form.replaceWith(categoryTitle);
                }
            });
            input.addEventListener('focusout', send);
    
            function send() {
                if(!input.value || input.value == categoryTitle.firstChild.innerText) {
                    form.replaceWith(categoryTitle);
                } else {
                    const body = { categoryName: input.value }
                    fetch('/categories/category', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    }).then(response => {
                        if(response.ok) {
                            categoryTitle.firstChild.innerText = input.value;
                            document.getElementsByClassName('category active')[0].firstChild.innerText = input.value;
                            form.replaceWith(categoryTitle);
                        } else {
                            throw new Error('Network response was not ok.');
                        }
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
        }
    });
}

async function getTasksCount() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            
            response.forEach(element => {
                try {
                    var work = document.querySelector('.category-name[href="/tasks/work"]');
                    var importance = document.querySelector('.category-name[href="/tasks/import"]');
                    var plan = document.querySelector('.category-name[href="/tasks/plan"]');
                    var today = document.querySelector('.category-name[href="/tasks/today"]');
                    var aTag = document.createElement('a');
                    aTag.className = "tasks-count";

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
                                document.querySelector(`.category-name[href="/tasks/category?id=${element.name}"]`).parentElement.appendChild(aTag);
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