document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toastContainer';
    document.body.appendChild(toastContainer);
    const tabs = document.querySelectorAll('.tab');
    let taskToDo = JSON.parse(localStorage.getItem('tasks')) || [];
    let editIndex = -1;
    let currentCategory = 'all';

    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keydown',(event) => {
        if(event.key === 'Enter') {
            addTask();
        }
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click',() => {
            currentCategory = tab.dataset.category;
            renderTasks();
            updateCategoryCounts();
            tabs.forEach(t => t.classList.add('active'));
            tab.classList.add('active');
            updateTabStyles(tab);
        });
    });
    function addTask()  {
        const taskValue = taskInput.value.trim();
        if (taskValue && !taskToDo.some(task => task && task.text === taskValue)) {
            if (editIndex === -1) {
                taskToDo.unshift({text: taskValue, completed: false});
                showToast(`Task "${taskValue}" added successfully`,'success');
            } else {
                const oldTask = taskToDo[editIndex].text;
                taskToDo[editIndex].text = taskValue;
                editIndex = -1;
                addButton.textContent = 'Add';
                showToast(`Task "${oldTask}" edited to "${taskValue}" Successfully`,'Information')
            }
            taskInput.value = '';
            saveTasks();
            renderTasks();
        } else if (taskToDo.some(task => task && task.text === taskValue)) {
            showToast(`Task "${taskValue}" already exists`,'warning');
        } else {
            showToast(`Task cannot be empty`,'warning'); 
        }
        updateCategoryCounts();
    }

    function renderTasks() {
        const filteredTasks = taskToDo.filter(task => {
            if(currentCategory === 'completed') {
                return task && task.completed;
            } else if (currentCategory === 'in-progress'){
                return task && !task.completed;
            }
            return true;
        });
        taskList.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            if (task && task.text) {
                const li = document.createElement('li');

                const taskText = document.createElement('div');
                taskText.className = 'task-text';
                taskText.textContent = task.text;

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('task-buttons');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change',() => {
                    task.completed = checkbox.checked;
                    saveTasks();
                    renderTasks();           
                });

                const editButton = document.createElement('button');
                editButton.classList.add('editButton');
                editButton.addEventListener('click', () => {
                    taskInput.value = task.text;
                    addButton.textContent = 'Save';
                    editIndex = index;
                });

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('deleteButton');
                deleteButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete the task?')) {
                        taskToDo.splice(index,1);
                        saveTasks();
                        renderTasks();
                        showToast(`Task "${task.text}" Deleted Successfully`,'error')
                    }
                });
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                li.appendChild(checkbox);
                li.appendChild(taskText);
                li.appendChild(buttonContainer);
                taskList.appendChild(li);

                if (task.completed) {
                    taskText.style.textDecoration = "line-through";
                } else {
                    taskText.style.textDecoration = "none";
                }
            }
        });
        updateCategoryCounts();
    }  
    function updateCategoryCounts(){
        const allCount = taskToDo.filter(task => task && task.text && task.text.trim() !== '').length;
        const completedCount = taskToDo.filter(task => task && task.completed).length;
        const inProgressCount = taskToDo.filter(task => task && task.text && !task.completed).length;
        document.querySelector('[data-category="all"]').textContent = `All Tasks (${allCount})`;
        document.querySelector('[data-category="completed"]').textContent = `Completed (${completedCount})`;
        document.querySelector('[data-category="in-progress"]').textContent = `In Progress (${inProgressCount})`;

    }  
    function updateTabStyles(activeTab) {
        tabs.forEach(tab => {
            if (tab === activeTab){
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    } 

    function saveTasks(){
        localStorage.setItem('tasks',JSON.stringify(taskToDo));
    } 
       
    
    function showToast(message,type){
        const toast = document.createElement('div');
        toast.classList.add('toast',type);
        toast.textContent= message;
        toastContainer.appendChild(toast);
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
            toastContainer.removeChild(toast);
        }, 3000);
    }
    renderTasks();
});
