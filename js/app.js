// 应用状态管理
class App {
    constructor() {
        this.state = {
            user: null,
            widgets: [],
            wallpaper: localStorage.getItem('wallpaper') || 'default',
            settings: this.loadSettings(),
            bookmarks: this.loadBookmarks()
        };
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.render();
        this.setupPWA();
    }

    loadSettings() {
        return {
            theme: localStorage.getItem('theme') || 'light',
            notifications: localStorage.getItem('notifications') === 'true',
            widgetsOrder: JSON.parse(localStorage.getItem('widgetsOrder')) || [],
            searchEngine: localStorage.getItem('searchEngine') || 'baidu'
        };
    }

    loadBookmarks() {
        const defaultBookmarks = [
            { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
            { name: '抖音', url: 'https://douyin.com', icon: 'https://douyin.com/favicon.ico' },
            { name: 'B站', url: 'https://bilibili.com', icon: 'https://bilibili.com/favicon.ico' },
            { name: '知乎', url: 'https://zhihu.com', icon: 'https://zhihu.com/favicon.ico' },
            { name: '淘宝', url: 'https://taobao.com', icon: 'https://taobao.com/favicon.ico' },
            { name: '小红书', url: 'https://xiaohongshu.com', icon: 'https://xiaohongshu.com/favicon.ico' }
        ];
        return JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
    }

    async loadUserData() {
        // 模拟加载用户数据
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    setupEventListeners() {
        // 右键菜单
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    showContextMenu(x, y) {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.innerHTML = `
            <div class="context-menu-item" onclick="app.addWidget()">
                <span>➕</span> 添加组件
            </div>
            <div class="context-menu-item" onclick="app.changeWallpaper()">
                <span>🎨</span> 换壁纸
            </div>
            <div class="context-menu-item" onclick="app.openSettings()">
                <span>⚙️</span> 设置
            </div>
            <div class="context-menu-item" onclick="app.refreshWidgets()">
                <span>🔄</span> 刷新组件
            </div>
            <div class="context-menu-item" onclick="app.exportData()">
                <span>💾</span> 备份数据
            </div>
        `;
        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 10);
    }

    render() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="container">
                ${this.renderStatusBar()}
                ${this.renderSearchBar()}
                ${this.renderAIAssistants()}
                <div class="grid-system" id="widgetsGrid">
                    ${this.renderWidgets()}
                </div>
                ${this.renderBookmarks()}
            </div>
            <div class="nav-sidebar" id="navSidebar">
                ${this.renderSidebar()}
            </div>
            <div class="menu-toggle" onclick="app.toggleSidebar()">
                ☰
            </div>
            <div class="modal" id="modal">
                <div class="modal-content" id="modalContent"></div>
            </div>
        `;
        
        // 绑定事件
        this.bindEvents();
    }

    renderStatusBar() {
        const now = new Date();
        return `
            <div class="status-bar">
                <div class="time">${now.toLocaleTimeString('zh-CN', { hour12: false })}</div>
                <div class="date">${now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div class="weather" id="weather">
                    <span>🌤️</span> <span>25°C</span>
                </div>
            </div>
        `;
    }

    renderSearchBar() {
        return `
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" placeholder="搜索内容或输入网址..." id="searchInput">
                <button class="search-btn" id="searchBtn">搜索</button>
            </div>
        `;
    }

    renderAIAssistants() {
        const ais = [
            { name: '问AI', icon: '🤖', color: '#6366f1' },
            { name: '元宝', icon: '💰', color: '#f59e0b' },
            { name: '豆包', icon: '🥟', color: '#10b981' },
            { name: 'DeepSeek', icon: '🔍', color: '#ef4444' }
        ];
        return `
            <div class="ai-assistants">
                ${ais.map(ai => `
                    <div class="ai-card" style="background: ${ai.color}" onclick="app.openAI('${ai.name}')">
                        <div style="font-size: 2rem;">${ai.icon}</div>
                        <div>${ai.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderWidgets() {
        const widgets = [
            { type: 'weather', title: '天气', icon: '🌤️', content: '深圳 25°C 中雨' },
            { type: 'calendar', title: '日历', icon: '📅', content: '2026年6月16日' },
            { type: 'countdown', title: '下班倒计时', icon: '⏰', content: '3天' },
            { type: 'woodfish', title: '电子木鱼', icon: '🐟', content: '已敲9次' },
            { type: 'earnings', title: '今天赚了', icon: '💰', content: '¥0.00' },
            { type: 'todo', title: '备忘录', icon: '📝', content: '点击新建备忘录' },
            { type: 'hotsearch', title: '大家都在看', icon: '🔥', content: '加载中...' },
            { type: 'poetry', title: '今日诗词', icon: '📜', content: '燕台一望客心惊...' }
        ];
        return widgets.map(widget => `
            <div class="card" data-type="${widget.type}" onclick="app.handleWidgetClick('${widget.type}')">
                <div style="font-size: 2rem; margin-bottom: 10px;">${widget.icon}</div>
                <h3>${widget.title}</h3>
                <p style="color: var(--gray); margin-top: 8px;">${widget.content}</p>
            </div>
        `).join('');
    }

    renderBookmarks() {
        return `
            <div style="margin-top: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>📑 常用链接</h2>
                    <button onclick="app.editBookmarks()" style="background: none; border: none; color: var(--primary); cursor: pointer;">编辑</button>
                </div>
                <div class="grid-system" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));">
                    ${this.state.bookmarks.map(bookmark => `
                        <div class="card" style="text-align: center; padding: 15px;" onclick="window.open('${bookmark.url}', '_blank')">
                            <img src="${bookmark.icon}" style="width: 40px; height: 40px; border-radius: 50%;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%236366f1%22/%3E%3Ctext x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22%3E${bookmark.name[0]}%3C/text%3E%3C/svg%3E'">
                            <div style="margin-top: 8px;">${bookmark.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSidebar() {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>⚙️ 导航</h2>
                <button onclick="app.toggleSidebar()" style="background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
            </div>
            <div class="nav-items">
                <div class="nav-item" onclick="app.addWidget()">➕ 添加组件</div>
                <div class="nav-item" onclick="app.changeWallpaper()">🎨 换壁纸</div>
                <div class="nav-item" onclick="app.openSettings()">⚙️ 设置</div>
                <div class="nav-item" onclick="app.exportData()">💾 备份数据</div>
                <div class="nav-item" onclick="app.resetToDefault()">🔄 恢复默认</div>
                <div class="nav-item" onclick="app.about()">ℹ️ 关于</div>
            </div>
        `;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('navSidebar');
        sidebar.classList.toggle('open');
    }

    addWidget() {
        this.openModal(`
            <h2>➕ 添加组件</h2>
            <div style="display: grid; gap: 10px; margin-top: 20px;">
                <button onclick="app.addWeatherWidget()" class="modal-btn">🌤️ 天气组件</button>
                <button onclick="app.addTodoWidget()" class="modal-btn">✅ 待办组件</button>
                <button onclick="app.addCalendarWidget()" class="modal-btn">📅 日历组件</button>
                <button onclick="app.addCountdownWidget()" class="modal-btn">⏰ 倒计时组件</button>
            </div>
            <button onclick="app.closeModal()" style="margin-top: 20px; padding: 10px; width: 100%;">关闭</button>
        `);
    }

    changeWallpaper() {
        const wallpapers = [
            { name: '梦幻紫', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { name: '海洋蓝', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
            { name: '樱花粉', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
            { name: '森林绿', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' }
        ];
        this.openModal(`
            <h2>🎨 选择壁纸</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                ${wallpapers.map(wall => `
                    <div style="background: ${wall.gradient}; padding: 20px; border-radius: 12px; text-align: center; color: white; cursor: pointer;" onclick="app.setWallpaper('${wall.gradient}')">
                        ${wall.name}
                    </div>
                `).join('')}
            </div>
        `);
    }

    setWallpaper(gradient) {
        document.body.style.background = gradient;
        localStorage.setItem('wallpaper', gradient);
        this.closeModal();
    }

    openSettings() {
        this.openModal(`
            <h2>⚙️ 设置</h2>
            <div style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span>🌙 深色模式</span>
                    <input type="checkbox" id="darkMode" ${localStorage.getItem('theme') === 'dark' ? 'checked' : ''} onchange="app.toggleDarkMode(this.checked)">
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span>🔔 桌面通知</span>
                    <input type="checkbox" id="notifications" ${localStorage.getItem('notifications') === 'true' ? 'checked' : ''} onchange="app.toggleNotifications(this.checked)">
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span>🔍 默认搜索引擎</span>
                    <select id="searchEngine" onchange="app.setSearchEngine(this.value)">
                        <option value="baidu">百度</option>
                        <option value="google">Google</option>
                        <option value="bing">Bing</option>
                    </select>
                </div>
            </div>
            <button onclick="app.saveSettings()" style="margin-top: 20px; padding: 10px; width: 100%; background: var(--primary); color: white; border: none; border-radius: 12px;">保存</button>
        `);
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.style.background = '#1a1a2e';
            localStorage.setItem('theme', 'dark');
        } else {
            this.setWallpaper(localStorage.getItem('wallpaper') || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            localStorage.setItem('theme', 'light');
        }
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js').then(reg => {
                console.log('Service Worker registered:', reg);
            });
        }
    }

    exportData() {
        const data = {
            bookmarks: this.state.bookmarks,
            settings: this.state.settings,
            exportTime: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tab_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    resetToDefault() {
        if (confirm('确定恢复所有默认设置吗？')) {
            localStorage.clear();
            location.reload();
        }
    }

    openModal(content) {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = content;
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    closeAllModals() {
        this.closeModal();
        const menu = document.querySelector('.context-menu');
        if (menu) menu.remove();
    }

    focusSearch() {
        document.getElementById('searchInput')?.focus();
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }
    }

    performSearch() {
        const query = document.getElementById('searchInput').value;
        if (!query) return;
        
        const engine = this.state.settings.searchEngine;
        const urls = {
            baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        window.open(urls[engine], '_blank');
    }

    handleWidgetClick(type) {
        switch(type) {
            case 'woodfish':
                this.knockWoodfish();
                break;
            case 'earnings':
                this.updateEarnings();
                break;
            default:
                console.log('Widget clicked:', type);
        }
    }

    knockWoodfish() {
        let count = parseInt(localStorage.getItem('woodfishCount')) || 9;
        count++;
        localStorage.setItem('woodfishCount', count);
        const woodfishCard = document.querySelector('[data-type="woodfish"] p');
        if (woodfishCard) woodfishCard.textContent = `已敲${count}次`;
        this.playSound('knock');
    }

    updateEarnings() {
        const earnings = (Math.random() * 100).toFixed(2);
        const earningsCard = document.querySelector('[data-type="earnings"] p');
        if (earningsCard) earningsCard.textContent = `¥${earnings}`;
    }

    playSound(type) {
        // 可选：添加音效
        console.log('Playing sound:', type);
    }

    openAI(name) {
        alert(`正在启动 ${name} AI 助手...`);
        // 这里可以接入真实的AI API
    }

    editBookmarks() {
        // 编辑书签功能
        alert('书签编辑功能开发中...');
    }
}

// 启动应用
window.app = new App();

// 移除加载屏幕
setTimeout(() => {
    const loading = document.querySelector('.loading-screen');
    if (loading) loading.style.opacity = '0';
    setTimeout(() => loading?.remove(), 500);
}, 500);
