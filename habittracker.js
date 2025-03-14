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

    // Alışkanlık ekleme fonksiyonu
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

        const newHabit = {
            id: Date.now(),
            text: habitName,
            completed: false,
            startTime,
            endTime,
            dateCreated: new Date().toISOString().split('T')[0] // Bugünün tarihi
        };

        habits.push(newHabit);
        saveHabits();
        renderHabits();
        updateStats();
        habitInput.value = "";
        startTimeInput.value = "";
        durationInput.value = "";
    }

    // Alışkanlıkları gösterme fonksiyonu
    function renderHabits() {
        if (habits.length === 0) {
            habitsContainer.innerHTML = noHabitsMsg.outerHTML;
            return;
        }
        
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
                    <button class="delete-btn">❌</button>
                </div>
            `;
            
            // Checkbox olayı ekle
            const checkbox = habitItem.querySelector(".checkbox");
            checkbox.addEventListener("change", () => {
                toggleHabit(habit.id);
            });
            
            // Silme butonu olayı ekle
            const deleteBtn = habitItem.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteHabit(habit.id);
            });
            
            habitsContainer.appendChild(habitItem);
        });
    }

    // Alışkanlığı tamamlama/tamamlanmamış yapma
    function toggleHabit(id) {
        habits = habits.map(habit => {
            if (habit.id === id) {
                return { ...habit, completed: !habit.completed };
            }
            return habit;
        });
        
        saveHabits();
        renderHabits();
        updateStats();
    }

    // Alışkanlığı silme
    function deleteHabit(id) {
        if (confirm("Are you sure you want to delete this habit?")) {
            habits = habits.filter(habit => habit.id !== id);
            saveHabits();
            renderHabits();
            updateStats();
        }
    }

    // İstatistikleri güncelleme
    function updateStats() {
        // Toplam alışkanlık sayısı
        totalHabitsValue.textContent = habits.length;
        
        // Bugün tamamlanan alışkanlık sayısı
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(habit => 
            habit.completed && 
            (habit.dateCompleted === today || habit.dateCreated === today)
        ).length;
        
        completedTodayValue.textContent = completedToday;
    }

    // LocalStorage'a kaydetme
    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }

    // Tamamlama tarihini güncelleme için yardımcı fonksiyon
    function markCompleted(id) {
        const today = new Date().toISOString().split('T')[0];
        habits = habits.map(habit => {
            if (habit.id === id && !habit.completed) {
                return { ...habit, completed: true, dateCompleted: today };
            }
            return habit;
        });
    }

    // Olay dinleyicileri
    addHabitBtn.addEventListener("click", addHabit);
    
    // Enter tuşuna basılınca da alışkanlık eklensin
    habitInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && startTimeInput.value && durationInput.value) {
            addHabit();
        }
    });

    // Sayfa yüklendiğinde alışkanlıkları göster ve istatistikleri güncelle
    renderHabits();
    updateStats();
});