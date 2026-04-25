class App {
    constructor() {
        this.tasks = [...mockTasks];
        this.volunteers = [...mockVolunteers];
        this.matcher = new MatchingEngine(this.volunteers);
        this.ai = new AIService();
        this.map = null;
        this.currentLang = 'en';
        this.translations = {
            en: { dashboard: 'Dashboard', matcher: 'Smart Matcher', ingest: 'Ingest Data', facilities: 'Facilities', analytics: 'Analytics', overview: 'Overview' },
            es: { dashboard: 'Tablero', matcher: 'Buscador Inteligente', ingest: 'Ingresar Datos', facilities: 'Instalaciones', analytics: 'Analítica', overview: 'Resumen' },
            hi: { dashboard: 'डैशबोर्ड', matcher: 'स्मार्ट मैचर', ingest: 'डेटा दर्ज करें', facilities: 'सुविधाएं', analytics: 'एनालिटिक्स', overview: 'अवलोकन' }
        };
        
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

        // Setup Theme Toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.onclick = () => {
                document.documentElement.classList.toggle('light-mode');
                const icon = themeBtn.querySelector('.material-symbols-outlined');
                icon.textContent = document.documentElement.classList.contains('light-mode') ? 'light_mode' : 'dark_mode';
            };
        }

        // Setup Notifications
        const notifBtn = document.getElementById('btn-notifications');
        const notifList = document.getElementById('notification-list');
        if (notifBtn && notifList) {
            notifBtn.onclick = () => notifList.classList.toggle('hidden');
            window.addEventListener('click', (e) => {
                if (!notifBtn.contains(e.target) && !notifList.contains(e.target)) {
                    notifList.classList.add('hidden');
                }
            });
        }

        // Setup Global Search
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.oninput = (e) => this.handleGlobalSearch(e.target.value);
        }

        // Setup Language Switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = (e) => {
                const lang = e.target.dataset.lang;
                this.updateLanguage(lang);
            };
        });

        // Load initial view
        this.switchView('dashboard');
    }

    updateLanguage(lang) {
        this.currentLang = lang;
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        
        // Update Sidebar Navigation Text
        const navs = document.querySelectorAll('.nav-item');
        navs[0].childNodes[2].nodeValue = ' ' + this.translations[lang].dashboard;
        navs[1].childNodes[2].nodeValue = ' ' + this.translations[lang].matcher;
        navs[2].childNodes[2].nodeValue = ' ' + this.translations[lang].ingest;
        navs[3].childNodes[2].nodeValue = ' ' + this.translations[lang].facilities;
        navs[4].childNodes[2].nodeValue = ' ' + this.translations[lang].analytics;

        // Re-render current view to update content
        const view = this.currentView;
        this.currentView = ''; // Reset to force re-render
        this.switchView(view);
    }

    // --- Map Integration ---
    initMap() {
        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer || this.map) return;

        // Initialize map centered on a simulated city area
        this.map = L.map('interactive-map').setView([40.7128, -74.0060], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(this.map);

        // Add markers for Facilities
        mockFacilities.forEach(facility => {
            // Simulated coords based on area
            const coords = facility.area === 'Downtown' ? [40.7128, -74.0060] : 
                          facility.area === 'Sector 4' ? [40.7200, -73.9900] : 
                          [40.7050, -74.0150];
            
            const marker = L.marker(coords).addTo(this.map);
            marker.bindPopup(`<b>${facility.name}</b><br>Occupancy: ${facility.occupancy}%`);
        });

        // Add circle hotspots for urgent tasks
        this.tasks.filter(t => t.urgency === 'critical').forEach((task, i) => {
            const coords = [40.7150 + (i * 0.005), -74.0080 - (i * 0.005)];
            L.circle(coords, {
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.5,
                radius: 300
            }).addTo(this.map).bindPopup(`<b>Critical: ${task.title}</b>`);
        });
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

        // Initialize map after dashboard is rendered
        setTimeout(() => this.initMap(), 100);
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

        // Reset map instance when navigating away from dashboard
        if (viewId !== 'dashboard') {
            this.map = null;
        }
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
                <div style="display:flex; gap:8px;">
                    <button class="btn ${task.status === 'Resolved' ? 'btn-success' : 'btn-secondary'}" style="font-size:12px; padding:4px 12px;" onclick="app.toggleTaskStatus('${task.id}')">
                        ${task.status === 'Resolved' ? 'Resolved ✓' : 'Mark Resolved'}
                    </button>
                    <span class="tag ${task.urgency}">${task.urgency}</span>
                </div>
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
                        <div style="display:flex; align-items:center; gap:8px;">
                            <h4>${volunteer.name}</h4>
                            <span class="impact-pts" style="font-size:10px; background:rgba(79, 70, 229, 0.2); color:var(--accent-primary); padding:2px 6px; border-radius:10px; font-weight:700;">${volunteer.points} pts</span>
                        </div>
                        <div class="vol-meta">
                            <span><span class="material-symbols-outlined" style="font-size:16px;">location_on</span> ${volunteer.location}</span>
                            <span style="color: ${volunteer.availability === 'High' ? 'var(--success)' : 'inherit'}">
                                ${volunteer.availability} Availability
                            </span>
                        </div>
                        <div style="margin-top: 4px; display:flex; gap:4px; flex-wrap:wrap;">
                            ${volunteer.badges.map(b => `<span style="font-size:10px; color:var(--warning); border:1px solid var(--warning); padding:1px 4px; border-radius:4px;">${b}</span>`).join('')}
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

    // --- Professional Workflow Methods ---
    handleGlobalSearch(query) {
        if (!query) {
            if (this.currentView === 'matcher') this.renderMatcherTaskList(this.tasks);
            return;
        }
        
        const q = query.toLowerCase();
        const filteredTasks = this.tasks.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.category.toLowerCase().includes(q) || 
            t.location.toLowerCase().includes(q)
        );

        if (this.currentView === 'matcher') {
            this.renderMatcherTaskList(filteredTasks);
        }
    }

    exportToCSV() {
        const headers = ['Title', 'Category', 'Urgency', 'Location', 'Status'];
        const rows = this.tasks.map(t => [t.title, t.category, t.urgency, t.location, t.status || 'Pending']);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "impact_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = task.status === 'Resolved' ? 'Pending' : 'Resolved';
        this.renderDashboard();
        if (this.currentView === 'matcher') this.selectTaskForMatching(taskId);
    }
}

// Initialize App
window.onload = () => {
    window.app = new App();
};
