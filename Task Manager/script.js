/* ============================================
   TaskFlow - Smart Task Manager JavaScript
   ============================================ */

// DOM Elements
const loader = document.getElementById('loader');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filterButtons = document.querySelectorAll('.filter-btn');
const priorityButtons = document.querySelectorAll('.priority-btn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTaskId = document.getElementById('editTaskId');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editPriority = document.getElementById('editPriority');
const editDueDate = document.getElementById('editDueDate');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

// State
let tasks = [];
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let searchQuery = '';

// ============================================
// Date Validation
// ============================================

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function isDateInPast(dateString) {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today;
}

function showDateError(inputElement, message) {
    // Remove existing error if any
    clearDateError(inputElement);

    // Add error class to input
    inputElement.classList.add('input-error');

    // Create error message element
    const errorEl = document.createElement('span');
    errorEl.className = 'date-error-message';
    errorEl.textContent = message;

    // Insert after the input
    inputElement.parentNode.appendChild(errorEl);
}

function clearDateError(inputElement) {
    inputElement.classList.remove('input-error');
    const existingError = inputElement.parentNode.querySelector('.date-error-message');
    if (existingError) {
        existingError.remove();
    }
}

function validateDateInput(inputElement) {
    const dateValue = inputElement.value;

    if (dateValue && isDateInPast(dateValue)) {
        showDateError(inputElement, 'Due date cannot be in the past');
        return false;
    }

    clearDateError(inputElement);
    return true;
}

// ============================================
// Confetti System
// ============================================

let confettiParticles = [];
let confettiAnimationId = null;

function initConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

// Initialize canvas on load and resize
window.addEventListener('resize', initConfettiCanvas);

class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 5;
        this.speedX = Math.random() * 12 - 6;
        this.speedY = Math.random() * -15 - 5;
        this.gravity = 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.opacity = 1;
        this.color = this.getRandomColor();
        this.shape = Math.floor(Math.random() * 3); // 0: square, 1: circle, 2: triangle
    }

    getRandomColor() {
        const colors = [
            '#06b6d4', // cyan
            '#8b5cf6', // purple
            '#22c55e', // green
            '#f59e0b', // amber
            '#ef4444', // red
            '#ec4899', // pink
            '#3b82f6', // blue
            '#fbbf24', // yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= 0.008;
    }

    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = this.opacity;
        confettiCtx.fillStyle = this.color;

        switch (this.shape) {
            case 0: // Square
                confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case 1: // Circle
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
                break;
            case 2: // Triangle
                confettiCtx.beginPath();
                confettiCtx.moveTo(0, -this.size / 2);
                confettiCtx.lineTo(this.size / 2, this.size / 2);
                confettiCtx.lineTo(-this.size / 2, this.size / 2);
                confettiCtx.closePath();
                confettiCtx.fill();
                break;
        }

        confettiCtx.restore();
    }
}

function createConfetti(x, y) {
    initConfettiCanvas();

    // Create particles from the button position
    for (let i = 0; i < 50; i++) {
        confettiParticles.push(new ConfettiParticle(x, y));
    }

    // Also create some from the top
    for (let i = 0; i < 30; i++) {
        confettiParticles.push(new ConfettiParticle(
            Math.random() * window.innerWidth,
            -20
        ));
    }

    if (!confettiAnimationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Remove particles that are off screen or faded
        if (particle.opacity <= 0 || particle.y > confettiCanvas.height + 50) {
            confettiParticles.splice(index, 1);
        }
    });

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimationId = null;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ============================================
// LocalStorage Functions
// ============================================

function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem('taskflow_tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    }
}

// ============================================
// Task CRUD Operations
// ============================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTask(title, description, priority, dueDate) {
    const task = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
}

function updateTask(id, updates) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function deleteTask(id) {
    const taskEl = document.querySelector(`[data-id="${id}"]`);
    if (taskEl) {
        taskEl.classList.add('deleting');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }, 300);
    }
}

function toggleTaskComplete(id, event) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const wasCompleted = task.completed;
        task.completed = !task.completed;
        saveTasks();

        // Trigger confetti if task is being completed (not uncompleted)
        if (!wasCompleted && task.completed && event) {
            const rect = event.target.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createConfetti(x, y);
        }

        renderTasks();
        updateStats();
    }
}

function clearCompletedTasks() {
    const completedTasks = tasks.filter(t => t.completed);
    completedTasks.forEach(task => {
        const taskEl = document.querySelector(`[data-id="${task.id}"]`);
        if (taskEl) {
            taskEl.classList.add('deleting');
        }
    });

    setTimeout(() => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }, 300);
}

// ============================================
// Filtering & Searching
// ============================================

function getFilteredTasks() {
    let filtered = [...tasks];

    // Apply status filter
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }

    // Apply priority filter
    if (currentPriorityFilter !== 'all') {
        filtered = filtered.filter(t => t.priority === currentPriorityFilter);
    }

    // Apply search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );
    }

    return filtered;
}

// ============================================
// Rendering
// ============================================

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function isOverdue(dateString) {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
}

function renderTasks() {
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.add('visible');

        // Update empty state message based on filters
        if (searchQuery) {
            emptyState.querySelector('h3').textContent = 'No tasks found';
            emptyState.querySelector('p').textContent = 'Try a different search term';
        } else if (currentFilter === 'completed') {
            emptyState.querySelector('h3').textContent = 'No completed tasks';
            emptyState.querySelector('p').textContent = 'Complete some tasks to see them here';
        } else if (currentFilter === 'pending') {
            emptyState.querySelector('h3').textContent = 'All caught up!';
            emptyState.querySelector('p').textContent = 'No pending tasks remaining';
        } else {
            emptyState.querySelector('h3').textContent = 'No tasks yet!';
            emptyState.querySelector('p').textContent = 'Add your first task to get started';
        }
        return;
    }

    emptyState.classList.remove('visible');

    tasksList.innerHTML = filtered.map(task => {
        const overdue = !task.completed && isOverdue(task.dueDate);

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <button class="btn-complete ${task.completed ? 'is-completed' : ''}" onclick="toggleTaskComplete('${task.id}', event)" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    <span>${task.completed ? 'Undo' : 'Complete'}</span>
                </button>
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${escapeHtml(task.title)}</span>
                        <span class="priority-tag ${task.priority}">${task.priority}</span>
                    </div>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `
                            <span class="${overdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar-alt"></i>
                                ${formatDate(task.dueDate)}
                                ${overdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                        <span>
                            <i class="fas fa-clock"></i>
                            Created ${formatRelativeTime(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-edit" onclick="openEditModal('${task.id}')" title="Edit task">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(dateString);
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// ============================================
// Modal Functions
// ============================================

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskId.value = task.id;
    editTitle.value = task.title;
    editDescription.value = task.description;
    editPriority.value = task.priority;
    editDueDate.value = task.dueDate || '';

    editModal.classList.add('active');
    editTitle.focus();
}

function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

// ============================================
// Event Listeners
// ============================================

// Page Load
window.addEventListener('load', () => {
    loadTasks();
    renderTasks();
    updateStats();

    // Set minimum date to today for due date inputs
    const today = new Date().toISOString().split('T')[0];
    taskDueDate.min = today;
    editDueDate.min = today;

    // Hide loader
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);
});

// Add Task Form
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitle.value;
    const description = taskDescription.value;
    const priority = taskPriority.value;
    const dueDate = taskDueDate.value;

    // Validate date before submitting
    if (!validateDateInput(taskDueDate)) {
        taskDueDate.focus();
        return;
    }

    if (title.trim()) {
        addTask(title, description, priority, dueDate);
        taskForm.reset();
        taskPriority.value = 'medium'; // Reset to default
        clearDateError(taskDueDate);
        taskTitle.focus();
    }
});

// Date validation on input change
taskDueDate.addEventListener('change', () => {
    validateDateInput(taskDueDate);
});

// Search Input
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
    renderTasks();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    renderTasks();
    searchInput.focus();
});

// Filter Buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Priority Filter Buttons
priorityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        priorityButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPriorityFilter = btn.dataset.priority;
        renderTasks();
    });
});

// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
    const hasCompleted = tasks.some(t => t.completed);
    if (hasCompleted) {
        clearCompletedTasks();
    }
});

// Edit Modal
editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = editTaskId.value;
    const title = editTitle.value;
    const description = editDescription.value;
    const priority = editPriority.value;
    const dueDate = editDueDate.value;

    // Validate date before submitting
    if (!validateDateInput(editDueDate)) {
        editDueDate.focus();
        return;
    }

    if (title.trim()) {
        updateTask(id, {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate
        });
        closeEditModal();
    }
});

// Date validation on edit modal input change
editDueDate.addEventListener('change', () => {
    validateDateInput(editDueDate);
});

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal on overlay click
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.classList.contains('active')) {
        closeEditModal();
    }
});

// Keyboard shortcut: Ctrl/Cmd + N to focus new task input
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        taskTitle.focus();
    }
});

// Keyboard shortcut: / to focus search
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
    }
});
