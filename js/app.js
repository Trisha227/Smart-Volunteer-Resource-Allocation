class App {
    constructor() {
        this.tasks = [...mockTasks];
        this.volunteers = [...mockVolunteers];
        this.matcher = new MatchingEngine(this.volunteers);
        this.ai = new AIService();
        
        this.currentView = '';
        this.init();
    }

    init() {
        // Setup Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Load initial view
        this.switchView('dashboard');
    }

    switchView(viewId) {
        if (this.currentView === viewId) return;
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const container = document.getElementById('view-container');
        const template = document.getElementById(`tpl-${viewId}`);
        
        if (template) {
            // Clone template content
            const content = template.content.cloneNode(true);
            
            // Clear current container and append new content
            container.innerHTML = '';
            container.appendChild(content);
            this.currentView = viewId;

            // Initialize view-specific logic
            this.initView(viewId);
        }
    }

    initView(viewId) {
        if (viewId === 'dashboard') {
            this.renderDashboard();
        } else if (viewId === 'matcher') {
            this.renderMatcher();
        } else if (viewId === 'data-entry') {
            this.initDataEntry();
        } else if (viewId === 'facilities') {
            this.renderFacilities();
        } else if (viewId === 'analytics') {
            this.renderAnalytics();
        }
    }

    // --- Dashboard View ---
    renderDashboard() {
        const urgentTasks = this.tasks.filter(t => t.urgency === 'critical' || t.urgency === 'high');
        
        document.getElementById('dash-urgent').textContent = urgentTasks.length;
        document.getElementById('dash-volunteers').textContent = this.volunteers.length;
        document.getElementById('dash-met').textContent = '24'; // Mocked stat

        const listContainer = document.getElementById('urgent-task-list');
        listContainer.innerHTML = '';

        urgentTasks.slice(0, 4).forEach(task => {
            const el = document.createElement('div');
            el.className = `task-item ${task.urgency}`;
            el.onclick = () => {
                this.switchView('matcher');
                setTimeout(() => this.selectTaskForMatching(task.id), 50);
            };

            el.innerHTML = `
                <div class="task-main">
                    <span class="task-title">${task.title}</span>
                    <div class="task-meta">
                        <span><span class="material-symbols-outlined">location_on</span> ${task.location}</span>
                        <span><span class="material-symbols-outlined">schedule</span> ${task.timestamp}</span>
                    </div>
                </div>
                <div class="tag ${task.urgency}">${task.urgency}</div>
            `;
            listContainer.appendChild(el);
        });
    }

    // --- Matcher View ---
    renderMatcher() {
        this.renderMatcherTaskList(this.tasks);

        const filterSelect = document.getElementById('filter-urgency');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'all') {
                    this.renderMatcherTaskList(this.tasks);
                } else {
                    this.renderMatcherTaskList(this.tasks.filter(t => t.urgency === val));
                }
            });
        }
    }

    renderMatcherTaskList(tasksToRender) {
        const listContainer = document.getElementById('matcher-task-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';

        tasksToRender.forEach(task => {
            const el = document.createElement('div');
            el.className = `task-item ${task.urgency}`;
            el.dataset.id = task.id;
            el.onclick = () => this.selectTaskForMatching(task.id);

            el.innerHTML = `
                <div class="task-main">
                    <span class="task-title">${task.title}</span>
                    <div class="task-meta">
                        <span>${task.category}</span>
                    </div>
                </div>
            `;
            listContainer.appendChild(el);
        });
    }

    selectTaskForMatching(taskId) {
        // Update selection UI
        document.querySelectorAll('.matcher-task-list .task-item').forEach(el => {
            if (el.dataset.id === taskId) {
                el.style.borderColor = 'var(--accent-primary)';
                el.style.background = 'rgba(255,255,255,0.05)';
            } else {
                el.style.borderColor = 'var(--border-color)';
                el.style.background = 'var(--bg-panel)';
            }
        });

        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Toggle UI states
        document.getElementById('matcher-empty').classList.add('hidden');
        document.getElementById('matcher-active').classList.remove('hidden');

        // Render Task Details
        document.getElementById('selected-task-details').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h3 style="font-size: 20px;">${task.title}</h3>
                <span class="tag ${task.urgency}">${task.urgency}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${task.description}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${task.skills.map(s => `<span class="tag medium">${s}</span>`).join('')}
                <span class="tag" style="background: rgba(255,255,255,0.1);"><span class="material-symbols-outlined" style="font-size:14px; margin-right:4px; vertical-align:middle;">location_on</span>${task.location}</span>
            </div>
        `;

        // Calculate and render matches
        const matches = this.matcher.getMatchesForTask(task, 4);
        const matchContainer = document.getElementById('volunteer-match-list');
        matchContainer.innerHTML = '';

        if (matches.length === 0) {
            matchContainer.innerHTML = `<p style="color: var(--text-secondary)">No suitable volunteers found for this task.</p>`;
            return;
        }

        matches.forEach(({volunteer, score, reasons}, index) => {
            // Stagger animation delay
            const delay = index * 0.1;
            
            const el = document.createElement('div');
            el.className = 'volunteer-card';
            el.style.animation = `fadeIn 0.3s ease ${delay}s both`;
            
            let colorScore = score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--text-secondary)';

            el.innerHTML = `
                <div class="vol-info">
                    <img src="${volunteer.avatar}" class="vol-avatar" alt="${volunteer.name}">
                    <div class="vol-details">
                        <h4>${volunteer.name}</h4>
                        <div class="vol-meta">
                            <span><span class="material-symbols-outlined" style="font-size:16px;">location_on</span> ${volunteer.location}</span>
                            <span style="color: ${volunteer.availability === 'High' ? 'var(--success)' : 'inherit'}">
                                ${volunteer.availability} Availability
                            </span>
                        </div>
                        <div style="margin-top: 6px; font-size: 12px; color: var(--text-secondary)">
                            ${reasons.join(' • ')}
                        </div>
                    </div>
                </div>
                <div class="match-score">
                    <div class="score-circle" style="color: ${colorScore}; border-color: ${colorScore}; background: ${colorScore}22;">
                        ${score}%
                    </div>
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">Assign</button>
                </div>
            `;
            matchContainer.appendChild(el);
        });
    }

    // --- Data Entry View ---
    initDataEntry() {
        const form = document.getElementById('ingest-form');
        const aiBtn = document.getElementById('btn-ai-analyze');
        const keySection = document.getElementById('ai-key-section');
        const loader = document.getElementById('ai-loader');

        if (aiBtn) {
            aiBtn.onclick = async () => {
                const rawText = document.getElementById('ai-raw-text').value;
                const apiKey = document.getElementById('gemini-api-key').value;

                if (!apiKey) {
                    keySection.style.display = 'block';
                    alert('Please provide your Google AI API Key to use this feature.');
                    return;
                }

                if (!rawText) {
                    alert('Please enter some text to analyze.');
                    return;
                }

                this.ai.setApiKey(apiKey);
                loader.classList.remove('hidden');
                aiBtn.disabled = true;

                try {
                    const result = await this.ai.analyzeSurvey(rawText);
                    if (result) {
                        // Populate form fields
                        form.querySelector('input[placeholder*="e.g. Emergency"]').value = result.title || '';
                        form.querySelector('select').value = result.category ? result.category.toLowerCase().split(' ')[0] : '';
                        form.querySelectorAll('select')[1].value = result.urgency || 'low';
                        form.querySelector('input[placeholder*="Skills"]').value = result.skills ? result.skills.join(', ') : '';
                        form.querySelector('input[placeholder*="Location"]').value = result.location || '';
                        form.querySelector('textarea').value = result.description || '';
                        
                        alert('AI Analysis successful! The form has been populated.');
                    }
                } catch (err) {
                    alert('AI Analysis failed: ' + err.message);
                } finally {
                    loader.classList.add('hidden');
                    aiBtn.disabled = false;
                }
            };
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Animate submission success
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                
                btn.style.background = 'var(--success)';
                btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:4px;">check_circle</span> Ingested Successfully';
                
                setTimeout(() => {
                    form.reset();
                    btn.style.background = '';
                    btn.textContent = originalText;
                }, 2000);
            });
        }
    }

    // --- Facilities View ---
    renderFacilities() {
        const grid = document.getElementById('facilities-grid');
        if (!grid) return;

        grid.innerHTML = '';
        mockFacilities.forEach(fac => {
            const el = document.createElement('div');
            el.className = 'glass-panel facility-card';
            
            const occupancyPct = Math.round((fac.occupancy / fac.capacity) * 100);
            const statusClass = fac.status.toLowerCase();
            const fillClass = occupancyPct > 80 ? 'high' : occupancyPct > 50 ? 'medium' : '';

            el.innerHTML = `
                <div class="fac-header">
                    <div>
                        <span class="fac-type">${fac.type}</span>
                        <h3 style="margin-top: 4px;">${fac.name}</h3>
                    </div>
                    <span class="fac-status-badge ${statusClass}">${fac.status}</span>
                </div>
                
                <div class="fac-occupancy">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                        <span>Occupancy</span>
                        <span>${fac.occupancy} / ${fac.capacity} (${occupancyPct}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${fillClass}" style="width: ${occupancyPct}%"></div>
                    </div>
                </div>

                <div class="fac-needs">
                    ${fac.needs.map(n => `<span class="tag medium">${n}</span>`).join('')}
                </div>

                <div class="fac-footer">
                    <span><span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; margin-right:4px;">location_on</span>${fac.location}</span>
                    <span>Checked ${fac.lastChecked}</span>
                </div>
            `;
            grid.appendChild(el);
        });
    }

    // --- Analytics View ---
    renderAnalytics() {
        const categoryContainer = document.getElementById('category-chart-container');
        const weeklyContainer = document.getElementById('weekly-chart-container');
        const areaContainer = document.getElementById('area-stats-list');
        
        if (!categoryContainer || !weeklyContainer || !areaContainer) return;

        // Render Bar Chart (Categories)
        categoryContainer.innerHTML = '';
        const maxCount = Math.max(...mockTrends.needsByCategory.map(c => c.count));
        mockTrends.needsByCategory.forEach(item => {
            const heightPct = (item.count / maxCount) * 100;
            const el = document.createElement('div');
            el.className = 'bar-wrapper';
            el.innerHTML = `
                <div class="bar" style="height: 0%;" data-height="${heightPct}%">
                    <span class="bar-value">${item.count}</span>
                </div>
                <span class="bar-label">${item.category}</span>
                <span class="area-trend ${item.trend.startsWith('+') ? 'up' : 'down'}" style="font-size: 10px;">${item.trend}</span>
            `;
            categoryContainer.appendChild(el);
            // Trigger animation
            setTimeout(() => el.querySelector('.bar').style.height = `${heightPct}%`, 100);
        });

        // Render Weekly Resolution (Line simulation)
        weeklyContainer.innerHTML = '';
        mockTrends.weeklyResolution.forEach((val, i) => {
            const el = document.createElement('div');
            el.className = 'dot-wrapper';
            el.innerHTML = `
                <div class="line-point"></div>
                <div class="line-bar" style="height: 0%;" data-height="${val}%"></div>
                <span class="bar-label">Day ${i+1}</span>
            `;
            weeklyContainer.appendChild(el);
            setTimeout(() => el.querySelector('.line-bar').style.height = `${val}%`, 100 + (i * 100));
        });

        // Render Area Stats
        areaContainer.innerHTML = '';
        mockTrends.topAreas.forEach(area => {
            const el = document.createElement('div');
            el.className = 'area-stat-card';
            const statusClass = area.status === 'Critical' ? 'down' : area.status === 'Improving' ? 'up' : 'warning';
            el.innerHTML = `
                <h4>${area.area}</h4>
                <p class="area-trend ${statusClass}">${area.status}</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Resource utilization: ${Math.floor(Math.random() * 40) + 60}%</p>
            `;
            areaContainer.appendChild(el);
        });
    }
}

// Initialize App
window.onload = () => {
    window.app = new App();
};
