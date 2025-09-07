// Sistema de onboarding para EntrenoApp
import { auth, db } from '../config/firebase-config.js';
import { 
    doc, 
    updateDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
            { id: 'crossfit', label: 'CrossFit/Funcional', icon: '🤸‍♂️' },
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
    console.log('🎯 Inicializando onboarding');
    
    // Cargar datos guardados si existen
    loadSavedProgress();
    
    renderOnboardingContent();
    setupOnboardingListeners();
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
    
    if (isMultiple) {
        // Selección múltiple
        if (!onboardingState.userData[stepId]) {
            onboardingState.userData[stepId] = [];
        }
        
        const selectedValues = onboardingState.userData[stepId];
        const index = selectedValues.indexOf(value);
        
        if (index > -1) {
            selectedValues.splice(index, 1);
        } else {
            selectedValues.push(value);
        }
    } else {
        // Selección única
        onboardingState.userData[stepId] = value;
    }
    
    saveProgress();
    renderOnboardingContent();
}

// Manejar siguiente paso
function handleNext() {
    if (!canProceedToNext()) return;
    
    if (onboardingState.currentStep === onboardingState.totalSteps - 1) {
        // Finalizar onboarding
        finishOnboarding();
    } else {
        // Siguiente paso
        onboardingState.currentStep++;
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
    if (onboardingState.isLoading) return;
    
    onboardingState.isLoading = true;
    
    try {
        console.log('🎯 Finalizando onboarding...');
        
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuario no autenticado');
        }
        
        // Actualizar perfil en Firestore
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
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
            updatedAt: serverTimestamp()
        });
        
        // Limpiar datos de onboarding de localStorage
        localStorage.removeItem('entrenoapp_onboarding');
        
        console.log('✅ Onboarding completado exitosamente');
        
        // Mostrar mensaje de éxito
        showSuccess();
        
        // Redirigir al dashboard después de un momento
        setTimeout(() => {
            window.loadPage('dashboard');
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error finalizando onboarding:', error);
        onboardingState.error = 'Error guardando tu perfil. Intenta de nuevo.';
        renderOnboardingContent();
    } finally {
        onboardingState.isLoading = false;
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

// Mostrar mensaje de éxito
function showSuccess() {
    const onboardingContent = document.getElementById('onboarding-content');
    
    onboardingContent.innerHTML = `
        <div class="success-container text-center glass-fade-in">
            <div class="success-icon mb-lg">
                <span style="font-size: 4rem;">🎉</span>
            </div>
            <h2 class="success-title mb-md">¡Perfil configurado!</h2>
            <p class="success-text text-secondary mb-lg">
                Tu EntrenoApp está personalizada y lista para usar
            </p>
            <div class="success-features glass-card p-lg">
                <p class="text-secondary mb-md">Ahora puedes disfrutar de:</p>
                <div class="feature-list">
                    <div class="feature-item">✅ Entrenamientos personalizados</div>
                    <div class="feature-item">✅ Retos adaptados a tu nivel</div>
                    <div class="feature-item">✅ Seguimiento de progreso</div>
                    <div class="feature-item">✅ Planes de running</div>
                </div>
            </div>
            <div class="loading-indicator mt-lg">
                <div class="loading-spinner"></div>
                <p class="text-secondary">Preparando tu dashboard...</p>
            </div>
        </div>
    `;
}

console.log('🎯 Módulo de onboarding cargado');
