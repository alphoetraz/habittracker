document.addEventListener("DOMContentLoaded", () => {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    const habitInput = document.getElementById("habitInput");
    const startTimeInput = document.getElementById("startTime");
    const durationInput = document.getElementById("duration");
    const addHabitBtn = document.getElementById("addHabitBtn");
    const habitsContainer = document.getElementById("habitsContainer");
    const noHabitsMsg = document.getElementById("noHabitsMsg");

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
        const endTime = `${String(endHour).padStart(2, "0")}:${String(finalEndMinute).padStart(2, "0")}`;

        const newHabit = {
            id: Date.now(),
            text: habitName,
            completed: false,
            startTime,
            endTime
        };

        habits.push(newHabit);
        saveHabits();
        renderHabits();
        habitInput.value = "";
        startTimeInput.value = "";
        durationInput.value = "";
    }

    function renderHabits() {
        habitsContainer.innerHTML = habits.length ? "" : noHabitsMsg.outerHTML;
        habits.forEach(habit => {
            const habitItem = document.createElement("div");
            habitItem.className = `habit-item ${habit.completed ? "completed" : ""}`;
            habitItem.innerHTML = `
                <div class="habit-left">
                    <span class="habit-time" contenteditable="true" onblur="updateTime(${habit.id}, this.innerText)">
                        ${habit.startTime} - ${habit.endTime}
                    </span>
                    <input type="checkbox" class="checkbox" ${habit.completed ? "checked" : ""} onclick="toggleHabit(${habit.id})">
                    <span class="habit-text">${habit.text}</span>
                </div>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">❌</button>
            `;
            habitsContainer.appendChild(habitItem);
        });
    }

    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }

    addHabitBtn.addEventListener("click", addHabit);
    renderHabits();
});
