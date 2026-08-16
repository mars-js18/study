/**
 * StudyFlow PWA - Full Application Architecture & Logic
 * Autodidact Study Ecosystem: Syllabus, Inbox, Time-Blocking, Pomodoro, Web Audio API, SRS & Heatmap.
 */

// ==========================================
// 1. STATE & STORAGE MANAGEMENT
// ==========================================

const STORAGE_KEY = 'studyflow_pwa_v1';

let state = {
  settings: {
    energyLevel: 'medium', // 'high', 'medium', 'low'
    pomodoroWork: 25,
    pomodoroBreak: 5,
    soundVolume: 50,
    ambientSound: 'none' // 'none', 'white', 'rain', 'cafe'
  },
  subjects: [],
  topics: [],
  inbox: [],
  timeBlocks: [],
  logs: [] // { id, subjectId, topicId, date: 'YYYY-MM-DD', durationMinutes: 25, type: 'pomodoro'|'manual'|'srs' }
};

// Seed initial data if empty
function loadInitialState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      // Ensure state defaults
      if (!state.settings) state.settings = { energyLevel: 'medium', pomodoroWork: 25, pomodoroBreak: 5, soundVolume: 50, ambientSound: 'none' };
      if (!state.subjects) state.subjects = [];
      if (!state.topics) state.topics = [];
      if (!state.inbox) state.inbox = [];
      if (!state.timeBlocks) state.timeBlocks = [];
      if (!state.logs) state.logs = [];
      return;
    } catch (e) {
      console.error('Error parsing stored state:', e);
    }
  }

  // Populate Default Seed Data for a Rich First-Time Experience
  const todayStr = getFormattedDate(new Date());
  const yesterdayStr = getFormattedDate(new Date(Date.now() - 86400000));
  const twoDaysAgoStr = getFormattedDate(new Date(Date.now() - 172800000));

  state.subjects = [
    {
      id: 'sub_1',
      title: 'Inteligencia Artificial y Deep Learning',
      description: 'Dominar arquitecturas de Redes Neuronales, PyTorch y LLMs.',
      color: 'indigo',
      weeksCount: 6,
      createdAt: Date.now() - 604800000
    },
    {
      id: 'sub_2',
      title: 'Arquitectura Frontend & PWA',
      description: 'Construcción de aplicaciones web progresivas offline-first sin frameworks pesados.',
      color: 'emerald',
      weeksCount: 4,
      createdAt: Date.now() - 1209600000
    }
  ];

  state.topics = [
    {
      id: 'top_1',
      subjectId: 'sub_1',
      week: 1,
      title: 'Fundamentos de Algebral Lineal y Tensores',
      completed: true,
      energyLevel: 'high',
      easeFactor: 2.5,
      interval: 7,
      lastReviewed: yesterdayStr,
      nextReviewDate: getFormattedDate(new Date(Date.now() + 6 * 86400000)),
      completedAt: Date.now() - 86400000
    },
    {
      id: 'top_2',
      subjectId: 'sub_1',
      week: 1,
      title: 'Backpropagation y Optimización por Descenso de Gradiente',
      completed: false,
      energyLevel: 'high',
      easeFactor: 2.5,
      interval: 0,
      lastReviewed: null,
      nextReviewDate: todayStr, // Due today!
      completedAt: null
    },
    {
      id: 'top_3',
      subjectId: 'sub_2',
      week: 1,
      title: 'Service Workers & Caché Offline-First',
      completed: true,
      energyLevel: 'medium',
      easeFactor: 2.5,
      interval: 3,
      lastReviewed: twoDaysAgoStr,
      nextReviewDate: todayStr, // Due today!
      completedAt: Date.now() - 172800000
    },
    {
      id: 'top_4',
      subjectId: 'sub_2',
      week: 2,
      title: 'IndexedDB & LocalStorage Persistencia de Datos',
      completed: false,
      energyLevel: 'medium',
      easeFactor: 2.5,
      interval: 0,
      lastReviewed: null,
      nextReviewDate: null,
      completedAt: null
    }
  ];

  state.inbox = [
    {
      id: 'inb_1',
      subjectId: 'sub_1',
      title: 'Video: Animación de Redes Neuronales 3Blue1Brown',
      url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      note: 'Excelente explicación visual del cálculo de gradientes.',
      type: 'youtube',
      status: 'pending',
      createdAt: Date.now() - 43200000
    },
    {
      id: 'inb_2',
      subjectId: 'sub_2',
      title: 'Artículo: MDN Guide to Progressive Web Apps',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps',
      note: 'Revisar sintaxis de manifest.json e instalación PWA.',
      type: 'article',
      status: 'studying',
      createdAt: Date.now() - 86400000
    }
  ];

  state.timeBlocks = [
    {
      id: 'tb_1',
      subjectId: 'sub_1',
      topicTitle: 'Estudio de Backpropagation y Gradiente',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:30',
      color: 'indigo'
    },
    {
      id: 'tb_2',
      subjectId: 'sub_2',
      topicTitle: 'Práctica de Service Worker offline',
      date: todayStr,
      startTime: '15:00',
      endTime: '16:00',
      color: 'emerald'
    }
  ];

  // Seed study logs for heatmap streak
  state.logs = [
    { id: 'log_1', subjectId: 'sub_1', topicId: 'top_1', date: twoDaysAgoStr, durationMinutes: 50, type: 'pomodoro' },
    { id: 'log_2', subjectId: 'sub_2', topicId: 'top_3', date: yesterdayStr, durationMinutes: 75, type: 'pomodoro' },
    { id: 'log_3', subjectId: 'sub_1', topicId: 'top_2', date: todayStr, durationMinutes: 25, type: 'pomodoro' }
  ];

  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Utility: Date formatter YYYY-MM-DD
function getFormattedDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


// ==========================================
// 2. WEB AUDIO API SYNTHESIZER LAB
// ==========================================

class WebAudioEngine {
  constructor() {
    this.ctx = null;
    this.currentNoiseSource = null;
    this.gainNode = null;
    this.activeType = 'none';
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(percent) {
    if (this.gainNode) {
      const vol = Math.max(0, Math.min(1, percent / 100));
      this.gainNode.gain.setTargetAtTime(vol * 0.4, this.ctx.currentTime, 0.1);
    }
  }

  playAmbient(type, volumePercent = 50) {
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbient();
    this.activeType = type;

    if (type === 'none') return;

    // Create Master Gain Node for Ambient Audio
    this.gainNode = this.ctx.createGain();
    const vol = Math.max(0, Math.min(1, volumePercent / 100));
    this.gainNode.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Buffer length: 5 seconds looping
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      // Pure White / Soft Low-pass Filtered Pink Noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter to smooth high harsh frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();
      this.currentNoiseSource = noiseSource;

    } else if (type === 'rain') {
      // Rain Simulation: Lowpass Filtered Noise + Subtle Amplitude Modulation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 800;
      bandpass.Q.value = 0.8;

      noiseSource.connect(bandpass);
      bandpass.connect(this.gainNode);
      noiseSource.start();
      this.currentNoiseSource = noiseSource;

    } else if (type === 'cafe') {
      // Coffee Shop Ambience: Warm Brown Noise + Resonant Acoustic Hums
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      noiseSource.start();
      this.currentNoiseSource = noiseSource;
    }
  }

  stopAmbient() {
    if (this.currentNoiseSource) {
      try {
        this.currentNoiseSource.stop();
        this.currentNoiseSource.disconnect();
      } catch (e) {}
      this.currentNoiseSource = null;
    }
    this.activeType = 'none';
  }

  // Play Crisp Harmonic Chime Notification Bell
  playAlarmChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now); // C6

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.8);
    osc2.stop(now + 1.8);
  }
}

const audioLab = new WebAudioEngine();


// ==========================================
// 3. NAVIGATION & MODAL CONTROLLERS
// ==========================================

let activeTab = 'dashboard';
let activeDatePlanner = getFormattedDate();

function switchTab(tabId) {
  activeTab = tabId;

  // Update Nav Buttons Styles
  document.querySelectorAll('.nav-tab').forEach(btn => {
    const isCurrent = btn.dataset.tab === tabId;
    if (isCurrent) {
      btn.className = 'nav-tab w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
    } else {
      btn.className = 'nav-tab w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';
    }
  });

  // Hide all view sections
  document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));

  // Show target section
  const targetSec = document.getElementById(`view-${tabId}`);
  if (targetSec) targetSec.classList.remove('hidden');

  // Update Header Title
  const pageTitle = document.getElementById('page-title');
  const titleMap = {
    dashboard: '<i data-lucide="layout-dashboard" class="w-4 h-4 text-indigo-400"></i> Dashboard & Consistencia',
    syllabus: '<i data-lucide="book-open" class="w-4 h-4 text-indigo-400"></i> Syllabus & Materias',
    inbox: '<i data-lucide="inbox" class="w-4 h-4 text-amber-400"></i> Inbox de Recursos',
    planner: '<i data-lucide="calendar" class="w-4 h-4 text-emerald-400"></i> Time-Blocking Planner',
    pomodoro: '<i data-lucide="timer" class="w-4 h-4 text-rose-400"></i> Pomodoro & Audio Lab',
    srs: '<i data-lucide="repeat" class="w-4 h-4 text-rose-400"></i> Repaso Espaciado (SRS)'
  };
  pageTitle.innerHTML = titleMap[tabId] || 'StudyFlow';

  // Trigger renders
  renderAllViews();
  if (window.lucide) lucide.createIcons();
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Pre-populate selectors if needed
    if (modalId === 'modal-inbox' || modalId === 'modal-timeblock' || modalId === 'modal-subject') {
      populateSubjectDropdowns();
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}


// ==========================================
// 4. RENDER ENGINE & UI MODULES
// ==========================================

function renderAllViews() {
  updateBadges();
  renderEnergyBanner();
  renderDashboard();
  renderHeatmap();
  renderSyllabus();
  renderInbox();
  renderPlanner();
  renderPomodoroView();
  renderSRSView();
}

function updateBadges() {
  // Subjects count
  document.getElementById('badge-subject-count').innerText = state.subjects.length;

  // Inbox count
  const pendingInbox = state.inbox.filter(i => i.status === 'pending').length;
  document.getElementById('badge-inbox-count').innerText = pendingInbox;

  // SRS due count
  const todayStr = getFormattedDate();
  const dueTopics = state.topics.filter(t => t.nextReviewDate && t.nextReviewDate <= todayStr);
  document.getElementById('badge-srs-due').innerText = dueTopics.length;

  // Streak calculate
  const streak = calculateStreak();
  document.getElementById('sidebar-streak').innerText = `${streak} Días`;
}

// Calculate Streak (Consecutive days with study logs)
function calculateStreak() {
  if (!state.logs || state.logs.length === 0) return 0;

  const datesWithLogs = new Set(state.logs.map(l => l.date));
  let count = 0;
  let curr = new Date();

  while (true) {
    const dateStr = getFormattedDate(curr);
    if (datesWithLogs.has(dateStr)) {
      count++;
      curr.setDate(curr.getDate() - 1);
    } else {
      // Check if missing today, allow checking from yesterday
      if (count === 0) {
        curr.setDate(curr.getDate() - 1);
        const yesterdayStr = getFormattedDate(curr);
        if (datesWithLogs.has(yesterdayStr)) {
          count++;
          curr.setDate(curr.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return count;
}


// ------------------------------------------
// MODULE: ANTI-BURNOUT ENERGY ENGINE
// ------------------------------------------

function renderEnergyBanner() {
  const level = state.settings.energyLevel || 'medium';
  const labelEl = document.getElementById('burnout-state-label');
  const adviceEl = document.getElementById('burnout-advice');
  const iconBg = document.getElementById('burnout-icon-bg');

  // Update Buttons UI
  document.querySelectorAll('.energy-btn').forEach(btn => {
    if (btn.dataset.energy === level) {
      btn.className = 'energy-btn px-2 py-1.5 rounded-md text-xs font-semibold flex flex-col items-center gap-0.5 transition-all bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
    } else {
      btn.className = 'energy-btn px-2 py-1.5 rounded-md text-xs font-medium flex flex-col items-center gap-0.5 transition-all text-slate-400 hover:text-white';
    }
  });

  if (level === 'low') {
    labelEl.innerText = 'Baja 🪫';
    labelEl.className = 'text-indigo-400';
    iconBg.innerText = '🪫';
    iconBg.className = 'w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-2xl border border-indigo-500/30';
    adviceEl.innerText = 'Día de baja energía. No te fuerces a sesiones densas. Te sugerimos actividades livianas: ver videos cortos del Inbox, repasar 2 flashcards de SRS o lectura rápida.';
  } else if (level === 'high') {
    labelEl.innerText = 'Alta ⚡';
    labelEl.className = 'text-amber-400';
    iconBg.innerText = '⚡';
    iconBg.className = 'w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-2xl border border-amber-500/30';
    adviceEl.innerText = '¡Energía al máximo! Momento perfecto para estudio profundo, resolver temas complejos del Syllabus y programar bloques de tiempo de 50 minutos de enfoque.';
  } else {
    labelEl.innerText = 'Media 🔋';
    labelEl.className = 'text-emerald-400';
    iconBg.innerText = '🔋';
    iconBg.className = 'w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-2xl border border-emerald-500/30';
    adviceEl.innerText = 'Energía balanceada. Ideal para avanzar 1 o 2 temas semanales, completar un bloque de tiempo de 25 min o hacer ejercicios de dificultad estándar.';
  }
}


// ------------------------------------------
// MODULE: DASHBOARD & CONSISTENCY HEATMAP
// ------------------------------------------

function renderDashboard() {
  // Counters
  document.getElementById('dash-streak').innerText = `${calculateStreak()} Días`;

  const totalMins = state.logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  document.getElementById('dash-total-hours').innerText = `${(totalMins / 60).toFixed(1)} hrs`;

  const completedTopicsCount = state.topics.filter(t => t.completed).length;
  document.getElementById('dash-completed-topics').innerText = `${completedTopicsCount} / ${state.topics.length}`;

  const todayStr = getFormattedDate();
  const dueSRSCount = state.topics.filter(t => t.nextReviewDate && t.nextReviewDate <= todayStr).length;
  document.getElementById('dash-srs-due').innerText = `${dueSRSCount} Temas`;

  // Render Due SRS list preview
  const dashSRSList = document.getElementById('dash-srs-list');
  const dueTopics = state.topics.filter(t => t.nextReviewDate && t.nextReviewDate <= todayStr);

  if (dueTopics.length === 0) {
    dashSRSList.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        <i data-lucide="check-circle" class="w-8 h-8 mx-auto mb-2 text-emerald-500/40"></i>
        ¡No tienes repasos pendientes hoy! Tu memoria está al día.
      </div>
    `;
  } else {
    dashSRSList.innerHTML = dueTopics.map(t => {
      const sub = state.subjects.find(s => s.id === t.subjectId);
      return `
        <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold text-white">${escapeHtml(t.title)}</div>
            <div class="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-${sub ? sub.color : 'indigo'}-400"></span>
              <span>${sub ? escapeHtml(sub.title) : 'Materia'}</span>
            </div>
          </div>
          <button onclick="switchTab('srs')" class="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg hover:bg-rose-500/30 transition-all shrink-0">
            Repasar
          </button>
        </div>
      `;
    }).join('');
  }

  // Render Subjects Progress Preview
  const dashSubList = document.getElementById('dash-subjects-list');
  if (state.subjects.length === 0) {
    dashSubList.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        Sin materias creadas. Haz clic en 'Syllabus' para agregar tu primer plan.
      </div>
    `;
  } else {
    dashSubList.innerHTML = state.subjects.map(s => {
      const subTopics = state.topics.filter(t => t.subjectId === s.id);
      const done = subTopics.filter(t => t.completed).length;
      const pct = subTopics.length > 0 ? Math.round((done / subTopics.length) * 100) : 0;

      return `
        <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-${s.color}-400"></span>
              ${escapeHtml(s.title)}
            </span>
            <span class="font-mono text-[11px] text-slate-400 font-bold">${pct}%</span>
          </div>
          <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-${s.color}-500 to-indigo-500 transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Heatmap Contribution Matrix (365 days / 52 weeks)
function renderHeatmap() {
  const container = document.getElementById('heatmap-grid');
  if (!container) return;

  container.innerHTML = '';

  // Calculate study minutes per date map
  const minutesPerDate = {};
  state.logs.forEach(log => {
    if (log.date) {
      minutesPerDate[log.date] = (minutesPerDate[log.date] || 0) + (log.durationMinutes || 0);
    }
  });

  // Render 52 weeks = 364 days ending today
  const today = new Date();
  const daysToRender = 52 * 7;
  const startDate = new Date();
  startDate.setDate(today.getDate() - daysToRender + 1);

  const tooltipInfo = document.getElementById('heatmap-tooltip-info');

  for (let i = 0; i < daysToRender; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = getFormattedDate(d);
    const mins = minutesPerDate[dateStr] || 0;

    // Determine cell opacity/color level
    let bgClass = 'bg-slate-800/40 border border-slate-800';
    if (mins >= 120) bgClass = 'bg-emerald-300 shadow-sm shadow-emerald-400 border border-emerald-200';
    else if (mins >= 60) bgClass = 'bg-emerald-500 border border-emerald-400';
    else if (mins >= 30) bgClass = 'bg-emerald-700 border border-emerald-600';
    else if (mins > 0) bgClass = 'bg-emerald-900/80 border border-emerald-800';

    const cell = document.createElement('div');
    cell.className = `w-3 h-3 rounded-[3px] ${bgClass} heatmap-cell cursor-pointer`;
    cell.setAttribute('data-date', dateStr);
    cell.setAttribute('data-mins', mins);

    cell.addEventListener('mouseenter', () => {
      tooltipInfo.innerText = `${dateStr}: ${mins} minutos de estudio (${(mins / 60).toFixed(1)} hrs)`;
    });

    container.appendChild(cell);
  }
}


// ------------------------------------------
// MODULE: GESTOR DE SYLLABUS DE MATERIA
// ------------------------------------------

function renderSyllabus() {
  const container = document.getElementById('syllabus-container');
  if (!container) return;

  if (state.subjects.length === 0) {
    container.innerHTML = `
      <div class="glass-card rounded-2xl p-12 text-center border-slate-800/80 max-w-lg mx-auto">
        <i data-lucide="book-open" class="w-12 h-12 text-indigo-400/40 mx-auto mb-3"></i>
        <h3 class="font-display font-bold text-base text-white">No tienes materias en tu Syllabus</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">Crea tu primera materia y define tu plan de estudio de 4, 6 o 12 semanas.</p>
        <button onclick="openModal('modal-subject')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30">
          + Crear Primera Materia
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.subjects.map(s => {
    const subTopics = state.topics.filter(t => t.subjectId === s.id);
    const completedCount = subTopics.filter(t => t.completed).length;
    const progressPct = subTopics.length > 0 ? Math.round((completedCount / subTopics.length) * 100) : 0;

    // Render Weeks Accordion
    let weeksHTML = '';
    for (let w = 1; w <= s.weeksCount; w++) {
      const weekTopics = subTopics.filter(t => t.week === w);

      weeksHTML += `
        <div class="border border-slate-800/80 rounded-xl bg-dark-850/60 overflow-hidden">
          <div class="p-3 bg-dark-800/40 flex items-center justify-between border-b border-slate-800/60">
            <span class="font-display font-bold text-xs text-slate-200 flex items-center gap-2">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-400"></i> Semana ${w}
            </span>
            <button onclick="openAddTopicModal('${s.id}', ${w})" class="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              <i data-lucide="plus" class="w-3 h-3"></i> Agregar Tema
            </button>
          </div>

          <div class="p-3 space-y-2">
            ${weekTopics.length === 0 ? '<p class="text-[11px] text-slate-500 italic">No hay temas asignados para esta semana.</p>' : ''}
            ${weekTopics.map(t => `
              <div class="p-2.5 rounded-lg bg-dark-950 border border-slate-800 flex items-center justify-between gap-3 group">
                <div class="flex items-center gap-3">
                  <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTopicComplete('${t.id}')" class="w-4 h-4 rounded border-slate-700 bg-dark-850 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <span class="text-xs font-medium ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}">${escapeHtml(t.title)}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-mono ${t.energyLevel === 'high' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : t.energyLevel === 'low' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}">
                    ${t.energyLevel === 'high' ? '⚡ Denso' : t.energyLevel === 'low' ? '🪫 Liviano' : '🔋 Medio'}
                  </span>
                  <button onclick="deleteTopic('${t.id}')" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="glass-card rounded-2xl p-5 border-slate-800/80 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-${s.color}-500 shadow-sm shadow-${s.color}-500/50"></span>
            <div>
              <h3 class="font-display font-bold text-base text-white">${escapeHtml(s.title)}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(s.description || 'Sin descripción')}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Plan de ${s.weeksCount} Semanas</span>
            <button onclick="deleteSubject('${s.id}')" class="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all" title="Eliminar Materia">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Progreso general</span>
            <span class="font-bold text-white font-mono">${progressPct}% (${completedCount}/${subTopics.length} temas)</span>
          </div>
          <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-${s.color}-500 to-indigo-500 transition-all duration-500" style="width: ${progressPct}%"></div>
          </div>
        </div>

        <!-- Weeks Accordion Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          ${weeksHTML}
        </div>
      </div>
    `;
  }).join('');
}

function openAddTopicModal(subjectId, week = 1) {
  document.getElementById('topic-subject-id').value = subjectId;
  const weekSelect = document.getElementById('topic-week-select');
  const sub = state.subjects.find(s => s.id === subjectId);

  weekSelect.innerHTML = '';
  if (sub) {
    for (let w = 1; w <= sub.weeksCount; w++) {
      weekSelect.innerHTML += `<option value="${w}" ${w === week ? 'selected' : ''}>Semana ${w}</option>`;
    }
  }

  openModal('modal-topic');
}

function toggleTopicComplete(topicId) {
  const topic = state.topics.find(t => t.id === topicId);
  if (topic) {
    topic.completed = !topic.completed;
    if (topic.completed) {
      topic.completedAt = Date.now();
      // Set initial SRS review date for tomorrow if not set
      if (!topic.nextReviewDate) {
        topic.nextReviewDate = getFormattedDate(new Date(Date.now() + 86400000));
        topic.lastReviewed = getFormattedDate();
        topic.interval = 1;
      }
      // Log completed study activity
      state.logs.push({
        id: 'log_' + Date.now(),
        subjectId: topic.subjectId,
        topicId: topic.id,
        date: getFormattedDate(),
        durationMinutes: 20,
        type: 'manual'
      });
    }
    saveState();
    renderAllViews();
  }
}

function deleteTopic(topicId) {
  if (confirm('¿Eliminar este tema del plan de estudio?')) {
    state.topics = state.topics.filter(t => t.id !== topicId);
    saveState();
    renderAllViews();
  }
}

function deleteSubject(subjectId) {
  if (confirm('¿Eliminar esta materia y todos sus temas e inbox asociados?')) {
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    state.topics = state.topics.filter(t => t.subjectId !== subjectId);
    state.inbox = state.inbox.filter(i => i.subjectId !== subjectId);
    saveState();
    renderAllViews();
  }
}


// ------------------------------------------
// MODULE: INBOX DE RECURSOS
// ------------------------------------------

let inboxFilterStatus = 'all';
let inboxFilterSubject = 'all';

function renderInbox() {
  const container = document.getElementById('inbox-grid');
  if (!container) return;

  // Filter items
  let items = state.inbox;
  if (inboxFilterStatus !== 'all') {
    items = items.filter(i => i.status === inboxFilterStatus);
  }
  if (inboxFilterSubject !== 'all') {
    items = items.filter(i => i.subjectId === inboxFilterSubject);
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full glass-card rounded-2xl p-12 text-center border-slate-800/80">
        <i data-lucide="inbox" class="w-12 h-12 text-amber-400/40 mx-auto mb-3"></i>
        <h3 class="font-display font-bold text-base text-white">No hay recursos en la bandeja</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">Pega enlaces de YouTube, PDFs o notas para estudiarlos más tarde.</p>
        <button onclick="openModal('modal-inbox')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30">
          + Capturar Recurso
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const sub = state.subjects.find(s => s.id === item.subjectId);
    const statusBadges = {
      pending: '<span class="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pendiente</span>',
      studying: '<span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">Estudiando</span>',
      assimilated: '<span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Asimilado</span>'
    };

    return `
      <div class="glass-card rounded-2xl p-4 border-slate-800/80 flex flex-col justify-between space-y-3 glass-card-hover">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] text-slate-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-${sub ? sub.color : 'indigo'}-400"></span>
              ${sub ? escapeHtml(sub.title) : 'General'}
            </span>
            ${statusBadges[item.status] || ''}
          </div>

          <h4 class="font-display font-bold text-sm text-white leading-snug">${escapeHtml(item.title)}</h4>
          ${item.note ? `<p class="text-xs text-slate-400 line-clamp-2">${escapeHtml(item.note)}</p>` : ''}
        </div>

        <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            ${item.url ? `
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs flex items-center gap-1 transition-all">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Abrir
              </a>
            ` : ''}
          </div>

          <!-- Status Dropdown Selector -->
          <select onchange="updateInboxStatus('${item.id}', this.value)" class="bg-dark-850 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none">
            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pendiente</option>
            <option value="studying" ${item.status === 'studying' ? 'selected' : ''}>Estudiando</option>
            <option value="assimilated" ${item.status === 'assimilated' ? 'selected' : ''}>Asimilado</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function updateInboxStatus(itemId, newStatus) {
  const item = state.inbox.find(i => i.id === itemId);
  if (item) {
    item.status = newStatus;
    saveState();
    renderAllViews();
  }
}


// ------------------------------------------
// MODULE: TIME-BLOCKING PLANNER
// ------------------------------------------

function renderPlanner() {
  const timeline = document.getElementById('planner-timeline');
  if (!timeline) return;

  const dateTitle = document.getElementById('planner-current-date-title');
  const daySubtitle = document.getElementById('planner-day-subtitle');

  dateTitle.innerText = activeDatePlanner === getFormattedDate() ? `Hoy, ${activeDatePlanner}` : activeDatePlanner;

  const dayBlocks = state.timeBlocks.filter(b => b.date === activeDatePlanner);
  daySubtitle.innerText = `${dayBlocks.length} Bloques programados`;

  // Render 06:00 to 23:00 timeline rows
  let rowsHTML = '';
  for (let hour = 6; hour <= 23; hour++) {
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    const matchingBlocks = dayBlocks.filter(b => b.startTime.startsWith(String(hour).padStart(2, '0')));

    rowsHTML += `
      <div class="flex items-start gap-4 py-2 border-b border-slate-800/40 group">
        <div class="w-12 font-mono text-xs text-slate-500 text-right pt-1 shrink-0">${timeStr}</div>
        <div class="flex-1 min-h-[42px] rounded-xl bg-dark-900/40 p-1 flex flex-wrap gap-2 items-center">
          ${matchingBlocks.map(b => {
            const sub = state.subjects.find(s => s.id === b.subjectId);
            return `
              <div class="px-3 py-1.5 rounded-lg bg-${sub ? sub.color : 'indigo'}-500/20 text-${sub ? sub.color : 'indigo'}-300 border border-${sub ? sub.color : 'indigo'}-500/40 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
                <span>${b.startTime} - ${b.endTime}: ${escapeHtml(b.topicTitle)}</span>
                <button onclick="deleteTimeBlock('${b.id}')" class="text-slate-400 hover:text-rose-400 p-0.5">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              </div>
            `;
          }).join('')}
          ${matchingBlocks.length === 0 ? `
            <button onclick="openAddTimeBlockModal('${timeStr}')" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 text-xs p-1 rounded transition-all flex items-center gap-1">
              <i data-lucide="plus" class="w-3 h-3"></i> Bloque
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  timeline.innerHTML = rowsHTML;
}

function openAddTimeBlockModal(defaultStartHour = '09:00') {
  const startSelect = document.getElementById('timeblock-start');
  const endSelect = document.getElementById('timeblock-end');

  startSelect.innerHTML = '';
  endSelect.innerHTML = '';

  for (let h = 6; h <= 23; h++) {
    const str = `${String(h).padStart(2, '0')}:00`;
    startSelect.innerHTML += `<option value="${str}" ${str === defaultStartHour ? 'selected' : ''}>${str}</option>`;
    const endStr = `${String(h + 1).padStart(2, '0')}:00`;
    endSelect.innerHTML += `<option value="${endStr}">${endStr}</option>`;
  }

  openModal('modal-timeblock');
}

function deleteTimeBlock(blockId) {
  state.timeBlocks = state.timeBlocks.filter(b => b.id !== blockId);
  saveState();
  renderAllViews();
}


// ------------------------------------------
// MODULE: POMODORO & AUDIO LAB ENGINE
// ------------------------------------------

let pomoState = {
  isRunning: false,
  mode: 'work', // 'work', 'break'
  workMinutes: 25,
  breakMinutes: 5,
  timeLeftSeconds: 25 * 60,
  timerInterval: null
};

function renderPomodoroView() {
  const digits = document.getElementById('pomo-timer-digits');
  const subtext = document.getElementById('pomo-subtext');
  const modeBadge = document.getElementById('pomo-timer-mode');
  const toggleBtn = document.getElementById('pomo-toggle-text');
  const toggleIcon = document.getElementById('pomo-toggle-icon');
  const ring = document.getElementById('pomo-progress-ring');
  const topTimerPill = document.getElementById('timer-status-pill');
  const topTimerDisplay = document.getElementById('top-timer-display');

  const mins = Math.floor(pomoState.timeLeftSeconds / 60);
  const secs = pomoState.timeLeftSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (digits) digits.innerText = timeStr;
  if (topTimerDisplay) topTimerDisplay.innerText = timeStr;

  // Title tag dynamic update
  document.title = pomoState.isRunning ? `(${timeStr}) ⏱️ Pomodoro - StudyFlow` : 'StudyFlow PWA - Sistema Autodidacta';

  if (topTimerPill) {
    if (pomoState.isRunning) topTimerPill.classList.remove('hidden');
    else topTimerPill.classList.add('hidden');
  }

  if (modeBadge) {
    if (pomoState.mode === 'work') {
      modeBadge.innerText = 'TRABAJO';
      modeBadge.className = 'text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 mb-1';
    } else {
      modeBadge.innerText = 'DESCANSO';
      modeBadge.className = 'text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-1';
    }
  }

  if (toggleBtn && toggleIcon) {
    if (pomoState.isRunning) {
      toggleBtn.innerText = 'Pausar';
      toggleIcon.setAttribute('data-lucide', 'pause');
    } else {
      toggleBtn.innerText = 'Iniciar Enfoque';
      toggleIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) lucide.createIcons();
  }

  // Radial Ring Calculation (stroke-dasharray = 276.46)
  if (ring) {
    const totalSecs = (pomoState.mode === 'work' ? pomoState.workMinutes : pomoState.breakMinutes) * 60;
    const progress = pomoState.timeLeftSeconds / totalSecs;
    const offset = 276.46 * (1 - progress);
    ring.style.strokeDashoffset = offset;
  }

  // Render Today's Log
  const pomoLogList = document.getElementById('pomo-today-log');
  if (pomoLogList) {
    const todayLogs = state.logs.filter(l => l.date === getFormattedDate() && l.type === 'pomodoro');
    if (todayLogs.length === 0) {
      pomoLogList.innerHTML = '<p class="text-xs text-slate-500 italic">No has completado pomodoros hoy aún.</p>';
    } else {
      pomoLogList.innerHTML = todayLogs.map(l => {
        const sub = state.subjects.find(s => s.id === l.subjectId);
        return `
          <div class="p-2 rounded-lg bg-dark-850 border border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-200 flex items-center gap-1.5">
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
              ${sub ? escapeHtml(sub.title) : 'Sesión General'}
            </span>
            <span class="font-mono text-indigo-300 font-semibold">+${l.durationMinutes} min</span>
          </div>
        `;
      }).join('');
    }
  }
}

function togglePomodoro() {
  if (pomoState.isRunning) {
    clearInterval(pomoState.timerInterval);
    pomoState.isRunning = false;
  } else {
    pomoState.isRunning = true;
    pomoState.timerInterval = setInterval(tickPomodoro, 1000);
  }
  renderPomodoroView();
}

function resetPomodoro() {
  clearInterval(pomoState.timerInterval);
  pomoState.isRunning = false;
  pomoState.mode = 'work';
  pomoState.timeLeftSeconds = pomoState.workMinutes * 60;
  renderPomodoroView();
}

function tickPomodoro() {
  if (pomoState.timeLeftSeconds > 0) {
    pomoState.timeLeftSeconds--;
  } else {
    // Session Finished!
    audioLab.playAlarmChime();

    if (pomoState.mode === 'work') {
      // Log session
      const selectSubject = document.getElementById('pomo-subject-select');
      const subjectId = selectSubject ? selectSubject.value : 'none';

      state.logs.push({
        id: 'log_' + Date.now(),
        subjectId: subjectId !== 'none' ? subjectId : null,
        topicId: null,
        date: getFormattedDate(),
        durationMinutes: pomoState.workMinutes,
        type: 'pomodoro'
      });
      saveState();

      pomoState.mode = 'break';
      pomoState.timeLeftSeconds = pomoState.breakMinutes * 60;
    } else {
      pomoState.mode = 'work';
      pomoState.timeLeftSeconds = pomoState.workMinutes * 60;
    }

    renderAllViews();
  }
  renderPomodoroView();
}


// ------------------------------------------
// MODULE: SPACED REPETITION ENGINE (SRS)
// ------------------------------------------

function renderSRSView() {
  const container = document.getElementById('srs-active-card-container');
  const tableBody = document.getElementById('srs-table-body');
  if (!container || !tableBody) return;

  const todayStr = getFormattedDate();
  const dueTopics = state.topics.filter(t => t.nextReviewDate && t.nextReviewDate <= todayStr);

  document.getElementById('srs-due-count-hero').innerHTML = `
    <i data-lucide="alert-circle" class="w-4 h-4"></i> ${dueTopics.length} Temas para repasar hoy
  `;

  // Render Active Recall Queue Card
  if (dueTopics.length === 0) {
    container.innerHTML = `
      <div class="glass-card rounded-3xl p-10 text-center border-slate-800/80 space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-3xl">
          🧠
        </div>
        <h3 class="font-display font-bold text-lg text-white">¡Mente despejada!</h3>
        <p class="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          No tienes temas pendientes de repaso para hoy según la curva del olvido. Vuelve mañana o completa nuevos temas en tu Syllabus.
        </p>
      </div>
    `;
  } else {
    const current = dueTopics[0];
    const sub = state.subjects.find(s => s.id === current.subjectId);

    container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 border-rose-500/30 bg-gradient-to-b from-dark-850 to-dark-900 space-y-6 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <span class="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Active Recall & SRS
          </span>
          <span class="text-xs text-slate-400 font-mono">Quedan: ${dueTopics.length} hoy</span>
        </div>

        <div class="space-y-2 text-center py-4">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">${sub ? escapeHtml(sub.title) : 'Materia'}</div>
          <h3 class="font-display font-black text-xl sm:text-2xl text-white">${escapeHtml(current.title)}</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Recuerda activamente los conceptos clave de este tema sin mirar tus apuntes. Luego califica tu retención:
          </p>
        </div>

        <!-- Rating Buttons (Easy, Medium, Hard) -->
        <div class="grid grid-cols-3 gap-3 pt-2">
          <button onclick="rateSRS('${current.id}', 'hard')" class="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex flex-col items-center gap-1 transition-all">
            <span class="text-lg">🔴</span>
            <span>Difícil</span>
            <span class="text-[10px] text-slate-400 font-normal">Repasar Mañana</span>
          </button>

          <button onclick="rateSRS('${current.id}', 'medium')" class="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex flex-col items-center gap-1 transition-all">
            <span class="text-lg">🟡</span>
            <span>Medio</span>
            <span class="text-[10px] text-slate-400 font-normal">3 - 7 Días</span>
          </button>

          <button onclick="rateSRS('${current.id}', 'easy')" class="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex flex-col items-center gap-1 transition-all">
            <span class="text-lg">🟢</span>
            <span>Fácil</span>
            <span class="text-[10px] text-slate-400 font-normal">7 - 30 Días</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render Full Table Schedule
  if (state.topics.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No hay temas en el sistema.</td></tr>';
  } else {
    tableBody.innerHTML = state.topics.map(t => {
      const sub = state.subjects.find(s => s.id === t.subjectId);
      const isDue = t.nextReviewDate && t.nextReviewDate <= todayStr;

      return `
        <tr class="hover:bg-dark-850/50 transition-colors">
          <td class="py-2.5 px-3 font-semibold text-white">${escapeHtml(t.title)}</td>
          <td class="py-2.5 px-3 text-slate-400">${sub ? escapeHtml(sub.title) : 'General'}</td>
          <td class="py-2.5 px-3 text-slate-400 font-mono text-[11px]">${t.lastReviewed || 'Sin repasar'}</td>
          <td class="py-2.5 px-3 font-mono text-[11px] ${isDue ? 'text-rose-400 font-bold' : 'text-slate-300'}">${t.nextReviewDate || 'No agendado'}</td>
          <td class="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400">${t.interval || 0} días</td>
        </tr>
      `;
    }).join('');
  }
}

// Ebbinghaus Spaced Repetition Rating Handler
function rateSRS(topicId, rating) {
  const topic = state.topics.find(t => t.id === topicId);
  if (!topic) return;

  let ease = topic.easeFactor || 2.5;
  let interval = topic.interval || 0;

  if (rating === 'easy') {
    ease = Math.max(1.3, ease + 0.15);
    interval = interval === 0 ? 7 : Math.round(interval * ease * 1.3);
  } else if (rating === 'medium') {
    interval = interval === 0 ? 3 : Math.round(interval * 1.5);
  } else if (rating === 'hard') {
    ease = Math.max(1.3, ease - 0.2);
    interval = 1;
  }

  topic.easeFactor = ease;
  topic.interval = interval;
  topic.lastReviewed = getFormattedDate();

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  topic.nextReviewDate = getFormattedDate(nextDate);

  // Log SRS session activity
  state.logs.push({
    id: 'log_' + Date.now(),
    subjectId: topic.subjectId,
    topicId: topic.id,
    date: getFormattedDate(),
    durationMinutes: 15,
    type: 'srs'
  });

  saveState();
  renderAllViews();
}


// ==========================================
// 5. HELPER FUNCTIONS & DROPDOWNS
// ==========================================

function populateSubjectDropdowns() {
  const inboxSubSelect = document.getElementById('inbox-subject-id');
  const timeblockSubSelect = document.getElementById('timeblock-subject-id');
  const pomoSubSelect = document.getElementById('pomo-subject-select');
  const inboxFilterSubSelect = document.getElementById('inbox-subject-filter');

  const optionsHTML = state.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');

  if (inboxSubSelect) inboxSubSelect.innerHTML = optionsHTML || '<option value="">Crea primero una materia</option>';
  if (timeblockSubSelect) timeblockSubSelect.innerHTML = optionsHTML || '<option value="">Crea primero una materia</option>';

  if (pomoSubSelect) {
    pomoSubSelect.innerHTML = '<option value="none">-- Sesión General de Estudio --</option>' + optionsHTML;
  }

  if (inboxFilterSubSelect) {
    inboxFilterSubSelect.innerHTML = '<option value="all">Todas las materias</option>' + optionsHTML;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}


// ==========================================
// 6. EVENT LISTENERS & INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadInitialState();
  renderAllViews();

  // Navigation tab clicks
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Energy level selectors
  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.energyLevel = btn.dataset.energy;
      saveState();
      renderEnergyBanner();
      renderDashboard();
    });
  });

  // Quick Add Button
  document.getElementById('btn-quick-add').addEventListener('click', () => {
    openModal('modal-topic');
  });

  // Forms submit listeners
  document.getElementById('form-subject').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('subject-name').value.trim();
    const desc = document.getElementById('subject-desc').value.trim();
    const weeks = parseInt(document.getElementById('subject-weeks').value, 10);
    const color = document.getElementById('subject-color').value;

    if (name) {
      state.subjects.push({
        id: 'sub_' + Date.now(),
        title: name,
        description: desc,
        weeksCount: weeks,
        color: color,
        createdAt: Date.now()
      });
      saveState();
      closeModal('modal-subject');
      document.getElementById('form-subject').reset();
      renderAllViews();
    }
  });

  document.getElementById('form-topic').addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectId = document.getElementById('topic-subject-id').value;
    const week = parseInt(document.getElementById('topic-week-select').value, 10);
    const title = document.getElementById('topic-title').value.trim();
    const energy = document.getElementById('topic-energy-level').value;

    if (subjectId && title) {
      state.topics.push({
        id: 'top_' + Date.now(),
        subjectId: subjectId,
        week: week,
        title: title,
        completed: false,
        energyLevel: energy,
        easeFactor: 2.5,
        interval: 0,
        lastReviewed: null,
        nextReviewDate: null,
        completedAt: null
      });
      saveState();
      closeModal('modal-topic');
      document.getElementById('form-topic').reset();
      renderAllViews();
    }
  });

  document.getElementById('form-inbox').addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectId = document.getElementById('inbox-subject-id').value;
    const title = document.getElementById('inbox-title').value.trim();
    const url = document.getElementById('inbox-url').value.trim();
    const note = document.getElementById('inbox-note').value.trim();

    if (subjectId && title) {
      state.inbox.push({
        id: 'inb_' + Date.now(),
        subjectId: subjectId,
        title: title,
        url: url,
        note: note,
        type: url.includes('youtube') ? 'youtube' : 'article',
        status: 'pending',
        createdAt: Date.now()
      });
      saveState();
      closeModal('modal-inbox');
      document.getElementById('form-inbox').reset();
      renderAllViews();
    }
  });

  document.getElementById('form-timeblock').addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectId = document.getElementById('timeblock-subject-id').value;
    const title = document.getElementById('timeblock-title').value.trim();
    const start = document.getElementById('timeblock-start').value;
    const end = document.getElementById('timeblock-end').value;

    const sub = state.subjects.find(s => s.id === subjectId);

    if (subjectId && title) {
      state.timeBlocks.push({
        id: 'tb_' + Date.now(),
        subjectId: subjectId,
        topicTitle: title,
        date: activeDatePlanner,
        startTime: start,
        endTime: end,
        color: sub ? sub.color : 'indigo'
      });
      saveState();
      closeModal('modal-timeblock');
      document.getElementById('form-timeblock').reset();
      renderAllViews();
    }
  });

  // Modal Triggers
  document.getElementById('btn-add-subject').addEventListener('click', () => openModal('modal-subject'));
  document.getElementById('btn-add-inbox').addEventListener('click', () => openModal('modal-inbox'));
  document.getElementById('btn-add-timeblock').addEventListener('click', () => openModal('modal-timeblock'));
  document.getElementById('btn-open-backup').addEventListener('click', () => openModal('modal-backup'));

  // Inbox Filters
  document.querySelectorAll('.inbox-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inbox-filter-btn').forEach(b => {
        b.className = 'inbox-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800';
      });
      btn.className = 'inbox-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
      inboxFilterStatus = btn.dataset.filterStatus;
      renderInbox();
    });
  });

  document.getElementById('inbox-subject-filter').addEventListener('change', (e) => {
    inboxFilterSubject = e.value;
    renderInbox();
  });

  // Planner Day Navigation
  document.getElementById('planner-prev-day').addEventListener('click', () => {
    const d = new Date(activeDatePlanner);
    d.setDate(d.getDate() - 1);
    activeDatePlanner = getFormattedDate(d);
    renderPlanner();
  });

  document.getElementById('planner-next-day').addEventListener('click', () => {
    const d = new Date(activeDatePlanner);
    d.setDate(d.getDate() + 1);
    activeDatePlanner = getFormattedDate(d);
    renderPlanner();
  });

  // Pomodoro Controls
  document.getElementById('btn-pomo-toggle').addEventListener('click', togglePomodoro);
  document.getElementById('btn-pomo-reset').addEventListener('click', resetPomodoro);

  document.querySelectorAll('.pomo-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pomo-preset-btn').forEach(b => {
        b.className = 'pomo-preset-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700';
      });
      btn.className = 'pomo-preset-btn text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';

      pomoState.workMinutes = parseInt(btn.dataset.pomoWork, 10);
      pomoState.breakMinutes = parseInt(btn.dataset.pomoBreak, 10);
      resetPomodoro();
    });
  });

  // Audio Lab Buttons
  document.querySelectorAll('.audio-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.audio-type-btn').forEach(b => {
        b.className = 'audio-type-btn p-3 rounded-xl border border-slate-800 bg-dark-850 text-slate-300 hover:bg-slate-800 text-xs font-medium flex items-center gap-2.5';
      });
      btn.className = 'audio-type-btn p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 bg-indigo-500/20 border-indigo-500/40 text-indigo-300';

      const type = btn.dataset.audioType;
      state.settings.ambientSound = type;
      saveState();

      const vol = parseInt(document.getElementById('audio-volume-slider').value, 10);
      audioLab.playAmbient(type, vol);
    });
  });

  document.getElementById('audio-volume-slider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('audio-volume-text').innerText = `${val}%`;
    state.settings.soundVolume = val;
    saveState();
    audioLab.setVolume(val);
  });

  document.getElementById('btn-test-chime').addEventListener('click', () => {
    audioLab.playAlarmChime();
  });

  // JSON Import & Export
  document.getElementById('btn-export-json').addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `studyflow_backup_${getFormattedDate()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  });

  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('input-import-json').click();
  });

  document.getElementById('input-import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.subjects && imported.topics) {
            state = imported;
            saveState();
            renderAllViews();
            closeModal('modal-backup');
            alert('¡Copia de seguridad importada con éxito!');
          } else {
            alert('El archivo JSON no tiene la estructura válida de StudyFlow.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('PWA ServiceWorker registrado con éxito:', reg.scope))
        .catch(err => console.warn('Error al registrar ServiceWorker:', err));
    });
  }

  // PWA Install Prompt Listener
  let deferredPrompt;
  const pwaInstallBtn = document.getElementById('btn-pwa-install');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.classList.remove('hidden');
      pwaInstallBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            pwaInstallBtn.classList.add('hidden');
          }
          deferredPrompt = null;
        });
      });
    }
  });
});
