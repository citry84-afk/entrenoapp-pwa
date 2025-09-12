// Sistema social completo para EntrenoApp
import { auth, db, storage } from '../config/firebase-config.js';
import { logout } from '../auth/auth.js';
import { 
    doc, 
    collection,
    addDoc,
    updateDoc,
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Estado global del sistema social
let socialState = {
    // Navegación
    currentMode: 'profile', // 'profile', 'friends', 'ranking', 'search', 'settings'
    
    // Usuario actual
    userProfile: null,
    userStats: {
        totalWorkouts: 0,
        totalDistance: 0,
        totalChallenges: 0,
        challengesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        joinDate: null,
        lastActivity: null
    },
    
    // Sistema social
    friends: [],
    friendRequests: [], // Solicitudes recibidas
    sentRequests: [], // Solicitudes enviadas
    friendActivity: [], // Actividad de amigos
    searchResults: [],
    
    // Rankings
    globalRanking: [],
    friendsRanking: [],
    dailyRanking: [],
    weeklyRanking: [],
    monthlyRanking: [],
    
    // Configuración
    settings: {
        privacy: 'friends', // 'public', 'friends', 'private'
        notifications: true,
        friendRequestNotifications: true,
        activityNotifications: true,
        showInRanking: true,
        units: 'metric',
        language: 'es'
    },
    
    // Cache y control
    isLoading: false,
    searchQuery: '',
    lastUpdate: null,
    
    // Listeners en tiempo real
    friendsListener: null,
    activityListener: null,
    rankingListener: null
};

// Inicializar componente social
window.initProfile = function() {
    console.log('👤 Inicializando sistema social');
    loadUserProfile();
    setupRealtimeListeners();
    renderProfilePage();
    setupSocialListeners();
};

// Cargar perfil del usuario
async function loadUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Cargar perfil básico
        if (window.getUserProfile) {
            socialState.userProfile = await window.getUserProfile(user.uid);
        }
        
        // Cargar estadísticas sociales
        await loadUserSocialStats();
        
        // Cargar amigos
        await loadFriends();
        
        // Cargar ranking
        await loadRankings();
        
        console.log('✅ Datos sociales cargados:', socialState.userProfile);
        
    } catch (error) {
        console.error('❌ Error cargando perfil social:', error);
    }
}

// Cargar estadísticas sociales del usuario
async function loadUserSocialStats() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            socialState.userStats = {
                ...socialState.userStats,
                ...userData.stats,
                joinDate: userData.createdAt?.toDate() || new Date()
            };
            
            socialState.settings = {
                ...socialState.settings,
                ...userData.settings
            };
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas sociales:', error);
    }
}

// Cargar lista de amigos
async function loadFriends() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Cargar amigos
        const friendsQuery = query(
            collection(db, 'friendships'),
            where('users', 'array-contains', user.uid),
            where('status', '==', 'accepted')
        );
        
        const friendsSnap = await getDocs(friendsQuery);
        const friendIds = [];
        
        friendsSnap.forEach(doc => {
            const data = doc.data();
            const friendId = data.users.find(id => id !== user.uid);
            if (friendId) friendIds.push(friendId);
        });
        
        // Cargar perfiles de amigos
        socialState.friends = [];
        for (const friendId of friendIds) {
            const friendProfile = await getUserProfileById(friendId);
            if (friendProfile) {
                socialState.friends.push(friendProfile);
            }
        }
        
        // Cargar solicitudes de amistad
        await loadFriendRequests();
        
        // Cargar actividad de amigos
        await loadFriendActivity();
        
    } catch (error) {
        console.error('❌ Error cargando amigos:', error);
    }
}

// Cargar solicitudes de amistad
async function loadFriendRequests() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Solicitudes recibidas
        const receivedQuery = query(
            collection(db, 'friendships'),
            where('receiver', '==', user.uid),
            where('status', '==', 'pending')
        );
        
        const receivedSnap = await getDocs(receivedQuery);
        socialState.friendRequests = [];
        
        for (const doc of receivedSnap.docs) {
            const data = doc.data();
            const senderProfile = await getUserProfileById(data.sender);
            if (senderProfile) {
                socialState.friendRequests.push({
                    id: doc.id,
                    sender: senderProfile,
                    sentAt: data.createdAt?.toDate() || new Date()
                });
            }
        }
        
        // Solicitudes enviadas
        const sentQuery = query(
            collection(db, 'friendships'),
            where('sender', '==', user.uid),
            where('status', '==', 'pending')
        );
        
        const sentSnap = await getDocs(sentQuery);
        socialState.sentRequests = [];
        
        for (const doc of sentSnap.docs) {
            const data = doc.data();
            const receiverProfile = await getUserProfileById(data.receiver);
            if (receiverProfile) {
                socialState.sentRequests.push({
                    id: doc.id,
                    receiver: receiverProfile,
                    sentAt: data.createdAt?.toDate() || new Date()
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error cargando solicitudes:', error);
    }
}

// Cargar actividad de amigos
async function loadFriendActivity() {
    try {
        const user = auth.currentUser;
        if (!user || socialState.friends.length === 0) return;
        
        const friendIds = socialState.friends.map(friend => friend.uid);
        
        // Cargar actividad reciente de amigos
        const activityQuery = query(
            collection(db, 'user-activity'),
            where('userId', 'in', friendIds.slice(0, 10)), // Firestore limit
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        
        const activitySnap = await getDocs(activityQuery);
        socialState.friendActivity = [];
        
        activitySnap.forEach(doc => {
            const data = doc.data();
            const friend = socialState.friends.find(f => f.uid === data.userId);
            if (friend) {
                socialState.friendActivity.push({
                    id: doc.id,
                    user: friend,
                    type: data.type,
                    data: data.data,
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error cargando actividad:', error);
    }
}

// Cargar rankings
async function loadRankings() {
    try {
        // Ranking global por puntos
        const globalQuery = query(
            collection(db, 'users'),
            where('settings.showInRanking', '!=', false),
            orderBy('stats.totalPoints', 'desc'),
            limit(50)
        );
        
        const globalSnap = await getDocs(globalQuery);
        socialState.globalRanking = [];
        
        globalSnap.forEach((doc, index) => {
            const data = doc.data();
            socialState.globalRanking.push({
                position: index + 1,
                uid: doc.id,
                username: data.username,
                displayName: data.displayName,
                photoURL: data.photoURL,
                points: data.stats?.totalPoints || 0,
                level: data.stats?.level || 1,
                completedChallenges: data.stats?.challengesCompleted || 0
            });
        });
        
        // Ranking de amigos
        if (socialState.friends.length > 0) {
            socialState.friendsRanking = socialState.friends
                .map(friend => ({
                    uid: friend.uid,
                    username: friend.username,
                    displayName: friend.displayName,
                    photoURL: friend.photoURL,
                    points: friend.stats?.totalPoints || 0,
                    level: friend.stats?.level || 1,
                    completedChallenges: friend.stats?.challengesCompleted || 0
                }))
                .sort((a, b) => b.points - a.points)
                .map((friend, index) => ({
                    ...friend,
                    position: index + 1
                }));
        }
        
        // Ranking diario
        await loadDailyRanking();
        
    } catch (error) {
        console.error('❌ Error cargando rankings:', error);
    }
}

// Cargar ranking diario
async function loadDailyRanking() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const dailyQuery = query(
            collection(db, 'daily-challenges'),
            where('date', '==', today),
            orderBy('totalPoints', 'desc'),
            limit(20)
        );
        
        const dailySnap = await getDocs(dailyQuery);
        socialState.dailyRanking = [];
        
        for (const doc of dailySnap.docs) {
            const data = doc.data();
            const userProfile = await getUserProfileById(data.userId);
            if (userProfile) {
                socialState.dailyRanking.push({
                    position: socialState.dailyRanking.length + 1,
                    user: userProfile,
                    points: data.totalPoints || 0,
                    completed: data.completed?.length || 0
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error cargando ranking diario:', error);
    }
}

// Configurar listeners en tiempo real
function setupRealtimeListeners() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Listener para solicitudes de amistad
    socialState.friendsListener = onSnapshot(
        query(
            collection(db, 'friendships'),
            where('receiver', '==', user.uid),
            where('status', '==', 'pending')
        ),
        (snapshot) => {
            loadFriendRequests();
            if (socialState.currentMode === 'friends') {
                renderProfilePage();
            }
        }
    );
}

// Renderizar página principal
function renderProfilePage() {
    const container = document.querySelector('.profile-container');
    if (!container) return;
    
    let content = '';
    
    switch (socialState.currentMode) {
        case 'profile':
            content = renderUserProfile();
            break;
        case 'friends':
            content = renderFriendsSection();
            break;
        case 'ranking':
            content = renderRankingSection();
            break;
        case 'search':
            content = renderSearchSection();
            break;
        case 'settings':
            content = renderSettingsSection();
            break;
        default:
            content = renderUserProfile();
    }
    
    container.innerHTML = content;
}

// Renderizar perfil del usuario
function renderUserProfile() {
    const profile = socialState.userProfile;
    const stats = socialState.userStats;
    
    if (!profile) {
        return '<div class="loading">Cargando perfil...</div>';
    }
    
    return `
        <div class="user-profile glass-fade-in">
            <!-- Header del perfil -->
            <div class="profile-header glass-card mb-lg">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="${profile.photoURL || '/assets/default-avatar.png'}" 
                             alt="${profile.displayName}" 
                             class="avatar-image">
                        <div class="level-badge">${stats.level}</div>
                    </div>
                    <div class="profile-details">
                        <h2 class="profile-name">${profile.displayName}</h2>
                        <p class="profile-username">@${profile.username}</p>
                        <div class="profile-stats-quick">
                            <span class="stat-item">
                                <strong>${stats.totalPoints}</strong> puntos
                            </span>
                            <span class="stat-divider">•</span>
                            <span class="stat-item">
                                <strong>${socialState.friends.length}</strong> amigos
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="glass-button glass-button-secondary" onclick="window.editProfile()">
                        ✏️ Editar
                    </button>
                    <button class="glass-button glass-button-danger" onclick="window.handleLogout()">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
            
            <!-- Navegación de pestañas -->
            <div class="profile-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn active" data-tab="profile">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Perfil</span>
                    </button>
                    <button class="tab-btn" data-tab="friends">
                        <span class="tab-icon">👥</span>
                        <span class="tab-text">Amigos</span>
                        ${socialState.friendRequests.length > 0 ? 
                            `<span class="notification-badge">${socialState.friendRequests.length}</span>` : ''}
                    </button>
                    <button class="tab-btn" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn" data-tab="search">
                        <span class="tab-icon">🔍</span>
                        <span class="tab-text">Buscar</span>
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Config</span>
                    </button>
                </div>
            </div>
            
            <!-- Información básica del perfil -->
            <div class="profile-bio glass-card mb-lg">
                <h3 class="section-title mb-md">📝 Sobre mí</h3>
                <p class="bio-text">${profile.bio || 'No hay biografía disponible'}</p>
            </div>
        </div>
    `;
}

// Renderizar sección de amigos
function renderFriendsSection() {
    return `
        <div class="friends-section glass-fade-in">
            <div class="friends-header text-center mb-lg">
                <h2 class="page-title">👥 Amigos</h2>
                <p class="page-subtitle text-secondary">Conecta con otros usuarios</p>
            </div>
            
            <!-- Navegación de pestañas -->
            <div class="profile-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn" data-tab="profile">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Perfil</span>
                    </button>
                    <button class="tab-btn active" data-tab="friends">
                        <span class="tab-icon">👥</span>
                        <span class="tab-text">Amigos</span>
                        ${socialState.friendRequests.length > 0 ? 
                            `<span class="notification-badge">${socialState.friendRequests.length}</span>` : ''}
                    </button>
                    <button class="tab-btn" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn" data-tab="search">
                        <span class="tab-icon">🔍</span>
                        <span class="tab-text">Buscar</span>
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Config</span>
                    </button>
                </div>
            </div>
            
            <!-- Solicitudes de amistad -->
            ${socialState.friendRequests.length > 0 ? renderFriendRequests() : ''}
            
            <!-- Solicitudes enviadas -->
            ${socialState.sentRequests.length > 0 ? renderSentFriendRequests() : ''}
            
            <!-- Lista de amigos -->
            ${renderFriendsList()}
            
            <!-- Actividad de amigos -->
            ${renderFriendActivity()}
        </div>
    `;
}

// Renderizar solicitudes de amistad
function renderFriendRequests() {
    return `
        <div class="friend-requests glass-card mb-lg">
            <h3 class="section-title mb-md">
                🔔 Solicitudes de Amistad 
                <span class="requests-count">(${socialState.friendRequests.length})</span>
            </h3>
            <div class="requests-list">
                ${socialState.friendRequests.map(request => `
                    <div class="request-item">
                        <div class="request-user">
                            <img src="${request.sender.photoURL || '/assets/default-avatar.png'}" 
                                 alt="${request.sender.displayName}" 
                                 class="user-avatar">
                            <div class="user-info">
                                <div class="user-name">${request.sender.displayName}</div>
                                <div class="user-username">@${request.sender.username}</div>
                                <div class="request-time">${getTimeAgo(request.sentAt)}</div>
                            </div>
                        </div>
                        <div class="request-actions">
                            <button class="glass-button glass-button-primary btn-sm" 
                                    onclick="window.acceptFriendRequest('${request.id}')">
                                ✅ Aceptar
                            </button>
                            <button class="glass-button glass-button-danger btn-sm" 
                                    onclick="window.rejectFriendRequest('${request.id}')">
                                ❌ Rechazar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Renderizar solicitudes enviadas
function renderSentFriendRequests() {
    return `
        <div class="friend-requests glass-card mb-lg">
            <h3 class="section-title mb-md">
                📤 Solicitudes Enviadas 
                <span class="requests-count">(${socialState.sentRequests.length})</span>
            </h3>
            <div class="requests-list">
                ${socialState.sentRequests.map(request => `
                    <div class="request-item">
                        <div class="request-user">
                            <img src="${request.receiver.photoURL || '/assets/default-avatar.png'}" 
                                 alt="${request.receiver.displayName}" 
                                 class="user-avatar">
                            <div class="user-info">
                                <div class="user-name">${request.receiver.displayName}</div>
                                <div class="user-username">@${request.receiver.username}</div>
                                <div class="request-time">${getTimeAgo(request.sentAt)}</div>
                            </div>
                        </div>
                        <div class="request-actions">
                            <button class="glass-button glass-button-secondary btn-sm" 
                                    onclick="window.cancelSentRequest('${request.id}')">
                                🚫 Cancelar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Renderizar lista de amigos
function renderFriendsList() {
    if (socialState.friends.length === 0) {
        return `
            <div class="friends-empty glass-card text-center">
                <div class="empty-icon mb-md">👥</div>
                <h3 class="empty-title">No tienes amigos aún</h3>
                <p class="empty-description text-secondary">
                    Busca usuarios y envía solicitudes de amistad para empezar a competir
                </p>
                <button class="glass-button glass-button-primary" onclick="window.switchToSearch()">
                    🔍 Buscar Usuarios
                </button>
            </div>
        `;
    }
    
    return `
        <div class="friends-list glass-card mb-lg">
            <div class="friends-header">
                <h3 class="section-title">
                    👥 Mis Amigos (${socialState.friends.length})
                </h3>
                <button class="glass-button glass-button-secondary btn-sm" onclick="window.switchToSearch()">
                    ➕ Agregar
                </button>
            </div>
            <div class="friends-grid">
                ${socialState.friends.map(friend => `
                    <div class="friend-card">
                        <img src="${friend.photoURL || '/assets/default-avatar.png'}" 
                             alt="${friend.displayName}" 
                             class="friend-avatar">
                        <div class="friend-info">
                            <div class="friend-name">${friend.displayName}</div>
                            <div class="friend-username">@${friend.username}</div>
                            <div class="friend-stats">
                                <span class="friend-level">Nivel ${friend.stats?.level || 1}</span>
                                <span class="friend-points">${friend.stats?.totalPoints || 0} pts</span>
                            </div>
                        </div>
                        <div class="friend-actions">
                            <button class="glass-button glass-button-secondary btn-sm" 
                                    onclick="window.viewFriendProfile('${friend.uid}')">
                                👤 Ver
                            </button>
                            <button class="glass-button glass-button-danger btn-sm" 
                                    onclick="window.removeFriend('${friend.uid}')">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Renderizar ranking
function renderRankingSection() {
    return `
        <div class="ranking-section glass-fade-in">
            <div class="ranking-header text-center mb-lg">
                <h2 class="page-title">🏆 Rankings</h2>
                <p class="page-subtitle text-secondary">Compite con la comunidad</p>
            </div>
            
            <!-- Navegación de pestañas -->
            <div class="profile-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn" data-tab="profile">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Perfil</span>
                    </button>
                    <button class="tab-btn" data-tab="friends">
                        <span class="tab-icon">👥</span>
                        <span class="tab-text">Amigos</span>
                        ${socialState.friendRequests.length > 0 ? 
                            `<span class="notification-badge">${socialState.friendRequests.length}</span>` : ''}
                    </button>
                    <button class="tab-btn active" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn" data-tab="search">
                        <span class="tab-icon">🔍</span>
                        <span class="tab-text">Buscar</span>
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Config</span>
                    </button>
                </div>
            </div>
            
            <!-- Selector de tipo de ranking -->
            <div class="ranking-selector glass-card mb-lg">
                <div class="selector-buttons">
                    <button class="selector-btn active" data-ranking="global">
                        🌍 Global
                    </button>
                    <button class="selector-btn" data-ranking="friends">
                        👥 Amigos
                    </button>
                    <button class="selector-btn" data-ranking="daily">
                        📅 Hoy
                    </button>
                </div>
            </div>
            
            <!-- Rankings -->
            <div id="ranking-content">
                ${renderGlobalRanking()}
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

// Configurar listeners
function setupSocialListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .tab-btn, .selector-btn');
        if (!target) return;
        
        // Navegación de pestañas
        if (target.classList.contains('tab-btn')) {
            e.preventDefault();
            switchSocialTab(target.dataset.tab);
        }
        
        // Selector de ranking
        if (target.classList.contains('selector-btn')) {
            e.preventDefault();
            switchRanking(target.dataset.ranking);
        }
        // Búsqueda: lanzar búsqueda
        if (target.id === 'search-btn') {
            const input = document.getElementById('search-query');
            if (input) {
                const queryText = input.value.trim();
                socialState.searchQuery = queryText;
                runUserSearch(queryText);
            }
            return;
        }

        // Búsqueda: enviar solicitud de amistad
        if (target.dataset && target.dataset.action === 'send-request' && target.dataset.userId) {
            sendFriendRequest(target.dataset.userId);
            return;
        }
    });
}

// Ejecutar búsqueda por email o nick (@usuario)
async function runUserSearch(queryText) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const results = [];

        // Si empieza por @, buscar por username exacto
        if (queryText.startsWith('@')) {
            const username = queryText.toLowerCase();
            const qByUsername = query(
                collection(db, 'users'),
                where('username', '==', username),
                limit(10)
            );
            const snap = await getDocs(qByUsername);
            snap.forEach(d => results.push({ uid: d.id, ...d.data() }));
        } else if (queryText.includes('@')) {
            // Tiene pinta de email → búsqueda exacta por email
            const qByEmail = query(
                collection(db, 'users'),
                where('email', '==', queryText.toLowerCase()),
                limit(10)
            );
            const snap = await getDocs(qByEmail);
            snap.forEach(d => results.push({ uid: d.id, ...d.data() }));
        } else {
            // Si no, intentar por displayName (prefijo)
            const qByName = query(
                collection(db, 'users'),
                where('displayName', '>=', queryText),
                where('displayName', '<=', queryText + '\uf8ff'),
                limit(10)
            );
            const snap = await getDocs(qByName);
            snap.forEach(d => results.push({ uid: d.id, ...d.data() }));
        }

        // Marcar usuario actual y limpiar duplicados por uid
        const map = new Map();
        results.forEach(r => {
            map.set(r.uid, {
                ...r,
                isCurrentUser: r.uid === user.uid
            });
        });
        socialState.searchResults = Array.from(map.values());

        // Actualizar UI
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = renderSearchResults();
        } else {
            renderProfilePage();
        }
    } catch (error) {
        console.error('❌ Error en búsqueda de usuarios:', error);
        alert('No se pudo realizar la búsqueda');
    }
}

// Enviar solicitud de amistad
async function sendFriendRequest(targetUserId) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        if (user.uid === targetUserId) return alert('No puedes enviarte una solicitud a ti mismo');

        const myDocRef = doc(db, 'users', user.uid);
        const targetDocRef = doc(db, 'users', targetUserId);

        // Registrar solicitud en ambos perfiles
        await updateDoc(myDocRef, {
            sentRequests: arrayUnion(targetUserId),
            updatedAt: serverTimestamp()
        });
        await updateDoc(targetDocRef, {
            friendRequests: arrayUnion(user.uid),
            updatedAt: serverTimestamp()
        });

        alert('✅ Solicitud enviada');

    } catch (error) {
        console.error('❌ Error enviando solicitud:', error);
        alert('No se pudo enviar la solicitud');
    }
}

// Cambiar pestaña social
function switchSocialTab(tab) {
    socialState.currentMode = tab;
    renderProfilePage();
    
    // Actualizar UI de pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
}

// Funciones auxiliares de perfil
function getDaysAsMember(joinDate) {
    if (!joinDate) return 0;
    const now = new Date();
    const join = new Date(joinDate);
    const diffTime = Math.abs(now - join);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
}

// Obtener perfil de usuario por ID
async function getUserProfileById(uid) {
    try {
        const userDoc = doc(db, 'users', uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
            return {
                uid: uid,
                ...userSnap.data()
            };
        }
        return null;
        
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        return null;
    }
}

// Funciones placeholder que se implementarán
function renderRecentActivity() {
    return `
        <div class="recent-activity glass-card">
            <h3 class="section-title mb-md">📈 Actividad Reciente</h3>
            <div class="activity-placeholder">
                <p class="text-secondary">Próximamente: actividad en tiempo real</p>
            </div>
        </div>
    `;
}

function renderUserRankingPosition() {
    const userPosition = socialState.globalRanking.findIndex(
        user => user.uid === auth.currentUser?.uid
    ) + 1;
    
    return `
        <div class="user-ranking glass-card">
            <h3 class="section-title mb-md">🏆 Tu Posición</h3>
            <div class="ranking-position">
                ${userPosition > 0 ? 
                    `<div class="position-display">
                        <span class="position-number">#${userPosition}</span>
                        <span class="position-text">en el ranking global</span>
                    </div>` :
                    '<p class="text-secondary">Completa retos para aparecer en el ranking</p>'
                }
            </div>
        </div>
    `;
}

function renderFriendActivity() {
    if (socialState.friendActivity.length === 0) {
        return '';
    }
    
    return `
        <div class="friend-activity glass-card">
            <h3 class="section-title mb-md">📰 Actividad de Amigos</h3>
            <div class="activity-list">
                ${socialState.friendActivity.slice(0, 5).map(activity => `
                    <div class="activity-item">
                        <img src="${activity.user.photoURL || '/assets/default-avatar.png'}" 
                             alt="${activity.user.displayName}" 
                             class="activity-avatar">
                        <div class="activity-content">
                            <span class="activity-user">${activity.user.displayName}</span>
                            <span class="activity-description">${getActivityDescription(activity)}</span>
                            <span class="activity-time">${getTimeAgo(activity.timestamp)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderGlobalRanking() {
    return `
        <div class="global-ranking glass-card">
            <h3 class="section-title mb-md">🌍 Ranking Global</h3>
            <div class="ranking-list">
                ${socialState.globalRanking.slice(0, 20).map(user => `
                    <div class="ranking-item ${user.uid === auth.currentUser?.uid ? 'current-user' : ''}">
                        <div class="ranking-position">
                            <span class="position-number">${user.position}</span>
                            ${user.position <= 3 ? getMedalIcon(user.position) : ''}
                        </div>
                        <img src="${user.photoURL || '/assets/default-avatar.png'}" 
                             alt="${user.displayName}" 
                             class="ranking-avatar">
                        <div class="ranking-info">
                            <div class="ranking-name">${user.displayName}</div>
                            <div class="ranking-username">@${user.username}</div>
                        </div>
                        <div class="ranking-stats">
                            <div class="ranking-points">${user.points} pts</div>
                            <div class="ranking-level">Nivel ${user.level}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getMedalIcon(position) {
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return `<span class="medal-icon">${medals[position]}</span>`;
}

function getActivityDescription(activity) {
    switch (activity.type) {
        case 'challenge_completed':
            return 'completó un reto diario';
        case 'workout_finished':
            return 'terminó un entrenamiento';
        case 'running_session':
            return `corrió ${activity.data.distance}km`;
        default:
            return 'tuvo actividad';
    }
}

// Funciones del sistema social (placeholder para implementación completa)
window.acceptFriendRequest = function(requestId) {
    handleAcceptRequest(requestId);
};

window.rejectFriendRequest = function(requestId) {
    handleRejectRequest(requestId);
};

window.removeFriend = function(friendId) {
    handleRemoveFriend(friendId);
};

window.cancelSentRequest = function(requestId) {
    handleCancelSentRequest(requestId);
};

// Aceptar solicitud: actualizar documento de friendship a accepted
async function handleAcceptRequest(requestId) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const friendshipRef = doc(db, 'friendships', requestId);
        await updateDoc(friendshipRef, {
            status: 'accepted',
            acceptedAt: serverTimestamp()
        });
        await loadFriends();
        renderProfilePage();
    } catch (error) {
        console.error('❌ Error aceptando solicitud:', error);
        alert('No se pudo aceptar la solicitud');
    }
}

// Rechazar solicitud: marcar como rejected o eliminar
async function handleRejectRequest(requestId) {
    try {
        const friendshipRef = doc(db, 'friendships', requestId);
        await updateDoc(friendshipRef, {
            status: 'rejected',
            updatedAt: serverTimestamp()
        });
        await loadFriends();
        renderProfilePage();
    } catch (error) {
        console.error('❌ Error rechazando solicitud:', error);
        alert('No se pudo rechazar la solicitud');
    }
}

// Eliminar amigo: buscar relación y marcarla como removed
async function handleRemoveFriend(friendId) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        // Buscar documentos de amistad accepted entre ambos
        const q = query(
            collection(db, 'friendships'),
            where('users', 'array-contains', user.uid),
            where('status', '==', 'accepted')
        );
        const snap = await getDocs(q);
        const updates = [];
        snap.forEach(d => {
            const data = d.data();
            if (Array.isArray(data.users) && data.users.includes(friendId)) {
                updates.push(updateDoc(doc(db, 'friendships', d.id), {
                    status: 'removed',
                    updatedAt: serverTimestamp()
                }));
            }
        });
        await Promise.all(updates);
        await loadFriends();
        renderProfilePage();
    } catch (error) {
        console.error('❌ Error eliminando amigo:', error);
        alert('No se pudo eliminar al amigo');
    }
}

// Cancelar solicitud enviada por el usuario actual
async function handleCancelSentRequest(requestId) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const friendshipRef = doc(db, 'friendships', requestId);
        await updateDoc(friendshipRef, {
            status: 'canceled',
            updatedAt: serverTimestamp()
        });
        await loadFriends();
        renderProfilePage();
    } catch (error) {
        console.error('❌ Error cancelando solicitud enviada:', error);
        alert('No se pudo cancelar la solicitud');
    }
}
window.viewFriendProfile = function(friendId) {
    console.log('Viendo perfil de amigo:', friendId);
    // TODO: Implementar vista de perfil de amigo
};

window.switchToSearch = function() {
    switchSocialTab('search');
};

window.editProfile = function() {
    console.log('Editando perfil');
    showEditProfileModal();
};

// Mostrar modal de edición de perfil
function showEditProfileModal() {
    const profile = socialState.userProfile;
    const stats = socialState.userStats;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content profile-edit-modal">
            <div class="modal-header">
                <h2>✏️ Editar Perfil</h2>
                <button class="modal-close" onclick="closeEditProfileModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <form id="edit-profile-form" class="profile-edit-form">
                    <!-- Foto de perfil -->
                    <div class="form-group">
                        <label class="form-label">📸 Foto de Perfil</label>
                        <div class="photo-upload-container">
                            <div class="current-photo">
                                <img id="current-photo" src="${profile?.photoURL || '/assets/default-avatar.png'}" 
                                     alt="Foto actual" class="profile-photo-preview">
                                <div class="photo-overlay">
                                    <span class="photo-text">Cambiar</span>
                                </div>
                            </div>
                            <input type="file" id="photo-input" accept="image/*" style="display: none;">
                        </div>
                    </div>
                    
                    <!-- Información básica -->
                    <div class="form-group">
                        <label for="display-name" class="form-label">👤 Nombre Completo</label>
                        <input type="text" id="display-name" class="glass-input" 
                               value="${profile?.displayName || ''}" 
                               placeholder="Tu nombre completo">
                    </div>
                    
                    <div class="form-group">
                        <label for="username" class="form-label">🏷️ Nombre de Usuario</label>
                        <input type="text" id="username" class="glass-input" 
                               value="${profile?.username || ''}" 
                               placeholder="@tu_usuario">
                    </div>
                    
                    <div class="form-group">
                        <label for="bio" class="form-label">📝 Biografía</label>
                        <textarea id="bio" class="glass-input" rows="3" 
                                  placeholder="Cuéntanos sobre ti...">${profile?.bio || ''}</textarea>
                    </div>
                    
                    <!-- Configuración de privacidad -->
                    <div class="form-group">
                        <label class="form-label">🔒 Privacidad</label>
                        <div class="privacy-options">
                            <label class="radio-option">
                                <input type="radio" name="privacy" value="public" 
                                       ${socialState.settings.privacy === 'public' ? 'checked' : ''}>
                                <span class="radio-text">🌐 Público</span>
                                <span class="radio-desc">Cualquiera puede ver tu perfil</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="privacy" value="friends" 
                                       ${socialState.settings.privacy === 'friends' ? 'checked' : ''}>
                                <span class="radio-text">👥 Solo Amigos</span>
                                <span class="radio-desc">Solo tus amigos pueden ver tu perfil</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="privacy" value="private" 
                                       ${socialState.settings.privacy === 'private' ? 'checked' : ''}>
                                <span class="radio-text">🔒 Privado</span>
                                <span class="radio-desc">Solo tú puedes ver tu perfil</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Notificaciones -->
                    <div class="form-group">
                        <label class="form-label">🔔 Notificaciones</label>
                        <div class="checkbox-options">
                            <label class="checkbox-option">
                                <input type="checkbox" id="notifications" 
                                       ${socialState.settings.notifications ? 'checked' : ''}>
                                <span class="checkbox-text">Notificaciones generales</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" id="friend-requests" 
                                       ${socialState.settings.friendRequestNotifications ? 'checked' : ''}>
                                <span class="checkbox-text">Solicitudes de amistad</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" id="activity-notifications" 
                                       ${socialState.settings.activityNotifications ? 'checked' : ''}>
                                <span class="checkbox-text">Actividad de amigos</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="glass-button glass-button-secondary" 
                        onclick="closeEditProfileModal()">
                    Cancelar
                </button>
                <button type="button" class="glass-button glass-button-primary" 
                        onclick="saveProfileChanges()">
                    💾 Guardar Cambios
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupPhotoUpload();
}

// Configurar subida de foto
function setupPhotoUpload() {
    const photoInput = document.getElementById('photo-input');
    const currentPhoto = document.getElementById('current-photo');
    const photoContainer = document.querySelector('.photo-upload-container');
    
    // Click en el contenedor de foto
    photoContainer.addEventListener('click', () => {
        photoInput.click();
    });
    
    // Cambio de archivo
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentPhoto.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Cerrar modal de edición
window.closeEditProfileModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
};

// Guardar cambios del perfil
window.saveProfileChanges = async function() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        // Obtener datos del formulario
        const displayName = document.getElementById('display-name').value.trim();
        const username = document.getElementById('username').value.trim();
        const bio = document.getElementById('bio').value.trim();
        const privacy = document.querySelector('input[name="privacy"]:checked').value;
        const notifications = document.getElementById('notifications').checked;
        const friendRequests = document.getElementById('friend-requests').checked;
        const activityNotifications = document.getElementById('activity-notifications').checked;
        
        // Validaciones
        if (!displayName) {
            alert('El nombre completo es obligatorio');
            return;
        }
        
        if (!username) {
            alert('El nombre de usuario es obligatorio');
            return;
        }
        
        // Validar formato de username (debe empezar con @ y tener al menos 3 caracteres)
        if (!username.startsWith('@') || username.length < 4) {
            alert('El nombre de usuario debe empezar con @ y tener al menos 3 caracteres');
            return;
        }
        
        // Validar que solo contenga caracteres válidos
        const usernamePattern = /^@[a-zA-Z0-9_]+$/;
        if (!usernamePattern.test(username)) {
            alert('El nombre de usuario solo puede contener letras, números y guiones bajos');
            return;
        }
        
        // Verificar si el username ya está en uso (solo si cambió)
        if (username !== socialState?.userProfile?.username) {
            const usernameQuery = query(
                collection(db, 'users'),
                where('username', '==', username)
            );
            const usernameSnap = await getDocs(usernameQuery);
            if (!usernameSnap.empty) {
                alert('Este nombre de usuario ya está en uso. Elige otro.');
                return;
            }
        }
        
        // Procesar foto si se seleccionó una nueva
        let photoURL = socialState?.userProfile?.photoURL;
        const photoInput = document.getElementById('photo-input');
        if (photoInput.files[0]) {
            photoURL = await uploadProfilePhoto(photoInput.files[0]);
        }
        
        // Actualizar perfil en Firebase Auth
        await updateProfile(user, {
            displayName: displayName,
            photoURL: photoURL
        });
        
        // Actualizar datos en Firestore
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
            displayName: displayName,
            username: username,
            bio: bio,
            photoURL: photoURL,
            settings: {
                privacy: privacy,
                notifications: notifications,
                friendRequestNotifications: friendRequests,
                activityNotifications: activityNotifications,
                showInRanking: socialState?.settings?.showInRanking || true,
                units: socialState?.settings?.units || 'metric',
                language: socialState?.settings?.language || 'es'
            },
            updatedAt: serverTimestamp()
        });
        
        // Actualizar estado local si existe
        if (typeof socialState !== 'undefined') {
            socialState.userProfile = {
                ...socialState.userProfile,
                displayName: displayName,
                username: username,
                bio: bio,
                photoURL: photoURL
            };
            
            socialState.settings = {
                ...socialState.settings,
                privacy: privacy,
                notifications: notifications,
                friendRequestNotifications: friendRequests,
                activityNotifications: activityNotifications
            };
        }
        
        // Cerrar modal y actualizar UI
        closeEditProfileModal();
        renderProfilePage();
        
        alert('✅ Perfil actualizado exitosamente!');
        
    } catch (error) {
        alert('Error actualizando el perfil. Inténtalo de nuevo.');
    }
};

// Subir foto de perfil
async function uploadProfilePhoto(file) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        // Crear referencia de almacenamiento
        const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);
        
        // Subir archivo
        const snapshot = await uploadBytes(storageRef, file);
        
        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('✅ Foto de perfil subida:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Error subiendo foto:', error);
        throw error;
    }
};

function switchRanking(type) {
    const content = document.getElementById('ranking-content');
    if (!content) return;
    
    // Actualizar botones
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.ranking === type) {
            btn.classList.add('active');
        }
    });
    
    // Renderizar ranking correspondiente
    switch (type) {
        case 'global':
            content.innerHTML = renderGlobalRanking();
            break;
        case 'friends':
            content.innerHTML = renderFriendsRanking();
            break;
        case 'daily':
            content.innerHTML = renderDailyRanking();
            break;
    }
}

function renderFriendsRanking() {
    if (socialState.friendsRanking.length === 0) {
        return `
            <div class="empty-ranking glass-card text-center">
                <div class="empty-icon mb-md">👥</div>
                <h3 class="empty-title">Sin amigos en el ranking</h3>
                <p class="empty-description text-secondary">
                    Agrega amigos para ver su progreso aquí
                </p>
            </div>
        `;
    }
    
    return `
        <div class="friends-ranking glass-card">
            <h3 class="section-title mb-md">👥 Ranking de Amigos</h3>
            <div class="ranking-list">
                ${socialState.friendsRanking.map(friend => `
                    <div class="ranking-item">
                        <div class="ranking-position">
                            <span class="position-number">${friend.position}</span>
                            ${friend.position <= 3 ? getMedalIcon(friend.position) : ''}
                        </div>
                        <img src="${friend.photoURL || '/assets/default-avatar.png'}" 
                             alt="${friend.displayName}" 
                             class="ranking-avatar">
                        <div class="ranking-info">
                            <div class="ranking-name">${friend.displayName}</div>
                            <div class="ranking-username">@${friend.username}</div>
                        </div>
                        <div class="ranking-stats">
                            <div class="ranking-points">${friend.points} pts</div>
                            <div class="ranking-level">Nivel ${friend.level}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderDailyRanking() {
    if (socialState.dailyRanking.length === 0) {
        return `
            <div class="empty-ranking glass-card text-center">
                <div class="empty-icon mb-md">📅</div>
                <h3 class="empty-title">Sin actividad hoy</h3>
                <p class="empty-description text-secondary">
                    Completa el reto diario para aparecer en el ranking
                </p>
            </div>
        `;
    }
    
    return `
        <div class="daily-ranking glass-card">
            <h3 class="section-title mb-md">📅 Ranking de Hoy</h3>
            <div class="ranking-list">
                ${socialState.dailyRanking.map(entry => `
                    <div class="ranking-item ${entry.user.uid === auth.currentUser?.uid ? 'current-user' : ''}">
                        <div class="ranking-position">
                            <span class="position-number">${entry.position}</span>
                            ${entry.position <= 3 ? getMedalIcon(entry.position) : ''}
                        </div>
                        <img src="${entry.user.photoURL || '/assets/default-avatar.png'}" 
                             alt="${entry.user.displayName}" 
                             class="ranking-avatar">
                        <div class="ranking-info">
                            <div class="ranking-name">${entry.user.displayName}</div>
                            <div class="ranking-username">@${entry.user.username}</div>
                        </div>
                        <div class="ranking-stats">
                            <div class="ranking-points">${entry.points} pts</div>
                            <div class="ranking-completed">${entry.completed} retos</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSearchSection() {
    return `
        <div class="search-section glass-fade-in">
            <div class="search-header text-center mb-lg">
                <h2 class="page-title">🔍 Buscar Usuarios</h2>
                <p class="page-subtitle text-secondary">Busca por email o por nick (@usuario)</p>
            </div>
            
            <!-- Navegación de pestañas -->
            <div class="profile-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn" data-tab="profile">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Perfil</span>
                    </button>
                    <button class="tab-btn" data-tab="friends">
                        <span class="tab-icon">👥</span>
                        <span class="tab-text">Amigos</span>
                        ${socialState.friendRequests.length > 0 ? 
                            `<span class="notification-badge">${socialState.friendRequests.length}</span>` : ''}
                    </button>
                    <button class="tab-btn" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn active" data-tab="search">
                        <span class="tab-icon">🔍</span>
                        <span class="tab-text">Buscar</span>
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Config</span>
                    </button>
                </div>
            </div>
            
            <div class="glass-card mb-lg">
                <div class="search-bar">
                    <input id="search-query" class="glass-input" type="text" placeholder="Escribe un email o @usuario" value="${socialState.searchQuery || ''}">
                    <button id="search-btn" class="glass-button glass-button-primary">Buscar</button>
                </div>
                <div class="helper-text text-secondary mt-sm">Ejemplos: usuario@correo.com o @pepito</div>
            </div>
            
            <div id="search-results" class="glass-card">
                ${renderSearchResults()}
            </div>
        </div>
    `;
}

function renderSearchResults() {
    const results = socialState.searchResults || [];
    if (!results.length) {
        return `
            <div class="search-placeholder text-center">
                <div class="placeholder-icon mb-md">🙋‍♂️</div>
                <h3 class="placeholder-title">Sin resultados</h3>
                <p class="placeholder-description text-secondary">Prueba con el email exacto o el nick con @</p>
            </div>
        `;
    }
    return `
        <div class="results-list">
            ${results.map(u => `
                <div class="result-item">
                    <div class="result-left">
                        <img src="${u.photoURL || '/assets/default-avatar.png'}" alt="${u.displayName || u.username}" class="result-avatar">
                        <div class="result-info">
                            <div class="result-name">${u.displayName || 'Usuario'}</div>
                            <div class="result-username text-secondary">${u.username || ''}</div>
                            <div class="result-email text-tertiary">${u.email || ''}</div>
                        </div>
                    </div>
                    <div class="result-actions">
                        ${u.isCurrentUser ? '<span class="badge">Tú</span>' : `<button class="glass-button glass-button-secondary" data-action="send-request" data-user-id="${u.uid}">Añadir</button>`}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderSettingsSection() {
    return `
        <div class="settings-section glass-fade-in">
            <div class="settings-header text-center mb-lg">
                <h2 class="page-title">⚙️ Configuración</h2>
                <p class="page-subtitle text-secondary">Personaliza tu experiencia</p>
            </div>
            
            <!-- Navegación de pestañas -->
            <div class="profile-tabs glass-card mb-lg">
                <div class="tabs-nav">
                    <button class="tab-btn" data-tab="profile">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Perfil</span>
                    </button>
                    <button class="tab-btn" data-tab="friends">
                        <span class="tab-icon">👥</span>
                        <span class="tab-text">Amigos</span>
                        ${socialState.friendRequests.length > 0 ? 
                            `<span class="notification-badge">${socialState.friendRequests.length}</span>` : ''}
                    </button>
                    <button class="tab-btn" data-tab="ranking">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-text">Ranking</span>
                    </button>
                    <button class="tab-btn" data-tab="search">
                        <span class="tab-icon">🔍</span>
                        <span class="tab-text">Buscar</span>
                    </button>
                    <button class="tab-btn active" data-tab="settings">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Config</span>
                    </button>
                </div>
            </div>
            
            <div class="settings-placeholder glass-card text-center">
                <div class="placeholder-icon mb-md">⚙️</div>
                <h3 class="placeholder-title">Configuración</h3>
                <p class="placeholder-description text-secondary">
                    Próximamente: configuración de privacidad, notificaciones y preferencias
                </p>
                <button class="glass-button glass-button-danger mt-lg" onclick="window.handleLogout()">
                    🚪 Cerrar Sesión
                </button>
            </div>
        </div>
    `;
}

// Función de logout
window.handleLogout = async function() {
    try {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar listeners en tiempo real
            if (socialState.friendsListener) {
                socialState.friendsListener();
            }
            
            await logout();
        }
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        alert('Error cerrando sesión');
    }
};

console.log('👥 Módulo social cargado');
