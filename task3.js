document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    let taskToDo = [];
    let editIndex = -1;

    addButton.addEventListener('click', () => {
      
        const taskValue = taskInput.value.trim();
        if (taskValue && !taskToDo.includes(taskValue)) {
            if (editIndex === -1) {
                taskToDo.push(taskValue);
                showToast('Task Added Successfully','success');
            } else {
                taskToDo[editIndex] = taskValue;
                editIndex = -1;
                addButton.textContent = 'Add';
                showToast('Task Edited Successfully','Information')
            }
            taskInput.value = '';
            renderTasks();
        } else if (taskToDo.includes(taskValue)) {
            showToast('Task already exists','warning');
        } else {
            showToast('Task cannot be empty','warning'); 
        }
    });

    function renderTasks() {
        taskList.innerHTML = '';
        taskToDo.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task;
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
                    taskToDo.splice(index, 1);
                    renderTasks();
                    showToast('Task Deleted Successfully','error')
                }
            });
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(buttonContainer);
            taskList.appendChild(li);
        });
    }
    function showToast(message,type){
        const toast = document.createElement('div');
        toast.classList.add('toast',type);
        toast.textContent= message;
        toastMessage.appendChild(toast);
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
            toastMessage.removeChild(toast);
        }, 3000);
    }
});
