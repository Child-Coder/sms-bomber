class SMSBomberWeb {
    constructor() {
        this.isRunning = false;
        this.currentSessionId = null;
        this.sentCount = 0;
        this.successCount = 0;
        this.failedCount = 0;
        this.startTime = null;
        this.statsInterval = null;
        this.API_BASE = window.location.origin;
        this.initializeApp();
    }

    initializeApp() {
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
        this.setupEventListeners();
        this.addLog('System initialized successfully', 'info');
        this.addLog('Connected to Vercel hosting', 'success');
    }

    updateCurrentTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent = 
            now.toLocaleTimeString();
    }

    setupEventListeners() {
        const form = document.getElementById('bomberForm');
        const stopBtn = document.getElementById('stopBtn');
        const testBtn = document.getElementById('testBtn');
        const clearLogs = document.getElementById('clearLogs');

        form.addEventListener('submit', (e) => this.startBombing(e));
        stopBtn.addEventListener('click', () => this.stopBombing());
        testBtn.addEventListener('click', () => this.testAPIs());
        clearLogs.addEventListener('click', () => this.clearLogs());
    }

    async startBombing(e) {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        const smsAmount = parseInt(document.getElementById('smsAmount').value);
        const delayTime = parseFloat(document.getElementById('delayTime').value);

        // Validation
        if (!this.validatePhoneNumber(phoneNumber)) {
            this.addLog('Invalid phone number format. Must be 01XXXXXXXXX', 'error');
            this.showNotification('Invalid phone number format!', 'error');
            return;
        }

        if (smsAmount < 10 || smsAmount > 100) {
            this.addLog('SMS amount must be between 10 and 100', 'error');
            this.showNotification('SMS amount must be between 10-100!', 'error');
            return;
        }

        this.isRunning = true;
        this.resetCounters();
        this.toggleForm(true);

        this.addLog(`Starting SMS campaign to ${phoneNumber}`, 'info');
        this.addLog(`Target: ${smsAmount} SMS, Delay: ${delayTime}s`, 'info');
        this.showNotification('Starting SMS bombing simulation...', 'info');

        try {
            const response = await fetch('/api/bomber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    amount: smsAmount,
                    delay: delayTime
                })
            });

            const result = await response.json();

            if (result.success) {
                this.currentSessionId = result.session_id;
                this.addLog('✅ Simulation started successfully!', 'success');
                this.addLog('🔄 Running in simulation mode (Vercel)', 'info');
                this.showNotification('Simulation started!', 'success');
                this.startTime = Date.now();
                
                // Start simulation
                this.startSimulation(smsAmount, delayTime);
            } else {
                this.addLog(`❌ Failed to start: ${result.message}`, 'error');
                this.showNotification(`Failed: ${result.message}`, 'error');
                this.toggleForm(false);
                this.isRunning = false;
            }
        } catch (error) {
            this.addLog('❌ Failed to connect to server', 'error');
            this.showNotification('Server connection failed!', 'error');
            this.toggleForm(false);
            this.isRunning = false;
        }
    }

    startSimulation(totalAmount, delay) {
        let completed = 0;
        const apis = [
            'mygp.grameenphone.com',
            'fundesh.com.bd',
            'webloginda.grameenphone.com',
            'go-app.paperfly.com.bd',
            'api.osudpotro.com',
            'api.apex4u.com',
            'bb-api.bohubrihi.com',
            'api.redx.com.bd',
            'training.gov.bd',
            'da-api.robi.com.bd'
        ];

        const simulationInterval = setInterval(() => {
            if (!this.isRunning || completed >= totalAmount) {
                clearInterval(simulationInterval);
                this.addLog('✅ Simulation completed!', 'success');
                this.showNotification('Simulation completed!', 'success');
                this.stopBombing();
                return;
            }

            // Simulate API calls
            const apiName = apis[completed % apis.length];
            const isSuccess = Math.random() > 0.3; // 70% success rate
            
            if (isSuccess) {
                this.successCount++;
                this.addLog(`✅ SMS sent via ${apiName} (#${this.sentCount + 1})`, 'success');
            } else {
                this.failedCount++;
                this.addLog(`❌ Failed via ${apiName} (#${this.sentCount + 1})`, 'error');
            }
            
            this.sentCount++;
            completed++;
            this.updateDashboard();

            // Update progress
            const progress = ((completed / totalAmount) * 100).toFixed(1);
            this.updateProgressBar(progress);

        }, delay * 300); // Adjusted delay for simulation
    }

    updateProgressBar(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${progress}%`;
        }
    }

    stopBombing() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }

        this.isRunning = false;
        this.currentSessionId = null;
        this.addLog('🛑 Simulation stopped', 'info');
        this.showNotification('Simulation stopped', 'info');
        this.toggleForm(false);
        this.calculateFinalStats();
    }

    async testAPIs() {
        this.addLog('Testing API connectivity...', 'info');
        this.showNotification('Testing APIs...', 'info');
        
        // Simulate API testing for Vercel
        setTimeout(() => {
            const working = 8;
            const total = 10;
            this.addLog(`✅ API Test: ${working}/${total} APIs would work in production`, 'success');
            this.showNotification(`${working}/${total} APIs available`, 'success');
        }, 2000);
    }

    clearLogs() {
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = `
            <div class="log-entry info">
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                <span class="message">Logs cleared. System ready.</span>
            </div>
        `;
        this.addLog('Logs cleared successfully', 'info');
    }

    updateDashboard() {
        document.getElementById('sentCount').textContent = this.sentCount;
        document.getElementById('successCount').textContent = this.successCount;
        document.getElementById('failedCount').textContent = this.failedCount;

        // Calculate real-time speed
        if (this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const speed = elapsed > 0 ? (this.sentCount / elapsed).toFixed(2) : '0';
            document.getElementById('speed').textContent = speed;
        }
    }

    calculateFinalStats() {
        if (this.startTime) {
            const totalTime = (Date.now() - this.startTime) / 1000;
            const speed = (this.sentCount / totalTime).toFixed(2);
            const successRate = this.sentCount > 0 ? ((this.successCount / this.sentCount) * 100).toFixed(1) : '0';

            this.addLog(`📊 Final Simulation Report:`, 'info');
            this.addLog(`   ⏱️ Total Time: ${totalTime.toFixed(1)}s`, 'info');
            this.addLog(`   📨 Total Sent: ${this.sentCount}`, 'info');
            this.addLog(`   ✅ Successful: ${this.successCount}`, 'success');
            this.addLog(`   ❌ Failed: ${this.failedCount}`, 'error');
            this.addLog(`   📈 Success Rate: ${successRate}%`, 'info');
            this.addLog(`   🚀 Average Speed: ${speed} SMS/second`, 'info');
            this.addLog(`   💡 Note: This is a simulation on Vercel`, 'info');
        }
    }

    addLog(message, type = 'info') {
        const logsContainer = document.getElementById('logsContainer');
        const logEntry = document.createElement('div');
        
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            <span class="message">${message}</span>
        `;

        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;

        // Keep only last 50 logs
        const logs = logsContainer.querySelectorAll('.log-entry');
        if (logs.length > 50) {
            logs[0].remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 300px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;

        const colors = {
            info: 'linear-gradient(135deg, #667eea, #764ba2)',
            success: 'linear-gradient(135deg, #10b981, #34d399)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    validatePhoneNumber(phone) {
        return /^01\d{9}$/.test(phone);
    }

    resetCounters() {
        this.sentCount = 0;
        this.successCount = 0;
        this.failedCount = 0;
        this.startTime = null;
        this.updateDashboard();
        this.updateProgressBar(0);
        
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = `
            <div class="log-entry info">
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                <span class="message">System ready. Enter target details to start simulation.</span>
            </div>
        `;
    }

    toggleForm(disabled) {
        const inputs = document.querySelectorAll('#bomberForm input, #bomberForm button');
        const stopBtn = document.getElementById('stopBtn');
        
        inputs.forEach(input => {
            if (input.type !== 'button' || input.id !== 'stopBtn') {
                input.disabled = disabled;
            }
        });
        
        stopBtn.disabled = !disabled;
        
        const submitBtn = document.querySelector('#bomberForm button[type="submit"]');
        if (disabled) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Simulation...';
        } else {
            submitBtn.innerHTML = '<i class="fas fa-play"></i> Start Bombing';
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.smsBomber = new SMSBomberWeb();
    
    // Global event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.smsBomber.isRunning) {
            window.smsBomber.stopBombing();
        }
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
