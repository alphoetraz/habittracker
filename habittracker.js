document.addEventListener("DOMContentLoaded", () => {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    let activeView = "dailyView"; // activeView değişkenini ekledik

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
            alert("Please enter a valid habit name, start time, and duration.");
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
            view: activeView // Görünüm bilgisini ekledik
        };

        habits.push(newHabit);
        saveHabits();
        renderHabits();
        updateStats();
        resetForm();
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
                    <span class="habit-time">${habit.startTime} - ${habit.endTime}</span>
                    <button class="delete-btn" aria-label="Delete habit">❌</button>
                </div>
            `;

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
        if (confirm("Are you sure you want to delete this habit?")) {
            habits = habits.filter(habit => habit.id !== id);
            saveHabits();
            renderHabits();
            updateStats();
        }
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
        activeView = viewId; // activeView'i güncelle
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

        renderHabits(); // Görünüm değiştiğinde alışkanlıkları yeniden render et
        updateStats(); // İstatistikleri güncelle
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