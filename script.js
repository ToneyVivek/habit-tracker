        const x = document.getElementsByTagName("button");
        for (const e of x) {
            e.onclick = function () {
                e.style.transform = "scale(1.05)";
            };
        }

        const allButtons = document.querySelectorAll("button");

        allButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const originalColor = btn.style.backgroundColor || window.getComputedStyle(btn).backgroundColor;
                btn.style.backgroundColor = "black";

                setTimeout(() => {
                    btn.style.backgroundColor = originalColor;
                }, 150);
            });
        });



        console.log(x);

        class AdvancedHabitTracker {x
            constructor() {
                this.storageKey = 'advancedHabitTrackerData';
                this.globalHabits = [];
                this.globalMetrics = []; // New: metrics with units
                this.monthlyHabits = {};
                this.monthlyMetrics = {}; // New: metrics per month
                this.habitData = {};
                this.metricData = {}; // New: metric values
                this.dailyNotes = {};
                this.currentMonth = new Date().getMonth();
                this.currentYear = new Date().getFullYear();
                this.lastViewedMonth = null;
                this.lastViewedYear = null;
                this.scrollPosition = { x: 0, y: 0 };
                this.isInitialLoad = true;

                // Chart properties
                this.habitChartVisible = false;
                this.dataChartVisible = false;
                this.selectedHabits = new Set();
                this.selectedMetrics = new Set();
                this.habitChartType = 'line';
                this.dataChartType = 'line';
                this.chartColors = [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
                    '#ec4899', '#6b7280', '#14b8a6', '#f43f5e'
                ];

                this.loadFromStorage();
                this.init();
            }

            init() {
                this.setupYearSelector();
                this.bindEvents();
                this.renderTable();
                this.updateStats();
                this.updateMonthInfo();
                this.restoreLastViewedState();
                this.restoreScrollPosition();
                this.isInitialLoad = false;
                this.loadTheme();
            }

            loadTheme() {
                const savedTheme = localStorage.getItem('habitTrackerTheme') || 'light';
                document.documentElement.setAttribute('data-theme', savedTheme);
                this.updateThemeIcon(savedTheme);
            }

            toggleTheme() {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('habitTrackerTheme', newTheme);
                this.updateThemeIcon(newTheme);
            }

            updateThemeIcon(theme) {
                const icon = document.querySelector('.dark-mode-icon');
                if (icon) {
                    icon.textContent = theme === 'light' ? '🌙' : '☀️';
                }
            }

            saveToStorage() {
                try {
                    const gridContainer = document.querySelector('.grid-container');
                    if (gridContainer) {
                        this.scrollPosition = {
                            x: gridContainer.scrollLeft,
                            y: gridContainer.scrollTop
                        };
                    }

                    const data = {
                        globalHabits: this.globalHabits,
                        globalMetrics: this.globalMetrics,
                        monthlyHabits: this.monthlyHabits,
                        monthlyMetrics: this.monthlyMetrics,
                        habitData: this.habitData,
                        metricData: this.metricData,
                        dailyNotes: this.dailyNotes,
                        currentMonth: this.currentMonth,
                        currentYear: this.currentYear,
                        lastViewedMonth: this.currentMonth,
                        lastViewedYear: this.currentYear,
                        scrollPosition: this.scrollPosition,
                        habitChartVisible: this.habitChartVisible,
                        dataChartVisible: this.dataChartVisible,
                        selectedHabits: Array.from(this.selectedHabits),
                        selectedMetrics: Array.from(this.selectedMetrics),
                        habitChartType: this.habitChartType,
                        dataChartType: this.dataChartType,
                        lastSaved: new Date().toISOString()
                    };
                    localStorage.setItem(this.storageKey, JSON.stringify(data));

                    if (!this.isInitialLoad) {
                        this.showStorageStatus('Data saved', 'success');
                    }
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                    this.showStorageStatus('Error saving data', 'error');
                }
            }

            loadFromStorage() {
                try {
                    const savedData = localStorage.getItem(this.storageKey);
                    if (savedData) {
                        const data = JSON.parse(savedData);
                        this.globalHabits = data.globalHabits || [
                            "Morning Meditation", "Exercise", "Read 30 min", "Drink 8 glasses water"
                        ];
                        this.globalMetrics = data.globalMetrics || [
                            { name: "Phone Usage", unit: "hours" },
                            { name: "Sleep Duration", unit: "hours" },
                            { name: "Water Intake", unit: "glasses" },
                            { name: "Steps", unit: "steps" }
                        ];
                        this.monthlyHabits = data.monthlyHabits || {};
                        this.monthlyMetrics = data.monthlyMetrics || {};
                        this.habitData = data.habitData || {};
                        this.metricData = data.metricData || {};
                        this.dailyNotes = data.dailyNotes || {};
                        this.currentMonth = data.currentMonth !== undefined ? data.currentMonth : new Date().getMonth();
                        this.currentYear = data.currentYear || new Date().getFullYear();
                        this.lastViewedMonth = data.lastViewedMonth;
                        this.lastViewedYear = data.lastViewedYear;
                        this.scrollPosition = data.scrollPosition || { x: 0, y: 0 };
                        this.habitChartVisible = data.habitChartVisible || false;
                        this.dataChartVisible = data.dataChartVisible || false;
                        this.selectedHabits = new Set(data.selectedHabits || []);
                        this.selectedMetrics = new Set(data.selectedMetrics || []);
                        this.habitChartType = data.habitChartType || 'line';
                        this.dataChartType = data.dataChartType || 'line';
                    } else {
                        this.globalHabits = [
                            "Morning Meditation", "Exercise", "Read 30 min", "Drink 8 glasses water"
                        ];
                        this.globalMetrics = [
                            { name: "Phone Usage", unit: "hours" },
                            { name: "Sleep Duration", unit: "hours" },
                            { name: "Water Intake", unit: "glasses" },
                            { name: "Steps", unit: "steps" }
                        ];
                    }
                } catch (error) {
                    console.error('Error loading from localStorage:', error);
                    this.showStorageStatus('Error loading data', 'error');
                }
            }

            restoreLastViewedState() {
                if (this.lastViewedMonth !== null && this.lastViewedYear !== null) {
                    this.currentMonth = this.lastViewedMonth;
                    this.currentYear = this.lastViewedYear;
                }
            }

            restoreScrollPosition() {
                setTimeout(() => {
                    const gridContainer = document.querySelector('.grid-container');
                    if (gridContainer && this.scrollPosition) {
                        gridContainer.scrollLeft = this.scrollPosition.x;
                        gridContainer.scrollTop = this.scrollPosition.y;
                    }

                    if (this.habitChartVisible) {
                        this.showHabitChart();
                    }
                    if (this.dataChartVisible) {
                        this.showDataChart();
                    }
                }, 100);
            }

            getCurrentMonthKey() {
                return `${this.currentYear}-${this.currentMonth}`;
            }

            getCurrentMonthHabits() {
                const monthKey = this.getCurrentMonthKey();
                if (!this.monthlyHabits[monthKey]) {
                    this.monthlyHabits[monthKey] = [...this.globalHabits];
                }
                return this.monthlyHabits[monthKey];
            }

            getCurrentMonthMetrics() {
                const monthKey = this.getCurrentMonthKey();
                if (!this.monthlyMetrics[monthKey]) {
                    this.monthlyMetrics[monthKey] = [...this.globalMetrics];
                }
                return this.monthlyMetrics[monthKey];
            }

            updateMonthInfo() {
                const monthInfo = document.getElementById('month-info');
                const currentHabits = this.getCurrentMonthHabits();
                const currentMetrics = this.getCurrentMonthMetrics();
                const habitCount = currentHabits.length;
                const metricCount = currentMetrics.length;

                monthInfo.innerHTML = `
                    <strong>${this.getMonthName(this.currentMonth)} ${this.currentYear}</strong> - 
                    ${habitCount} habit${habitCount !== 1 ? 's' : ''} and ${metricCount} metric${metricCount !== 1 ? 's' : ''} being tracked this month.
                `;
            }

            // Parse metric input (e.g., "5h 30m", "2.5", "150")
            parseMetricValue(input, unit) {
                if (!input || input.trim() === '') return null;

                const value = input.trim().toLowerCase();

                // Handle time formats (hours and minutes)
                if (unit === 'hours' || unit === 'time') {
                    const timeMatch = value.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/);
                    if (timeMatch) {
                        return parseFloat(timeMatch[1]) + parseFloat(timeMatch[2]) / 60;
                    }

                    const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/);
                    if (hourMatch) {
                        return parseFloat(hourMatch[1]);
                    }

                    const minMatch = value.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/);
                    if (minMatch) {
                        return parseFloat(minMatch[1]) / 60;
                    }
                }

                // Handle regular numbers
                const numMatch = value.match(/(\d+(?:\.\d+)?)/);
                if (numMatch) {
                    return parseFloat(numMatch[1]);
                }

                return null;
            }

            // Format metric value for display
            formatMetricValue(value, unit) {
                if (value === null || value === undefined) return '';

                if (unit === 'hours' || unit === 'time') {
                    const hours = Math.floor(value);
                    const minutes = Math.round((value - hours) * 60);
                    if (hours > 0 && minutes > 0) {
                        return `${hours}h ${minutes}m`;
                    } else if (hours > 0) {
                        return `${hours}h`;
                    } else if (minutes > 0) {
                        return `${minutes}m`;
                    }
                }

                return value.toString();
            }

            // Habit Chart Methods
            showHabitChart() {
                const chartSection = document.getElementById('habit-chart-section');
                const toggleBtn = document.getElementById('toggle-habit-chart-btn');
                const resetBtn = document.getElementById('reset-habit-chart-btn');

                chartSection.style.display = 'block';
                toggleBtn.textContent = 'Hide Habit Charts';
                resetBtn.style.display = 'inline-block';
                this.habitChartVisible = true;

                this.renderHabitSelector();
                this.renderHabitChart();
                this.saveToStorage();
            }

            hideHabitChart() {
                const chartSection = document.getElementById('habit-chart-section');
                const toggleBtn = document.getElementById('toggle-habit-chart-btn');
                const resetBtn = document.getElementById('reset-habit-chart-btn');

                chartSection.style.display = 'none';
                toggleBtn.textContent = 'Show Habit Charts';
                resetBtn.style.display = 'none';
                this.habitChartVisible = false;
                this.saveToStorage();
            }

            // Data Chart Methods
            showDataChart() {
                const chartSection = document.getElementById('data-chart-section');
                const toggleBtn = document.getElementById('toggle-data-chart-btn');
                const resetBtn = document.getElementById('reset-data-chart-btn');

                chartSection.style.display = 'block';
                toggleBtn.textContent = 'Hide Data Charts';
                resetBtn.style.display = 'inline-block';
                this.dataChartVisible = true;

                this.renderMetricSelector();
                this.renderDataChart();
                this.saveToStorage();
            }

            hideDataChart() {
                const chartSection = document.getElementById('data-chart-section');
                const toggleBtn = document.getElementById('toggle-data-chart-btn');
                const resetBtn = document.getElementById('reset-data-chart-btn');

                chartSection.style.display = 'none';
                toggleBtn.textContent = 'Show Data Charts';
                resetBtn.style.display = 'none';
                this.dataChartVisible = false;
                this.saveToStorage();
            }

            renderHabitSelector() {
                const selector = document.getElementById('habit-selector');
                const currentHabits = this.getCurrentMonthHabits();

                selector.innerHTML = '<strong>Select habits to display:</strong>';

                currentHabits.forEach((habit, index) => {
                    const isSelected = this.selectedHabits.has(index);
                    const color = this.chartColors[index % this.chartColors.length];

                    const checkbox = document.createElement('div');
                    checkbox.className = `habit-checkbox-chart ${isSelected ? 'selected' : ''}`;
                    checkbox.innerHTML = `
                        <div class="color-indicator" style="background-color: ${color}"></div>
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="habitTracker.toggleHabitSelection(${index})">
                        ${habit}
                    `;
                    selector.appendChild(checkbox);
                });
            }

            renderMetricSelector() {
                const selector = document.getElementById('metric-selector');
                const currentMetrics = this.getCurrentMonthMetrics();

                selector.innerHTML = '<strong>Select metrics to display:</strong>';

                currentMetrics.forEach((metric, index) => {
                    const isSelected = this.selectedMetrics.has(index);
                    const color = this.chartColors[index % this.chartColors.length];

                    const checkbox = document.createElement('div');
                    checkbox.className = `metric-checkbox-chart ${isSelected ? 'selected' : ''}`;
                    checkbox.innerHTML = `
                        <div class="color-indicator" style="background-color: ${color}"></div>
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="habitTracker.toggleMetricSelection(${index})">
                        ${metric.name} (${metric.unit})
                    `;
                    selector.appendChild(checkbox);
                });
            }

            toggleHabitSelection(habitIndex) {
                if (this.selectedHabits.has(habitIndex)) {
                    this.selectedHabits.delete(habitIndex);
                } else {
                    this.selectedHabits.add(habitIndex);
                }
                this.renderHabitSelector();
                this.renderHabitChart();
                this.saveToStorage();
            }

            toggleMetricSelection(metricIndex) {
                if (this.selectedMetrics.has(metricIndex)) {
                    this.selectedMetrics.delete(metricIndex);
                } else {
                    this.selectedMetrics.add(metricIndex);
                }
                this.renderMetricSelector();
                this.renderDataChart();
                this.saveToStorage();
            }

            renderHabitChart() {
                const canvas = document.getElementById('habit-chart');
                const ctx = canvas.getContext('2d');
                const currentHabits = this.getCurrentMonthHabits();
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);

                // Clear canvas
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (this.selectedHabits.size === 0) {
                    ctx.fillStyle = '#6b7280';
                    ctx.font = '16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Select habits to display chart', canvas.width / 2, canvas.height / 2);
                    return;
                }

                this.drawChart(ctx, canvas, 'habit', this.selectedHabits, currentHabits, this.habitChartType);
                this.updateHabitChartLegend();
            }

            renderDataChart() {
                const canvas = document.getElementById('data-chart');
                const ctx = canvas.getContext('2d');
                const currentMetrics = this.getCurrentMonthMetrics();
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);

                // Clear canvas
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (this.selectedMetrics.size === 0) {
                    ctx.fillStyle = '#6b7280';
                    ctx.font = '16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Select metrics to display chart', canvas.width / 2, canvas.height / 2);
                    return;
                }

                this.drawChart(ctx, canvas, 'metric', this.selectedMetrics, currentMetrics, this.dataChartType);
                this.updateDataChartLegend();
            }

            drawChart(ctx, canvas, type, selectedItems, items, chartType) {
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);

                // Chart dimensions
                const padding = 60;
                const chartWidth = canvas.width - 2 * padding;
                const chartHeight = canvas.height - 2 * padding;

                // Get data for scaling
                let maxValue = 0;
                Array.from(selectedItems).forEach(itemIndex => {
                    for (let day = 1; day <= daysInMonth; day++) {
                        let value;
                        if (type === 'habit') {
                            // For habits, calculate cumulative completion rate
                            const habitKey = `${this.currentYear}-${this.currentMonth}-${itemIndex}`;
                            const habitCompletions = this.habitData[habitKey] || {};
                            let completedSoFar = 0;
                            for (let d = 1; d <= day; d++) {
                                if (habitCompletions[d]) completedSoFar++;
                            }
                            value = (completedSoFar / day) * 100;
                        } else {
                            // For metrics, use actual values
                            const metricKey = `${this.currentYear}-${this.currentMonth}-${itemIndex}`;
                            const metricValues = this.metricData[metricKey] || {};
                            value = metricValues[day] || 0;
                        }
                        maxValue = Math.max(maxValue, value);
                    }
                });

                // Ensure minimum scale
                if (type === 'habit') {
                    maxValue = Math.max(maxValue, 100);
                } else {
                    maxValue = Math.max(maxValue, 10);
                }

                // Draw axes and grid
                this.drawAxesAndGrid(ctx, canvas, padding, chartWidth, chartHeight, daysInMonth, maxValue, type);

                // Draw data
                Array.from(selectedItems).forEach((itemIndex, colorIndex) => {
                    const item = items[itemIndex];
                    const color = this.chartColors[itemIndex % this.chartColors.length];

                    // Get data points
                    const dataPoints = [];
                    for (let day = 1; day <= daysInMonth; day++) {
                        let value;
                        if (type === 'habit') {
                            const habitKey = `${this.currentYear}-${this.currentMonth}-${itemIndex}`;
                            const habitCompletions = this.habitData[habitKey] || {};
                            let completedSoFar = 0;
                            for (let d = 1; d <= day; d++) {
                                if (habitCompletions[d]) completedSoFar++;
                            }
                            value = (completedSoFar / day) * 100;
                        } else {
                            const metricKey = `${this.currentYear}-${this.currentMonth}-${itemIndex}`;
                            const metricValues = this.metricData[metricKey] || {};
                            value = metricValues[day] || 0;
                        }
                        dataPoints.push({ day, value });
                    }

                    this.drawDataSeries(ctx, dataPoints, color, chartType, padding, chartWidth, chartHeight, daysInMonth, maxValue);
                });
            }

            drawAxesAndGrid(ctx, canvas, padding, chartWidth, chartHeight, daysInMonth, maxValue, type) {
                // Draw axes
                ctx.strokeStyle = '#e5e7eb';
                ctx.lineWidth = 1;

                // Y-axis
                ctx.beginPath();
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, canvas.height - padding);
                ctx.stroke();

                // X-axis
                ctx.beginPath();
                ctx.moveTo(padding, canvas.height - padding);
                ctx.lineTo(canvas.width - padding, canvas.height - padding);
                ctx.stroke();

                // Draw grid lines
                ctx.strokeStyle = '#f3f4f6';
                ctx.lineWidth = 0.5;

                // Vertical grid lines (days)
                for (let day = 1; day <= daysInMonth; day += 5) {
                    const x = padding + (day - 1) * (chartWidth / (daysInMonth - 1));
                    ctx.beginPath();
                    ctx.moveTo(x, padding);
                    ctx.lineTo(x, canvas.height - padding);
                    ctx.stroke();
                }

                // Horizontal grid lines
                const steps = type === 'habit' ? 5 : Math.max(1, Math.ceil(maxValue / 10));
                for (let i = 0; i <= maxValue; i += maxValue / steps) {
                    const y = canvas.height - padding - (i / maxValue) * chartHeight;
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(canvas.width - padding, y);
                    ctx.stroke();
                }

                // Draw labels
                ctx.fillStyle = '#374151';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';

                // X-axis labels (days)
                for (let day = 1; day <= daysInMonth; day += 5) {
                    const x = padding + (day - 1) * (chartWidth / (daysInMonth - 1));
                    ctx.fillText(day.toString(), x, canvas.height - padding + 20);
                }

                // Y-axis labels
                ctx.textAlign = 'right';
                for (let i = 0; i <= maxValue; i += maxValue / steps) {
                    const y = canvas.height - padding - (i / maxValue) * chartHeight;
                    const label = type === 'habit' ? i + '%' : i.toFixed(1);
                    ctx.fillText(label, padding - 10, y + 4);
                }
            }

            drawDataSeries(ctx, dataPoints, color, chartType, padding, chartWidth, chartHeight, daysInMonth, maxValue) {
                if (chartType === 'line' || chartType === 'area') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;

                    if (chartType === 'area') {
                        ctx.fillStyle = color + '20';
                        ctx.beginPath();
                        ctx.moveTo(padding, chartHeight + padding);
                    } else {
                        ctx.beginPath();
                    }

                    dataPoints.forEach((point, index) => {
                        const x = padding + (point.day - 1) * (chartWidth / (daysInMonth - 1));
                        const y = chartHeight + padding - (point.value / maxValue) * chartHeight;

                        if (index === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });

                    if (chartType === 'area') {
                        ctx.lineTo(padding + chartWidth, chartHeight + padding);
                        ctx.closePath();
                        ctx.fill();
                    }

                    ctx.stroke();

                    // Draw points
                    ctx.fillStyle = color;
                    dataPoints.forEach(point => {
                        const x = padding + (point.day - 1) * (chartWidth / (daysInMonth - 1));
                        const y = chartHeight + padding - (point.value / maxValue) * chartHeight;
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 2 * Math.PI);
                        ctx.fill();
                    });

                } else if (chartType === 'bar') {
                    ctx.fillStyle = color;
                    const barWidth = chartWidth / daysInMonth * 0.8;

                    dataPoints.forEach(point => {
                        const x = padding + (point.day - 1) * (chartWidth / daysInMonth) + (chartWidth / daysInMonth - barWidth) / 2;
                        const barHeight = (point.value / maxValue) * chartHeight;
                        const y = chartHeight + padding - barHeight;

                        ctx.fillRect(x, y, barWidth, barHeight);
                    });
                }
            }

            updateHabitChartLegend() {
                const legend = document.getElementById('habit-chart-legend');
                const currentHabits = this.getCurrentMonthHabits();

                legend.innerHTML = '';
                Array.from(this.selectedHabits).forEach(habitIndex => {
                    const habit = currentHabits[habitIndex];
                    const color = this.chartColors[habitIndex % this.chartColors.length];
                    const completionRate = this.getCompletionRate(habitIndex);

                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    legendItem.innerHTML = `
                        <div class="color-indicator" style="background-color: ${color}"></div>
                        <span>${habit} (${completionRate}%)</span>
                    `;
                    legend.appendChild(legendItem);
                });
            }

            updateDataChartLegend() {
                const legend = document.getElementById('data-chart-legend');
                const currentMetrics = this.getCurrentMonthMetrics();

                legend.innerHTML = '';
                Array.from(this.selectedMetrics).forEach(metricIndex => {
                    const metric = currentMetrics[metricIndex];
                    const color = this.chartColors[metricIndex % this.chartColors.length];
                    const average = this.getMetricAverage(metricIndex);

                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    legendItem.innerHTML = `
                        <div class="color-indicator" style="background-color: ${color}"></div>
                        <span>${metric.name} (avg: ${this.formatMetricValue(average, metric.unit)})</span>
                    `;
                    legend.appendChild(legendItem);
                });
            }

            getMetricAverage(metricIndex) {
                const metricKey = `${this.currentYear}-${this.currentMonth}-${metricIndex}`;
                const metricValues = this.metricData[metricKey] || {};
                const values = Object.values(metricValues).filter(v => v !== null && v !== undefined);

                if (values.length === 0) return 0;
                return values.reduce((sum, val) => sum + val, 0) / values.length;
            }

            // Existing methods with metric support
            exportData() {
                try {
                    const data = {
                        globalHabits: this.globalHabits,
                        globalMetrics: this.globalMetrics,
                        monthlyHabits: this.monthlyHabits,
                        monthlyMetrics: this.monthlyMetrics,
                        habitData: this.habitData,
                        metricData: this.metricData,
                        dailyNotes: this.dailyNotes,
                        exportDate: new Date().toISOString(),
                        version: '3.0'
                    };

                    const dataStr = JSON.stringify(data, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });

                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(dataBlob);
                    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();

                    this.showStorageStatus('Data exported successfully', 'success');
                } catch (error) {
                    console.error('Error exporting data:', error);
                    this.showStorageStatus('Error exporting data', 'error');
                }
            }

            importData(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);

                        if (data.globalHabits || data.globalMetrics || data.habitData || data.metricData || data.dailyNotes) {
                            this.globalHabits = data.globalHabits || this.globalHabits;
                            this.globalMetrics = data.globalMetrics || this.globalMetrics;
                            this.monthlyHabits = data.monthlyHabits || this.monthlyHabits;
                            this.monthlyMetrics = data.monthlyMetrics || this.monthlyMetrics;
                            this.habitData = data.habitData || this.habitData;
                            this.metricData = data.metricData || this.metricData;
                            this.dailyNotes = data.dailyNotes || this.dailyNotes;

                            this.saveToStorage();
                            this.renderTable();
                            this.updateStats();
                            this.updateMonthInfo();
                            if (this.habitChartVisible) {
                                this.renderHabitSelector();
                                this.renderHabitChart();
                            }
                            if (this.dataChartVisible) {
                                this.renderMetricSelector();
                                this.renderDataChart();
                            }

                            this.showStorageStatus('Data imported successfully', 'success');
                        } else {
                            throw new Error('Invalid data format');
                        }
                    } catch (error) {
                        console.error('Error importing data:', error);
                        this.showStorageStatus('Error importing data - invalid format', 'error');
                    }
                };
                reader.readAsText(file);
            }

            clearAllData() {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.removeItem(this.storageKey);
                    this.globalHabits = [
                        "Morning Meditation", "Exercise", "Read 30 min", "Drink 8 glasses water"
                    ];
                    this.globalMetrics = [
                        { name: "Phone Usage", unit: "hours" },
                        { name: "Sleep Duration", unit: "hours" },
                        { name: "Water Intake", unit: "glasses" },
                        { name: "Steps", unit: "steps" }
                    ];
                    this.monthlyHabits = {};
                    this.monthlyMetrics = {};
                    this.habitData = {};
                    this.metricData = {};
                    this.dailyNotes = {};
                    this.selectedHabits.clear();
                    this.selectedMetrics.clear();

                    this.renderTable();
                    this.updateStats();
                    this.updateMonthInfo();
                    if (this.habitChartVisible) {
                        this.renderHabitSelector();
                        this.renderHabitChart();
                    }
                    if (this.dataChartVisible) {
                        this.renderMetricSelector();
                        this.renderDataChart();
                    }
                    this.showStorageStatus('All data cleared', 'success');
                }
            }

            showStorageStatus(message, type) {
                const statusEl = document.getElementById('storage-status');
                statusEl.textContent = message;
                statusEl.className = `storage-status ${type} show`;

                setTimeout(() => {
                    statusEl.classList.remove('show');
                }, 3000);
            }

            setupYearSelector() {
                const yearSelect = document.getElementById('year-select');
                const currentYear = new Date().getFullYear();

                for (let year = currentYear - 2; year <= currentYear + 2; year++) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    if (year === this.currentYear) option.selected = true;
                    yearSelect.appendChild(option);
                }
            }

            getDaysInMonth(month, year) {
                return new Date(year, month + 1, 0).getDate();
            }

            getMonthName(month) {
                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                return months[month];
            }

            getDayOfWeek(day, month, year) {
                return new Date(year, month, day).getDay();
            }

            isToday(day, month, year) {
                const today = new Date();
                return day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
            }

            updateMonthYear() {
                const monthSelect = document.getElementById('month-select');
                const yearSelect = document.getElementById('year-select');

                this.currentMonth = parseInt(monthSelect.value);
                this.currentYear = parseInt(yearSelect.value);

                document.getElementById('page-title').textContent =
                    `Daily Habit Tracker - ${this.getMonthName(this.currentMonth)} ${this.currentYear}`;

                this.updateMonthInfo();
                this.saveToStorage();
            }

            renderTable() {
                const thead = document.querySelector('#habit-table thead tr');
                const tbody = document.getElementById('habit-tbody');
                const currentHabits = this.getCurrentMonthHabits();
                const currentMetrics = this.getCurrentMonthMetrics();

                // Clear existing headers
                while (thead.children.length > 2) {
                    thead.removeChild(thead.lastChild);
                }

                // Add habit headers
                currentHabits.forEach((habit, index) => {
                    const th = document.createElement('th');
                    th.className = 'habit-header';
                    th.innerHTML = `
                        <div class="habit-header-content">
                            <div class="habit-title">${habit}</div>
                            <div class="habit-percentage">${this.getCompletionRate(index)}%</div>
                            <button class="remove-habit-btn" onclick="habitTracker.removeHabitFromMonth(${index})" title="Remove from this month only">×</button>
                        </div>
                    `;
                    thead.appendChild(th);
                });

                // Add metric headers
                currentMetrics.forEach((metric, index) => {
                    const th = document.createElement('th');
                    th.className = 'metric-header';
                    th.innerHTML = `
                        <div class="metric-header-content">
                            <span class="metric-title">${metric.name} (${metric.unit})</span>
                            
                            <button class="remove-metric-btn" onclick="habitTracker.removeMetricFromMonth(${index})">×</button>
                        </div>
                    `;
                    thead.appendChild(th);
                });

                // Clear and generate rows
                tbody.innerHTML = '';
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);

                for (let day = 1; day <= daysInMonth; day++) {
                    const row = document.createElement('tr');
                    const dayOfWeek = this.getDayOfWeek(day, this.currentMonth, this.currentYear);
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isToday = this.isToday(day, this.currentMonth, this.currentYear);

                    if (isWeekend) row.classList.add('weekend');
                    if (isToday) row.classList.add('today');

                    // Date cell
                    const dateCell = document.createElement('td');
                    dateCell.className = 'date-cell';
                    dateCell.textContent = day;
                    row.appendChild(dateCell);

                    // Notes cell
                    const notesCell = document.createElement('td');
                    notesCell.className = 'notes-cell';
                    const notesKey = `${this.currentYear}-${this.currentMonth}-${day}`;
                    notesCell.innerHTML = `
                        <textarea 
                            class="notes-input" 
                            placeholder="Daily notes..."
                            onchange="habitTracker.updateDailyNote('${notesKey}', this.value)"
                            onblur="habitTracker.saveToStorage()"
                        >${this.dailyNotes[notesKey] || ''}</textarea>
                    `;
                    row.appendChild(notesCell);

                    // Habit cells
                    currentHabits.forEach((habit, habitIndex) => {
                        const habitCell = document.createElement('td');
                        const isCompleted = this.isHabitCompleted(habitIndex, day);

                        const checkbox = document.createElement('div');
                        checkbox.className = 'habit-checkbox';
                        if (isCompleted) {
                            checkbox.classList.add('completed');
                            checkbox.textContent = '✓';
                        }
                        checkbox.onclick = () => this.toggleHabit(habitIndex, day);

                        habitCell.appendChild(checkbox);
                        row.appendChild(habitCell);
                    });

                    // Metric cells
                    currentMetrics.forEach((metric, metricIndex) => {
                        const metricCell = document.createElement('td');
                        const metricKey = `${this.currentYear}-${this.currentMonth}-${metricIndex}`;
                        const currentValue = this.metricData[metricKey]?.[day];

                        const input = document.createElement('input');
                        input.className = 'metric-input-cell';
                        input.type = 'text';
                        input.placeholder = `0 ${metric.unit}`;
                        input.value = currentValue ? this.formatMetricValue(currentValue, metric.unit) : '';
                        input.onchange = () => this.updateMetricValue(metricIndex, day, input.value, metric.unit);
                        input.onblur = () => this.saveToStorage();

                        metricCell.appendChild(input);
                        row.appendChild(metricCell);
                    });

                    tbody.appendChild(row);
                }
            }

            isHabitCompleted(habitIndex, day) {
                const habitKey = `${this.currentYear}-${this.currentMonth}-${habitIndex}`;
                return this.habitData[habitKey]?.[day] || false;
            }

            toggleHabit(habitIndex, day) {
                const habitKey = `${this.currentYear}-${this.currentMonth}-${habitIndex}`;
                if (!this.habitData[habitKey]) {
                    this.habitData[habitKey] = {};
                }
                this.habitData[habitKey][day] = !this.habitData[habitKey][day];

                this.renderTable();
                this.updateStats();
                if (this.habitChartVisible) {
                    this.renderHabitChart();
                }
                this.saveToStorage();
            }

            updateMetricValue(metricIndex, day, inputValue, unit) {
                const metricKey = `${this.currentYear}-${this.currentMonth}-${metricIndex}`;
                if (!this.metricData[metricKey]) {
                    this.metricData[metricKey] = {};
                }

                const parsedValue = this.parseMetricValue(inputValue, unit);
                this.metricData[metricKey][day] = parsedValue;

                this.updateStats();
                if (this.dataChartVisible) {
                    this.renderDataChart();
                }
            }

            getCompletionRate(habitIndex) {
                const habitKey = `${this.currentYear}-${this.currentMonth}-${habitIndex}`;
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
                const completed = Object.values(this.habitData[habitKey] || {}).filter(Boolean).length;
                return Math.round((completed / daysInMonth) * 100);
            }

            updateDailyNote(noteKey, value) {
                this.dailyNotes[noteKey] = value;
            }

            updateStats() {
                const currentHabits = this.getCurrentMonthHabits();
                const currentMetrics = this.getCurrentMonthMetrics();
                const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
                const totalPossible = currentHabits.length * daysInMonth;

                let totalCompleted = 0;
                currentHabits.forEach((_, index) => {
                    const habitKey = `${this.currentYear}-${this.currentMonth}-${index}`;
                    totalCompleted += Object.values(this.habitData[habitKey] || {}).filter(Boolean).length;
                });

                const overallPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
                document.getElementById('overall-progress').textContent = `${overallPercentage}%`;

                // Update individual habit and metric stats
                const statsGrid = document.getElementById('stats-grid');
                statsGrid.innerHTML = '';

                // Habit stats
                currentHabits.forEach((habit, index) => {
                    const completionRate = this.getCompletionRate(index);
                    const habitKey = `${this.currentYear}-${this.currentMonth}-${index}`;
                    const completed = Object.values(this.habitData[habitKey] || {}).filter(Boolean).length;

                    const statCard = document.createElement('div');
                    statCard.className = 'stat-card';
                    statCard.innerHTML = `
                        <div class="stat-title">${habit}</div>
                        <div class="stat-value">${completed}/${daysInMonth} days (${completionRate}%)</div>
                    `;
                    statsGrid.appendChild(statCard);
                });

                // Metric stats
                currentMetrics.forEach((metric, index) => {
                    const average = this.getMetricAverage(index);
                    const metricKey = `${this.currentYear}-${this.currentMonth}-${index}`;
                    const values = Object.values(this.metricData[metricKey] || {}).filter(v => v !== null && v !== undefined);
                    const daysWithData = values.length;

                    const statCard = document.createElement('div');
                    statCard.className = 'stat-card';
                    statCard.innerHTML = `
                        <div class="stat-title">${metric.name}</div>
                        <div class="stat-value">${daysWithData}/${daysInMonth} days (avg: ${this.formatMetricValue(average, metric.unit)})</div>
                    `;
                    statsGrid.appendChild(statCard);
                });
            }

            addHabitToMonth(habitName) {
                if (habitName.trim()) {
                    const monthKey = this.getCurrentMonthKey();
                    if (!this.monthlyHabits[monthKey]) {
                        this.monthlyHabits[monthKey] = [...this.globalHabits];
                    }

                    this.monthlyHabits[monthKey].push(habitName.trim());

                    if (!this.globalHabits.includes(habitName.trim())) {
                        this.globalHabits.push(habitName.trim());
                    }

                    this.renderTable();
                    this.updateStats();
                    this.updateMonthInfo();
                    if (this.habitChartVisible) {
                        this.renderHabitSelector();
                        this.renderHabitChart();
                    }
                    this.saveToStorage();
                    this.showStorageStatus(`Added habit "${habitName.trim()}" to ${this.getMonthName(this.currentMonth)}`, 'success');
                }
            }

            addMetricToMonth(metricName, unit) {
                if (metricName.trim() && unit.trim()) {
                    const monthKey = this.getCurrentMonthKey();
                    if (!this.monthlyMetrics[monthKey]) {
                        this.monthlyMetrics[monthKey] = [...this.globalMetrics];
                    }

                    const newMetric = { name: metricName.trim(), unit: unit.trim() };
                    this.monthlyMetrics[monthKey].push(newMetric);

                    const existingMetric = this.globalMetrics.find(m => m.name === metricName.trim());
                    if (!existingMetric) {
                        this.globalMetrics.push(newMetric);
                    }

                    this.renderTable();
                    this.updateStats();
                    this.updateMonthInfo();
                    if (this.dataChartVisible) {
                        this.renderMetricSelector();
                        this.renderDataChart();
                    }
                    this.saveToStorage();
                    this.showStorageStatus(`Added metric "${metricName.trim()}" to ${this.getMonthName(this.currentMonth)}`, 'success');
                }
            }

            removeHabitFromMonth(index) {
                const currentHabits = this.getCurrentMonthHabits();
                const habitName = currentHabits[index];

                if (confirm(`Remove "${habitName}" from ${this.getMonthName(this.currentMonth)} ${this.currentYear}? This will only affect this month.`)) {
                    const monthKey = this.getCurrentMonthKey();

                    this.monthlyHabits[monthKey].splice(index, 1);

                    const habitKey = `${this.currentYear}-${this.currentMonth}-${index}`;
                    delete this.habitData[habitKey];

                    // Reindex remaining habits for this month
                    const newHabitData = {};
                    Object.keys(this.habitData).forEach(key => {
                        const parts = key.split('-');
                        if (parts.length === 3) {
                            const keyYear = parseInt(parts[0]);
                            const keyMonth = parseInt(parts[1]);
                            const oldIndex = parseInt(parts[2]);

                            if (keyYear === this.currentYear && keyMonth === this.currentMonth) {
                                if (oldIndex > index) {
                                    const newKey = `${keyYear}-${keyMonth}-${oldIndex - 1}`;
                                    newHabitData[newKey] = this.habitData[key];
                                } else if (oldIndex < index) {
                                    newHabitData[key] = this.habitData[key];
                                }
                            } else {
                                newHabitData[key] = this.habitData[key];
                            }
                        }
                    });
                    this.habitData = newHabitData;

                    // Remove from selected habits if it was selected
                    this.selectedHabits.delete(index);
                    const newSelectedHabits = new Set();
                    this.selectedHabits.forEach(selectedIndex => {
                        if (selectedIndex > index) {
                            newSelectedHabits.add(selectedIndex - 1);
                        } else if (selectedIndex < index) {
                            newSelectedHabits.add(selectedIndex);
                        }
                    });
                    this.selectedHabits = newSelectedHabits;

                    this.renderTable();
                    this.updateStats();
                    this.updateMonthInfo();
                    if (this.habitChartVisible) {
                        this.renderHabitSelector();
                        this.renderHabitChart();
                    }
                    this.saveToStorage();
                    this.showStorageStatus(`Removed "${habitName}" from ${this.getMonthName(this.currentMonth)}`, 'success');
                }
            }

            removeMetricFromMonth(index) {
                const currentMetrics = this.getCurrentMonthMetrics();
                const metricName = currentMetrics[index].name;

                if (confirm(`Remove "${metricName}" from ${this.getMonthName(this.currentMonth)} ${this.currentYear}? This will only affect this month.`)) {
                    const monthKey = this.getCurrentMonthKey();

                    this.monthlyMetrics[monthKey].splice(index, 1);

                    const metricKey = `${this.currentYear}-${this.currentMonth}-${index}`;
                    delete this.metricData[metricKey];

                    // Reindex remaining metrics for this month
                    const newMetricData = {};
                    Object.keys(this.metricData).forEach(key => {
                        const parts = key.split('-');
                        if (parts.length === 3) {
                            const keyYear = parseInt(parts[0]);
                            const keyMonth = parseInt(parts[1]);
                            const oldIndex = parseInt(parts[2]);

                            if (keyYear === this.currentYear && keyMonth === this.currentMonth) {
                                if (oldIndex > index) {
                                    const newKey = `${keyYear}-${keyMonth}-${oldIndex - 1}`;
                                    newMetricData[newKey] = this.metricData[key];
                                } else if (oldIndex < index) {
                                    newMetricData[key] = this.metricData[key];
                                }
                            } else {
                                newMetricData[key] = this.metricData[key];
                            }
                        }
                    });
                    this.metricData = newMetricData;

                    // Remove from selected metrics if it was selected
                    this.selectedMetrics.delete(index);
                    const newSelectedMetrics = new Set();
                    this.selectedMetrics.forEach(selectedIndex => {
                        if (selectedIndex > index) {
                            newSelectedMetrics.add(selectedIndex - 1);
                        } else if (selectedIndex < index) {
                            newSelectedMetrics.add(selectedIndex);
                        }
                    });
                    this.selectedMetrics = newSelectedMetrics;

                    this.renderTable();
                    this.updateStats();
                    this.updateMonthInfo();
                    if (this.dataChartVisible) {
                        this.renderMetricSelector();
                        this.renderDataChart();
                    }
                    this.saveToStorage();
                    this.showStorageStatus(`Removed "${metricName}" from ${this.getMonthName(this.currentMonth)}`, 'success');
                }
            }

            bindEvents() {
                const addHabitBtn = document.getElementById('add-habit-btn');
                const habitInput = document.getElementById('new-habit-input');
                const addMetricBtn = document.getElementById('add-metric-btn');
                const metricInput = document.getElementById('new-metric-input');
                const metricUnitInput = document.getElementById('new-metric-unit');
                const monthSelect = document.getElementById('month-select');
                const yearSelect = document.getElementById('year-select');
                const exportBtn = document.getElementById('export-btn');
                const importBtn = document.getElementById('import-btn');
                const clearBtn = document.getElementById('clear-btn');
                const fileInput = document.getElementById('file-input');
                const toggleHabitChartBtn = document.getElementById('toggle-habit-chart-btn');
                const resetHabitChartBtn = document.getElementById('reset-habit-chart-btn');
                const toggleDataChartBtn = document.getElementById('toggle-data-chart-btn');
                const resetDataChartBtn = document.getElementById('reset-data-chart-btn');
                const darkModeToggle = document.getElementById('dark-mode-toggle');

                // Dark mode toggle
                darkModeToggle.onclick = () => this.toggleTheme();

                addHabitBtn.onclick = () => {
                    this.addHabitToMonth(habitInput.value);
                    habitInput.value = '';
                };

                habitInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.addHabitToMonth(habitInput.value);
                        habitInput.value = '';
                    }
                };

                addMetricBtn.onclick = () => {
                    this.addMetricToMonth(metricInput.value, metricUnitInput.value);
                    metricInput.value = '';
                    metricUnitInput.value = '';
                };

                metricInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.addMetricToMonth(metricInput.value, metricUnitInput.value);
                        metricInput.value = '';
                        metricUnitInput.value = '';
                    }
                };

                metricUnitInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.addMetricToMonth(metricInput.value, metricUnitInput.value);
                        metricInput.value = '';
                        metricUnitInput.value = '';
                    }
                };

                monthSelect.onchange = () => {
                    this.updateMonthYear();
                    this.renderTable();
                    this.updateStats();
                    if (this.habitChartVisible) {
                        this.renderHabitSelector();
                        this.renderHabitChart();
                    }
                    if (this.dataChartVisible) {
                        this.renderMetricSelector();
                        this.renderDataChart();
                    }
                };

                yearSelect.onchange = () => {
                    this.updateMonthYear();
                    this.renderTable();
                    this.updateStats();
                    if (this.habitChartVisible) {
                        this.renderHabitSelector();
                        this.renderHabitChart();
                    }
                    if (this.dataChartVisible) {
                        this.renderMetricSelector();
                        this.renderDataChart();
                    }
                };

                exportBtn.onclick = () => this.exportData();
                importBtn.onclick = () => fileInput.click();
                clearBtn.onclick = () => this.clearAllData();

                toggleHabitChartBtn.onclick = () => {
                    if (this.habitChartVisible) {
                        this.hideHabitChart();
                    } else {
                        this.showHabitChart();
                    }
                };

                resetHabitChartBtn.onclick = () => {
                    this.selectedHabits.clear();
                    this.habitChartType = 'line';
                    document.querySelector('[data-chart="habit"].active').classList.remove('active');
                    document.querySelector('[data-type="line"][data-chart="habit"]').classList.add('active');
                    this.renderHabitSelector();
                    this.renderHabitChart();
                    this.saveToStorage();
                };

                toggleDataChartBtn.onclick = () => {
                    if (this.dataChartVisible) {
                        this.hideDataChart();
                    } else {
                        this.showDataChart();
                    }
                };

                resetDataChartBtn.onclick = () => {
                    this.selectedMetrics.clear();
                    this.dataChartType = 'line';
                    document.querySelector('[data-chart="data"].active').classList.remove('active');
                    document.querySelector('[data-type="line"][data-chart="data"]').classList.add('active');
                    this.renderMetricSelector();
                    this.renderDataChart();
                    this.saveToStorage();
                };

                fileInput.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        this.importData(e.target.files[0]);
                        e.target.value = '';
                    }
                };

                // Chart type selectors
                document.querySelectorAll('.chart-type-btn').forEach(btn => {
                    btn.onclick = () => {
                        const chartType = btn.dataset.chart;
                        const typeValue = btn.dataset.type;

                        // Remove active class from siblings
                        document.querySelectorAll(`[data-chart="${chartType}"].active`).forEach(activeBtn => {
                            activeBtn.classList.remove('active');
                        });
                        btn.classList.add('active');

                        if (chartType === 'habit') {
                            this.habitChartType = typeValue;
                            this.renderHabitChart();
                        } else {
                            this.dataChartType = typeValue;
                            this.renderDataChart();
                        }
                        this.saveToStorage();
                    };
                });

                // Set current month and year
                monthSelect.value = this.currentMonth;
                yearSelect.value = this.currentYear;

                // Save scroll position when scrolling
                const gridContainer = document.querySelector('.grid-container');
                if (gridContainer) {
                    gridContainer.addEventListener('scroll', () => {
                        this.scrollPosition = {
                            x: gridContainer.scrollLeft,
                            y: gridContainer.scrollTop
                        };
                    });
                }

                // Auto-save on page unload
                window.addEventListener('beforeunload', () => {
                    this.saveToStorage();
                });

                // Auto-save periodically (every 30 seconds)
                setInterval(() => {
                    this.saveToStorage();
                }, 30000);
            }
        }

        // Initialize the habit tracker when the page loads
        let habitTracker;
        document.addEventListener('DOMContentLoaded', () => {
            habitTracker = new AdvancedHabitTracker();
        });
