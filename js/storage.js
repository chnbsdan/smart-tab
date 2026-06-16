// 数据存储管理
class StorageManager {
    constructor() {
        this.prefix = 'smart_tab_';
        this.defaults = {
            settings: {
                theme: 'light',
                searchEngine: 'baidu',
                notifications: false,
                autoBackup: true,
                showStatusBar: true
            },
            widgets: [],
            bookmarks: [
                { name: '微博', url: 'https://weibo.com', icon: '🔴' },
                { name: '抖音', url: 'https://douyin.com', icon: '🎵' },
                { name: 'B站', url: 'https://bilibili.com', icon: '📺' },
                { name: '知乎', url: 'https://zhihu.com', icon: '❓' },
                { name: '淘宝', url: 'https://taobao.com', icon: '🛒' },
                { name: '小红书', url: 'https://xiaohongshu.com', icon: '📕' }
            ],
            userData: {},
            backups: []
        };
        this.init();
    }

    init() {
        // 初始化默认数据
        for (const [key, defaultValue] of Object.entries(this.defaults)) {
            if (!this.get(key)) {
                this.set(key, defaultValue);
            }
        }
    }

    get(key) {
        const value = localStorage.getItem(this.prefix + key);
        if (!value) return null;
        
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    set(key, value) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(this.prefix + key, stringValue);
        this.dispatchEvent(key, value);
        
        // 自动备份
        if (key !== 'backups' && this.get('settings')?.autoBackup) {
            this.autoBackup();
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
        this.init();
    }

    dispatchEvent(key, value) {
        const event = new CustomEvent('storageChange', {
            detail: { key, value }
        });
        window.dispatchEvent(event);
    }

    export() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key);
            }
        }
        return JSON.stringify(data, null, 2);
    }

    import(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const [key, value] of Object.entries(data)) {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, value);
                }
            }
            return true;
        } catch (e) {
            console.error('导入失败:', e);
            return false;
        }
    }

    autoBackup() {
        const backup = this.export();
        const backups = this.get('backups') || [];
        backups.push({
            id: Utils.generateId(),
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: backup
        });
        
        // 只保留最近20个备份
        while (backups.length > 20) {
            backups.shift();
        }
        
        this.set('backups', backups);
    }

    restoreBackup(backupId) {
        const backups = this.get('backups') || [];
        const backup = backups.find(b => b.id === backupId);
        if (backup) {
            return this.import(backup.data);
        }
        return false;
    }

    getBackups() {
        return this.get('backups') || [];
    }

    clearBackups() {
        this.set('backups', []);
    }
}

// 导出到全局
window.storage = new StorageManager();
