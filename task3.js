document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    let tasks = [];
    let editIndex = -1;

    addButton.addEventListener('click', () => {
        const taskValue = taskInput.value.trim();
        if (taskValue && !tasks.includes(taskValue)) {
            if (editIndex === -1) {
                tasks.push(taskValue);
            } else {
                tasks[editIndex] = taskValue;
                editIndex = -1;
                addButton.textContent = 'Add';
            }
            taskInput.value = '';
            renderTasks();
        } else if (tasks.includes(taskValue)) {
            alert('Task already exists.');
        } else {
            alert('Task cannot be empty.');
        }
    });

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task;
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
                    tasks.splice(index, 1);
                    renderTasks();
                }
            });
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });
    }
});
