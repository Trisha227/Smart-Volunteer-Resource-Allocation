class App {
    constructor() {
        this.tasks = [...mockTasks];
        this.volunteers = [...mockVolunteers];
        this.matcher = new MatchingEngine(this.volunteers);
        this.ai = new AIService();
        this.vision = new VisionService();
        this.db = new DBService();
        this.map = null;
        
        // Load Firebase Config if saved
        const savedConfig = localStorage.getItem('firebase_config');
        if (savedConfig) {
            this.db.initialize(JSON.parse(savedConfig));
        }

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

        // Add markers for Facilities (using facility.location correctly)
        const facilityCoords = {
            'Downtown': [40.7128, -74.0060],
            'Sector 4': [40.7200, -73.9900],
            'West End': [40.7050, -74.0150]
        };
        mockFacilities.forEach(facility => {
            const coords = facilityCoords[facility.location] || [40.7128 + (Math.random() * 0.01), -74.0060 + (Math.random() * 0.01)];
            const marker = L.marker(coords).addTo(this.map);
            marker.bindPopup(`<b>${facility.name}</b><br>Type: ${facility.type}<br>Occupancy: ${facility.occupancy}/${facility.capacity}<br>Status: ${facility.status}`);
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
        const resolvedTasks = this.tasks.filter(t => t.status === 'Resolved');
        
        document.getElementById('dash-urgent').textContent = urgentTasks.length;
        document.getElementById('dash-volunteers').textContent = this.volunteers.length;
        document.getElementById('dash-met').textContent = resolvedTasks.length + 24; // 24 = historical baseline

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

        matches.forEach((match, index) => {
            const { volunteer, score, reasons, breakdown } = match;
            const delay = index * 0.1;
            
            const el = document.createElement('div');
            el.className = 'volunteer-card';
            el.style.animation = `fadeIn 0.3s ease ${delay}s both`;
            
            const colorScore = score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--text-secondary)';
            const scoreLabel = score > 70 ? 'Excellent Match' : score > 40 ? 'Good Match' : 'Possible Match';

            el.innerHTML = `
                <div class="vol-info">
                    <img src="${volunteer.avatar}" class="vol-avatar" alt="${volunteer.name}">
                    <div class="vol-details">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            <h4>${volunteer.name}</h4>
                            <span style="font-size:10px; background:rgba(79,70,229,0.2); color:var(--accent-primary); padding:2px 6px; border-radius:10px; font-weight:700;">${volunteer.points} pts</span>
                        </div>
                        <div class="vol-meta">
                            <span><span class="material-symbols-outlined" style="font-size:16px;">location_on</span> ${volunteer.location}</span>
                            <span style="color: ${volunteer.availability === 'High' ? 'var(--success)' : volunteer.availability === 'Medium' ? 'var(--warning)' : 'var(--text-secondary)'}">
                                ${volunteer.availability} Availability
                            </span>
                        </div>
                        <div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                            ${volunteer.badges.map(b => `<span style="font-size:10px; color:var(--warning); border:1px solid var(--warning); padding:1px 4px; border-radius:4px;">${b}</span>`).join('')}
                        </div>
                        <div style="margin-top:6px; font-size:12px; color:var(--text-secondary);">
                            ${reasons.join(' • ')}
                        </div>
                        <div style="margin-top:8px; display:flex; gap:8px; font-size:10px; opacity:0.75;">
                            <span title="Skill Match">🎯 Skills: ${breakdown.skills}%</span>
                            <span title="Proximity">📍 Proximity: ${breakdown.proximity}%</span>
                            <span title="Availability">⏰ Available: ${breakdown.availability}%</span>
                        </div>
                    </div>
                </div>
                <div class="match-score">
                    <div class="score-circle" style="color:${colorScore}; border-color:${colorScore}; background:${colorScore}22;">
                        ${score}%
                    </div>
                    <div style="font-size:10px; text-align:center; color:${colorScore}; margin-top:4px;">${scoreLabel}</div>
                    <button class="btn btn-primary" style="padding:6px 12px; font-size:12px; margin-top:8px;" onclick="app.assignVolunteer('${volunteer.id}', '${task.id}')" aria-label="Assign ${volunteer.name} to this task">Assign</button>
                </div>
            `;
            matchContainer.appendChild(el);
        });
    }

    // --- Data Entry View ---
    initDataEntry() {
        const form = document.getElementById('ingest-form');
        const aiBtn = document.getElementById('btn-ai-analyze');
        const loader = document.getElementById('ai-loader');

        // Wire up Vision AI scan button (triggered by upload)
        // Wire up Gemini Analyze button
        if (aiBtn) {
            aiBtn.onclick = async () => {
                const rawText = document.getElementById('ai-raw-text').value.trim();
                const apiKey = document.getElementById('gemini-api-key')?.value.trim();

                if (!rawText) {
                    alert('Please enter survey text or upload an image first.');
                    return;
                }

                if (apiKey) this.ai.setApiKey(apiKey);

                // Activate Step 2
                document.getElementById('step-2')?.classList.add('active');
                loader.classList.remove('hidden');
                aiBtn.disabled = true;

                try {
                    const result = await this.ai.analyzeSurvey(rawText);
                    if (result) {
                        // Auto-fill the form
                        form.querySelector('input[type="text"]').value = result.title || '';
                        const selects = form.querySelectorAll('select');
                        if (selects[0]) selects[0].value = result.category || '';
                        if (selects[1]) selects[1].value = result.urgency?.toLowerCase() || 'medium';
                        const skillsInput = document.getElementById('skills-input');
                        if (skillsInput) skillsInput.value = result.skills ? result.skills.join(', ') : '';
                        form.querySelector('input[placeholder*="Sector"]').value = result.location || '';
                        const affectedInput = document.getElementById('affected-count');
                        if (affectedInput) affectedInput.value = result.affectedCount || '';
                        form.querySelector('textarea').value = result.description || '';

                        // Show AI Reasoning
                        const reasonBox = document.getElementById('ai-reasoning-box');
                        if (reasonBox && result.reasoning) {
                            reasonBox.style.display = 'block';
                            reasonBox.innerHTML = `<strong>🧠 Gemini Reasoning:</strong> ${result.reasoning} <em style="color:var(--text-secondary); font-size:11px;">(Confidence: ${result.confidence || '?'}%)</em>`;
                        }

                        // Step 3: Calculate Need Score
                        document.getElementById('step-3')?.classList.add('active');
                        await this.displayNeedScore(result);
                    }
                } catch (err) {
                    if (err.message.includes('API Key missing')) {
                        document.getElementById('ai-key-section').style.display = 'block';
                        alert('Please set your Google AI (Gemini) API Key to use this feature.');
                    } else {
                        alert('AI Analysis failed: ' + err.message);
                    }
                } finally {
                    loader.classList.add('hidden');
                    aiBtn.disabled = false;
                }
            };
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newTask = {
                    id: 't' + Date.now(),
                    title: form.querySelector('input[type="text"]').value || 'New Task',
                    category: form.querySelectorAll('select')[0]?.value || 'General',
                    urgency: form.querySelectorAll('select')[1]?.value || 'medium',
                    skills: (document.getElementById('skills-input')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
                    location: form.querySelector('input[placeholder*="Sector"]')?.value || 'Unknown',
                    description: form.querySelector('textarea')?.value || '',
                    affectedCount: parseInt(document.getElementById('affected-count')?.value) || 0,
                    timestamp: 'Just now',
                    status: 'Pending'
                };
                this.tasks.unshift(newTask);

                const btn = form.querySelector('button[type="submit"]');
                btn.style.background = 'var(--success)';
                btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;">check_circle</span> Task Added!';
                setTimeout(() => { form.reset(); btn.style.background=''; btn.innerHTML='<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:4px; font-size:16px;">send</span>Submit to System'; }, 2500);
            });
        }
    }

    async displayNeedScore(taskData) {
        const section = document.getElementById('need-score-section');
        if (!section) return;
        section.style.display = 'block';

        const scoreEl = document.getElementById('need-score-circle');
        const breakdownEl = document.getElementById('need-score-breakdown');
        const summaryEl = document.getElementById('need-score-summary');

        scoreEl.textContent = '...';
        breakdownEl.innerHTML = '<span style="color:var(--text-secondary)">Calculating...</span>';

        const scoreData = await this.ai.calculateNeedScore(taskData);
        const score = scoreData.needScore;
        const color = score >= 75 ? 'var(--urgent)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

        scoreEl.textContent = score;
        scoreEl.style.borderColor = color;
        scoreEl.style.color = color;

        const bd = scoreData.breakdown;
        breakdownEl.innerHTML = `
            <div>⚡ Severity: <strong>${bd.severity}/25</strong></div>
            <div>👥 Scale: <strong>${bd.scale}/25</strong></div>
            <div>⏱️ Timeliness: <strong>${bd.timeliness}/25</strong></div>
            <div>📦 Resource Gap: <strong>${bd.resourceGap}/25</strong></div>
        `;
        if (summaryEl) summaryEl.textContent = scoreData.summary || '';
    }

    // Vision AI image handlers
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        await this.processImage(file);
    }

    async handleImageDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (!file) return;
        await this.processImage(file);
    }

    async processImage(file) {
        // Show preview
        const preview = document.getElementById('vision-preview');
        const previewImg = document.getElementById('vision-preview-img');
        const statusEl = document.getElementById('vision-status');
        const progressBar = document.getElementById('vision-progress-bar');
        const dropZone = document.getElementById('vision-drop-zone');

        if (!preview) return;
        preview.style.display = 'flex';
        if (dropZone) dropZone.style.display = 'none';

        // Show image preview
        const objectUrl = URL.createObjectURL(file);
        if (previewImg) previewImg.src = objectUrl;

        // Animate progress bar
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => progressBar.style.width = '70%', 100);
        }
        if (statusEl) statusEl.textContent = '🔍 Scanning with Google Vision AI...';

        // Activate Step 1 pipeline
        document.getElementById('step-1')?.classList.add('active');

        // Set Vision API key if entered
        const visionKey = document.getElementById('vision-api-key')?.value.trim();
        if (visionKey) this.vision.setApiKey(visionKey);

        try {
            const extractedText = await this.vision.extractTextFromImage(file);

            if (progressBar) progressBar.style.width = '100%';
            if (statusEl) statusEl.innerHTML = `<span style="color:var(--success)">✓ Text extracted successfully!</span>`;

            // Populate Gemini text area
            const textArea = document.getElementById('ai-raw-text');
            if (textArea) {
                textArea.value = extractedText;
                textArea.style.borderColor = 'var(--success)';
            }

            // Auto-trigger Gemini analysis
            setTimeout(() => document.getElementById('btn-ai-analyze')?.click(), 500);

        } catch (err) {
            if (statusEl) statusEl.innerHTML = `<span style="color:var(--urgent)">✗ ${err.message}</span>`;
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

    assignVolunteer(volunteerId, taskId) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!volunteer || !task) return;

        // Award points
        volunteer.points = (volunteer.points || 0) + 50;
        task.status = 'In Progress';
        task.assignedTo = volunteer.name;

        // Visual feedback
        const btn = event.target;
        btn.textContent = `✓ Assigned to ${volunteer.name}`;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        btn.disabled = true;

        this.renderDashboard();
    }
}

// Initialize App
window.onload = () => {
    window.app = new App();
};
