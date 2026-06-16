// 数据存储管理
class StorageManager {
    constructor() {
        this.prefix = 'smart_tab_';
        this.defaults = {
            settings: {
                theme: 'light',
                searchEngine: 'baidu',
                notifications: false,
                autoBackup: true
            },
            widgets: [],
            bookmarks: [],
            userData: {}
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
        return value ? JSON.parse(value) : null;
    }

    set(key, value) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
        this.dispatchEvent(key, value);
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
            if (key.startsWith(this.prefix)) {
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
            console.error('Import failed:', e);
            return false;
        }
    }

    autoBackup() {
        if (this.get('settings').autoBackup) {
            const backup = this.export();
            const backups = this.get('backups') || [];
            backups.push({
                timestamp: Date.now(),
                data: backup
            });
            // 只保留最近10个备份
            if (backups.length > 10) backups.shift();
            this.set('backups', backups);
        }
    }
}

window.storage = new StorageManager();
