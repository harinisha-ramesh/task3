document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toastContainer';
    document.body.appendChild(toastContainer);
    let taskToDo = JSON.parse(localStorage.getItem('tasks')) || [];
    let editIndex = -1;

    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keydown',(event) => {
        if(event.key === 'Enter') {
            addTask();
        }
    })
    function addTask()  {
        const taskValue = taskInput.value.trim();
        if (taskValue && !taskToDo.includes(taskValue)) {
            if (editIndex === -1) {
                taskToDo.push(taskValue);
                showToast(`Task "${taskValue}" added successfully`,'success');
            } else {
                const oldTask = taskToDo[editIndex];
                taskToDo[editIndex] = taskValue;
                editIndex = -1;
                addButton.textContent = 'Add';
                showToast(`Task "${oldTask}" edited to "${taskValue}" Successfully`,'Information')
            }
            taskInput.value = '';
            saveTasks();
            renderTasks();
        } else if (taskToDo.includes(taskValue)) {
            showToast(`Task "${taskValue}" already exists`,'warning');
        } else {
            showToast(`Task cannot be empty`,'warning'); 
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        taskToDo.forEach((task, index) => {
            if (task !== null) {
            const li = document.createElement('li');

            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            taskText.textContent = task;

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('task-buttons');

            const editButton = document.createElement('button');
            editButton.classList.add('editButton');
            editButton.addEventListener('click', () => {
                taskInput.value = task;
                addButton.textContent = 'Save';
                editIndex = index;
            });
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('deleteButton');
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete the task?')) {
                    taskToDo[index] = null;
                    saveTasks();
                    renderTasks();
                    showToast(`Task "${task}" Deleted Successfully`,'error')
                }
            });
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(taskText);
            li.appendChild(buttonContainer);
            taskList.appendChild(li);
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
