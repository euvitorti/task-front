// ui.js
import { listTasks, deleteTask, editTask } from './task.js';

const createCell = (content) => {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
};

function renderTasks(tasks) {
    const tasksTableBody = document.querySelector('#tasks-table tbody');
    tasksTableBody.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');

        if (task.cost >= 1000) {
            row.style.backgroundColor = 'yellow';
        }

        row.appendChild(createCell(task.name));
        row.appendChild(createCell(`R$ ${task.cost.toFixed(2)}`));
        row.appendChild(createCell(task.dueDate));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.onclick = () => {
            deleteTask(task.id).then(renderTasks);
        };
        row.appendChild(createCell(deleteButton));

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => editTask(task.id);
        row.appendChild(createCell(editButton));

        tasksTableBody.appendChild(row);
    });
}

function handleError(error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
}

export { renderTasks, handleError };