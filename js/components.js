// 组件管理系统
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.activeComponents = storage.get('widgets') || [];
        this.initComponents();
    }

    initComponents() {
        // 注册所有可用组件
        this.registerComponent('weather', WeatherComponent);
        this.registerComponent('todo', TodoComponent);
        this.registerComponent('calendar', CalendarComponent);
        this.registerComponent('countdown', CountdownComponent);
        this.registerComponent('poetry', PoetryComponent);
        this.registerComponent('english', EnglishComponent);
        this.registerComponent('hotsearch', HotSearchComponent);
        this.registerComponent('woodfish', WoodfishComponent);
    }

    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    addComponent(name) {
        const ComponentClass = this.components.get(name);
        if (ComponentClass) {
            const instance = new ComponentClass();
            const componentId = `${name}_${Date.now()}`;
            this.activeComponents.push({
                id: componentId,
                name: name,
                data: instance.getDefaultData()
            });
            this.save();
            this.render();
            return componentId;
        }
        return null;
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
        storage.set('widgets', this.activeComponents);
    }

    render() {
        const container = document.getElementById('widgetsGrid');
        if (!container) return;

        if (this.activeComponents.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: white; padding: 40px;">右键点击或点击侧边栏添加组件</div>';
            return;
        }

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
            weather: '晴',
            humidity: 65,
            wind: '东南风 2级'
        };
    }

    render(id, data) {
        const weatherIcon = Utils.getWeatherIcon(data.weather);
        return `
            <div class="component-card weather-widget" data-component-id="${id}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-size: 2rem;">${weatherIcon}</div>
                        <h3>天气</h3>
                        <div class="weather-temp">${data.temperature}°C</div>
                        <div>${data.weather}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>📍 ${data.city}</div>
                        <div style="font-size: 12px; margin-top: 8px;">💧 ${data.humidity}%</div>
                        <div style="font-size: 12px;">🌬️ ${data.wind}</div>
                    </div>
                </div>
                <button class="refresh-weather" style="margin-top: 16px; width: 100%; background: rgba(255,255,255,0.2); border: none; padding: 8px; border-radius: 8px; cursor: pointer;">🔄 刷新天气</button>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        const refreshBtn = container.querySelector('.refresh-weather');
        refreshBtn?.addEventListener('click', async () => {
            const newData = await this.fetchWeather(data.city);
            updateCallback(newData);
        });

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }

    async fetchWeather(city) {
        // 模拟API调用，实际可接入真实天气API
        const weathers = ['晴', '多云', '阴', '小雨', '中雨'];
        return {
            city: city,
            temperature: Math.floor(Math.random() * 30) + 10,
            weather: Utils.randomItem(weathers),
            humidity: Math.floor(Math.random() * 50) + 40,
            wind: ['东北风', '东南风', '西南风', '西北风'][Math.floor(Math.random() * 4)] + ' ' + (Math.floor(Math.random() * 5) + 1) + '级'
        };
    }
}

// 待办组件
class TodoComponent {
    getDefaultData() {
        return {
            todos: [
                { text: '欢迎使用灵动标签页', completed: false, createdAt: new Date().toISOString() },
                { text: '右键点击添加更多组件', completed: false, createdAt: new Date().toISOString() }
            ]
        };
    }

    render(id, data) {
        const todos = data.todos || [];
        return `
            <div class="component-card" data-component-id="${id}">
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
                    <input type="text" class="add-todo-input" placeholder="添加新待办..." maxlength="100">
                    <button class="add-todo-btn">添加</button>
                </div>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
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

        addInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
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

        // 删除组件
        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
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
            events: {}
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
            <div class="component-card" data-component-id="${id}">
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
                        <div class="calendar-day ${day && isCurrentMonth && day === todayDate ? 'today' : ''} ${!day ? 'empty' : ''}" data-date="${day || ''}">
                            ${day || ''}
                        </div>
                    `).join('')}
                </div>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

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

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
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
        nextFriday.setHours(18, 0, 0, 0);
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
            <div class="component-card" data-component-id="${id}">
                <h3>⏰ 倒计时</h3>
                ${data.targets.map(target => `
                    <div class="countdown-item">
                        <div class="countdown-name">${target.icon} ${target.name}</div>
                        <div class="countdown-number">${this.getDaysLeft(new Date(target.date))}天</div>
                    </div>
                `).join('')}
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        // 每小时自动刷新显示
        setInterval(() => {
            updateCallback({ targets: data.targets });
        }, 3600000);

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }
}

// 诗词组件
class PoetryComponent {
    getDefaultData() {
        return {
            poems: [
                { content: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
                { content: '人间四月芳菲尽，山寺桃花始盛开。', author: '白居易' },
                { content: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', author: '苏轼' },
                { content: '落霞与孤鹜齐飞，秋水共长天一色。', author: '王勃' },
                { content: '海上生明月，天涯共此时。', author: '张九龄' }
            ]
        };
    }

    render(id, data) {
        const poem = Utils.randomItem(data.poems);
        return `
            <div class="component-card" data-component-id="${id}">
                <h3>📜 今日诗词</h3>
                <div class="poetry-content">${poem.content}</div>
                <div class="poetry-author">—— ${poem.author}</div>
                <button class="refresh-poetry" style="margin-top: 12px; width: 100%; background: #f3f4f6; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">🔄 换一首</button>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        const refreshBtn = container.querySelector('.refresh-poetry');
        refreshBtn?.addEventListener('click', () => {
            const newPoem = Utils.randomItem(data.poems);
            const poetryContent = container.querySelector('.poetry-content');
            const poetryAuthor = container.querySelector('.poetry-author');
            if (poetryContent && poetryAuthor) {
                poetryContent.textContent = newPoem.content;
                poetryAuthor.textContent = `—— ${newPoem.author}`;
            }
        });

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }
}

// 英语组件
class EnglishComponent {
    getDefaultData() {
        return {
            sentences: [
                { english: 'The only limit is your mind.', chinese: '唯一的限制是你的思想。' },
                { english: 'Stay hungry, stay foolish.', chinese: '求知若饥，虚心若愚。' },
                { english: 'Simplicity is the ultimate sophistication.', chinese: '简单是最终的复杂。' }
            ]
        };
    }

    render(id, data) {
        const sentence = Utils.randomItem(data.sentences);
        return `
            <div class="component-card" data-component-id="${id}">
                <h3>📖 每日英语</h3>
                <div class="english-sentence">"${sentence.english}"</div>
                <div class="english-translation">—— ${sentence.chinese}</div>
                <button class="refresh-english" style="margin-top: 12px; width: 100%; background: #f3f4f6; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">🔄 换一句</button>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        const refreshBtn = container.querySelector('.refresh-english');
        refreshBtn?.addEventListener('click', () => {
            const newSentence = Utils.randomItem(data.sentences);
            const englishContent = container.querySelector('.english-sentence');
            const chineseContent = container.querySelector('.english-translation');
            if (englishContent && chineseContent) {
                englishContent.textContent = `"${newSentence.english}"`;
                chineseContent.textContent = `—— ${newSentence.chinese}`;
            }
        });

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }
}

// 热搜组件
class HotSearchComponent {
    getDefaultData() {
        return {
            hotList: [
                { rank: 1, title: '神舟十九号载人飞船发射成功',热度: '爆' },
                { rank: 2, title: 'iPhone 17 Pro 全新配色曝光',热度: '热' },
                { rank: 3, title: '端午节放假安排公布',热度: '热' },
                { rank: 4, title: '多地高温预警持续',热度: '新' },
                { rank: 5, title: 'AI新算法突破性进展',热度: '新' }
            ]
        };
    }

    render(id, data) {
        return `
            <div class="component-card" data-component-id="${id}">
                <h3>🔥 热搜榜单</h3>
                <div class="hotsearch-list">
                    ${data.hotList.map(item => `
                        <div class="hotsearch-item">
                            <span class="hotsearch-rank">${item.rank}</span>
                            <span style="flex: 1;">${item.title}</span>
                            <span style="color: #f59e0b;">${item.热度}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }
}

// 电子木鱼组件
class WoodfishComponent {
    getDefaultData() {
        return {
            count: parseInt(localStorage.getItem('woodfish_count')) || 0
        };
    }

    render(id, data) {
        return `
            <div class="component-card" data-component-id="${id}">
                <h3>🐟 电子木鱼</h3>
                <div class="woodfish-display">
                    <div style="font-size: 4rem;">🐟</div>
                    <div class="woodfish-count">${data.count}</div>
                    <button class="woodfish-btn">敲一下</button>
                    <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">积功德，心平静</div>
                </div>
                <button class="delete-component" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
    }

    bindEvents(id, data, updateCallback) {
        const container = document.querySelector(`[data-component-id="${id}"]`);
        if (!container) return;

        const knockBtn = container.querySelector('.woodfish-btn');
        knockBtn?.addEventListener('click', () => {
            const newCount = data.count + 1;
            localStorage.setItem('woodfish_count', newCount);
            updateCallback({ count: newCount });
            
            // 敲击动画
            const fishIcon = container.querySelector('.woodfish-display div:first-child');
            fishIcon.style.transform = 'scale(0.9)';
            setTimeout(() => {
                fishIcon.style.transform = 'scale(1)';
            }, 100);
        });

        const deleteBtn = container.querySelector('.delete-component');
        deleteBtn?.addEventListener('click', () => {
            window.componentManager.removeComponent(id);
        });
    }
}

// 导出到全局
window.componentManager = new ComponentManager();
