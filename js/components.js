// 组件管理系统
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.activeComponents = JSON.parse(localStorage.getItem('activeComponents')) || [];
        this.initComponents();
    }

    initComponents() {
        // 注册所有可用组件
        this.registerComponent('weather', WeatherComponent);
        this.registerComponent('todo', TodoComponent);
        this.registerComponent('calendar', CalendarComponent);
        this.registerComponent('countdown', CountdownComponent);
        this.registerComponent('stocks', StocksComponent);
        this.registerComponent('poetry', PoetryComponent);
        this.registerComponent('english', EnglishComponent);
        this.registerComponent('memorial', MemorialComponent);
        this.registerComponent('hotsearch', HotSearchComponent);
        this.registerComponent('woodfish', WoodfishComponent);
    }

    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    addComponent(name, position = null) {
        const ComponentClass = this.components.get(name);
        if (ComponentClass) {
            const component = new ComponentClass();
            const componentId = `${name}_${Date.now()}`;
            this.activeComponents.push({
                id: componentId,
                name: name,
                position: position || this.activeComponents.length,
                data: component.getDefaultData()
            });
            this.save();
            this.render();
            return componentId;
        }
    }

    removeComponent(componentId) {
        this.activeComponents = this.activeComponents.filter(c => c.id !== componentId);
        this.save();
        this.render();
    }

    updateComponentData(componentId, data) {
        const component = this.activeComponents.find(c => c.id === componentId);
        if (component) {
            component.data = { ...component.data, ...data };
            this.save();
            this.render();
        }
    }

    save() {
        localStorage.setItem('activeComponents', JSON.stringify(this.activeComponents));
    }

    render() {
        const container = document.getElementById('widgetsGrid');
        if (!container) return;

        container.innerHTML = this.activeComponents.map(comp => {
            const ComponentClass = this.components.get(comp.name);
            if (ComponentClass) {
                const instance = new ComponentClass();
                return instance.render(comp.id, comp.data);
            }
            return '';
        }).join('');

        // 绑定组件事件
        this.bindComponentEvents();
    }

    bindComponentEvents() {
        this.activeComponents.forEach(comp => {
            const ComponentClass = this.components.get(comp.name);
            if (ComponentClass) {
                const instance = new ComponentClass();
                instance.bindEvents(comp.id, comp.data, (data) => {
                    this.updateComponentData(comp.id, data);
                });
            }
        });
    }
}

// 天气组件
class WeatherComponent {
    getDefaultData() {
        return {
            city: '深圳',
            temperature: 25,
            weather: '中雨',
            humidity: 85,
            wind: '东南风 3级'
        };
    }

    render(id, data) {
        return `
            <div class="card weather-widget" data-component-id="${id}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-size: 2rem;">🌤️</div>
                        <h3>天气</h3>
                        <div style="font-size: 2rem; font-weight: bold;">${data.temperature}°C</div>
                        <div>${data.weather}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>${data.city}</div>
                        <div style="font-size: 12px;">💧 ${data.humidity}%</div>
                        <div style="font-size: 12px;">🌬️ ${data.wind}</div>
                    </div>
                </div>
                <button class="refresh-weather" style="margin-top: 12px; width: 100%; background: rgba(255,255,255,0.2); border: none; padding: 8px; border-radius: 8px; cursor: pointer;">刷新</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const refreshBtn = document.querySelector(`[data-component-id="${id}"] .refresh-weather`);
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                const newData = await this.fetchWeather(data.city);
                updateCallback(newData);
            });
        }
    }

    async fetchWeather(city) {
        // 模拟API调用
        return {
            city: city,
            temperature: Math.floor(Math.random() * 30) + 10,
            weather: ['晴', '多云', '阴', '小雨', '中雨'][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 50) + 40,
            wind: ['东北风', '东南风', '西南风', '西北风'][Math.floor(Math.random() * 4)] + ' ' + (Math.floor(Math.random() * 5) + 1) + '级'
        };
    }
}

// 待办组件
class TodoComponent {
    getDefaultData() {
        return {
            todos: JSON.parse(localStorage.getItem('todos')) || []
        };
    }

    render(id, data) {
        const todos = data.todos || [];
        return `
            <div class="card" data-component-id="${id}">
                <h3>✅ 待办清单</h3>
                <div class="todo-list">
                    ${todos.map((todo, idx) => `
                        <div class="todo-item" data-todo-idx="${idx}">
                            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
                            <button class="todo-delete">🗑️</button>
                        </div>
                    `).join('')}
                    ${todos.length === 0 ? '<div style="text-align: center; color: #9ca3af; padding: 20px;">暂无待办事项</div>' : ''}
                </div>
                <div class="add-todo-form">
                    <input type="text" class="add-todo-input" placeholder="添加新待办...">
                    <button class="add-todo-btn">添加</button>
                </div>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        // 添加待办
        const addBtn = container.querySelector('.add-todo-btn');
        const addInput = container.querySelector('.add-todo-input');
        
        addBtn?.addEventListener('click', () => {
            const text = addInput.value.trim();
            if (text) {
                const newTodo = { text, completed: false, createdAt: new Date().toISOString() };
                const updatedTodos = [...(data.todos || []), newTodo];
                updateCallback({ todos: updatedTodos });
                addInput.value = '';
            }
        });

        // 删除待办
        container.querySelectorAll('.todo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const idx = parseInt(todoItem.dataset.todoIdx);
                const updatedTodos = data.todos.filter((_, i) => i !== idx);
                updateCallback({ todos: updatedTodos });
            });
        });

        // 切换完成状态
        container.querySelectorAll('.todo-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const idx = parseInt(todoItem.dataset.todoIdx);
                const updatedTodos = [...data.todos];
                updatedTodos[idx].completed = e.target.checked;
                updateCallback({ todos: updatedTodos });
            });
        });
    }

    escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}

// 日历组件
class CalendarComponent {
    getDefaultData() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth(),
            events: JSON.parse(localStorage.getItem('calendarEvents')) || {}
        };
    }

    render(id, data) {
        const firstDay = new Date(data.year, data.month, 1).getDay();
        const daysInMonth = new Date(data.year, data.month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === data.year && today.getMonth() === data.month;
        const todayDate = today.getDate();

        let days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return `
            <div class="card" data-component-id="${id}">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-dir="-1">◀</button>
                    <h3>${data.year}年${data.month + 1}月</h3>
                    <button class="calendar-nav-btn" data-dir="1">▶</button>
                </div>
                <div class="calendar-weekdays">
                    <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                </div>
                <div class="calendar-days">
                    ${days.map(day => `
                        <div class="calendar-day ${day && isCurrentMonth && day === todayDate ? 'today' : ''}" data-date="${day}">
                            ${day || ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        
        container.querySelectorAll('.calendar-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dir = parseInt(e.target.dataset.dir);
                let newMonth = data.month + dir;
                let newYear = data.year;
                if (newMonth < 0) {
                    newMonth = 11;
                    newYear--;
                } else if (newMonth > 11) {
                    newMonth = 0;
                    newYear++;
                }
                updateCallback({ year: newYear, month: newMonth });
            });
        });
    }
}

// 倒计时组件
class CountdownComponent {
    getDefaultData() {
        return {
            targets: [
                { name: '下班', date: this.getNextFriday(), icon: '⏰' },
                { name: '发薪日', date: this.getNextPayday(), icon: '💰' },
                { name: '周末', date: this.getNextWeekend(), icon: '🎉' }
            ]
        };
    }

    getNextFriday() {
        const now = new Date();
        const daysUntilFriday = (5 - now.getDay() + 7) % 7;
        const nextFriday = new Date(now);
        nextFriday.setDate(now.getDate() + (daysUntilFriday || 7));
        return nextFriday;
    }

    getNextPayday() {
        const now = new Date();
        const nextPayday = new Date(now.getFullYear(), now.getMonth(), 10);
        if (nextPayday <= now) {
            nextPayday.setMonth(nextPayday.getMonth() + 1);
        }
        return nextPayday;
    }

    getNextWeekend() {
        const now = new Date();
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        const nextSaturday = new Date(now);
        nextSaturday.setDate(now.getDate() + (daysUntilSaturday || 7));
        return nextSaturday;
    }

    getDaysLeft(targetDate) {
        const now = new Date();
        const diffTime = targetDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    render(id, data) {
        return `
            <div class="card" data-component-id="${id}">
                <h3>⏰ 倒计时</h3>
                ${data.targets.map(target => `
                    <div class="countdown-item">
                        <div>${target.icon} ${target.name}</div>
                        <div class="countdown-number">${this.getDaysLeft(new Date(target.date))}天</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        // 每小时自动刷新
        setInterval(() => {
            updateCallback({ targets: data.targets });
        }, 3600000);
    }
}

// 其他组件类似实现...
class StocksComponent { getDefaultData() { return { stocks: [] }; } render(id, data) { return '<div>股票组件</div>'; } bindEvents() {} }
class PoetryComponent { getDefaultData() { return {}; } render(id, data) { return '<div>诗词组件</div>'; } bindEvents() {} }
class EnglishComponent { getDefaultData() { return {}; } render(id, data) { return '<div>英语组件</div>'; } bindEvents() {} }
class MemorialComponent { getDefaultData() { return {}; } render(id, data) { return '<div>纪念日组件</div>'; } bindEvents() {} }
class HotSearchComponent { getDefaultData() { return {}; } render(id, data) { return '<div>热搜组件</div>'; } bindEvents() {} }
class WoodfishComponent { getDefaultData() { return { count: 0 }; } render(id, data) { return '<div>电子木鱼</div>'; } bindEvents() {} }

// 导出组件管理器
window.componentManager = new ComponentManager();
