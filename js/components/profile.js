// Componente de perfil y sistema social de EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { logout } from '../auth/auth.js';

// Estado del componente de perfil
let profileState = {
    currentMode: 'profile', // 'profile', 'friends', 'achievements', 'settings'
    userProfile: null,
    userStats: {
        totalWorkouts: 0,
        totalDistance: 0,
        totalChallenges: 0,
        currentStreak: 0,
        joinDate: null
    },
    friends: [],
    achievements: [],
    settings: {
        notifications: true,
        privacy: 'friends',
        units: 'metric',
        language: 'es',
        theme: 'auto'
    }
};

// Inicializar componente de perfil
window.initProfile = function() {
    console.log('👤 Inicializando perfil');
    loadProfileData();
    renderProfilePage();
    setupProfileListeners();
};

// Cargar datos del perfil
async function loadProfileData() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Perfil básico del usuario
        profileState.userProfile = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Usuario',
            email: user.email,
            photoURL: user.photoURL || null,
            username: generateUsername(user.displayName || user.email),
            joinDate: user.metadata.creationTime
        };
        
        // Cargar estadísticas
        await loadUserStats();
        
        // Cargar amigos
        await loadFriends();
        
        // Cargar logros
        await loadAchievements();
        
        // Cargar configuración
        await loadSettings();
        
    } catch (error) {
        console.error('❌ Error cargando datos del perfil:', error);
    }
}

// Renderizar página de perfil
function renderProfilePage() {
    const container = document.querySelector('.profile-container');
    if (!container) return;
    
    let content = '';
    
    switch (profileState.currentMode) {
        case 'profile':
            content = renderMainProfile();
            break;
        case 'friends':
            content = renderFriendsSection();
            break;
        case 'achievements':
            content = renderAchievementsSection();
            break;
        case 'settings':
            content = renderSettingsSection();
            break;
        default:
            content = renderMainProfile();
    }
    
    container.innerHTML = content;
    
    // Añadir animaciones
    const cards = container.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('glass-fade-in');
    });
}

// Perfil principal
function renderMainProfile() {
    if (!profileState.userProfile) return '';
    
    const profile = profileState.userProfile;
    const stats = profileState.userStats;
    
    return `
        <div class="main-profile">
            <div class="profile-header">
                <div class="profile-nav">
                    <button class="glass-button nav-btn active" data-mode="profile">Perfil</button>
                    <button class="glass-button nav-btn" data-mode="friends">Amigos</button>
                    <button class="glass-button nav-btn" data-mode="achievements">Logros</button>
                    <button class="glass-button nav-btn" data-mode="settings">Ajustes</button>
                </div>
            </div>
            
            ${renderUserCard(profile, stats)}
            ${renderUserStats(stats)}
            ${renderRecentActivity()}
            ${renderQuickActions()}
        </div>
    `;
}

// Tarjeta del usuario
function renderUserCard(profile, stats) {
    return `
        <div class="user-card glass-card glass-gradient-blue">
            <div class="user-info">
                <div class="user-avatar">
                    ${profile.photoURL ? 
                        `<img src="${profile.photoURL}" alt="${profile.name}" class="avatar-image">` :
                        `<div class="avatar-placeholder">${profile.name.charAt(0).toUpperCase()}</div>`
                    }
                    <button class="edit-avatar-btn" onclick="editAvatar()">📷</button>
                </div>
                
                <div class="user-details">
                    <h2 class="user-name">${profile.name}</h2>
                    <p class="user-username">@${profile.username}</p>
                    <p class="user-join-date">Miembro desde ${formatJoinDate(profile.joinDate)}</p>
                </div>
                
                <div class="user-actions">
                    <button class="glass-button edit-profile-btn" onclick="editProfile()">
                        ✏️ Editar
                    </button>
                </div>
            </div>
            
            <div class="user-level">
                <div class="level-info">
                    <span class="level-label">Nivel</span>
                    <span class="level-value">${calculateUserLevel(stats)}</span>
                </div>
                <div class="level-progress">
                    <div class="level-bar">
                        <div class="level-fill" style="width: ${calculateLevelProgress(stats)}%"></div>
                    </div>
                    <span class="level-next">Siguiente: ${getNextLevelName(stats)}</span>
                </div>
            </div>
        </div>
    `;
}

// Estadísticas del usuario
function renderUserStats(stats) {
    return `
        <div class="user-stats glass-card">
            <div class="card-header">
                <h3 class="card-title">📊 Estadísticas Generales</h3>
                <button class="glass-button glass-button-sm" onclick="viewDetailedStats()">
                    Ver Detalle
                </button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">💪</div>
                    <div class="stat-value">${stats.totalWorkouts}</div>
                    <div class="stat-label">Entrenamientos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🏃</div>
                    <div class="stat-value">${(stats.totalDistance / 1000).toFixed(1)}</div>
                    <div class="stat-label">km corridos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.totalChallenges}</div>
                    <div class="stat-label">Retos completados</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">Racha actual</div>
                </div>
            </div>
        </div>
    `;
}

// Actividad reciente
function renderRecentActivity() {
    const recentActivity = getRecentActivity();
    
    return `
        <div class="recent-activity glass-card">
            <div class="card-header">
                <h3 class="card-title">📅 Actividad Reciente</h3>
            </div>
            
            <div class="activity-list">
                ${recentActivity.length > 0 ? 
                    recentActivity.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
                            <div class="activity-details">
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-date">${formatActivityDate(activity.date)}</div>
                            </div>
                            <div class="activity-badge ${activity.type}">
                                ${getActivityBadge(activity)}
                            </div>
                        </div>
                    `).join('') :
                    `<div class="no-activity">
                        <p>Aún no tienes actividad registrada</p>
                        <p class="encouragement">¡Empieza a entrenar para ver tu progreso! 💪</p>
                    </div>`
                }
            </div>
        </div>
    `;
}

// Acciones rápidas
function renderQuickActions() {
    return `
        <div class="quick-actions glass-card">
            <div class="card-header">
                <h3 class="card-title">⚡ Acciones Rápidas</h3>
            </div>
            
            <div class="actions-grid">
                <button class="action-button glass-effect" onclick="shareProfile()">
                    <div class="action-icon">📤</div>
                    <div class="action-label">Compartir Perfil</div>
                </button>
                <button class="action-button glass-effect" onclick="inviteFriends()">
                    <div class="action-icon">👥</div>
                    <div class="action-label">Invitar Amigos</div>
                </button>
                <button class="action-button glass-effect" onclick="exportData()">
                    <div class="action-icon">💾</div>
                    <div class="action-label">Exportar Datos</div>
                </button>
                <button class="action-button glass-effect" onclick="logout()">
                    <div class="action-icon">🚪</div>
                    <div class="action-label">Cerrar Sesión</div>
                </button>
            </div>
        </div>
    `;
}

// Sección de amigos
function renderFriendsSection() {
    return `
        <div class="friends-section">
            <div class="profile-header">
                <div class="profile-nav">
                    <button class="glass-button nav-btn" data-mode="profile">Perfil</button>
                    <button class="glass-button nav-btn active" data-mode="friends">Amigos</button>
                    <button class="glass-button nav-btn" data-mode="achievements">Logros</button>
                    <button class="glass-button nav-btn" data-mode="settings">Ajustes</button>
                </div>
            </div>
            
            ${renderFriendsSearch()}
            ${renderFriendsList()}
            ${renderFriendsActivity()}
        </div>
    `;
}

// Búsqueda de amigos
function renderFriendsSearch() {
    return `
        <div class="friends-search glass-card">
            <div class="card-header">
                <h3 class="card-title">👥 Conectar con Amigos</h3>
            </div>
            
            <div class="search-form">
                <div class="search-input-group">
                    <input 
                        type="text" 
                        id="friend-search" 
                        class="glass-input" 
                        placeholder="Buscar por nombre de usuario..."
                    >
                    <button class="glass-button search-btn" onclick="searchFriends()">
                        🔍
                    </button>
                </div>
                
                <div class="search-methods">
                    <button class="glass-button method-btn" onclick="scanQRCode()">
                        📱 Escanear QR
                    </button>
                    <button class="glass-button method-btn" onclick="shareMyQR()">
                        📄 Mi QR
                    </button>
                    <button class="glass-button method-btn" onclick="inviteByEmail()">
                        📧 Invitar por Email
                    </button>
                </div>
            </div>
            
            <div id="search-results" class="search-results"></div>
        </div>
    `;
}

// Lista de amigos
function renderFriendsList() {
    const friends = profileState.friends;
    
    return `
        <div class="friends-list glass-card">
            <div class="card-header">
                <h3 class="card-title">👥 Mis Amigos (${friends.length})</h3>
                <button class="glass-button glass-button-sm" onclick="manageFriends()">
                    Gestionar
                </button>
            </div>
            
            <div class="friends-grid">
                ${friends.length > 0 ? 
                    friends.map(friend => `
                        <div class="friend-card" onclick="viewFriendProfile('${friend.id}')">
                            <div class="friend-avatar">
                                ${friend.photoURL ? 
                                    `<img src="${friend.photoURL}" alt="${friend.name}">` :
                                    `<div class="avatar-placeholder">${friend.name.charAt(0)}</div>`
                                }
                                <div class="friend-status ${friend.isOnline ? 'online' : 'offline'}"></div>
                            </div>
                            <div class="friend-info">
                                <div class="friend-name">${friend.name}</div>
                                <div class="friend-username">@${friend.username}</div>
                                <div class="friend-activity">${friend.lastActivity}</div>
                            </div>
                        </div>
                    `).join('') :
                    `<div class="no-friends">
                        <p>Aún no tienes amigos conectados</p>
                        <p class="encouragement">¡Invita a tus amigos a entrenar contigo! 👥</p>
                    </div>`
                }
            </div>
        </div>
    `;
}

// Actividad de amigos
function renderFriendsActivity() {
    const friendsActivity = getFriendsActivity();
    
    return `
        <div class="friends-activity glass-card">
            <div class="card-header">
                <h3 class="card-title">📈 Actividad de Amigos</h3>
            </div>
            
            <div class="activity-feed">
                ${friendsActivity.length > 0 ? 
                    friendsActivity.map(activity => `
                        <div class="activity-item">
                            <div class="activity-avatar">
                                ${activity.user.photoURL ? 
                                    `<img src="${activity.user.photoURL}" alt="${activity.user.name}">` :
                                    `<div class="avatar-placeholder">${activity.user.name.charAt(0)}</div>`
                                }
                            </div>
                            <div class="activity-content">
                                <div class="activity-text">
                                    <strong>${activity.user.name}</strong> ${activity.description}
                                </div>
                                <div class="activity-meta">
                                    <span class="activity-time">${formatActivityDate(activity.date)}</span>
                                    ${activity.stats ? `<span class="activity-stats">${activity.stats}</span>` : ''}
                                </div>
                            </div>
                            <div class="activity-actions">
                                <button class="like-btn ${activity.liked ? 'liked' : ''}" onclick="toggleLike('${activity.id}')">
                                    ❤️ ${activity.likes}
                                </button>
                            </div>
                        </div>
                    `).join('') :
                    `<div class="no-activity">
                        <p>No hay actividad reciente de tus amigos</p>
                    </div>`
                }
            </div>
        </div>
    `;
}

// Configurar listeners del perfil
function setupProfileListeners() {
    // Navegación entre secciones
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-btn')) {
            const mode = e.target.dataset.mode;
            switchProfileMode(mode);
        }
    });
}

// Cambiar modo del perfil
function switchProfileMode(mode) {
    profileState.currentMode = mode;
    
    // Actualizar botones activos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
    
    renderProfilePage();
}

// Funciones de datos
async function loadUserStats() {
    try {
        // Cargar desde localStorage temporalmente
        const workouts = JSON.parse(localStorage.getItem('entrenoapp_workouts') || '[]');
        const runs = JSON.parse(localStorage.getItem('entrenoapp_runs') || '[]');
        const challenges = JSON.parse(localStorage.getItem('entrenoapp_completed_challenges') || '[]');
        
        profileState.userStats = {
            totalWorkouts: workouts.length,
            totalDistance: runs.reduce((total, run) => total + (run.distance || 0), 0),
            totalChallenges: challenges.length,
            currentStreak: getCurrentStreak(challenges),
            joinDate: profileState.userProfile?.joinDate || new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function loadFriends() {
    // Simular amigos por ahora
    profileState.friends = [
        {
            id: 'friend_1',
            name: 'Ana García',
            username: 'ana_fitness',
            photoURL: null,
            isOnline: true,
            lastActivity: 'Completó un reto hace 2 horas'
        },
        {
            id: 'friend_2',
            name: 'Carlos López',
            username: 'carlos_runner',
            photoURL: null,
            isOnline: false,
            lastActivity: 'Corrió 5K ayer'
        }
    ];
}

async function loadAchievements() {
    // Cargar logros
    profileState.achievements = [
        {
            id: 'first_workout',
            name: 'Primer Entrenamiento',
            description: 'Completa tu primer entrenamiento',
            icon: '🎯',
            unlocked: true,
            unlockedAt: Date.now() - 86400000
        },
        {
            id: 'week_streak',
            name: 'Semana Completa',
            description: 'Entrena 7 días seguidos',
            icon: '🔥',
            unlocked: false,
            progress: 4
        }
    ];
}

async function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('entrenoapp_settings');
        if (savedSettings) {
            profileState.settings = { ...profileState.settings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

// Funciones de utilidad
function generateUsername(name) {
    if (!name) return 'usuario' + Math.floor(Math.random() * 1000);
    return name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 100);
}

function formatJoinDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
    });
}

function calculateUserLevel(stats) {
    const totalPoints = stats.totalWorkouts * 10 + stats.totalChallenges * 15 + Math.floor(stats.totalDistance / 1000) * 5;
    
    if (totalPoints < 100) return 'Principiante';
    if (totalPoints < 500) return 'Intermedio';
    if (totalPoints < 1000) return 'Avanzado';
    return 'Experto';
}

function calculateLevelProgress(stats) {
    const totalPoints = stats.totalWorkouts * 10 + stats.totalChallenges * 15 + Math.floor(stats.totalDistance / 1000) * 5;
    
    if (totalPoints < 100) return (totalPoints / 100) * 100;
    if (totalPoints < 500) return ((totalPoints - 100) / 400) * 100;
    if (totalPoints < 1000) return ((totalPoints - 500) / 500) * 100;
    return 100;
}

function getNextLevelName(stats) {
    const level = calculateUserLevel(stats);
    
    switch (level) {
        case 'Principiante': return 'Intermedio';
        case 'Intermedio': return 'Avanzado';
        case 'Avanzado': return 'Experto';
        default: return 'Máximo';
    }
}

function getCurrentStreak(challenges) {
    if (!challenges.length) return 0;
    
    // Calcular racha actual basada en días consecutivos
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = checkDate.toDateString();
        
        const hasChallenge = challenges.some(challenge => {
            const challengeDate = new Date(challenge.completedAt).toDateString();
            return challengeDate === dateString;
        });
        
        if (hasChallenge) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function getRecentActivity() {
    const activities = [];
    
    // Cargar actividades desde localStorage
    try {
        const workouts = JSON.parse(localStorage.getItem('entrenoapp_workouts') || '[]');
        const runs = JSON.parse(localStorage.getItem('entrenoapp_runs') || '[]');
        const challenges = JSON.parse(localStorage.getItem('entrenoapp_completed_challenges') || '[]');
        
        // Agregar entrenamientos
        workouts.slice(-3).forEach(workout => {
            activities.push({
                type: 'workout',
                description: `Completó entrenamiento de ${workout.workout?.name || 'gimnasio'}`,
                date: workout.completedAt,
                duration: workout.duration
            });
        });
        
        // Agregar carreras
        runs.slice(-3).forEach(run => {
            activities.push({
                type: 'run',
                description: `Corrió ${(run.distance / 1000).toFixed(1)} km`,
                date: run.endTime || run.startTime,
                distance: run.distance,
                duration: run.duration
            });
        });
        
        // Agregar retos
        challenges.slice(-3).forEach(challenge => {
            activities.push({
                type: 'challenge',
                description: `Completó el reto "${challenge.name}"`,
                date: challenge.completedAt,
                points: challenge.points
            });
        });
        
        // Ordenar por fecha más reciente
        activities.sort((a, b) => b.date - a.date);
        
    } catch (error) {
        console.error('Error cargando actividad reciente:', error);
    }
    
    return activities.slice(0, 5);
}

function getFriendsActivity() {
    // Simular actividad de amigos
    return [
        {
            id: 'activity_1',
            user: { name: 'Ana García', photoURL: null },
            description: 'completó el reto de flexiones',
            date: Date.now() - 3600000,
            stats: '+25 puntos',
            likes: 3,
            liked: false
        },
        {
            id: 'activity_2',
            user: { name: 'Carlos López', photoURL: null },
            description: 'corrió 5.2 km en 28 minutos',
            date: Date.now() - 7200000,
            stats: '5:23 pace',
            likes: 5,
            liked: true
        }
    ];
}

function getActivityIcon(type) {
    const icons = {
        workout: '💪',
        run: '🏃',
        challenge: '🏆',
        achievement: '⭐'
    };
    return icons[type] || '📅';
}

function getActivityBadge(activity) {
    switch (activity.type) {
        case 'workout':
            return `${Math.floor(activity.duration / 60)} min`;
        case 'run':
            return `${(activity.distance / 1000).toFixed(1)} km`;
        case 'challenge':
            return `+${activity.points} pts`;
        default:
            return '';
    }
}

function formatActivityDate(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) { // Menos de 1 hora
        const minutes = Math.floor(diff / 60000);
        return `hace ${minutes} min`;
    } else if (diff < 86400000) { // Menos de 1 día
        const hours = Math.floor(diff / 3600000);
        return `hace ${hours} h`;
    } else {
        const days = Math.floor(diff / 86400000);
        return `hace ${days} d`;
    }
}

// Funciones de acciones
window.editProfile = function() {
    console.log('✏️ Editando perfil');
    showToast('Función de edición próximamente', 'info');
};

window.editAvatar = function() {
    console.log('📷 Cambiando avatar');
    showToast('Cambio de avatar próximamente', 'info');
};

window.shareProfile = function() {
    const profile = profileState.userProfile;
    if (!profile) return;
    
    const text = `¡Sígueme en EntrenoApp! 💪\n@${profile.username}\n\nMis estadísticas:\n🏃 ${(profileState.userStats.totalDistance / 1000).toFixed(1)} km corridos\n💪 ${profileState.userStats.totalWorkouts} entrenamientos\n🏆 ${profileState.userStats.totalChallenges} retos completados\n\n#EntrenoApp #Fitness`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mi perfil en EntrenoApp',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Perfil copiado al portapapeles', 'success');
        });
    }
};

window.inviteFriends = function() {
    console.log('👥 Invitando amigos');
    showToast('Sistema de invitaciones próximamente', 'info');
};

window.exportData = function() {
    console.log('💾 Exportando datos');
    
    try {
        const data = {
            profile: profileState.userProfile,
            stats: profileState.userStats,
            workouts: JSON.parse(localStorage.getItem('entrenoapp_workouts') || '[]'),
            runs: JSON.parse(localStorage.getItem('entrenoapp_runs') || '[]'),
            challenges: JSON.parse(localStorage.getItem('entrenoapp_completed_challenges') || '[]')
        };
        
        const dataBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `entrenoapp_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showToast('Datos exportados exitosamente', 'success');
        
    } catch (error) {
        console.error('Error exportando datos:', error);
        showToast('Error exportando datos', 'error');
    }
};

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast glass-effect ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('👤 Componente de perfil y sistema social cargado');
