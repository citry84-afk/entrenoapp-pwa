// Sistema de onboarding rediseñado para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    doc, 
    setDoc,
    getDoc,
    updateDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Helper para logging
function debugLog(category, message, data = null) {
    if (window.debugLogger) {
        window.debugLogger.logInfo('ONBOARDING_' + category, message, data);
    }
    console.log(`[ONBOARDING_${category}] ${message}`, data || '');
}

// Estado del onboarding
let onboardingState = {
    currentStep: 0,
    totalSteps: 6,
    userData: {},
    isLoading: false,
    error: null
};

// Pasos del onboarding rediseñados - EMPEZAR CON TIPO DE PLAN
const onboardingSteps = [
    {
        id: 'welcome',
        type: 'welcome',
        title: '¡Bienvenido a EntrenoApp!',
        subtitle: 'Tu entrenador personal inteligente',
        description: 'Vamos a crear un plan de entrenamiento personalizado solo para ti. Te haremos algunas preguntas para conocerte mejor.',
        icon: '💪'
    },
    {
        id: 'plan_type',
        type: 'selection',
        title: '¿Qué tipo de plan personalizado buscas?',
        subtitle: 'Elige tu disciplina principal',
        options: [
            { 
                id: 'running', 
                label: 'Plan de Carrera', 
                description: 'Desde 5K hasta maratón, GPS tracking, planes estructurados', 
                icon: '🏃‍♂️',
                features: ['GPS tracking', 'Planes progresivos', 'Audio coaching']
            },
            { 
                id: 'functional', 
                label: 'Entrenamiento Funcional', 
                description: 'WODs, Hero workouts, CrossFit style, alta intensidad', 
                icon: '🔥',
                features: ['Hero WODs', 'Benchmarks', 'Competición']
            },
            { 
                id: 'gym', 
                label: 'Gimnasio/Musculación', 
                description: 'Pesas, máquinas, hipertrofia, fuerza tradicional', 
                icon: '🏋️‍♂️',
                features: ['Rutinas divididas', 'Progresión automática', 'Tracking de peso']
            }
        ]
    },
    {
        id: 'experience',
        type: 'selection',
        title: '¿Cuál es tu nivel de experiencia?',
        subtitle: 'En la disciplina que elegiste',
        options: [
            { id: 'beginner', label: 'Principiante', description: 'Nuevo o menos de 6 meses', icon: '🌱' },
            { id: 'intermediate', label: 'Intermedio', description: '6 meses a 2 años', icon: '🔥' },
            { id: 'advanced', label: 'Avanzado', description: 'Más de 2 años de experiencia', icon: '💎' }
        ]
    },
    {
        id: 'session_time',
        type: 'selection',
        title: '¿Cuánto tiempo por sesión?',
        subtitle: 'Duración típica de entrenamiento',
        options: [
            { id: 'short', label: '30-45 minutos', description: 'Sesiones cortas e intensas', icon: '⚡' },
            { id: 'medium', label: '45-60 minutos', description: 'Duración estándar', icon: '⏰' },
            { id: 'long', label: '60-90 minutos', description: 'Sesiones completas', icon: '🕐' }
        ]
    },
    {
        id: 'frequency',
        type: 'selection',
        title: '¿Cuántos días a la semana?',
        subtitle: 'Frecuencia de entrenamiento',
        options: [
            { id: 'low', label: '3 días/semana', description: 'Equilibrio vida-entrenamiento', icon: '📅' },
            { id: 'medium', label: '4-5 días/semana', description: 'Compromiso serio', icon: '💪' },
            { id: 'high', label: '6+ días/semana', description: 'Atleta dedicado', icon: '🔥' }
        ]
    },
    {
        id: 'equipment',
        type: 'multiple',
        title: '¿Qué equipamiento tienes disponible?',
        subtitle: 'Selecciona todo lo que tengas acceso',
        options: [
            { id: 'gym_access', label: 'Gimnasio completo', icon: '🏋️‍♂️' },
            { id: 'home_gym', label: 'Gimnasio casero', icon: '🏠' },
            { id: 'basic_equipment', label: 'Equipamiento básico', description: 'Mancuernas, bandas', icon: '💪' },
            { id: 'bodyweight_only', label: 'Solo peso corporal', icon: '🤸‍♂️' },
            { id: 'outdoor_space', label: 'Espacio exterior', description: 'Para correr, ejercicios', icon: '🌳' }
        ]
    }
];

// Inicializar página de onboarding v2
window.initOnboardingPage = function() {
    debugLog('INIT_V2', 'Inicializando onboarding v2 rediseñado');
    console.log('🎯 Onboarding v2 iniciado correctamente');
    
    try {
        // Verificar contenedor
        const container = document.querySelector('.dashboard-container');
        if (!container) {
            throw new Error('Container .dashboard-container no encontrado');
        }
        debugLog('CONTAINER_OK', 'Container encontrado');
        
        // Cargar datos guardados si existen
        loadSavedProgress();
        
        renderOnboardingContent();
        setupOnboardingListeners();
        
        // Mostrar panel de debug si está habilitado
        if (window.debugLogger && window.debugLogger.isDebugMode) {
            setTimeout(() => {
                window.debugLogger.showDebugPanel();
            }, 1000);
        }
        
        debugLog('INIT_SUCCESS', 'Onboarding v2 inicializado exitosamente');
        
    } catch (error) {
        console.error('❌ Error inicializando onboarding v2:', error);
        debugLog('INIT_ERROR', 'Error en inicialización', { error: error.message, stack: error.stack });
        
        // Fallback: mostrar mensaje de error
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card text-center" style="padding: 2rem; margin: 2rem;">
                    <h2>❌ Error cargando onboarding</h2>
                    <p>Error: ${error.message}</p>
                    <button onclick="window.location.reload()" class="glass-button glass-button-primary">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }
};

// Cargar progreso guardado
function loadSavedProgress() {
    try {
        const savedData = localStorage.getItem('entrenoapp_onboarding');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            onboardingState.currentStep = parsed.currentStep || 0;
            onboardingState.userData = parsed.userData || {};
            debugLog('LOAD_PROGRESS', 'Progreso cargado', parsed);
        }
    } catch (error) {
        debugLog('LOAD_ERROR', 'Error cargando progreso', error);
    }
}

// Guardar progreso
function saveProgress() {
    try {
        const dataToSave = {
            currentStep: onboardingState.currentStep,
            userData: onboardingState.userData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('entrenoapp_onboarding', JSON.stringify(dataToSave));
        debugLog('SAVE_PROGRESS', 'Progreso guardado');
    } catch (error) {
        debugLog('SAVE_ERROR', 'Error guardando progreso', error);
    }
}

// Renderizar contenido del onboarding
function renderOnboardingContent() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;

    const currentStepData = onboardingSteps[onboardingState.currentStep];
    const progress = ((onboardingState.currentStep + 1) / onboardingSteps.length) * 100;

    container.innerHTML = `
        <div class="onboarding-container">
            <!-- Barra de progreso -->
            <div class="progress-container mb-lg">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    Paso ${onboardingState.currentStep + 1} de ${onboardingSteps.length}
                </div>
            </div>

            <!-- Contenido del paso -->
            <div class="step-content glass-card">
                ${renderStepContent(currentStepData)}
            </div>

            <!-- Navegación -->
            <div class="step-navigation">
                ${onboardingState.currentStep > 0 ? `
                    <button id="prev-btn" class="glass-button glass-button-secondary">
                        ← Anterior
                    </button>
                ` : '<div></div>'}
                
                ${currentStepData.type !== 'welcome' ? `
                    <button id="next-btn" class="glass-button glass-button-primary" ${!canProceedToNext() ? 'disabled' : ''}>
                        ${onboardingState.currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Siguiente →'}
                    </button>
                ` : `
                    <button id="next-btn" class="glass-button glass-button-primary">
                        Comenzar →
                    </button>
                `}
            </div>

            ${onboardingState.error ? `
                <div class="error-message glass-card-error mt-md">
                    <span>⚠️ ${onboardingState.error}</span>
                </div>
            ` : ''}
        </div>
    `;
}

// Renderizar contenido específico del paso
function renderStepContent(stepData) {
    switch (stepData.type) {
        case 'welcome':
            return renderWelcomeStep(stepData);
        case 'selection':
            return renderSelectionStep(stepData);
        case 'multiple':
            return renderMultipleStep(stepData);
        default:
            return '<div>Tipo de paso no reconocido</div>';
    }
}

// Renderizar paso de bienvenida
function renderWelcomeStep(stepData) {
    return `
        <div class="welcome-step text-center">
            <div class="welcome-icon">${stepData.icon}</div>
            <h1 class="welcome-title">${stepData.title}</h1>
            <h2 class="welcome-subtitle">${stepData.subtitle}</h2>
            <p class="welcome-description">${stepData.description}</p>
        </div>
    `;
}

// Renderizar paso de selección única
function renderSelectionStep(stepData) {
    const selectedValue = onboardingState.userData[stepData.id];
    
    debugLog('RENDER_SELECTION', `Renderizando selección para ${stepData.id}`, {
        selectedValue,
        optionsCount: stepData.options.length
    });
    
    return `
        <div class="selection-step">
            <h2 class="step-title">${stepData.title}</h2>
            <p class="step-subtitle">${stepData.subtitle}</p>
            
            <div class="options-grid">
                ${stepData.options.map(option => {
                    debugLog('RENDER_OPTION', `Renderizando opción ${option.id}`);
                    return `
                        <div class="option-card ${selectedValue === option.id ? 'selected' : ''}" 
                             data-step="${stepData.id}" 
                             data-value="${option.id}"
                             data-multiple="false"
                             style="cursor: pointer;">
                            <div class="option-icon">${option.icon}</div>
                            <div class="option-content">
                                <h3 class="option-label">${option.label}</h3>
                                <p class="option-description">${option.description}</p>
                                ${option.features ? `
                                    <div class="option-features">
                                        ${option.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Renderizar paso de selección múltiple
function renderMultipleStep(stepData) {
    const selectedValues = onboardingState.userData[stepData.id] || [];
    
    debugLog('RENDER_MULTIPLE', `Renderizando selección múltiple para ${stepData.id}`, {
        selectedValues,
        optionsCount: stepData.options.length
    });
    
    return `
        <div class="multiple-step">
            <h2 class="step-title">${stepData.title}</h2>
            <p class="step-subtitle">${stepData.subtitle}</p>
            
            <div class="options-grid">
                ${stepData.options.map(option => `
                    <div class="option-card ${selectedValues.includes(option.id) ? 'selected' : ''}" 
                         data-step="${stepData.id}" 
                         data-value="${option.id}"
                         data-multiple="true"
                         style="cursor: pointer;">
                        <div class="option-icon">${option.icon}</div>
                        <div class="option-content">
                            <h3 class="option-label">${option.label}</h3>
                            ${option.description ? `<p class="option-description">${option.description}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Verificar si se puede proceder al siguiente paso
function canProceedToNext() {
    const currentStepData = onboardingSteps[onboardingState.currentStep];
    
    if (currentStepData.type === 'welcome') {
        return true;
    }
    
    const stepValue = onboardingState.userData[currentStepData.id];
    
    if (currentStepData.type === 'selection') {
        return stepValue != null;
    }
    
    if (currentStepData.type === 'multiple') {
        return Array.isArray(stepValue) && stepValue.length > 0;
    }
    
    return false;
}

// Variable para almacenar la función del listener
let onboardingClickHandler = null;

// Configurar listeners del onboarding
function setupOnboardingListeners() {
    debugLog('SETUP_LISTENERS', 'Configurando listeners del onboarding');
    
    const container = document.querySelector('.dashboard-container');
    if (!container) {
        debugLog('SETUP_ERROR', 'Container no encontrado para listeners');
        return;
    }
    
    // Remover listener anterior si existe
    if (onboardingClickHandler) {
        container.removeEventListener('click', onboardingClickHandler);
        debugLog('LISTENER_REMOVED', 'Listener anterior removido');
    }
    
    // Crear nuevo listener
    onboardingClickHandler = (e) => {
        debugLog('CLICK_EVENT', 'Click detectado', { 
            target: e.target.tagName,
            className: e.target.className,
            id: e.target.id
        });
        
        // Verificar si es una option-card o está dentro de una
        const optionCard = e.target.closest('.option-card');
        if (optionCard) {
            debugLog('OPTION_CLICK_DETECTED', 'Click en option-card');
            e.preventDefault();
            e.stopPropagation();
            handleOptionClick(e);
            return;
        }
        
        // Verificar botones
        if (e.target.id === 'next-btn') {
            debugLog('NEXT_BTN_CLICK', 'Click en botón siguiente');
            e.preventDefault();
            handleNext();
            return;
        }
        
        if (e.target.id === 'prev-btn') {
            debugLog('PREV_BTN_CLICK', 'Click en botón anterior');
            e.preventDefault();
            handlePrevious();
            return;
        }
    };
    
    // Agregar el nuevo listener
    container.addEventListener('click', onboardingClickHandler);
    
    debugLog('LISTENERS_OK', 'Listeners configurados exitosamente');
}

// Manejar click en opción
function handleOptionClick(e) {
    try {
        // Buscar la card desde el elemento clickeado
        const card = e.target.closest('.option-card');
        if (!card) {
            debugLog('CLICK_ERROR', 'No se encontró option-card');
            return;
        }
        
        const stepId = card.dataset.step;
        const value = card.dataset.value;
        const isMultiple = card.dataset.multiple === 'true';
        
        debugLog('OPTION_CLICK', `Opción seleccionada: ${value}`, { 
            stepId, 
            isMultiple, 
            currentUserData: onboardingState.userData 
        });
        
        if (!stepId || !value) {
            debugLog('CLICK_ERROR', 'Datos de la card incompletos', { stepId, value });
            return;
        }
        
        if (isMultiple) {
            // Selección múltiple
            if (!onboardingState.userData[stepId]) {
                onboardingState.userData[stepId] = [];
            }
            
            const selectedValues = onboardingState.userData[stepId];
            const index = selectedValues.indexOf(value);
            
            if (index > -1) {
                selectedValues.splice(index, 1);
                debugLog('OPTION_DESELECT', `Opción deseleccionada: ${value}`);
            } else {
                selectedValues.push(value);
                debugLog('OPTION_SELECT', `Opción añadida: ${value}`);
            }
            
            // Para selección múltiple, solo actualizar visual
            saveProgress();
            renderOnboardingContent();
            setupOnboardingListeners();
        } else {
            // Selección única - avanzar automáticamente
            onboardingState.userData[stepId] = value;
            debugLog('SINGLE_SELECT', `Selección única: ${value}`, {
                stepId,
                newUserData: onboardingState.userData
            });
            
            saveProgress();
            renderOnboardingContent();
            setupOnboardingListeners();
            
            // Avanzar automáticamente después de un breve delay
            setTimeout(() => {
                if (canProceedToNext()) {
                    debugLog('AUTO_ADVANCE', 'Avanzando al siguiente paso automáticamente');
                    handleNext();
                } else {
                    debugLog('AUTO_ADVANCE_BLOCKED', 'No se puede avanzar automáticamente');
                }
            }, 800); // 800ms para que el usuario vea la selección
        }
        
    } catch (error) {
        debugLog('OPTION_CLICK_ERROR', 'Error en handleOptionClick', {
            error: error.message,
            stack: error.stack
        });
    }
}

// Manejar siguiente paso
function handleNext() {
    debugLog('HANDLE_NEXT', `Ejecutado - Paso actual: ${onboardingState.currentStep}/${onboardingState.totalSteps - 1}`);
    
    if (!canProceedToNext()) {
        debugLog('CANNOT_PROCEED', 'No se puede proceder al siguiente paso', {
            currentStep: onboardingState.currentStep,
            userData: onboardingState.userData,
            currentStepData: onboardingSteps[onboardingState.currentStep]
        });
        return;
    }
    
    if (onboardingState.currentStep === onboardingSteps.length - 1) {
        // Finalizar onboarding
        debugLog('FINISH_START', 'Ejecutando finishOnboarding...');
        finishOnboarding();
    } else {
        // Siguiente paso
        onboardingState.currentStep++;
        debugLog('NEXT_STEP', `Avanzando al paso ${onboardingState.currentStep}`);
        saveProgress();
        renderOnboardingContent();
        setupOnboardingListeners();
    }
}

// Manejar paso anterior
function handlePrevious() {
    if (onboardingState.currentStep > 0) {
        onboardingState.currentStep--;
        saveProgress();
        renderOnboardingContent();
        setupOnboardingListeners();
    }
}

// Finalizar onboarding
async function finishOnboarding() {
    if (onboardingState.isLoading) {
        debugLog('ALREADY_LOADING', 'Onboarding ya está procesándose...');
        return;
    }
    
    onboardingState.isLoading = true;
    debugLog('FINISH_INIT', 'Iniciando finalización del onboarding...', onboardingState.userData);
    
    try {
        // Soporte modo invitado: si no hay auth o user, guardar localmente
        let user = null;
        if (auth && auth.currentUser) {
            user = auth.currentUser;
            debugLog('USER_AUTH', `Usuario autenticado: ${user.email}`);
        } else {
            debugLog('USER_GUEST', 'Sin autenticación: modo invitado');
        }
        
        // Generar plan personalizado automáticamente
        debugLog('PLAN_GENERATION_START', 'Generando plan personalizado...');
        const personalizedPlan = await generatePersonalizedPlan(onboardingState.userData);
        debugLog('PLAN_GENERATION_SUCCESS', 'Plan generado exitosamente', personalizedPlan);
        
        // Si hay usuario autenticado, guardar en Firestore; si no, usar localStorage
        debugLog('FIRESTORE_START', 'Guardando datos en Firestore...');
        if (user) {
            try {
                const userDoc = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userDoc);
                debugLog('USER_DOC_CHECK', `Documento existe: ${userSnap.exists()}`);
                const userData = {
                    onboarding: {
                        completed: true,
                        completedAt: serverTimestamp(),
                        responses: onboardingState.userData
                    },
                    preferences: {
                        ...getPreferencesFromOnboarding(onboardingState.userData),
                        language: 'es',
                        units: 'metric'
                    },
                    activePlan: personalizedPlan,
                    updatedAt: serverTimestamp()
                };
                if (userSnap.exists()) {
                    await updateDoc(userDoc, userData);
                } else {
                    userData.createdAt = serverTimestamp();
                    userData.profile = {
                        displayName: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL || null
                    };
                    userData.stats = { totalWorkouts: 0, currentStreak: 0, totalPoints: 0, completedChallenges: 0 };
                    await setDoc(userDoc, userData);
                }
                debugLog('FIRESTORE_SUCCESS', 'Datos guardados en Firestore');
                localStorage.setItem('entrenoapp_active_plan', JSON.stringify(personalizedPlan));
            } catch (firestoreError) {
                // Fallback silencioso: continuar en modo local para no romper la UX
                debugLog('FIRESTORE_FAIL', 'Fallo guardando en Firestore, usando localStorage', {
                    error: firestoreError.message
                });
                localStorage.setItem('entrenoapp_active_plan', JSON.stringify(personalizedPlan));
                localStorage.setItem('entrenoapp_onboarding_complete', 'true');
            }
        } else {
            // Modo invitado: solo localStorage
            localStorage.setItem('entrenoapp_active_plan', JSON.stringify(personalizedPlan));
            localStorage.setItem('entrenoapp_onboarding_complete', 'true');
        }
        
        // Limpiar workouts antiguos para que se generen con la nueva duración
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gym_workout_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Limpiar datos de onboarding de localStorage
        localStorage.removeItem('entrenoapp_onboarding');
        localStorage.setItem('entrenoapp_onboarding_complete', 'true');
        
        debugLog('SUCCESS_COMPLETE', 'Onboarding completado exitosamente');
        
        // Mostrar mensaje de éxito con el plan generado
        showSuccess(personalizedPlan);
        
        // Redirigir al dashboard después de un momento
        setTimeout(() => {
            if (window.navigateToPage) {
                window.navigateToPage('dashboard');
            } else {
                console.error('❌ window.navigateToPage no está disponible');
                window.location.href = '#/dashboard';
            }
        }, 4000);
        
    } catch (error) {
        debugLog('FINISH_ERROR', 'Error finalizando onboarding', {
            error: error.message,
            stack: error.stack,
            userData: onboardingState.userData
        });
        
        if (window.debugLogger) {
            window.debugLogger.logError('ONBOARDING_FINISH', error.message, {
                stack: error.stack,
                userData: onboardingState.userData,
                currentStep: onboardingState.currentStep
            });
        }
        
        // RESCATE: Intentar generar y guardar plan de todos modos, incluso si hay error
        try {
            debugLog('RESCUE_START', 'Intentando rescate: generando plan de todos modos...');
            const rescuePlan = await generatePersonalizedPlan(onboardingState.userData);
            if (rescuePlan && typeof rescuePlan === 'object') {
                localStorage.setItem('entrenoapp_active_plan', JSON.stringify(rescuePlan));
                localStorage.setItem('entrenoapp_onboarding_complete', 'true');
                localStorage.removeItem('entrenoapp_onboarding');
                debugLog('RESCUE_SUCCESS', 'Plan rescatado y guardado exitosamente');
                // Redirigir al dashboard en lugar de mostrar error
                setTimeout(() => {
                    if (window.navigateToPage) {
                        window.navigateToPage('dashboard');
                    } else {
                        window.location.href = '#/dashboard';
                    }
                }, 1000);
                return; // Salir sin mostrar error
            }
        } catch (rescueError) {
            debugLog('RESCUE_FAIL', 'No se pudo rescatar el plan', rescueError);
            // Continuar con el flujo de error normal
        }
        
        onboardingState.error = 'Error guardando tu perfil. Intenta de nuevo.';
        renderOnboardingContent();
        setupOnboardingListeners();
    } finally {
        onboardingState.isLoading = false;
        debugLog('FINISH_COMPLETE', 'Finalización completada (con éxito o error)');
        // Garantizar que exista un plan en modo invitado (última red de seguridad)
        try {
            const hasPlan = !!localStorage.getItem('entrenoapp_active_plan');
            if (!hasPlan && onboardingState.userData && Object.keys(onboardingState.userData).length > 0) {
                // Intentar generar plan con datos del usuario primero
                generatePersonalizedPlan(onboardingState.userData)
                    .then(plan => {
                        if (plan && typeof plan === 'object') {
                            localStorage.setItem('entrenoapp_active_plan', JSON.stringify(plan));
                            localStorage.setItem('entrenoapp_onboarding_complete', 'true');
                            debugLog('FALLBACK_PLAN_CREATED', 'Plan personalizado creado en finally con datos del usuario');
                            // Solo navegar si no se navegó ya antes
                            setTimeout(() => {
                                if (window.navigateToPage && window.location.hash !== '#/dashboard') {
                                    window.navigateToPage('dashboard');
                                }
                            }, 500);
                        } else {
                            // Fallback a plan genérico si no se pudo generar con datos del usuario
                            const fallbackPlan = generateDefaultPlan();
                            localStorage.setItem('entrenoapp_active_plan', JSON.stringify(fallbackPlan));
                            localStorage.setItem('entrenoapp_onboarding_complete', 'true');
                            debugLog('FALLBACK_PLAN_CREATED', 'Plan genérico creado en finally');
                        }
                    })
                    .catch(e => {
                        console.warn('No se pudo generar plan en finally:', e);
                        // Último recurso: plan genérico
                        try {
                            const fallbackPlan = generateDefaultPlan();
                            localStorage.setItem('entrenoapp_active_plan', JSON.stringify(fallbackPlan));
                            localStorage.setItem('entrenoapp_onboarding_complete', 'true');
                        } catch (finalError) {
                            console.error('Error crítico: no se pudo crear ningún plan', finalError);
                        }
                    });
            } else if (!hasPlan) {
                // Si no hay datos del usuario, generar plan genérico
                const fallbackPlan = generateDefaultPlan();
                localStorage.setItem('entrenoapp_active_plan', JSON.stringify(fallbackPlan));
                localStorage.setItem('entrenoapp_onboarding_complete', 'true');
                debugLog('FALLBACK_PLAN_CREATED', 'Plan genérico creado en finally (sin datos de usuario)');
            }
        } catch (e) {
            console.warn('No se pudo asegurar plan tras finalizar onboarding:', e);
        }
    }
}

// Generar plan personalizado basado en las respuestas
async function generatePersonalizedPlan(userData) {
    try {
        debugLog('PLAN_GENERATION', 'Generando plan personalizado...', userData);
        
        const planType = userData.plan_type;
        const experience = userData.experience || 'beginner';
        const frequency = userData.frequency || 'medium';
        const sessionTime = userData.session_time || 'medium';
        const equipment = userData.equipment || [];
        
        // Determinar configuración del plan
        const planConfig = {
            planType,
            experience,
            frequency,
            sessionTime,
            equipment,
            duration: getDurationForPlan(planType, experience),
            weeklyFrequency: getWeeklyFrequency(frequency)
        };
        
        let plan = {};
        
        // Generar plan según tipo seleccionado
        switch (planType) {
            case 'running':
                plan = generateRunningPlan(planConfig);
                break;
            case 'functional':
                plan = generateFunctionalPlan(planConfig);
                break;
            case 'gym':
            default:
                plan = generateGymPlan(planConfig);
                break;
        }
        
        // Agregar metadatos del plan
        plan.metadata = {
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true,
            planType: planType,
            experience: experience,
            frequency: frequency,
            sessionTime: sessionTime,
            equipment: equipment
        };
        
        return plan;
        
    } catch (error) {
        debugLog('PLAN_GENERATION_ERROR', 'Error generando plan', error);
        return generateDefaultPlan();
    }
}

// Determinar duración del plan
function getDurationForPlan(planType, experience) {
    const durations = {
        'running': { 'beginner': 8, 'intermediate': 12, 'advanced': 16 },
        'functional': { 'beginner': 6, 'intermediate': 10, 'advanced': 12 },
        'gym': { 'beginner': 8, 'intermediate': 12, 'advanced': 16 }
    };
    
    return durations[planType]?.[experience] || 8;
}

// Determinar frecuencia semanal
function getWeeklyFrequency(frequency) {
    const frequencies = {
        'low': 3,
        'medium': 4,
        'high': 6
    };
    
    return frequencies[frequency] || 4;
}

// Generar plan de running
function generateRunningPlan(config) {
    return {
        type: 'running',
        name: `Plan de Running ${getExperienceLabel(config.experience)}`,
        description: `Plan de ${config.duration} semanas para mejorar tu rendimiento en carrera`,
        duration: config.duration,
        frequency: config.weeklyFrequency,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: 'endurance',
        equipment: config.equipment,
        progressTracking: {
            totalDistance: 0,
            totalTime: 0,
            averagePace: 0,
            personalRecords: {}
        }
    };
}

// Generar plan funcional
function generateFunctionalPlan(config) {
    // Usar el generador avanzado si está disponible
    if (window.generateFunctionalPlan) {
        try {
            const advancedPlan = window.generateFunctionalPlan({
                experience: config.experience,
                frequency: mapFrequencyToLevel(config.weeklyFrequency),
                sessionTime: getSessionTime(config.sessionTime),
                equipment: config.equipment || []
            });
            
            debugLog('FUNCTIONAL_PLAN_GENERATED', 'Plan avanzado generado', advancedPlan);
            return advancedPlan;
        } catch (error) {
            debugLog('FUNCTIONAL_PLAN_ERROR', 'Error generando plan avanzado, usando fallback', error);
        }
    }
    
    // Fallback: plan básico mejorado
    return {
        type: 'functional',
        name: `Plan Funcional ${getExperienceLabel(config.experience)}`,
        description: `Plan de ${config.duration} semanas con WODs y entrenamientos funcionales`,
        duration: config.duration,
        frequency: config.weeklyFrequency,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: 'conditioning',
        equipment: config.equipment,
        difficulty: config.experience,
        metadata: {
            planType: 'functional',
            experience: config.experience,
            sessionTime: config.sessionTime,
            frequency: mapFrequencyToLevel(config.weeklyFrequency),
            equipment: config.equipment || [],
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true
        },
        progressTracking: {
            totalWods: 0,
            totalTime: 0,
            personalRecords: {},
            wodsCompleted: [],
            averageScore: 0
        }
    };
}

// Generar plan de gym inteligente
function generateGymPlan(config) {
    // Importar el generador avanzado dinámicamente
    if (window.generateGymPlanAdvanced) {
        try {
            const advancedPlan = window.generateGymPlanAdvanced({
                experience: config.experience,
                frequency: mapFrequencyToLevel(config.weeklyFrequency),
                session_time: getSessionTime(config.sessionTime),
                equipment: config.equipment || [],
                goals: ['hypertrophy'] // Por defecto hipertrofia
            });
            
            debugLog('GYM_PLAN_GENERATED', 'Plan avanzado generado', advancedPlan);
            return advancedPlan;
        } catch (error) {
            debugLog('GYM_PLAN_ERROR', 'Error generando plan avanzado, usando fallback', error);
        }
    }
    
    // Fallback: plan básico mejorado
    return {
        type: 'gym',
        name: `Plan de Gimnasio ${getExperienceLabel(config.experience)}`,
        description: `Plan de ${config.duration} semanas para musculación y fuerza`,
        duration: config.duration,
        frequency: config.weeklyFrequency,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: 'strength',
        equipment: config.equipment,
        metadata: {
            planType: 'gym',
            experience: config.experience,
            sessionTime: config.sessionTime,
            frequency: mapFrequencyToLevel(config.weeklyFrequency),
            equipment: config.equipment || [],
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true
        },
        progressTracking: {
            totalWorkouts: 0,
            totalVolume: 0,
            totalTime: 0,
            personalRecords: {},
            strengthProgression: {}
        }
    };
}

// Mapear frecuencia numérica a nivel
function mapFrequencyToLevel(weeklyFreq) {
    if (weeklyFreq <= 2) return 'low';
    if (weeklyFreq <= 4) return 'medium';
    return 'high';
}

// Obtener tiempo de sesión 
function getSessionTime(sessionTime) {
    // Mapear session_time del onboarding a duración en minutos
    const sessionTimeMap = {
        'short': 30,     // 30-45 min -> 30 min
        'medium': 45,    // 45-60 min -> 45 min  
        'long': 60       // 60+ min -> 60 min
    };
    
    return sessionTimeMap[sessionTime] || 45; // Default 45 min
}

// Plan por defecto
function generateDefaultPlan() {
    return {
        type: 'gym',
        name: 'Plan Básico de Gimnasio',
        description: 'Plan general de fitness',
        duration: 8,
        frequency: 4,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: 'general',
        equipment: ['gym_access'],
        progressTracking: {
            totalWorkouts: 0,
            totalVolume: 0,
            personalRecords: {}
        }
    };
}

// Obtener etiqueta de experiencia
function getExperienceLabel(experience) {
    const labels = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio', 
        'advanced': 'Avanzado'
    };
    return labels[experience] || 'Principiante';
}

// Convertir respuestas del onboarding en preferencias
function getPreferencesFromOnboarding(responses) {
    return {
        planType: responses.plan_type || 'gym',
        experience: responses.experience || 'beginner',
        sessionTime: responses.session_time || 'medium',
        frequency: responses.frequency || 'medium',
        equipment: responses.equipment || [],
        notifications: {
            workouts: true,
            achievements: true,
            challenges: true
        }
    };
}

// Mostrar mensaje de éxito
function showSuccess(personalizedPlan = null) {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;

    container.innerHTML = `
        <div class="success-container text-center">
            <div class="success-animation">
                <div class="success-icon">🎉</div>
                <h1 class="success-title">¡Plan Personalizado Creado!</h1>
                <p class="success-message">
                    Tu plan de entrenamiento ha sido generado exitosamente
                </p>
                
                ${personalizedPlan ? `
                    <div class="generated-plan glass-card mt-lg">
                        <h3 class="plan-title">${personalizedPlan.name}</h3>
                        <p class="plan-description">${personalizedPlan.description}</p>
                        <div class="plan-stats">
                            <div class="plan-stat">
                                <span class="stat-label">Duración</span>
                                <span class="stat-value">${personalizedPlan.duration} semanas</span>
                            </div>
                            <div class="plan-stat">
                                <span class="stat-label">Frecuencia</span>
                                <span class="stat-value">${personalizedPlan.frequency} días/semana</span>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <p class="redirect-message mt-md">
                    Redirigiendo al dashboard en unos segundos...
                </p>
            </div>
        </div>
    `;
}

console.log('📋 Onboarding v2 rediseñado cargado');
