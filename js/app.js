// 在App类的constructor中添加
constructor() {
    this.state = { ... };
    this.componentManager = null;
    this.init();
}

async init() {
    await this.loadUserData();
    this.setupEventListeners();
    
    // 初始化组件管理器
    if (window.componentManager) {
        this.componentManager = window.componentManager;
    }
    
    this.render();
    this.setupPWA();
    
    // 添加组件示例
    setTimeout(() => {
        if (this.componentManager && this.componentManager.activeComponents.length === 0) {
            this.componentManager.addComponent('weather');
            this.componentManager.addComponent('todo');
            this.componentManager.addComponent('calendar');
            this.componentManager.addComponent('countdown');
        }
    }, 1000);
}
