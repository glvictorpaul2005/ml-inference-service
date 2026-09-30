/**
 * AegisML Diagnostic Intelligence - Interactive Frontend Engine
 * Authored by GL Victor Paul
 */

const FEATURES = [
  // 1-10: Mean Morphometric Core
  { id: 'mean_radius', name: 'Mean Radius', group: 'core', min: 6.0, max: 30.0, step: 0.1, unit: 'mm', benign: 13.54, malignant: 17.99, borderline: 14.25 },
  { id: 'mean_texture', name: 'Mean Texture', group: 'core', min: 9.0, max: 40.0, step: 0.1, unit: 'HU', benign: 14.36, malignant: 10.38, borderline: 18.5 },
  { id: 'mean_perimeter', name: 'Mean Perimeter', group: 'core', min: 40.0, max: 190.0, step: 0.5, unit: 'mm', benign: 87.46, malignant: 122.8, borderline: 92.5 },
  { id: 'mean_area', name: 'Mean Area', group: 'core', min: 140.0, max: 2500.0, step: 5.0, unit: 'mm²', benign: 566.3, malignant: 1001.0, borderline: 630.0 },
  { id: 'mean_smoothness', name: 'Mean Smoothness', group: 'core', min: 0.05, max: 0.17, step: 0.001, unit: 'index', benign: 0.0978, malignant: 0.1184, borderline: 0.098 },
  { id: 'mean_compactness', name: 'Mean Compactness', group: 'core', min: 0.01, max: 0.35, step: 0.001, unit: 'index', benign: 0.0813, malignant: 0.2776, borderline: 0.105 },
  { id: 'mean_concavity', name: 'Mean Concavity', group: 'core', min: 0.00, max: 0.45, step: 0.001, unit: 'index', benign: 0.0666, malignant: 0.3001, borderline: 0.085 },
  { id: 'mean_concave_points', name: 'Mean Concave Points', group: 'core', min: 0.00, max: 0.21, step: 0.001, unit: 'index', benign: 0.0478, malignant: 0.1471, borderline: 0.052 },
  { id: 'mean_symmetry', name: 'Mean Symmetry', group: 'core', min: 0.10, max: 0.31, step: 0.001, unit: 'index', benign: 0.1885, malignant: 0.2419, borderline: 0.185 },
  { id: 'mean_fractal_dimension', name: 'Mean Fractal Dim', group: 'core', min: 0.04, max: 0.10, step: 0.001, unit: 'index', benign: 0.0577, malignant: 0.0787, borderline: 0.063 },

  // 11-20: Standard Errors (Biopsy Variations)
  { id: 'radius_error', name: 'Radius Error', group: 'se', min: 0.10, max: 2.90, step: 0.01, unit: 'SE', benign: 0.2699, malignant: 1.095, borderline: 0.35 },
  { id: 'texture_error', name: 'Texture Error', group: 'se', min: 0.30, max: 4.90, step: 0.01, unit: 'SE', benign: 0.7886, malignant: 0.9053, borderline: 1.05 },
  { id: 'perimeter_error', name: 'Perimeter Error', group: 'se', min: 0.50, max: 22.0, step: 0.1, unit: 'SE', benign: 2.058, malignant: 8.589, borderline: 2.6 },
  { id: 'area_error', name: 'Area Error', group: 'se', min: 5.0, max: 540.0, step: 1.0, unit: 'SE', benign: 23.56, malignant: 153.4, borderline: 32.0 },
  { id: 'smoothness_error', name: 'Smoothness Error', group: 'se', min: 0.001, max: 0.032, step: 0.0005, unit: 'SE', benign: 0.0085, malignant: 0.0064, borderline: 0.007 },
  { id: 'compactness_error', name: 'Compactness Error', group: 'se', min: 0.002, max: 0.136, step: 0.001, unit: 'SE', benign: 0.0146, malignant: 0.049, borderline: 0.025 },
  { id: 'concavity_error', name: 'Concavity Error', group: 'se', min: 0.000, max: 0.397, step: 0.001, unit: 'SE', benign: 0.0239, malignant: 0.0537, borderline: 0.032 },
  { id: 'concave_points_error', name: 'Concave Points Error', group: 'se', min: 0.000, max: 0.053, step: 0.0005, unit: 'SE', benign: 0.0132, malignant: 0.0159, borderline: 0.014 },
  { id: 'symmetry_error', name: 'Symmetry Error', group: 'se', min: 0.007, max: 0.079, step: 0.001, unit: 'SE', benign: 0.0198, malignant: 0.030, borderline: 0.022 },
  { id: 'fractal_dimension_error', name: 'Fractal Dim Error', group: 'se', min: 0.0009, max: 0.030, step: 0.0005, unit: 'SE', benign: 0.0023, malignant: 0.0062, borderline: 0.0035 },

  // 21-30: Worst Extrema (Aggressive Margins)
  { id: 'worst_radius', name: 'Worst Radius', group: 'worst', min: 7.0, max: 37.0, step: 0.1, unit: 'mm', benign: 15.11, malignant: 25.38, borderline: 16.5 },
  { id: 'worst_texture', name: 'Worst Texture', group: 'worst', min: 10.0, max: 50.0, step: 0.1, unit: 'HU', benign: 19.26, malignant: 17.33, borderline: 24.5 },
  { id: 'worst_perimeter', name: 'Worst Perimeter', group: 'worst', min: 50.0, max: 255.0, step: 0.5, unit: 'mm', benign: 99.7, malignant: 184.6, borderline: 108.0 },
  { id: 'worst_area', name: 'Worst Area', group: 'worst', min: 180.0, max: 4260.0, step: 10.0, unit: 'mm²', benign: 711.2, malignant: 2019.0, borderline: 840.0 },
  { id: 'worst_smoothness', name: 'Worst Smoothness', group: 'worst', min: 0.07, max: 0.23, step: 0.001, unit: 'index', benign: 0.144, malignant: 0.1622, borderline: 0.135 },
  { id: 'worst_compactness', name: 'Worst Compactness', group: 'worst', min: 0.02, max: 1.06, step: 0.005, unit: 'index', benign: 0.1773, malignant: 0.6656, borderline: 0.24 },
  { id: 'worst_concavity', name: 'Worst Concavity', group: 'worst', min: 0.00, max: 1.26, step: 0.005, unit: 'index', benign: 0.239, malignant: 0.7119, borderline: 0.28 },
  { id: 'worst_concave_points', name: 'Worst Concave Points', group: 'worst', min: 0.00, max: 0.30, step: 0.001, unit: 'index', benign: 0.1288, malignant: 0.2654, borderline: 0.115 },
  { id: 'worst_symmetry', name: 'Worst Symmetry', group: 'worst', min: 0.15, max: 0.67, step: 0.005, unit: 'index', benign: 0.2977, malignant: 0.4601, borderline: 0.31 },
  { id: 'worst_fractal_dimension', name: 'Worst Fractal Dim', group: 'worst', min: 0.05, max: 0.21, step: 0.001, unit: 'index', benign: 0.0726, malignant: 0.1189, borderline: 0.082 }
];

let activeTab = 'core';
let sessionHistory = [];
let currentPatientId = 'Patient #1042';

// DOM Elements
const featuresContainer = document.getElementById('featuresContainer');
const tabButtons = document.querySelectorAll('.tab-btn');
const runInferenceBtn = document.getElementById('runInferenceBtn');
const resetBtn = document.getElementById('resetBtn');
const gaugeProgress = document.getElementById('gaugeProgress');
const gaugePercent = document.getElementById('gaugePercent');
const verdictBadge = document.getElementById('verdictBadge');
const verdictDesc = document.getElementById('verdictDesc');
const telemetryLatency = document.getElementById('telemetryLatency');
const telemetryCache = document.getElementById('telemetryCache');
const telemetryModel = document.getElementById('telemetryModel');
const telemetryAuc = document.getElementById('telemetryAuc');
const headerRequests = document.getElementById('headerRequests');
const headerHitRate = document.getElementById('headerHitRate');
const historyTableBody = document.getElementById('historyTableBody');
const impactList = document.getElementById('impactList');
const clinicalRecommendation = document.getElementById('clinicalRecommendation');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();
  setupTabs();
  setupPresets();
  setupModal();
  loadPreset('benign', 'Patient #1042 (Benign)');
  fetchStats();
});

// Render Controls
function renderFeatures() {
  featuresContainer.innerHTML = '';
  
  FEATURES.forEach(feature => {
    const isVisible = feature.group === activeTab;
    const card = document.createElement('div');
    card.className = `feature-control ${isVisible ? '' : 'hidden'}`;
    card.id = `wrap_${feature.id}`;
    card.style.display = isVisible ? 'block' : 'none';

    card.innerHTML = `
      <div class="feature-meta">
        <span class="feature-name">${feature.name}</span>
        <span class="feature-unit">${feature.unit}</span>
      </div>
      <div class="feature-input-wrap">
        <input type="range" class="feature-slider" id="slider_${feature.id}" 
               min="${feature.min}" max="${feature.max}" step="${feature.step}" value="${feature.benign}">
        <input type="number" class="feature-num-input" id="num_${feature.id}" 
               min="${feature.min}" max="${feature.max}" step="${feature.step}" value="${feature.benign}">
      </div>
    `;

    featuresContainer.appendChild(card);

    const slider = card.querySelector(`#slider_${feature.id}`);
    const numInput = card.querySelector(`#num_${feature.id}`);

    slider.addEventListener('input', (e) => {
      numInput.value = e.target.value;
    });

    numInput.addEventListener('input', (e) => {
      slider.value = e.target.value;
    });
  });
}

// Tab Switching
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;

      FEATURES.forEach(f => {
        const wrap = document.getElementById(`wrap_${f.id}`);
        if (wrap) {
          wrap.style.display = f.group === activeTab ? 'block' : 'none';
        }
      });
    });
  });
}

// Presets
function setupPresets() {
  document.getElementById('presetBenign').addEventListener('click', () => {
    loadPreset('benign', 'Patient #1042 (Benign Specimen)');
  });

  document.getElementById('presetMalignant').addEventListener('click', () => {
    loadPreset('malignant', 'Patient #2087 (Malignant Specimen)');
  });

  document.getElementById('presetBorderline').addEventListener('click', () => {
    loadPreset('borderline', 'Patient #3144 (Borderline Profile)');
  });

  document.getElementById('presetRandom').addEventListener('click', () => {
    generateRandomSpecimen();
  });

  document.getElementById('presetStress').addEventListener('click', () => {
    runCacheStressTest();
  });

  runInferenceBtn.addEventListener('click', () => {
    runInference(currentPatientId);
  });

  resetBtn.addEventListener('click', () => {
    loadPreset('benign', 'Patient #1042 (Reset)');
  });
}

function loadPreset(type, label) {
  currentPatientId = label;
  FEATURES.forEach(f => {
    const val = f[type] !== undefined ? f[type] : f.benign;
    const slider = document.getElementById(`slider_${f.id}`);
    const num = document.getElementById(`num_${f.id}`);
    if (slider) slider.value = val;
    if (num) num.value = val;
  });
  runInference(label);
}

function generateRandomSpecimen() {
  currentPatientId = `Synthetic Specimen #${Math.floor(1000 + Math.random() * 9000)}`;
  FEATURES.forEach(f => {
    const factor = Math.random();
    const val = Number((f.min + factor * (f.max - f.min)).toFixed(f.step < 0.01 ? 4 : 2));
    const slider = document.getElementById(`slider_${f.id}`);
    const num = document.getElementById(`num_${f.id}`);
    if (slider) slider.value = val;
    if (num) num.value = val;
  });
  runInference(currentPatientId);
}

// Collect current feature values vector (exactly 30 floats in dataset order)
function getFeatureVector() {
  return FEATURES.map(f => {
    const num = document.getElementById(`num_${f.id}`);
    return parseFloat(num.value) || 0.0;
  });
}

// Execute Inference
async function runInference(patientLabel = 'Ad-hoc Assessment') {
  const vector = getFeatureVector();
  const startTime = performance.now();

  runInferenceBtn.disabled = true;
  runInferenceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Model...';

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: vector })
    });

    if (!response.ok) {
      throw new Error(`Inference Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const clientLatency = (performance.now() - startTime).toFixed(2);

    updateAssessmentUI(data, clientLatency, patientLabel, vector);
    fetchStats();
  } catch (err) {
    console.error('Inference failed:', err);
    alert('Prediction failed. Ensure the server is running on http://localhost:8000');
  } finally {
    runInferenceBtn.disabled = false;
    runInferenceBtn.innerHTML = '<i class="fas fa-microscope"></i> Run Clinical Inference';
  }
}

// Update UI with Model Output
function updateAssessmentUI(result, clientLatency, label, vector) {
  // Label and Probability
  const isMalignant = result.label.toLowerCase() === 'malignant';
  const prob = result.probability;
  const maligScore = isMalignant ? prob : (1 - prob);
  const percentText = (prob * 100).toFixed(1) + '%';

  // Gauge Circumference = 2 * PI * 85 ~= 534
  const circumference = 534;
  const strokeOffset = circumference - (maligScore * circumference);

  gaugeProgress.style.strokeDashoffset = strokeOffset;
  if (maligScore > 0.6) {
    gaugeProgress.style.stroke = '#ef4444';
    gaugeProgress.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))';
  } else if (maligScore > 0.35) {
    gaugeProgress.style.stroke = '#f59e0b';
    gaugeProgress.style.filter = 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))';
  } else {
    gaugeProgress.style.stroke = '#10b981';
    gaugeProgress.style.filter = 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))';
  }

  gaugePercent.textContent = percentText;

  // Verdict Badge
  if (isMalignant) {
    verdictBadge.className = 'verdict-badge malignant';
    verdictBadge.innerHTML = '<i class="fas fa-radiation"></i> MALIGNANT CARCINOMA';
    verdictDesc.textContent = 'High probability of invasive cellular malignancy detected based on high nuclear margin concavity and worst perimeter.';
    clinicalRecommendation.innerHTML = '<strong>Action Required:</strong> Immediate Fine-Needle Aspiration Biopsy (FNAB) and multidisciplinary oncology staging review indicated. Priority: Urgent.';
  } else {
    verdictBadge.className = 'verdict-badge benign';
    verdictBadge.innerHTML = '<i class="fas fa-shield-alt"></i> BENIGN / HEALTHY';
    verdictDesc.textContent = 'Cellular morphometry displays regular smooth nuclear borders and normal cellular architecture with high statistical confidence.';
    clinicalRecommendation.innerHTML = '<strong>Routine Follow-up:</strong> No signs of tissue malignancy. Standard 6-12 month mammography / imaging protocol recommended. Priority: Low.';
  }

  // Telemetry
  telemetryLatency.textContent = `${result.latency_ms.toFixed(2)} ms (client: ${clientLatency} ms)`;
  telemetryCache.className = result.cached ? 'telemetry-v cached' : 'telemetry-v';
  telemetryCache.textContent = result.cached ? 'HIT (Memory/Redis)' : 'MISS (Inferred)';
  telemetryModel.textContent = result.model_version;
  telemetryAuc.textContent = '0.9937 (99.4%)';

  // Feature Impact Breakdown
  updateImpactBars(vector, isMalignant);

  // Add to History
  addToHistory(label, result, result.latency_ms);
}

// Compute dynamic relative drivers
function updateImpactBars(vector, isMalignant) {
  // Highlight top 4 impactful features in Wisconsin dataset:
  // worst perimeter (idx 22), worst concave points (idx 27), worst area (idx 23), mean concavity (idx 6)
  const drivers = [
    { name: 'Worst Perimeter', val: vector[22], max: 250, unit: 'mm' },
    { name: 'Worst Concave Points', val: vector[27], max: 0.3, unit: 'index' },
    { name: 'Worst Area', val: vector[23], max: 4000, unit: 'mm²' },
    { name: 'Mean Concavity', val: vector[6], max: 0.45, unit: 'index' }
  ];

  impactList.innerHTML = '';
  drivers.forEach(d => {
    const pct = Math.min(100, Math.max(8, (d.val / d.max) * 100)).toFixed(0);
    const item = document.createElement('div');
    item.className = 'impact-item';
    item.innerHTML = `
      <div class="impact-header">
        <span class="impact-name">${d.name}</span>
        <span class="impact-val">${d.val} ${d.unit}</span>
      </div>
      <div class="impact-bar-wrap">
        <div class="impact-bar-fill" style="width: ${pct}%; background: ${isMalignant ? '#ef4444' : '#10b981'};"></div>
      </div>
    `;
    impactList.appendChild(item);
  });
}

function addToHistory(label, result, latency) {
  const item = {
    time: new Date().toLocaleTimeString(),
    label: label,
    verdict: result.label.toUpperCase(),
    prob: (result.probability * 100).toFixed(1) + '%',
    latency: `${latency.toFixed(2)} ms`,
    cached: result.cached
  };

  sessionHistory.unshift(item);
  if (sessionHistory.length > 8) sessionHistory.pop();

  historyTableBody.innerHTML = '';
  sessionHistory.forEach(h => {
    const tr = document.createElement('tr');
    const isM = h.verdict === 'MALIGNANT';
    tr.innerHTML = `
      <td>${h.time}</td>
      <td style="font-weight: 600; color: #fff;">${h.label}</td>
      <td><span class="badge-status ${isM ? 'malignant' : 'benign'}">${h.verdict}</span></td>
      <td style="font-family: monospace;">${h.prob}</td>
      <td style="font-family: monospace; color: var(--cyan-primary);">${h.latency}</td>
      <td><span class="telemetry-chip" style="padding: 2px 6px; font-size: 0.7rem; color: ${h.cached ? '#34d399' : '#9ca3af'};">${h.cached ? 'HIT' : 'MISS'}</span></td>
    `;
    historyTableBody.appendChild(tr);
  });
}

// Rapid Cache Test
async function runCacheStressTest() {
  currentPatientId = 'Cache Stress Profile (10x Calls)';
  const vector = getFeatureVector();

  runInferenceBtn.disabled = true;
  runInferenceBtn.innerHTML = '<i class="fas fa-bolt fa-spin"></i> Stress Testing Cache...';

  let totalMs = 0;
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: vector })
    });
    const d = await res.json();
    totalMs += (performance.now() - t0);
    if (i === 9) {
      updateAssessmentUI(d, (totalMs / 10).toFixed(2), `Cache Test Batch (Call #10)`, vector);
    }
  }

  fetchStats();
  runInferenceBtn.disabled = false;
  runInferenceBtn.innerHTML = '<i class="fas fa-microscope"></i> Run Clinical Inference';
}

// Fetch stats from server
async function fetchStats() {
  try {
    const res = await fetch('/stats');
    if (res.ok) {
      const s = await res.json();
      if (headerRequests) headerRequests.textContent = s.requests || 0;
      if (headerHitRate) headerHitRate.textContent = `${((s.cache_hit_rate || 0) * 100).toFixed(1)}%`;
    }
  } catch (e) {
    // optional telemetry
  }
}

// Architecture Modal
function setupModal() {
  const modal = document.getElementById('archModal');
  const openBtn = document.getElementById('openArchBtn');
  const closeBtn = document.getElementById('closeArchBtn');

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}
