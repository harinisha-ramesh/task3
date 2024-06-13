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

    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    let deleteIndex = -1;
    let completeIndex = -1;

    const specialChars = `,./<>?;':"\|{}[]()!@#$%^&*~`;
    const specialCharNote = document.createElement('div');
    specialCharNote.textContent = '*Special Characters are not Allowed*';
    specialCharNote.style.display = 'none';
    specialCharNote.style.color = 'red';
    document.querySelector('.container').appendChild(specialCharNote);

    taskInput.addEventListener('keypress', (event) => {
        const inputChar = event.key;
        const specialChars = `,./<>?;':"\|{}[]()!@#$%^&*~`;
        if (inputChar === ' ' && taskInput.value.length === 0) {
            event.preventDefault(); // Prevent spaces at the begining
        }
        if (specialChars.includes(inputChar)) {
            event.preventDefault(); //Prevent special characters
            specialCharNote.style.display = 'block';
        } else {
            specialCharNote.style.display = 'none';
        }
    });

    //Adds a task when the add button is clicked
    addButton.addEventListener('click', addTask);
    
    //Adds a task when Entry key is pressed
    taskInput.addEventListener('keydown',(event) => {
        if(event.key === 'Enter') {
            switchTab('all');
            addTask();
        }
    });
    
    //Updates task category when a tab is clicked
    tabs.forEach(tab => {
        tab.addEventListener('click',() => {
            currentCategory = tab.dataset.category;
            renderTasks();
            updateCategoryCounts();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateTabStyles(tab);
        });
    });

    //Adds a new task or edits an existing task
    function addTask()  {
        const taskValue = taskInput.value.trim();
        const isValidInput = /^[A-Za-z0-9][A-Za-z0-9\s]*$/.test(taskValue); // check for valid input
        if (taskValue && !taskToDo.some(task => task && task.text === taskValue)) {
            if (editIndex === -1) {
                taskToDo.unshift({text: taskValue, completed: false});
                showToast(`Task "${taskValue}" added successfully`,'success');
            } else {
                const oldTask = taskToDo[editIndex].text;
                taskToDo[editIndex].text = taskValue;
                taskToDo[editIndex].timestamp = Date.now();
                editIndex = -1;
                addButton.textContent = 'Add';
                showToast(`Task "${oldTask}" edited to "${taskValue}" Successfully`,'information')
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
    
    //Renders the tasks based on the selected category
    function renderTasks() {
        const filteredTasks = taskToDo.filter(task => {
            if(currentCategory === 'completed') {
                return task && task.completed;
            } else if (currentCategory === 'in-progress'){
                return task && !task.completed;
            }
            return true;
        });
        filteredTasks.sort((a, b) => {
            if (a && b && a.timestamp && b.timestamp) {
                return b.timestamp - a.timestamp;
            }
            return 0;
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
                    confirmCompletion(task,index,checkbox);           
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
                    deleteIndex = index;
                    if(confirmMessage) {
                        confirmMessage.textContent = `Are you sure do you want to delete the task "${task.text}"?`;
                    } 
                    confirmModal.style.display = 'block';
                });

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                li.appendChild(checkbox);
                li.appendChild(taskText);
                li.appendChild(buttonContainer);
                taskList.appendChild(li);
                
                //Strikes through completed tasks
                if (task.completed) {
                    taskText.style.textDecoration = "line-through";
                } else {
                    taskText.style.textDecoration = "none";
                }
            }
        });
        updateCategoryCounts();
    }  
    function confirmCompletion(task,index,checkbox){
        confirmMessage.textContent = checkbox.checked ?
            `Are you sure do you want to mark the task "${task.text}" as completed?`:
            `Are you sure do you want to mark the task "${task.text}" as uncompleted?`;
        confirmModal.style.display = 'block';

        
        confirmDeleteButton.onclick = () => {
            task.completed = checkbox.checked;
            task.timestamp = Date.now();
            saveTasks();
            renderTasks();
            if (checkbox.checked) {
                showToast(`Task "${task.text}" marked as completed`, 'information');
                switchTab('completed');
            } else{
                showToast(`Task "${task.text}" marked as in progress`,'information');
                switchTab('in-progress');
            }
            confirmModal.style.display = 'none';
        };
        cancelDeleteButton.onclick = () => {
            checkbox.checked = !checkbox.checked;
            confirmModal.style.display = 'none';
        };
    }
    //Deletes a task when the delete is confirmed
    confirmDeleteButton.addEventListener('click',() => {
        if (deleteIndex !== -1) {
            const task = taskToDo[deleteIndex];
            taskToDo.splice(deleteIndex,1);
            saveTasks();
            renderTasks();
            showToast(`Task "${task.text}" Deleted Successfully`,'error');
            deleteIndex = -1;
            confirmModal.style.display = 'none';
        } else if (completeIndex !== -1) {
            taskToDo[completeIndex].completed = true;
            saveTasks();
            renderTasks();
            showToast(`Task "${taskToDo[completeIndex].text}" marked as completed`,'success');
            completeIndex = -1;
            confirmModal.style.display = 'none';
        }
    });
    
    //Cancels the delete action
    cancelDeleteButton.addEventListener('click',() => {
        confirmModal.style.display = 'none';
        deleteIndex = -1;
        completeIndex = -1;
    });
    
    //Updates the count of tasks in each category
    function updateCategoryCounts(){
        const allCount = taskToDo.filter(task => task && task.text && task.text.trim() !== '').length;
        const completedCount = taskToDo.filter(task => task && task.completed).length;
        const inProgressCount = taskToDo.filter(task => task && task.text && !task.completed).length;
        document.querySelector('[data-category="all"]').textContent = `All Tasks (${allCount})`;
        document.querySelector('[data-category="completed"]').textContent = `Completed (${completedCount})`;
        document.querySelector('[data-category="in-progress"]').textContent = `In Progress (${inProgressCount})`;

    } 
    
    //Highlights the active tab
    function updateTabStyles(activeTab) {
        tabs.forEach(tab => {
            if (tab === activeTab){
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    } 
    
    //saves task to local storage
    function saveTasks(){
        localStorage.setItem('tasks',JSON.stringify(taskToDo));
    } 
       
    //Displays a toast message
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

    function switchTab(category) {
        currentCategory = category;
        renderTasks();
        updateCategoryCounts();
        tabs.forEach(tab => {
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        updateTabStyles(document.querySelector(`[data-category="${category}"]`));
    }

    renderTasks();
});
