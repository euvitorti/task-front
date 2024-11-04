// main.js
import { listTasks, addTask } from './task.js';
import { renderTasks } from './ui.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const tasks = await listTasks();
        renderTasks(tasks);
    } catch (error) {
        handleError(error);
    }
});

// Adiciona o evento de envio do formulário
document.getElementById('taskForm').onsubmit = async (event) => {
    event.preventDefault();
    
    const taskData = {
        name: document.getElementById('taskName').value,
        cost: parseFloat(document.getElementById('taskCost').value),
        dueDate: document.getElementById('taskDueDate').value,
        userName: localStorage.getItem('username'), // Adiciona o nome de usuário
    };

    try {
        await addTask(taskData); // Chama a nova função para adicionar a tarefa
        const tasks = await listTasks(); // Atualiza a lista de tarefas
        renderTasks(tasks); // Renderiza a lista atualizada
    } catch (error) {
        handleError(error);
    }
};