// Sistema de onboarding para EntrenoApp
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

// Datos del onboarding
const onboardingSteps = [
    {
        id: 'welcome',
        title: '¡Bienvenido a EntrenoApp!',
        subtitle: 'Tu compañero integral de fitness',
        type: 'welcome'
    },
    {
        id: 'experience',
        title: '¿Cuál es tu nivel de experiencia?',
        subtitle: 'Esto nos ayuda a personalizar tus entrenamientos',
        type: 'selection',
        options: [
            { id: 'beginner', label: 'Principiante', description: 'Nuevo en fitness o retomando', icon: '🌱' },
            { id: 'intermediate', label: 'Intermedio', description: '6 meses - 2 años de experiencia', icon: '💪' },
            { id: 'advanced', label: 'Avanzado', description: 'Más de 2 años de experiencia', icon: '🔥' }
        ]
    },
    {
        id: 'goals',
        title: '¿Cuáles son tus objetivos?',
        subtitle: 'Puedes seleccionar múltiples opciones',
        type: 'multiple',
        options: [
            { id: 'weight_loss', label: 'Perder peso', icon: '⚖️' },
            { id: 'muscle_gain', label: 'Ganar músculo', icon: '💪' },
            { id: 'endurance', label: 'Mejorar resistencia', icon: '🏃' },
            { id: 'strength', label: 'Aumentar fuerza', icon: '🏋️' },
            { id: 'flexibility', label: 'Flexibilidad', icon: '🧘' },
            { id: 'health', label: 'Salud general', icon: '❤️' }
        ]
    },
    {
        id: 'activities',
        title: '¿Qué actividades te interesan?',
        subtitle: 'Selecciona tus preferencias de entrenamiento',
        type: 'multiple',
        options: [
            { id: 'running', label: 'Running/Cardio', icon: '🏃‍♂️' },
            { id: 'weightlifting', label: 'Pesas/Gym', icon: '🏋️‍♀️' },
            { id: 'functional', label: 'Entrenamiento Funcional', icon: '🤸‍♂️' },
            { id: 'yoga', label: 'Yoga/Pilates', icon: '🧘‍♀️' },
            { id: 'martial_arts', label: 'Artes marciales', icon: '🥋' },
            { id: 'sports', label: 'Deportes', icon: '⚽' }
        ]
    },
    {
        id: 'availability',
        title: '¿Cuánto tiempo puedes entrenar?',
        subtitle: 'Esto nos ayuda a crear planes realistas',
        type: 'selection',
        options: [
            { id: 'low', label: '15-30 min', description: '2-3 veces por semana', icon: '⏰' },
            { id: 'medium', label: '30-60 min', description: '3-4 veces por semana', icon: '⏱️' },
            { id: 'high', label: '60+ min', description: '4-6 veces por semana', icon: '⏳' },
            { id: 'athlete', label: 'Atleta', description: 'Entrenamientos diarios', icon: '🏆' }
        ]
    },
    {
        id: 'equipment',
        title: '¿Qué equipo tienes disponible?',
        subtitle: 'Adaptaremos los ejercicios a tu equipamiento',
        type: 'multiple',
        options: [
            { id: 'bodyweight', label: 'Solo peso corporal', icon: '🤸' },
            { id: 'dumbbells', label: 'Mancuernas', icon: '🏋️' },
            { id: 'barbell', label: 'Barra olímpica', icon: '🏋️‍♂️' },
            { id: 'resistance_bands', label: 'Bandas elásticas', icon: '🔗' },
            { id: 'gym_access', label: 'Acceso a gimnasio', icon: '🏢' },
            { id: 'home_gym', label: 'Gimnasio casero', icon: '🏠' }
        ]
    }
];

// Inicializar página de onboarding
window.initOnboardingPage = function() {
    debugLog('INIT', 'Inicializando onboarding');
    
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
};

// Cargar progreso guardado
function loadSavedProgress() {
    try {
        const savedData = localStorage.getItem('entrenoapp_onboarding');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            onboardingState.currentStep = parsed.currentStep || 0;
            onboardingState.userData = parsed.userData || {};
        }
    } catch (error) {
        console.error('❌ Error cargando progreso de onboarding:', error);
    }
}

// Guardar progreso
function saveProgress() {
    try {
        const dataToSave = {
            currentStep: onboardingState.currentStep,
            userData: onboardingState.userData,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('entrenoapp_onboarding', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('❌ Error guardando progreso:', error);
    }
}

// Renderizar contenido del onboarding
function renderOnboardingContent() {
    const onboardingContent = document.getElementById('onboarding-content');
    
    if (!onboardingContent) {
        console.error('❌ No se encontró el contenedor de onboarding');
        return;
    }
    
    const currentStepData = onboardingSteps[onboardingState.currentStep];
    
    let content = `
        <div class="onboarding-container glass-fade-in">
            ${renderProgressBar()}
            ${renderStepContent(currentStepData)}
            ${renderNavigationButtons()}
        </div>
    `;
    
    onboardingContent.innerHTML = content;
    setupStepListeners();
}

// Renderizar barra de progreso
function renderProgressBar() {
    const progress = ((onboardingState.currentStep + 1) / onboardingState.totalSteps) * 100;
    
    return `
        <div class="progress-container mb-lg">
            <div class="progress-bar glass-card">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text text-center mt-sm">
                <span class="text-secondary">Paso ${onboardingState.currentStep + 1} de ${onboardingState.totalSteps}</span>
            </div>
        </div>
    `;
}

// Renderizar contenido del paso actual
function renderStepContent(stepData) {
    let content = `
        <div class="step-header text-center mb-lg">
            <h2 class="step-title">${stepData.title}</h2>
            <p class="step-subtitle text-secondary">${stepData.subtitle}</p>
        </div>
    `;
    
    switch (stepData.type) {
        case 'welcome':
            content += renderWelcomeStep();
            break;
        case 'selection':
            content += renderSelectionStep(stepData);
            break;
        case 'multiple':
            content += renderMultipleStep(stepData);
            break;
        default:
            content += '<p>Paso no implementado</p>';
    }
    
    return content;
}

// Renderizar paso de bienvenida
function renderWelcomeStep() {
    return `
        <div class="welcome-step text-center">
            <div class="welcome-icon mb-lg">
                <span style="font-size: 4rem;">💪</span>
            </div>
            <div class="welcome-features glass-card p-lg mb-lg">
                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">🏃‍♂️</span>
                        <span class="feature-text">GPS Tracking</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏋️‍♀️</span>
                        <span class="feature-text">Entrenamientos</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏆</span>
                        <span class="feature-text">Retos Diarios</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <span class="feature-text">Progreso</span>
                    </div>
                </div>
            </div>
            <p class="welcome-text text-secondary">
                Configuremos tu perfil para ofrecerte la mejor experiencia personalizada
            </p>
        </div>
    `;
}

// Renderizar paso de selección única
function renderSelectionStep(stepData) {
    const selectedValue = onboardingState.userData[stepData.id];
    
    let content = '<div class="selection-options">';
    
    stepData.options.forEach(option => {
        const isSelected = selectedValue === option.id;
        content += `
            <div class="option-card glass-card ${isSelected ? 'selected' : ''}" 
                 data-step="${stepData.id}" 
                 data-value="${option.id}">
                <div class="option-icon">${option.icon}</div>
                <div class="option-content">
                    <h3 class="option-label">${option.label}</h3>
                    <p class="option-description text-secondary">${option.description}</p>
                </div>
                <div class="option-check">
                    ${isSelected ? '✓' : ''}
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    return content;
}

// Renderizar paso de selección múltiple
function renderMultipleStep(stepData) {
    const selectedValues = onboardingState.userData[stepData.id] || [];
    
    let content = '<div class="multiple-options">';
    
    stepData.options.forEach(option => {
        const isSelected = selectedValues.includes(option.id);
        content += `
            <div class="option-card glass-card ${isSelected ? 'selected' : ''}" 
                 data-step="${stepData.id}" 
                 data-value="${option.id}"
                 data-multiple="true">
                <div class="option-icon">${option.icon}</div>
                <div class="option-content">
                    <h3 class="option-label">${option.label}</h3>
                </div>
                <div class="option-check">
                    ${isSelected ? '✓' : ''}
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    return content;
}

// Renderizar botones de navegación
function renderNavigationButtons() {
    const isFirstStep = onboardingState.currentStep === 0;
    const isLastStep = onboardingState.currentStep === onboardingState.totalSteps - 1;
    const canProceed = canProceedToNext();
    
    return `
        <div class="navigation-buttons">
            ${!isFirstStep ? `
                <button id="btn-previous" class="glass-button glass-button-secondary">
                    ← Anterior
                </button>
            ` : ''}
            
            <button id="btn-next" 
                    class="glass-button glass-button-primary ${!canProceed ? 'disabled' : ''}"
                    ${!canProceed ? 'disabled' : ''}>
                ${isLastStep ? 'Finalizar' : 'Siguiente →'}
            </button>
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

// Configurar listeners del paso actual
function setupStepListeners() {
    // Listeners para opciones
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', handleOptionClick);
    });
}

// Configurar listeners de navegación
function setupOnboardingListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-next') {
            e.preventDefault();
            handleNext();
        } else if (e.target.id === 'btn-previous') {
            e.preventDefault();
            handlePrevious();
        }
    });
}

// Manejar click en opción
function handleOptionClick(e) {
    const card = e.currentTarget;
    const stepId = card.dataset.step;
    const value = card.dataset.value;
    const isMultiple = card.dataset.multiple === 'true';
    
    debugLog('OPTION_CLICK', `Opción seleccionada: ${value}`, { stepId, isMultiple });
    
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
    } else {
        // Selección única - avanzar automáticamente
        onboardingState.userData[stepId] = value;
        debugLog('SINGLE_SELECT', `Selección única: ${value}, avanzando automáticamente...`);
        
        saveProgress();
        renderOnboardingContent();
        
        // Avanzar automáticamente después de un breve delay
        setTimeout(() => {
            if (canProceedToNext()) {
                debugLog('AUTO_ADVANCE', 'Avanzando al siguiente paso automáticamente');
                handleNext();
            }
        }, 800); // 800ms para que el usuario vea la selección
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
    
    if (onboardingState.currentStep === onboardingState.totalSteps - 1) {
        // Finalizar onboarding
        debugLog('FINISH_START', 'Ejecutando finishOnboarding...');
        finishOnboarding();
    } else {
        // Siguiente paso
        onboardingState.currentStep++;
        debugLog('NEXT_STEP', `Avanzando al paso ${onboardingState.currentStep}`);
        saveProgress();
        renderOnboardingContent();
    }
}

// Manejar paso anterior
function handlePrevious() {
    if (onboardingState.currentStep > 0) {
        onboardingState.currentStep--;
        saveProgress();
        renderOnboardingContent();
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
        // Verificar autenticación
        if (!auth) {
            throw new Error('Firebase auth no está disponible');
        }
        debugLog('AUTH_CHECK', 'Firebase auth disponible');
        
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuario no autenticado');
        }
        debugLog('USER_AUTH', `Usuario autenticado: ${user.email}`);
        
        // Generar plan personalizado automáticamente
        debugLog('PLAN_GENERATION_START', 'Generando plan personalizado...');
        const personalizedPlan = await generatePersonalizedPlan(onboardingState.userData);
        debugLog('PLAN_GENERATION_SUCCESS', 'Plan generado exitosamente', personalizedPlan);
        
        // Crear/actualizar perfil en Firestore
        debugLog('FIRESTORE_START', 'Guardando datos en Firestore...');
        const userDoc = doc(db, 'users', user.uid);
        
        // Verificar si el documento existe
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
            // Documento existe, actualizar
            debugLog('FIRESTORE_UPDATE', 'Actualizando documento existente');
            await updateDoc(userDoc, userData);
        } else {
            // Documento no existe, crear
            debugLog('FIRESTORE_CREATE', 'Creando nuevo documento de usuario');
            userData.createdAt = serverTimestamp();
            userData.profile = {
                displayName: user.displayName || user.email.split('@')[0],
                email: user.email,
                photoURL: user.photoURL || null
            };
            userData.stats = {
                totalWorkouts: 0,
                currentStreak: 0,
                totalPoints: 0,
                completedChallenges: 0
            };
            await setDoc(userDoc, userData);
        }
        
        debugLog('FIRESTORE_SUCCESS', 'Datos guardados exitosamente en Firestore');
        
        // Guardar plan en localStorage para acceso rápido
        localStorage.setItem('entrenoapp_active_plan', JSON.stringify(personalizedPlan));
        
        // Limpiar datos de onboarding de localStorage
        localStorage.removeItem('entrenoapp_onboarding');
        
        console.log('✅ Onboarding completado con plan personalizado:', personalizedPlan);
        
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
        
        onboardingState.error = 'Error guardando tu perfil. Intenta de nuevo.';
        renderOnboardingContent();
    } finally {
        onboardingState.isLoading = false;
        debugLog('FINISH_COMPLETE', 'Finalización completada (con éxito o error)');
    }
}

// Convertir respuestas del onboarding en preferencias
function getPreferencesFromOnboarding(responses) {
    return {
        experience: responses.experience || 'beginner',
        goals: responses.goals || [],
        activities: responses.activities || [],
        availability: responses.availability || 'medium',
        equipment: responses.equipment || ['bodyweight'],
        notifications: {
            workouts: true,
            challenges: true,
            social: true,
            achievements: true
        },
        privacy: {
            showProfile: true,
            showWorkouts: true,
            showAchievements: true
        }
    };
}

// Generar plan personalizado basado en las respuestas del onboarding
async function generatePersonalizedPlan(userData) {
    try {
        console.log('🎯 Generando plan personalizado...', userData);
        
        const primaryActivity = userData.activities[0] || 'gym';
        const experience = userData.experience || 'beginner';
        const availability = userData.availability || 'medium';
        const goals = userData.goals || [];
        
        // Determinar duración del plan basado en disponibilidad
        const planDuration = {
            'low': 4,      // 4 semanas
            'medium': 8,   // 8 semanas 
            'high': 12     // 12 semanas
        }[availability] || 8;
        
        // Determinar frecuencia semanal
        const weeklyFrequency = {
            'low': 3,      // 3 días por semana
            'medium': 4,   // 4 días por semana
            'high': 5      // 5 días por semana
        }[availability] || 4;
        
        // Determinar duración de la sesión en minutos
        const sessionDuration = {
            'low': 30,     // 15-30 min -> 30 min
            'medium': 45,  // 30-60 min -> 45 min
            'high': 60,    // 60+ min -> 60 min
            'athlete': 75  // Atleta -> 75 min
        }[availability] || 45;
        
        let plan = {};
        
        // Generar plan según actividad principal
        switch (primaryActivity) {
            case 'running':
                plan = generateRunningPlan(experience, planDuration, weeklyFrequency, goals, sessionDuration);
                break;
            case 'functional':
                plan = generateFunctionalPlan(experience, planDuration, weeklyFrequency, goals, userData.equipment, sessionDuration);
                break;
            case 'gym':
            default:
                plan = generateGymPlan(experience, planDuration, weeklyFrequency, goals, userData.equipment, sessionDuration);
                break;
        }
        
        // Agregar metadatos del plan
        plan.metadata = {
            generatedAt: new Date().toISOString(),
            basedOnOnboarding: true,
            primaryActivity: primaryActivity,
            experience: experience,
            availability: availability,
            goals: goals,
            planDuration: planDuration,
            weeklyFrequency: weeklyFrequency
        };
        
        console.log('✅ Plan personalizado generado:', plan);
        return plan;
        
    } catch (error) {
        console.error('❌ Error generando plan personalizado:', error);
        // Plan por defecto si hay error
        return generateDefaultPlan();
    }
}

// Generar plan de running personalizado
function generateRunningPlan(experience, duration, frequency, goals, sessionDuration = 45) {
    const isWeightLoss = goals.includes('lose_weight');
    const isEndurance = goals.includes('improve_endurance');
    const isSpeed = goals.includes('get_stronger'); // Adaptamos fuerza a velocidad para running
    
    let targetDistance = {
        'beginner': isEndurance ? 10 : 5,    // 5-10km objetivo
        'intermediate': isEndurance ? 21 : 10, // 10-21km objetivo  
        'advanced': isEndurance ? 42 : 21     // 21-42km objetivo
    }[experience] || 5;
    
    return {
        type: 'running',
        name: `Plan de Running ${experience} - ${targetDistance}km`,
        description: `Plan personalizado de ${duration} semanas para alcanzar ${targetDistance}km`,
        targetDistance: targetDistance,
        duration: duration,
        frequency: frequency,
        sessionDuration: sessionDuration, // Duración de cada sesión en minutos
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: isWeightLoss ? 'weight_loss' : isSpeed ? 'speed' : 'endurance',
        progressTracking: {
            totalSessions: 0,
            completedSessions: 0,
            totalDistance: 0,
            averagePace: 0,
            bestDistance: 0
        }
    };
}

// Generar plan de entrenamiento funcional
function generateFunctionalPlan(experience, duration, frequency, goals, equipment, sessionDuration = 45) {
    const isStrength = goals.includes('get_stronger');
    const isWeightLoss = goals.includes('lose_weight');
    const isEndurance = goals.includes('improve_endurance');
    
    let intensity = {
        'beginner': 'moderate',
        'intermediate': 'high',
        'advanced': 'very_high'
    }[experience] || 'moderate';
    
    const hasEquipment = equipment.some(eq => eq !== 'bodyweight');
    
    return {
        type: 'functional',
        name: `Plan Funcional ${experience} - ${duration} semanas`,
        description: `Entrenamiento funcional personalizado con ${hasEquipment ? 'equipamiento' : 'peso corporal'}`,
        duration: duration,
        frequency: frequency,
        sessionDuration: sessionDuration, // Duración de cada sesión en minutos
        intensity: intensity,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: isStrength ? 'strength' : isWeightLoss ? 'weight_loss' : 'general_fitness',
        equipment: equipment,
        progressTracking: {
            totalWorkouts: 0,
            completedWorkouts: 0,
            totalExercises: 0,
            averageIntensity: 0,
            personalRecords: {}
        }
    };
}

// Generar plan de gimnasio
function generateGymPlan(experience, duration, frequency, goals, equipment, sessionDuration = 45) {
    const isStrength = goals.includes('get_stronger');
    const isMuscle = goals.includes('build_muscle');
    const isWeightLoss = goals.includes('lose_weight');
    
    let split = 'full_body'; // Por defecto cuerpo completo
    
    if (frequency >= 4) {
        split = isStrength || isMuscle ? 'upper_lower' : 'push_pull_legs';
    }
    if (frequency >= 5) {
        split = 'body_parts';
    }
    
    return {
        type: 'gym',
        name: `Plan de Gimnasio ${experience} - ${split.replace('_', ' ')}`,
        description: `Plan de ${duration} semanas con rutina ${split.replace('_', ' ')}`,
        split: split,
        duration: duration,
        frequency: frequency,
        sessionDuration: sessionDuration, // Duración de cada sesión en minutos
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: isStrength ? 'strength' : isMuscle ? 'muscle_building' : 'general_fitness',
        equipment: equipment,
        progressTracking: {
            totalWorkouts: 0,
            completedWorkouts: 0,
            totalSets: 0,
            totalReps: 0,
            volumeLifted: 0,
            personalRecords: {}
        }
    };
}

// Plan por defecto en caso de error
function generateDefaultPlan() {
    return {
        type: 'gym',
        name: 'Plan Básico de Inicio',
        description: 'Plan general para comenzar tu entrenamiento',
        duration: 6,
        frequency: 3,
        currentWeek: 1,
        currentSession: 1,
        status: 'active',
        startDate: new Date().toISOString(),
        focus: 'general_fitness',
        equipment: ['bodyweight'],
        progressTracking: {
            totalWorkouts: 0,
            completedWorkouts: 0
        }
    };
}

// Mostrar mensaje de éxito
function showSuccess(personalizedPlan = null) {
    const onboardingContent = document.getElementById('onboarding-content');
    
    const planInfo = personalizedPlan ? `
        <div class="generated-plan glass-card p-lg mb-lg">
            <h3 class="plan-title mb-md">🎯 Tu Plan Personalizado</h3>
            <div class="plan-details">
                <div class="plan-name">${personalizedPlan.name}</div>
                <p class="plan-description text-secondary">${personalizedPlan.description}</p>
                <div class="plan-stats">
                    <div class="plan-stat">
                        <span class="stat-label">Duración:</span>
                        <span class="stat-value">${personalizedPlan.duration} semanas</span>
                    </div>
                    <div class="plan-stat">
                        <span class="stat-label">Frecuencia:</span>
                        <span class="stat-value">${personalizedPlan.frequency}x por semana</span>
                    </div>
                    <div class="plan-stat">
                        <span class="stat-label">Tipo:</span>
                        <span class="stat-value">${getActivityLabel(personalizedPlan.type)}</span>
                    </div>
                </div>
            </div>
        </div>
    ` : '';
    
    onboardingContent.innerHTML = `
        <div class="success-container text-center glass-fade-in">
            <div class="success-icon mb-lg">
                <span style="font-size: 4rem;">🎉</span>
            </div>
            <h2 class="success-title mb-md">¡Todo listo!</h2>
            <p class="success-text text-secondary mb-lg">
                Hemos creado tu plan personalizado basado en tus preferencias
            </p>
            
            ${planInfo}
            
            <div class="success-features glass-card p-lg">
                <p class="text-secondary mb-md">Tu EntrenoApp incluye:</p>
                <div class="feature-list">
                    <div class="feature-item">✅ Plan personalizado automático</div>
                    <div class="feature-item">✅ Retos diarios adaptativos</div>
                    <div class="feature-item">✅ Seguimiento GPS profesional</div>
                    <div class="feature-item">✅ Sistema social y rankings</div>
                </div>
            </div>
            <div class="loading-indicator mt-lg">
                <div class="loading-spinner"></div>
                <p class="text-secondary">Preparando tu dashboard personalizado...</p>
            </div>
        </div>
    `;
}

// Obtener etiqueta de actividad
function getActivityLabel(type) {
    const labels = {
        'running': 'Running',
        'functional': 'Entrenamiento Funcional',
        'gym': 'Gimnasio'
    };
    return labels[type] || 'Entrenamiento';
}

console.log('🎯 Módulo de onboarding cargado');
