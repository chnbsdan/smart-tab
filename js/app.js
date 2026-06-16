// 应用核心类
class App {
    constructor() {
        this.state = {
            settings: storage.get('settings'),
            bookmarks: storage.get('bookmarks'),
            isSidebarOpen: false
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.render();
        this.setupPWA();
        this.loadUserSettings();
        
        // 移除加载屏幕
        setTimeout(() => {
            const loading = document.querySelector('.loading-screen');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.remove(), 500);
            }
        }, 500);
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

        // 存储变化监听
        window.addEventListener('storageChange', (e) => {
            if (e.detail.key === 'settings') {
                this.state.settings = e.detail.value;
                this.loadUserSettings();
            }
            if (e.detail.key === 'bookmarks') {
                this.state.bookmarks = e.detail.value;
                this.renderBookmarks();
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
            <div class="context-menu-item" onclick="app.exportData()">
                <span>💾</span> 备份数据
            </div>
            <div class="context-menu-item" onclick="app.refreshPage()">
                <span>🔄</span> 刷新页面
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
                <div class="grid-system" id="widgetsGrid"></div>
                ${this.renderBookmarks()}
            </div>
            <div class="nav-sidebar" id="navSidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>⚙️ 导航菜单</h2>
                    <button onclick="app.toggleSidebar()" style="background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
                </div>
                <div class="nav-items">
                    <div class="nav-item" onclick="app.addWidget()">➕ 添加组件</div>
                    <div class="nav-item" onclick="app.changeWallpaper()">🎨 换壁纸</div>
                    <div class="nav-item" onclick="app.openSettings()">⚙️ 设置</div>
                    <div class="nav-item" onclick="app.exportData()">💾 备份数据</div>
                    <div class="nav-item" onclick="app.importData()">📂 导入数据</div>
                    <div class="nav-item" onclick="app.resetToDefault()">🔄 恢复默认</div>
                    <div class="nav-item" onclick="app.about()">ℹ️ 关于</div>
                </div>
            </div>
            <div class="menu-toggle" onclick="app.toggleSidebar()">
                ☰
            </div>
            <div class="modal" id="modal">
                <div class="modal-content" id="modalContent"></div>
            </div>
        `;
        
        // 渲染组件
        if (window.componentManager) {
            window.componentManager.render();
        }
    }

    renderStatusBar() {
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour12: false });
        const date = Utils.formatDate(now, 'YYYY年MM月DD日 WW');
        return `
            <div class="status-bar" id="statusBar">
                <div class="time">${time}</div>
                <div class="date">${date}</div>
                <div class="weather" id="weather">
                    <span>🌤️</span> <span id="weatherTemp">加载中...</span>
                </div>
            </div>
        `;
    }

    renderSearchBar() {
        const searchEngine = this.state.settings?.searchEngine || 'baidu';
        const placeholders = {
            baidu: '百度搜索',
            google: 'Google Search',
            bing: 'Bing Search'
        };
        return `
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" placeholder="${placeholders[searchEngine]}" id="searchInput">
                <button class="search-btn" id="searchBtn">搜索</button>
            </div>
        `;
    }

    renderAIAssistants() {
        const ais = [
            { name: '问AI', icon: '🤖', url: '#' },
            { name: '元宝', icon: '💰', url: '#' },
            { name: '豆包', icon: '🥟', url: '#' },
            { name: 'DeepSeek', icon: '🔍', url: 'https://chat.deepseek.com' }
        ];
        return `
            <div class="ai-assistants">
                ${ais.map(ai => `
                    <div class="ai-card" onclick="app.openAI('${ai.name}')">
                        <div style="font-size: 2rem;">${ai.icon}</div>
                        <div>${ai.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBookmarks() {
        const bookmarks = this.state.bookmarks || [];
        return `
            <div class="bookmarks-section">
                <div class="bookmarks-header">
                    <h2>📑 常用链接</h2>
                    <button onclick="app.editBookmarks()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer;">编辑</button>
                </div>
                <div class="bookmarks-grid">
                    ${bookmarks.map(bookmark => `
                        <div class="bookmark-card" onclick="window.open('${bookmark.url}', '_blank')">
                            <div class="bookmark-icon">${bookmark.icon || '🔗'}</div>
                            <div class="bookmark-name">${bookmark.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('navSidebar');
        sidebar.classList.toggle('open');
    }

    addWidget() {
        const components = [
            { name: 'weather', label: '天气组件', icon: '🌤️' },
            { name: 'todo', label: '待办组件', icon: '✅' },
            { name: 'calendar', label: '日历组件', icon: '📅' },
            { name: 'countdown', label: '倒计时组件', icon: '⏰' },
            { name: 'poetry', label: '诗词组件', icon: '📜' },
            { name: 'english', label: '英语组件', icon: '📖' },
            { name: 'hotsearch', label: '热搜组件', icon: '🔥' },
            { name: 'woodfish', label: '电子木鱼', icon: '🐟' }
        ];
        
        this.openModal(`
            <h2>➕ 添加组件</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">
                ${components.map(comp => `
                    <button onclick="app.addComponentByName('${comp.name}'); app.closeModal();" style="padding: 12px; border: none; border-radius: 12px; background: #f3f4f6; cursor: pointer; font-size: 16px;">
                        ${comp.icon} ${comp.label}
                    </button>
                `).join('')}
            </div>
            <button onclick="app.closeModal()" style="margin-top: 20px; padding: 10px; width: 100%; border: none; border-radius: 12px; background: #e5e7eb; cursor: pointer;">取消</button>
        `);
    }

    addComponentByName(name) {
        if (window.componentManager) {
            window.componentManager.addComponent(name);
        }
    }

    changeWallpaper() {
        const wallpapers = [
            { name: '梦幻紫', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { name: '海洋蓝', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
            { name: '樱花粉', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
            { name: '森林绿', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
            { name: '落日橙', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
            { name: '星空', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }
        ];
        
        this.openModal(`
            <h2>🎨 选择壁纸</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">
                ${wallpapers.map(wall => `
                    <div style="background: ${wall.gradient}; padding: 20px; border-radius: 12px; text-align: center; color: white; cursor: pointer; transition: transform 0.2s;" onclick="app.setWallpaper('${wall.gradient}')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        ${wall.name}
                    </div>
                `).join('')}
            </div>
            <button onclick="app.closeModal()" style="margin-top: 20px; padding: 10px; width: 100%; border: none; border-radius: 12px; background: #e5e7eb; cursor: pointer;">关闭</button>
        `);
    }

    setWallpaper(gradient) {
        document.body.style.background = gradient;
        storage.set('wallpaper', gradient);
        this.closeModal();
    }

    openSettings() {
        const settings = this.state.settings;
        this.openModal(`
            <h2>⚙️ 设置</h2>
            <div style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>🌙 深色模式</span>
                    <input type="checkbox" id="darkMode" ${settings?.theme === 'dark' ? 'checked' : ''} onchange="app.toggleDarkMode(this.checked)">
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>🔔 桌面通知</span>
                    <input type="checkbox" id="notifications" ${settings?.notifications ? 'checked' : ''} onchange="app.toggleNotifications(this.checked)">
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>📊 显示状态栏</span>
                    <input type="checkbox" id="showStatusBar" ${settings?.showStatusBar !== false ? 'checked' : ''} onchange="app.toggleStatusBar(this.checked)">
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span>🔍 默认搜索引擎</span>
                    <select id="searchEngine" onchange="app.setSearchEngine(this.value)">
                        <option value="baidu" ${settings?.searchEngine === 'baidu' ? 'selected' : ''}>百度</option>
                        <option value="google" ${settings?.searchEngine === 'google' ? 'selected' : ''}>Google</option>
                        <option value="bing" ${settings?.searchEngine === 'bing' ? 'selected' : ''}>Bing</option>
                    </select>
                </div>
            </div>
            <button onclick="app.saveSettings()" style="margin-top: 20px; padding: 12px; width: 100%; background: var(--primary); color: white; border: none; border-radius: 12px; cursor: pointer;">保存设置</button>
            <button onclick="app.closeModal()" style="margin-top: 10px; padding: 10px; width: 100%; border: none; border-radius: 12px; background: #e5e7eb; cursor: pointer;">取消</button>
        `);
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.style.background = '#1a1a2e';
            storage.set('theme', 'dark');
        } else {
            const wallpaper = storage.get('wallpaper') || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            document.body.style.background = wallpaper;
            storage.set('theme', 'light');
        }
    }

    toggleNotifications(enabled) {
        if (enabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        const settings = storage.get('settings');
        settings.notifications = enabled;
        storage.set('settings', settings);
    }

    toggleStatusBar(enabled) {
        const statusBar = document.getElementById('statusBar');
        if (statusBar) {
            statusBar.style.display = enabled ? 'flex' : 'none';
        }
        const settings = storage.get('settings');
        settings.showStatusBar = enabled;
        storage.set('settings', settings);
    }

    setSearchEngine(engine) {
        const settings = storage.get('settings');
        settings.searchEngine = engine;
        storage.set('settings', settings);
    }

    saveSettings() {
        const darkMode = document.getElementById('darkMode')?.checked;
        const notifications = document.getElementById('notifications')?.checked;
        const showStatusBar = document.getElementById('showStatusBar')?.checked;
        const searchEngine = document.getElementById('searchEngine')?.value;
        
        const settings = {
            theme: darkMode ? 'dark' : 'light',
            notifications: notifications,
            showStatusBar: showStatusBar,
            searchEngine: searchEngine,
            autoBackup: true
        };
        
        storage.set('settings', settings);
        this.state.settings = settings;
        
        if (darkMode) this.toggleDarkMode(true);
        else this.toggleDarkMode(false);
        this.toggleStatusBar(showStatusBar);
        
        this.closeModal();
        Utils.showNotification('设置已保存', '你的偏好设置已更新');
    }

    exportData() {
        const data = storage.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart_tab_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showNotification('备份成功', '数据已导出到本地');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const success = storage.import(event.target.result);
                if (success) {
                    Utils.showNotification('导入成功', '数据已恢复，页面将刷新');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    Utils.showNotification('导入失败', '文件格式错误');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetToDefault() {
        if (confirm('确定恢复所有默认设置吗？当前数据将丢失！')) {
            storage.clear();
            Utils.showNotification('已恢复默认', '页面将刷新');
            setTimeout(() => location.reload(), 1500);
        }
    }

    openAI(name) {
        Utils.showNotification('AI助手', `${name}正在开发中...`);
    }

    editBookmarks() {
        this.openModal(`
            <h2>📑 编辑书签</h2>
            <div id="bookmarksEditor">
                ${this.state.bookmarks.map((bookmark, idx) => `
                    <div style="margin-bottom: 12px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                        <input type="text" placeholder="名称" value="${bookmark.name}" data-field="name" data-idx="${idx}" style="width: 100%; margin-bottom: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                        <input type="text" placeholder="URL" value="${bookmark.url}" data-field="url" data-idx="${idx}" style="width: 100%; margin-bottom: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                        <input type="text" placeholder="图标" value="${bookmark.icon}" data-field="icon" data-idx="${idx}" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                        <button onclick="app.deleteBookmark(${idx})" style="margin-top: 8px; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">删除</button>
                    </div>
                `).join('')}
                <button onclick="app.addBookmark()" style="width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 12px;">➕ 添加书签</button>
                <button onclick="app.saveBookmarks()" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 8px;">💾 保存所有</button>
                <button onclick="app.closeModal()" style="width: 100%; padding: 10px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; margin-top: 8px;">取消</button>
            </div>
        `);
    }

    addBookmark() {
        const bookmarks = [...this.state.bookmarks];
        bookmarks.push({ name: '新书签', url: 'https://', icon: '🔗' });
        this.state.bookmarks = bookmarks;
        this.editBookmarks();
    }

    deleteBookmark(idx) {
        const bookmarks = [...this.state.bookmarks];
        bookmarks.splice(idx, 1);
        this.state.bookmarks = bookmarks;
        this.editBookmarks();
    }

    saveBookmarks() {
        const inputs = document.querySelectorAll('#bookmarksEditor input');
        const bookmarks = [];
        const tempMap = new Map();
        
        inputs.forEach(input => {
            const idx = parseInt(input.dataset.idx);
            const field = input.dataset.field;
            if (!tempMap.has(idx)) tempMap.set(idx, {});
            tempMap.get(idx)[field] = input.value;
        });
        
        for (let [_, bookmark] of tempMap) {
            if (bookmark.name && bookmark.url) {
                bookmarks.push(bookmark);
            }
        }
        
        storage.set('bookmarks', bookmarks);
        this.state.bookmarks = bookmarks;
        this.renderBookmarks();
        this.closeModal();
        Utils.showNotification('书签已保存', `共${bookmarks.length}个书签`);
    }

    about() {
        this.openModal(`
            <h2>ℹ️ 关于</h2>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem;">✨</div>
                <h3>灵动标签页 v1.0.0</h3>
                <p style="margin: 16px 0; color: #6b7280;">一个现代化、可定制、支持PWA的智能浏览器新标签页</p>
                <p style="font-size: 12px; color: #9ca3af;">© 2024 Smart Tab. MIT Licensed.</p>
            </div>
            <button onclick="app.closeModal()" style="padding: 10px; width: 100%; border: none; border-radius: 12px; background: var(--primary); color: white; cursor: pointer;">关闭</button>
        `);
    }

    focusSearch() {
        document.getElementById('searchInput')?.focus();
    }

    performSearch() {
        const query = document.getElementById('searchInput')?.value;
        if (!query) return;
        
        const engine = this.state.settings?.searchEngine || 'baidu';
        const urls = {
            baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        window.open(urls[engine], '_blank');
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

    refreshPage() {
        location.reload();
    }

    loadUserSettings() {
        const settings = this.state.settings;
        if (settings) {
            if (settings.theme === 'dark') this.toggleDarkMode(true);
            if (settings.showStatusBar === false) {
                const statusBar = document.getElementById('statusBar');
                if (statusBar) statusBar.style.display = 'none';
            }
        }
        
        // 更新时间
        setInterval(() => {
            const now = new Date();
            const timeElement = document.querySelector('.status-bar .time');
            const dateElement = document.querySelector('.status-bar .date');
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
            }
            if (dateElement) {
                dateElement.textContent = Utils.formatDate(now, 'YYYY年MM月DD日 WW');
            }
        }, 1000);
        
        // 获取天气
        this.fetchWeather();
        setInterval(() => this.fetchWeather(), 1800000);
    }

    async fetchWeather() {
        const weatherElement = document.getElementById('weatherTemp');
        if (weatherElement) {
            // 模拟天气数据，实际可接入API
            const temp = Math.floor(Math.random() * 30) + 10;
            weatherElement.textContent = `${temp}°C`;
        }
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js').then(reg => {
                console.log('Service Worker 注册成功:', reg);
            }).catch(err => {
                console.log('Service Worker 注册失败:', err);
            });
        }
    }
}

// 绑定全局事件
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // 绑定搜索事件
    document.addEventListener('click', (e) => {
        if (e.target.id === 'searchBtn' || e.target.classList.contains('search-btn')) {
            window.app.performSearch();
        }
    });
    
    document.addEventListener('keypress', (e) => {
        if (e.target.id === 'searchInput' && e.key === 'Enter') {
            window.app.performSearch();
        }
    });
});
