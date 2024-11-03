const API_URL = 'http://localhost:8080/task';
const token = localStorage.getItem('Bearer Token');
const userName = localStorage.getItem('username');
let tasksList = []; // Array para armazenar as tarefas

document.addEventListener("DOMContentLoaded", async () => {
    await listTasks()
});

// Função utilitária para criar células da tabela
const createCell = (content) => {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
};

const fetchWithAuth = async (url, options = {}) => {
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
        ...options.headers,
    };
    const response = await fetch(url, options);

    if (!response.ok && response.status !== 204) {
        throw new Error(`Error: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
};

async function listTasks() {
    try {
        if (!token) throw new Error('Token not available.');

        const tasks = await fetchWithAuth(`${API_URL}/tarefas/${userName}`, { method: 'GET' });

        // Verifica se tasks é um array e inicializa tasksList
        tasksList = Array.isArray(tasks) ? tasks : []; // Garante que tasksList é um array

        // Ordena as tarefas pelo ID do menor para o maior, se houver tarefas
        if (tasksList.length > 0) {
            tasksList.sort((a, b) => a.id - b.id);
        }

        const tasksTableBody = document.querySelector('#tasks-table tbody');
        tasksTableBody.innerHTML = '';

        tasksList.forEach(task => {
            const row = document.createElement('tr');
            row.setAttribute('draggable', 'true'); // Permite que a linha seja arrastada
            row.dataset.id = task.id; // Adiciona o ID da tarefa como atributo data-id

            // Verifica se o custo é maior ou igual a R$ 1.000,00
            if (task.cost >= 1000) {
                row.style.backgroundColor = 'red';
            }

            row.appendChild(createCell(task.name));
            row.appendChild(createCell(`R$ ${task.cost.toFixed(2)}`));
            row.appendChild(createCell(task.dueDate));

            // Ícone de deletar
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash'); // Classe do ícone de lixeira
            deleteIcon.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável
            deleteIcon.onclick = () => deleteTask(task.id);
            const deleteCell = document.createElement('td'); // Cria uma nova célula
            deleteCell.appendChild(deleteIcon); // Anexa o ícone à célula
            row.appendChild(deleteCell); // Anexa a célula à linha

            // Ícone de editar
            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit'); // Classe do ícone de editar
            editIcon.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável
            editIcon.onclick = () => editTask(task.id);
            const editCell = document.createElement('td'); // Cria uma nova célula
            editCell.appendChild(editIcon); // Anexa o ícone à célula
            row.appendChild(editCell); // Anexa a célula à linha

            tasksTableBody.appendChild(row);
        });
    } catch (error) {
        handleError(error);
    }
}

// Função para deletar uma tarefa
async function deleteTask(taskId) {
    const confirmDeletion = window.confirm("Você tem certeza que deseja excluir esta tarefa?");

    if (confirmDeletion) {
        try {
            await fetchWithAuth(`${API_URL}/deletar/${taskId}`, { method: 'DELETE' });
            tasksList = tasksList.filter(task => task.id !== taskId);
            listTasks();
        } catch (error) {
            handleError(error);
        }
    } else {
        console.log("Exclusão cancelada.");
    }
}

let currentTaskId = null;

async function editTask(taskId) {
    currentTaskId = taskId; // Armazena o ID da tarefa atual
    const task = tasksList.find(t => t.id === taskId);
    if (!task) {
        alert('Tarefa não encontrada!');
        return;
    }

    document.getElementById('editTaskName').value = task.name;
    document.getElementById('editTaskCost').value = task.cost.toFixed(2);
    document.getElementById('editTaskDueDate').value = task.dueDate;

    document.getElementById('editTaskModal').style.display = 'block';
}

document.getElementById('editTaskForm').onsubmit = async (event) => {
    event.preventDefault();

    const updatedTaskData = {
        name: document.getElementById('editTaskName').value,
        cost: parseFloat(document.getElementById('editTaskCost').value),
        dueDate: document.getElementById('editTaskDueDate').value,
    };

    try {
        await fetchWithAuth(`${API_URL}/editar/${currentTaskId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedTaskData),
        });
        listTasks();
        closeModal();
    } catch (error) {
        handleError(error);
    }
};

// Função para fechar o modal
function closeModal() {
    document.getElementById('editTaskModal').style.display = 'none';
}

// Adiciona o evento de fechar o modal ao clicar no "X"
document.getElementById('closeModal').onclick = closeModal;

// Adiciona o evento para fechar o modal ao clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('editTaskModal');
    if (event.target === modal) {
        closeModal();
    }
};

// CADASTRAR TAREFA
document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Log para verificar o estado de tasksList
    console.log("tasksList antes de verificar:", tasksList);

    const taskData = {
        name: document.getElementById('taskName').value,
        cost: parseFloat(document.getElementById('taskCost').value),
        dueDate: document.getElementById('taskDueDate').value,
        userName,
    };

    // Verifica se tasksList é um array e se a tarefa já existe
    if (!Array.isArray(tasksList)) {
        tasksList = []; // Inicializa como um array vazio se não for
    }

    if (tasksList.some(task => task.name === taskData.name)) {
        alert('Essa tarefa já existe!');
        return;
    }

    try {
        await fetchWithAuth(`${API_URL}/adicionar`, {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
        await listTasks();
    } catch (error) {
        handleError(error);
    }
});

// Função para tratar erros
function handleError(error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
}


// Adiciona os eventos de drag-and-drop
const tasksTableBody = document.querySelector('#tasks-table tbody');

// Função para permitir o arrasto
tasksTableBody.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'TR') {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.id); // Armazena o ID da tarefa
    }
});

tasksTableBody.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

// Permite que a linha seja solta
tasksTableBody.addEventListener('dragover', (e) => {
    e.preventDefault(); // Permite que o elemento seja solto
    const draggingRow = document.querySelector('.dragging');
    const targetRow = e.target.closest('tr'); // Encontra a linha alvo

    if (targetRow && targetRow !== draggingRow) {
        targetRow.classList.add('over'); // Adiciona estilo visual
    }
});

// Remove o estilo de sobreposição
tasksTableBody.addEventListener('dragleave', (e) => {
    const targetRow = e.target.closest('tr');
    if (targetRow) {
        targetRow.classList.remove('over'); // Remove o estilo visual
    }
});

// Lógica para soltar a tarefa
tasksTableBody.addEventListener('drop', async (e) => {
    e.preventDefault();
    const draggingRow = document.querySelector('.dragging');
    const targetRow = e.target.closest('tr');

    if (targetRow && targetRow !== draggingRow) {
        const draggingId = draggingRow.dataset.id;
        const targetId = targetRow.dataset.id;

        if (draggingRow && targetRow) {
            const draggingRowIndex = Array.from(tasksTableBody.children).indexOf(draggingRow);
            const targetRowIndex = Array.from(tasksTableBody.children).indexOf(targetRow);

            if (draggingRowIndex < targetRowIndex) {
                tasksTableBody.insertBefore(draggingRow, targetRow.nextSibling);
            } else {
                tasksTableBody.insertBefore(draggingRow, targetRow);
            }

            const draggingTask = tasksList.find(task => task.id == draggingId);
            const targetTask = tasksList.find(task => task.id == targetId);
            const draggingIndex = tasksList.indexOf(draggingTask);
            const targetIndex = tasksList.indexOf(targetTask);

            // Troca as posições no array
            tasksList[draggingIndex] = targetTask;
            tasksList[targetIndex] = draggingTask;
        }
    }

    // Remove o estilo de sobreposição
    if (targetRow) {
        targetRow.classList.remove('over');
    }
});
