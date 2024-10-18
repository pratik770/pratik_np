  
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthDisplay = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();
    let selectedDay = null;

    function renderCalendar() {
      calendarDays.innerHTML = '';
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
      const lastDayOfMonth = new Date(year, month, lastDateOfMonth).getDay();

      currentMonthDisplay.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Fill in the blanks for the days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day');
        calendarDays.appendChild(emptyDay);
      }

      // Create clickable days for the current month
      for (let i = 1; i <= lastDateOfMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.textContent = i;

        day.addEventListener('click', function() {
          // If there's a previously selected day, remove its "selected" class
          if (selectedDay) {
            selectedDay.classList.remove('selected');
          }
          // Mark the clicked day as selected and change its background
          day.classList.add('selected');
          selectedDay = day;
        });

        calendarDays.appendChild(day);
      }

      // Fill in the blanks for the days after the last day of the month
      for (let i = lastDayOfMonth + 1; i <= 6; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day');
        calendarDays.appendChild(emptyDay);
      }
    }

    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    // Initialize the calendar
    renderCalendar();
  