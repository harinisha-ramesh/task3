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
    let isEditing = false;
    let editingIndex = -1;

    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No Tasks Available';
    document.querySelector('.taskLists').appendChild(emptyMessage);

    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    let deleteIndex = -1;
    let completeIndex = -1;

   
    const specialCharNote = document.createElement('div');
    specialCharNote.textContent = '*Special Characters are not Allowed*';
    specialCharNote.style.display = 'none';
    specialCharNote.style.color = 'red';
    document.querySelector('.container').appendChild(specialCharNote);
    
    taskInput.addEventListener('keypress', (event) => {
        const inputChar = event.key;
        const specialChars = `,./<>?;':"\|{}[]()!@#$%^&*~`;
        if (inputChar === ' '  && taskInput.value.length === 0){
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
    addButton.addEventListener('click', () => {
        if (isEditing) {
            // Edit mode
            updateTask(editingIndex, taskInput.value);
        } else {
            // Add mode
            if (taskInput.value.trim() !== '') {
                addTask(taskInput.value);
                taskInput.value = '';
                // Clear the task input box
            } else {
                showToast('Task cannot be empty','warning');
            }
        }
    });
    
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
    
    // Function to trim input value and remove extra spaces
function normalizeInput(value) {
    return value.replace(/\s+/g, ' ').trim();
}

    //Adds a new task or edits an existing task
    function addTask() {
        const taskValue =  normalizeInput(taskInput.value);;
        const isDuplicate = taskToDo.some(task => task && task.text && task.text.toLowerCase() === taskValue.toLowerCase());
       
    
        if (editIndex === -1) {
            // Adding a new task
            if (taskValue && !isDuplicate) {
                taskToDo.unshift({ text: taskValue, completed: false });
                showToast(`Task added successfully`, 'success');
                taskInput.value = '';
                saveTasks();
                renderTasks();
                const taskListContainer = document.querySelector('.taskListContainer'); // Adjust selector if needed
                if (taskListContainer) {
                    taskListContainer.scrollTop = 0;
                } else {
                    console.error('Task list container not found.');
                }
            } else if (isDuplicate) {
                showToast(`Task already exists`, 'warning');
            } else {
                showToast(`Task cannot be empty`, 'warning');
            }
        } else {
            // Editing an existing task
            updateTask(editIndex, taskValue);
            taskInput.value = '';
            addButton.textContent = 'Add';
            editIndex = -1;
            isEditing = false;
            closeModal();
    
        updateCategoryCounts();
      
    }
   
} 


    function updateTask(index, updatedTaskText) {
        const currentTaskText = taskToDo[index].text;
        const trimmedText = normalizeInput(updatedTaskText);
        const isDuplicate = taskToDo.some((task, i) => 
        task && task.text && task.text.toLowerCase() === trimmedText.toLowerCase() && i !== index);
        if (currentTaskText === trimmedText) {
            showToast('There is no change in the task', 'information');
           
        } else if (isDuplicate) {
            showToast('Task already exists', 'error');
            
        } else {
            const [updatedTask] = taskToDo.splice(index,1);
            updatedTask.text = trimmedText;
            taskToDo.unshift(updatedTask);
            saveTasks();
            renderTasks();
            showToast(`Task edited successfully`, 'information');
            
            
        }
        taskInput.value = ''; // Clear the task input box
        addButton.textContent = 'Add';
        isEditing = false; // Reset the edit mode flag
        editingIndex = -1;
        editIndex= -1
        closeModal();
        const taskListContainer = document.querySelector('.taskListContainer'); // Adjust selector if needed
        if (taskListContainer) {
            taskListContainer.scrollTop = 0;
        } else {
            console.error('Task list container not found.');
        }
        
    }
    
    function closeModal() {
        const modal = document.querySelector('#completeModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    //Renders the tasks based on the selected category
    function renderTasks() {
        const filteredTasks = taskToDo.filter(task => {
            if(currentCategory === 'completed') {
                return task && task.completed;
            } else if (currentCategory === 'in-progress'){
                return task && !task.completed;
            } else {
                return true;
            }    
        });


        taskList.innerHTML = '';

        filteredTasks.forEach((task, filteredIndex) => {
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
                    confirmCompletion(task, taskToDo.indexOf(task), checkbox);           
                });

                const editButton = document.createElement('button');
                editButton.classList.add('editButton');
                editButton.addEventListener('click', () => {
                    taskInput.value = task.text;
                    addButton.textContent = 'Save';
                    editIndex = taskToDo.indexOf(task);

                    taskInput.focus();
                });

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('deleteButton');
                deleteButton.addEventListener('click', () => {
                    deleteIndex = taskToDo.indexOf(task);
                    if(confirmMessage) {
                        confirmMessage.innerHTML = `Are you sure you want to delete the task?<br>Task: "${task.text}"`;
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
        const originalState = checkbox.checked;
        const confirmCompleteButton = document.getElementById('confirmComplete'); // Updated ID
        const cancelCompleteButton = document.getElementById('cancelComplete'); 
        const completeMessage = document.getElementById('completeMessage');
        completeMessage.innerHTML = originalState ?
        `Are you sure you want to mark the task as completed?<br>Task: "${task.text}"`:
        `Are you sure you want to mark the task as uncompleted?<br>Task: "${task.text}"` ;
        const completeModal = document.getElementById('completeModal');
        completeModal.style.display = 'block';

        confirmCompleteButton.onclick = function() {
            completeModal.style.display = 'none';
            task.completed = originalState;
            task.timestamp = Date.now();

            const [updatedTask] = taskToDo.splice(index, 1);
            taskToDo.unshift(updatedTask);
            
            saveTasks();
            renderTasks();
            showToast(`Task marked as ${task.completed ? 'completed' : 'in progress'}`, 'success');
            
            if (currentCategory === 'completed' && !originalState) {
                switchTab('in-progress'); // Switch to In Progress tab if marking uncompleted in Completed tab
            } else if (currentCategory === 'in-progress' && originalState) {
                switchTab('completed'); // Switch to Completed tab if marking completed in In Progress tab
            }    
        };
        cancelCompleteButton.onclick = function()  {
            completeModal.style.display = 'none';
            checkbox.checked = !originalState;
        };
    }
 

    //Deletes a task when the delete is confirmed
    confirmDeleteButton.addEventListener('click',() => {
        if (deleteIndex !== -1) {
            const task = taskToDo[deleteIndex];
            if (task.text === taskInput.value) {
                taskInput.value = '';
                addButton.textContent = 'Add';
                editIndex = -1;
                isEditing = false;
            }
            taskToDo.splice(deleteIndex,1);
            saveTasks();
            renderTasks();
            showToast(`Task Deleted Successfully`,'error');
            deleteIndex = -1;
            confirmModal.style.display = 'none';
            confirmDeleteButton.onclick = null;
            cancelDeleteButton.onclick = null;
        } else if (completeIndex !== -1) {
            taskToDo[completeIndex].completed = true;
            saveTasks();
            renderTasks();
            showToast(`Task  marked as completed`,'success');
            completeIndex = -1;
            confirmModal.style.display = 'none';
            confirmDeleteButton.onclick = null;
            cancelDeleteButton.onclick = null;
        }
    });

    //Cancels the delete action
    cancelDeleteButton.addEventListener('click',() => {
        confirmModal.style.display = 'none';
        deleteIndex = -1;
        confirmDeleteButton.onclick = null;
        cancelDeleteButton.onclick = null;

    });

    //Updates the count of tasks in each category
    function updateCategoryCounts(){
        const allCount = taskToDo.filter(task => task && task.text && task.text.trim()!== '').length;
        const completedCount = taskToDo.filter(task => task && task.completed).length;
        const inProgressCount = taskToDo.filter(task => task && task.text &&!task.completed).length;

        document.querySelector('[data-category="all"]').textContent = `All Tasks (${allCount})`;
        document.querySelector('[data-category="completed"]').textContent = `Completed (${completedCount})`;
        document.querySelector('[data-category="in-progress"]').textContent = `In Progress (${inProgressCount})`;

        if (currentCategory === 'all' && allCount === 0) {
            emptyMessage.style.display = 'block';
        } else if (currentCategory === 'completed' && completedCount === 0) {
            emptyMessage.style.display = 'block';
        } else if (currentCategory === 'in-progress' && inProgressCount === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
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
        updateCategoryCounts();
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

        tabs.forEach(tab => {
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        updateTabStyles(document.querySelector(`[data-category="${category}"]`));
        renderTasks();
    }

    renderTasks();
    updateCategoryCounts();
    }); 