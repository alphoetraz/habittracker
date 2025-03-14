document.addEventListener("DOMContentLoaded", () => {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    const habitInput = document.getElementById("habitInput");
    const startTimeInput = document.getElementById("startTime");
    const durationInput = document.getElementById("duration");
    const addHabitBtn = document.getElementById("addHabitBtn");
    const habitsContainer = document.getElementById("habitsContainer");
    const noHabitsMsg = document.getElementById("noHabitsMsg");
    const totalHabitsValue = document.getElementById("totalHabitsValue");
    const completedTodayValue = document.getElementById("completedTodayValue");

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
            dateCreated: today
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
        if (habits.length === 0) {
            habitsContainer.innerHTML = `<p class="no-habits" id="noHabitsMsg">No habits added yet. Add a habit to get started!</p>`;
            return;
        }
        
        // Sort habits by start time and completion status
        habits.sort((a, b) => {
            // Show incomplete habits first
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // Then sort by start time
            return a.startTime.localeCompare(b.startTime);
        });
        
        habitsContainer.innerHTML = "";
        habits.forEach(habit => {
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
                // Add completion date when marked as completed
                if (updated.completed) {
                    updated.dateCompleted = today;
                } else {
                    // Remove completion date if unmarked
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
        totalHabitsValue.textContent = habits.length;
        
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(habit => 
            habit.completed && 
            (habit.dateCompleted === today || 
             (habit.dateCreated === today && !habit.dateCompleted))
        ).length;
        
        completedTodayValue.textContent = completedToday;

        // Show or hide stats section based on whether there are habits
        document.getElementById("statsSection").style.display = 
            habits.length > 0 ? "block" : "none";
    }

    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }

    // Remove unused function
    // function markCompleted(id) was unused in the original code

    // Event Listeners
    addHabitBtn.addEventListener("click", addHabit);
    
    // Allow form submission on Enter from any input field
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

    // Initial render
    renderHabits();
    updateStats();
});