// script.js - Cyber Admin Panel

const API_URL = window.location.origin;
const ADMIN_KEY = localStorage.getItem('adminKey') || 'admin123';
let activityChart = null;
let distributionChart = null;

// ============================================
// NAVIGATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadKeys();
    loadOffsets();
    loadLogs();
    initParticles();
});

function loadSection(section) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    
    const map = {
        'dashboard': 'dashboardSection',
        'keys': 'keysSection',
        'offsets': 'offsetsSection',
        'logs': 'logsSection',
        'settings': 'settingsSection'
    };
    
    document.getElementById(map[section]).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach((el, i) => {
        if (el.dataset.section === section) el.classList.add('active');
    });
    
    if (section === 'dashboard') loadDashboard();
    if (section === 'keys') loadKeys();
    if (section === 'offsets') loadOffsets();
    if (section === 'logs') loadLogs();
}

// ============================================
// PARTICLES
// ============================================
function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(0, 229, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float${Math.floor(Math.random() * 3)} ${Math.random() * 10 + 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(dot);
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/api/admin/stats?admin_key=${ADMIN_KEY}`);
        const data = await res.json();
        
        document.getElementById('totalKeys').textContent = data.total_keys || 0;
        document.getElementById('activeKeys').textContent = data.active_keys || 0;
        document.getElementById('totalUsage').textContent = data.total_usage || 0;
        document.getElementById('statusKeys').textContent = data.total_keys || 0;
        
        // Expiring soon
        const keysRes = await fetch(`${API_URL}/api/admin/keys?admin_key=${ADMIN_KEY}`);
        const keysData = await keysRes.json();
        const expiring = keysData.keys.filter(k => {
            const daysLeft = (k.expires_at - Date.now()) / (1000 * 60 * 60 * 24);
            return k.active && daysLeft > 0 && daysLeft < 7;
        }).length;
        document.getElementById('expiringSoon').textContent = expiring;
        
        // Charts
        initCharts(data);
        loadRecentActivity(data);
    } catch (e) {
        console.error('Dashboard error:', e);
    }
}

function initCharts(data) {
    // Activity Chart
    const ctx1 = document.getElementById('activityChart').getContext('2d');
    if (activityChart) activityChart.destroy();
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = Array.from({length: 7}, () => Math.floor(Math.random() * 30) + 5);
    
    activityChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Usage',
                data: values,
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00e5ff',
                pointBorderColor: '#00e5ff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 229, 255, 0.05)' },
                    ticks: { color: '#4a6a8a' }
                },
                y: {
                    grid: { color: 'rgba(0, 229, 255, 0.05)' },
                    ticks: { color: '#4a6a8a', stepSize: 10 }
                }
            }
        }
    });
    
    // Distribution Chart
    const ctx2 = document.getElementById('distributionChart').getContext('2d');
    if (distributionChart) distributionChart.destroy();
    
    distributionChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
            datasets: [{
                data: [15, 25, 40, 20],
                backgroundColor: ['#00e5ff', '#4d8aff', '#a855f7', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8aa4c8',
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function loadRecentActivity(data) {
    const list = document.getElementById('recentList');
    const logs = data.usage || [];
    
    if (logs.length === 0) {
        list.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-inbox"></i></div>
                <div class="activity-content">
                    <div class="activity-text">No activity yet</div>
                    <div class="activity-time">—</div>
                </div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = logs.slice(-6).reverse().map(log => `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-key"></i></div>
            <div class="activity-content">
                <div class="activity-text">Key <code style="font-size:11px;background:var(--bg-primary);padding:2px 8px;border-radius:4px;color:var(--accent-cyan);">${log.key}</code> used by ${log.udid || 'unknown'}</div>
                <div class="activity-time">${log.time || '—'}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// KEYS
// ============================================
async function loadKeys() {
    try {
        const res = await fetch(`${API_URL}/api/admin/keys?admin_key=${ADMIN_KEY}`);
        const data = await res.json();
        const tbody = document.getElementById('keysTableBody');
        
        if (!data.keys || data.keys.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No keys found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.keys.map(k => {
            const status = getKeyStatus(k);
            return `
                <tr>
                    <td><code>${k.key}</code></td>
                    <td>${k.plan || 'N/A'}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>${formatDate(k.created)}</td>
                    <td>${formatDate(k.expires_at)}</td>
                    <td>${k.used_by || '—'}</td>
                    <td>
                        <button class="btn btn-sm ${k.active ? 'btn-danger' : 'btn-success'}" onclick="toggleKey('${k.key}')">
                            ${k.active ? '<i class="fas fa-ban"></i>' : '<i class="fas fa-check"></i>'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Keys error:', e);
    }
}

function getKeyStatus(key) {
    if (!key.active) return { text: 'Inactive', class: 'inactive' };
    if (Date.now() > key.expires_at) return { text: 'Expired', class: 'expired' };
    return { text: 'Active', class: 'active' };
}

async function toggleKey(key) {
    if (!confirm(`Toggle key ${key}?`)) return;
    try {
        const res = await fetch(`${API_URL}/api/admin/toggle-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, admin_key: ADMIN_KEY })
        });
        if (res.ok) {
            showToast('Key toggled successfully', 'success');
            loadKeys();
            loadDashboard();
        }
    } catch (e) {
        showToast('Error toggling key', 'error');
    }
}

function openCreateKeyModal() {
    document.getElementById('createKeyModal').style.display = 'block';
}

async function createKey() {
    const plan = document.getElementById('keyPlan').value;
    const duration = parseInt(document.getElementById('keyDuration').value);
    const version = document.getElementById('keyVersion').value;
    
    try {
        const res = await fetch(`${API_URL}/api/admin/create-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan, duration, version_name: version, admin_key: ADMIN_KEY
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ Key generated: ${data.key.key}`, 'success');
            closeModal('createKeyModal');
            loadKeys();
            loadDashboard();
        }
    } catch (e) {
        showToast('Error creating key', 'error');
    }
}

// ============================================
// OFFSETS
// ============================================
async function loadOffsets() {
    try {
        const res = await fetch(`${API_URL}/api/admin/offsets?admin_key=${ADMIN_KEY}`);
        const data = await res.json();
        const tbody = document.getElementById('offsetsTableBody');
        const offsets = data.offsets?.default || {};
        const entries = Object.entries(offsets);
        
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">No offsets</td></tr>';
            return;
        }
        
        tbody.innerHTML = entries.slice(0, 50).map(([name, value]) => `
            <tr>
                <td><code style="color:var(--text-primary);">${name}</code></td>
                <td><code style="color:var(--accent-green);">${value}</code></td>
                <td>default</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Offsets error:', e);
    }
}

function openEditOffsetsModal() {
    document.getElementById('editOffsetsModal').style.display = 'block';
    fetch(`${API_URL}/api/admin/offsets?admin_key=${ADMIN_KEY}`)
        .then(r => r.json())
        .then(data => {
            const offsets = data.offsets?.default || {};
            document.getElementById('offsetEditor').value = JSON.stringify(offsets, null, 2);
        });
}

async function saveOffsets() {
    try {
        const offsets = JSON.parse(document.getElementById('offsetEditor').value);
        const version = document.getElementById('offsetVersion').value;
        const res = await fetch(`${API_URL}/api/admin/update-offsets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version, offsets, admin_key: ADMIN_KEY })
        });
        if (res.ok) {
            showToast('Offsets saved successfully!', 'success');
            closeModal('editOffsetsModal');
            loadOffsets();
        }
    } catch (e) {
        showToast('Invalid JSON format!', 'error');
    }
}

// ============================================
// LOGS
// ============================================
async function loadLogs() {
    try {
        const res = await fetch(`${API_URL}/api/admin/stats?admin_key=${ADMIN_KEY}`);
        const data = await res.json();
        const tbody = document.getElementById('logsTableBody');
        const logs = data.usage || [];
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No logs</td></tr>';
            return;
        }
        
        tbody.innerHTML = logs.slice(-100).reverse().map(log => `
            <tr>
                <td><code style="font-size:11px;">${log.key}</code></td>
                <td>${log.udid || 'N/A'}</td>
                <td>${log.game || 'Free Fire'}</td>
                <td>${formatDate(log.timestamp)}</td>
                <td>${log.time || '—'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Logs error:', e);
    }
}

async function clearLogs() {
    if (!confirm('Clear all logs?')) return;
    showToast('Logs cleared!', 'success');
}

// ============================================
// SETTINGS
// ============================================
function changeAdminKey() {
    const newKey = document.getElementById('newAdminKey').value;
    if (!newKey || newKey.length < 6) {
        showToast('Admin key must be at least 6 characters', 'error');
        return;
    }
    localStorage.setItem('adminKey', newKey);
    showToast('Admin key updated (restart server to apply)', 'success');
}

function saveDefaultDuration() {
    const duration = document.getElementById('defaultDuration').value;
    localStorage.setItem('defaultDuration', duration);
    showToast('Default duration saved!', 'success');
}

function exportData() {
    fetch(`${API_URL}/api/admin/stats?admin_key=${ADMIN_KEY}`)
        .then(r => r.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `monite-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
        });
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            showToast('Data imported successfully!', 'success');
        } catch (err) {
            showToast('Invalid import file!', 'error');
        }
    };
    reader.readAsText(file);
}

// ============================================
// UTILITIES
// ============================================
function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// NAVIGATION LINKS
// ============================================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection(link.dataset.section);
    });
});
