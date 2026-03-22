/**
 * Plan 4 semanas - 5 días. Selector semana/día, vista del día, timer EMOM/AMRAP/For Time.
 */
import { PLAN_4_WEEKS } from '../data/plan-4-weeks-data.js';

const DAY_COLORS = ['#4a90d9', '#e85d75', '#6bcb77', '#ffd93d', '#9b59b6'];
const WEEK_LABELS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (descarga)'];

let state = { week: 1, day: 1, timerInterval: null, timerStart: 0, timerPaused: false, pausedAt: 0 };

function getContainer() {
  return document.getElementById('plan-4-weeks-container');
}

function renderWeekPills() {
  const html = WEEK_LABELS.map((label, i) => {
    const w = i + 1;
    const active = state.week === w;
    const isDescarga = w === 4;
    return `
      <button type="button" class="plan-week-pill ${active ? 'active' : ''} ${isDescarga ? 'descarga' : ''}"
              data-week="${w}" aria-pressed="${active}">
        ${label}
      </button>`;
  }).join('');
  return `<div class="plan-week-pills" role="tablist" aria-label="Semana del bloque">${html}</div>`;
}

function renderDayPills() {
  const html = PLAN_4_WEEKS.days.map((d, i) => {
    const active = state.day === d.id;
    const color = DAY_COLORS[i % DAY_COLORS.length];
    return `
      <button type="button" class="plan-day-pill ${active ? 'active' : ''}"
              data-day="${d.id}" style="--day-color:${color}" aria-pressed="${active}">
        <span class="plan-day-num">Día ${d.id}</span>
        <span class="plan-day-name">${d.name}</span>
      </button>`;
  }).join('');
  return `<div class="plan-day-pills" role="tablist" aria-label="Día de entrenamiento">${html}</div>`;
}

function getDayData() {
  const d = PLAN_4_WEEKS.days.find(x => x.id === state.day);
  if (!d) return null;
  if (d.id === 5 && d.weekVariations) {
    const w = d.weekWods.find(x => x.week === state.week) || d.weekWods[0];
    return { ...d, currentWod: w, isDay5: true };
  }
  return { ...d, isDay5: false };
}

function renderExercises(exercises) {
  if (!exercises || !exercises.length) return '';
  return `
    <ul class="plan-exercise-list">
      ${exercises.map(e => `
        <li class="plan-exercise-item">
          <span class="plan-exercise-name">${e.name}</span>
          <span class="plan-exercise-sets">${e.sets}</span>
        </li>`).join('')}
    </ul>`;
}

function renderMiniWod(wod, canStartTimer = true) {
  if (!wod) return '';
  const type = wod.type || 'AMRAP';
  const cap = wod.cap || wod.duration;
  const desc = wod.description || `${type} ${cap}'`;
  const roundsHtml = (wod.rounds || []).map(r => `<li>${r}</li>`).join('');
  const timerId = `plan-timer-${state.week}-${state.day}-${(wod.rounds || []).join('').length}`;
  return `
    <div class="plan-mini-wod">
      <div class="plan-mini-wod-header">
        <span class="plan-mini-wod-label">Mini-WOD (opcional)</span>
        <span class="plan-mini-wod-desc">${desc}</span>
      </div>
      <ol class="plan-mini-wod-rounds">${roundsHtml}</ol>
      ${canStartTimer ? `
        <div class="plan-timer-wrap">
          <div id="${timerId}" class="plan-timer-display">00:00</div>
          <div class="plan-timer-buttons">
            <button type="button" class="plan-timer-btn start" data-timer-id="${timerId}" data-type="${type}" data-cap="${cap || 0}" data-duration="${wod.duration || 0}">Iniciar</button>
            <button type="button" class="plan-timer-btn pause" data-timer-id="${timerId}" style="display:none">Pausar</button>
            <button type="button" class="plan-timer-btn reset" data-timer-id="${timerId}">Reiniciar</button>
          </div>
        </div>` : ''}
    </div>`;
}

function renderDayContent() {
  const data = getDayData();
  if (!data) return '';

  const title = data.subtitle ? `${data.name} (${data.subtitle})` : data.name;
  const goalHtml = data.goal ? `<p class="plan-day-goal">${data.goal}</p>` : '';

  let exercisesHtml = '';
  let wodHtml = '';

  if (data.isDay5 && data.currentWod) {
    const w = data.currentWod;
    wodHtml = `
      <div class="plan-day5-wod">
        <div class="plan-day5-week-label">${w.label}</div>
        <div class="plan-day5-desc">${w.description}</div>
        <ol class="plan-mini-wod-rounds">${(w.rounds || []).map(r => `<li>${r}</li>`).join('')}</ol>
        <div class="plan-timer-wrap">
          <div id="plan-timer-day5" class="plan-timer-display">00:00</div>
          <div class="plan-timer-buttons">
            <button type="button" class="plan-timer-btn start" data-timer-id="plan-timer-day5" data-type="${w.type}" data-cap="${w.cap || 0}" data-duration="${w.duration || 0}">Iniciar</button>
            <button type="button" class="plan-timer-btn pause" data-timer-id="plan-timer-day5" style="display:none">Pausar</button>
            <button type="button" class="plan-timer-btn reset" data-timer-id="plan-timer-day5">Reiniciar</button>
          </div>
        </div>
      </div>`;
  } else {
    exercisesHtml = renderExercises(data.exercises);
    wodHtml = data.miniWod ? renderMiniWod(data.miniWod) : '';
  }

  return `
    <div class="plan-day-content">
      <h2 class="plan-day-title">${title}</h2>
      ${goalHtml}
      ${exercisesHtml}
      ${wodHtml}
    </div>`;
}

function renderProgressionNote() {
  return `
    <div class="plan-progression-note glass-effect">
      <p><strong>📈 Progresión del bloque (4 semanas)</strong></p>
      <p>${PLAN_4_WEEKS.progression.weeks1to3}</p>
      <p>${PLAN_4_WEEKS.progression.week4}</p>
      <p class="plan-order-note">👉 ${PLAN_4_WEEKS.noteOrder}</p>
    </div>`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startTimer(btn) {
  const timerId = btn.dataset.timerId;
  const type = btn.dataset.type || 'AMRAP';
  const cap = parseInt(btn.dataset.cap, 10) || 0;
  const duration = parseInt(btn.dataset.duration, 10) || 0;
  const el = document.getElementById(timerId);
  if (!el) return;

  const wrap = el.closest('.plan-timer-wrap');
  const startBtn = wrap.querySelector('.plan-timer-btn.start');
  const pauseBtn = wrap.querySelector('.plan-timer-btn.pause');

  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  state.timerStart = Date.now();
  state.timerPaused = false;
  state.pausedAt = 0;

  if (type === 'EMOM') {
    const totalSeconds = (duration || cap) * 60;
    let remaining = totalSeconds;
    el.textContent = formatTime(remaining);
    state.timerInterval = setInterval(() => {
      if (state.timerPaused) return;
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        el.textContent = '00:00';
        el.classList.add('timer-done');
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance('Fin');
          u.lang = 'es-ES';
          window.speechSynthesis.speak(u);
        }
        return;
      }
      el.textContent = formatTime(remaining);
      if (remaining <= 10) el.classList.add('timer-low');
    }, 1000);
  } else {
    // AMRAP o FOR_TIME: count-up
    state.timerInterval = setInterval(() => {
      if (state.timerPaused) return;
      const elapsed = Math.floor((Date.now() - state.timerStart - state.pausedAt) / 1000);
      el.textContent = formatTime(elapsed);
      const capSec = (cap || duration) * 60;
      if (capSec > 0 && elapsed >= capSec) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        el.classList.add('timer-done');
      }
    }, 1000);
  }

  startBtn.style.display = 'none';
  pauseBtn.style.display = 'inline-block';
}

function pauseTimer(btn) {
  const timerId = btn.dataset.timerId;
  const el = document.getElementById(timerId);
  if (!el) return;
  state.timerPaused = !state.timerPaused;
  if (state.timerPaused) {
    state.pausedAt += Date.now() - state.timerStart;
    btn.textContent = 'Reanudar';
  } else {
    state.timerStart = Date.now();
    btn.textContent = 'Pausar';
  }
}

function resetTimer(btn) {
  const timerId = btn.dataset.timerId;
  const el = document.getElementById(timerId);
  const wrap = el?.closest('.plan-timer-wrap');
  if (!wrap) return;
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  el.textContent = '00:00';
  el.classList.remove('timer-done', 'timer-low');
  wrap.querySelector('.plan-timer-btn.start').style.display = 'inline-block';
  wrap.querySelector('.plan-timer-btn.pause').style.display = 'none';
  wrap.querySelector('.plan-timer-btn.pause').textContent = 'Pausar';
}

function setupTimerButtons() {
  const c = getContainer();
  if (!c) return;
  c.querySelectorAll('.plan-timer-btn.start').forEach(btn => {
    btn.addEventListener('click', () => startTimer(btn));
  });
  c.querySelectorAll('.plan-timer-btn.pause').forEach(btn => {
    btn.addEventListener('click', () => pauseTimer(btn));
  });
  c.querySelectorAll('.plan-timer-btn.reset').forEach(btn => {
    btn.addEventListener('click', () => resetTimer(btn));
  });
}

function setupPills() {
  const c = getContainer();
  if (!c) return;
  c.querySelectorAll('.plan-week-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.week = parseInt(pill.dataset.week, 10);
      render();
    });
  });
  c.querySelectorAll('.plan-day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.day = parseInt(pill.dataset.day, 10);
      render();
    });
  });
}

function render() {
  const c = getContainer();
  if (!c) return;

  c.innerHTML = `
    <div class="plan-4-weeks-header">
      <h1 class="plan-4-weeks-title">🗓️ Plan 4 semanas</h1>
      <p class="plan-4-weeks-subtitle">5 días · Pull, Push, Pierna, Hombros+Core, CrossFit</p>
    </div>
    ${renderProgressionNote()}
    ${renderWeekPills()}
    ${renderDayPills()}
    <div class="plan-day-area">
      ${renderDayContent()}
    </div>
  `;

  setupPills();
  setupTimerButtons();
}

function init() {
  const c = getContainer();
  if (!c) return;
  state.week = 1;
  state.day = 1;
  render();
}

window.initPlan4Weeks = init;
