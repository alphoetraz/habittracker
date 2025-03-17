document.addEventListener("DOMContentLoaded", () => {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    let activeView = "dailyView";

    const habitInput = document.getElementById("habitInput");
    const startTimeInput = document.getElementById("startTime");
    const durationInput = document.getElementById("duration");
    const addHabitBtn = document.getElementById("addHabitBtn");
    const habitsContainer = document.getElementById("habitsContainer");
    const noHabitsMsg = document.getElementById("noHabitsMsg");
    const totalHabitsValue = document.getElementById("totalHabitsValue");
    const completedTodayValue = document.getElementById("completedTodayValue");
    const viewButtons = document.querySelectorAll(".view-btn");
    const viewContainers = document.querySelectorAll(".view-container");

    // Bildirim fonksiyonu
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Bildirimi görünür yap
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Bildirimi kaldır
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Zaman girişi için fonksiyon
    function createTimeInput(currentTime, type, habit, timeSpan) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.value = currentTime;
        timeInput.classList.add('inline-time-input');
        
        timeSpan.innerHTML = '';
        timeSpan.appendChild(timeInput);
        timeInput.focus();

        timeInput.addEventListener('blur', () => {
            const newTime = timeInput.value;
            
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(newTime)) {
                showNotification("Invalid time format. Please use HH:MM format.", 'error');
                timeSpan.textContent = currentTime;
                return;
            }

            // Zamanları güncelle
            if (type === 'start') {
                habit.startTime = newTime;
            } else {
                habit.endTime = newTime;
            }

            // Zamanı span'a geri yaz
            timeSpan.textContent = newTime;

            // Kaydet ve yeniden sırala
            saveHabits();
            renderHabits();
        });

        timeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                timeInput.blur();
            }
        });

        return timeInput;
    }

    // Set default time to current hour
    const setDefaultTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        startTimeInput.value = `${hours}:${minutes}`;
    };
    setDefaultTime();

    function addHabit() {
        const habitName = habitInput.value.trim();
        const startTime = startTimeInput.value;
        const duration = parseInt(durationInput.value, 10);

        if (!habitName || !startTime || isNaN(duration) || duration <= 0) {
            showNotification('Please enter a valid habit name, start time, and duration.', 'error');
            return;
        }

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const endMinute = startMinute + duration;
        const endHour = startHour + Math.floor(endMinute / 60);
        const finalEndMinute = endMinute % 60;
        const endTime = `${String(endHour % 24).padStart(2, "0")}:${String(finalEndMinute).padStart(2, "0")}`;

        const today = new Date().toISOString().split('T')[0];
        const newHabit = {
            id: Date.now(),
            text: habitName,
            completed: false,
            startTime,
            endTime,
            dateCreated: today,
            view: activeView
        };

        habits.push(newHabit);
        saveHabits();
        renderHabits();
        updateStats();
        resetForm();
        showNotification('Habit added successfully', 'success');
    }

    function resetForm() {
        habitInput.value = "";
        durationInput.value = "";
        setDefaultTime();
        habitInput.focus();
    }

    function renderHabits() {
        const filteredHabits = habits.filter(habit => habit.view === activeView);

        if (filteredHabits.length === 0) {
            habitsContainer.innerHTML = `<p class="no-habits" id="noHabitsMsg">No habits added yet. Add a habit to get started!</p>`;
            return;
        }

        filteredHabits.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return a.startTime.localeCompare(b.startTime);
        });

        habitsContainer.innerHTML = "";
        filteredHabits.forEach(habit => {
            const habitItem = document.createElement("div");
            habitItem.className = `habit-item ${habit.completed ? "completed" : ""}`;
            habitItem.dataset.id = habit.id;

            habitItem.innerHTML = `
                <div class="habit-left">
                    <input type="checkbox" class="checkbox" ${habit.completed ? "checked" : ""}>
                    <span class="habit-text">${habit.text}</span>
                </div>
                <div class="habit-right">
                    <span class="habit-time" id="habitTime-${habit.id}">
                        <span class="start-time" id="startTime-${habit.id}">${habit.startTime}</span> - 
                        <span class="end-time" id="endTime-${habit.id}">${habit.endTime}</span>
                    </span>
                    <button class="delete-btn" aria-label="Delete habit">❌</button>
                </div>
            `;

            const startTimeSpan = habitItem.querySelector(`#startTime-${habit.id}`);
            const endTimeSpan = habitItem.querySelector(`#endTime-${habit.id}`);

            // Başlangıç zamanı için çift tıklama
            startTimeSpan.addEventListener('dblclick', () => {
                createTimeInput(habit.startTime, 'start', habit, startTimeSpan);
            });

            // Bitiş zamanı için çift tıklama
            endTimeSpan.addEventListener('dblclick', () => {
                createTimeInput(habit.endTime, 'end', habit, endTimeSpan);
            });

            const checkbox = habitItem.querySelector(".checkbox");
            checkbox.addEventListener("change", () => {
                toggleHabit(habit.id);
            });

            const deleteBtn = habitItem.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteHabit(habit.id);
            });

            habitsContainer.appendChild(habitItem);
        });
    }

    function toggleHabit(id) {
        const today = new Date().toISOString().split('T')[0];
        habits = habits.map(habit => {
            if (habit.id === id) {
                const updated = { ...habit, completed: !habit.completed };
                if (updated.completed) {
                    updated.dateCompleted = today;
                } else {
                    delete updated.dateCompleted;
                }
                return updated;
            }
            return habit;
        });

        saveHabits();
        renderHabits();
        updateStats();
    }

    function deleteHabit(id) {
        const habitToDelete = habits.find(habit => habit.id === id);
        
        // Silme onayı için bir konteyner oluştur
        const deleteConfirmation = document.createElement('div');
        deleteConfirmation.classList.add('delete-confirm-modal');
        deleteConfirmation.innerHTML = `
            <div class="delete-confirm">
                <p>Are you sure you want to delete "${habitToDelete.text}"?</p>
                <div class="delete-actions">
                    <button class="confirm-delete">Delete</button>
                    <button class="cancel-delete">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(deleteConfirmation);

        const confirmDelete = deleteConfirmation.querySelector('.confirm-delete');
        const cancelDelete = deleteConfirmation.querySelector('.cancel-delete');

        confirmDelete.addEventListener('click', () => {
            habits = habits.filter(habit => habit.id !== id);
            saveHabits();
            renderHabits();
            updateStats();
            document.body.removeChild(deleteConfirmation);
            showNotification('Habit deleted successfully', 'success');
        });

        cancelDelete.addEventListener('click', () => {
            document.body.removeChild(deleteConfirmation);
        });
    }

    function updateStats() {
        const filteredHabits = habits.filter(habit => habit.view === activeView);
        
        // Total Habits
        totalHabitsValue.textContent = filteredHabits.length;

        // Completed Today
        const today = new Date().toISOString().split('T')[0];
        const completedToday = filteredHabits.filter(habit =>
            habit.completed &&
            (habit.dateCompleted === today ||
                (habit.dateCreated === today && !habit.dateCompleted))
        ).length;

        completedTodayValue.textContent = completedToday;

        // Completion Rate
        const totalHabits = filteredHabits.length;
        const completedHabits = filteredHabits.filter(habit => habit.completed).length;
        
        const completionRate = totalHabits > 0 
            ? Math.round((completedHabits / totalHabits) * 100) 
            : 0;

        const completionRateValue = document.getElementById("completionRateValue");
        completionRateValue.textContent = `${completionRate}%`;

        // Stats Section Visibility
        document.getElementById("statsSection").style.display =
            filteredHabits.length > 0 ? "block" : "none";
    }

    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }

    function switchView(viewId) {
        activeView = viewId;
        viewContainers.forEach(container => {
            if (container.id === viewId) {
                container.classList.add("active");
            } else {
                container.classList.remove("active");
            }
        });

        viewButtons.forEach(button => {
            if (button.id === `${viewId}Btn`) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });

        renderHabits();
        updateStats();
    }

    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            const viewId = button.id.replace("Btn", "");
            switchView(viewId);
        });
    });

    switchView("dailyView");

    addHabitBtn.addEventListener("click", addHabit);

    const formInputs = [habitInput, startTimeInput, durationInput];
    formInputs.forEach(input => {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                if (habitInput.value.trim() && startTimeInput.value && durationInput.value) {
                    addHabit();
                } else {
                    const nextInput = formInputs[formInputs.indexOf(input) + 1];
                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        addHabitBtn.click();
                    }
                }
            }
        });
    });

    renderHabits();
    updateStats();

    // ========== DARK MODE TOGGLE ========== //
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            if (document.body.classList.contains("dark-mode")) {
                themeToggleBtn.textContent = "☀️ Light Mode";
            } else {
                themeToggleBtn.textContent = "🌙 Dark Mode";
            }
        });
    }
});