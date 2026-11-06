// FieldKit Physical AI Runtime & Uncommon Web Interactive Simulation
// Inspired by webdev.teknium.io — Bayer 4x4 Dither, Braille Tracking, WebAudio & Mission State Engine
(() => {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (Zero-Dependency WebAudio) ---
  let audioCtx = null;
  let sfxEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBlip(freq = 1100, duration = 0.035, type = 'triangle', gainVal = 0.03) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playConfirmChime() {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 chord
      freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.04);
        osc.stop(audioCtx.currentTime + 0.22);
      });
    } catch (_) {}
  }

  // Hook up SFX Toggle button
  const sfxBtn = document.getElementById('sfxToggle');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxBtn.textContent = sfxEnabled ? '♫ SFX: ON' : '♫ SFX: OFF';
      sfxBtn.classList.toggle('on', sfxEnabled);
      if (sfxEnabled) playBlip(880, 0.05, 'sine', 0.05);
    });
  }

  // --- INTERACTIVE PHYSICAL AI CANVAS ---
  const canvas = document.getElementById('fieldkitCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    function resizeCanvas() {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : 880;
      height = canvas.height = window.innerWidth <= 640 ? 200 : 280;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Bayer 4x4 matrix for retro dither shading
    const BAYER_4X4 = [
      [ 0/16,  8/16,  2/16, 10/16],
      [12/16,  4/16, 14/16,  6/16],
      [ 3/16, 11/16,  1/16,  9/16],
      [15/16,  7/16, 13/16,  5/16]
    ];

    const TARGETS = {
      loto: {
        id: 'LOTO-480V-BREAKER',
        name: '480V BREAKER #04',
        type: 'ELECTRICAL_ISOLATION',
        hint: 'Align thumb & index to verify padlock shackle locked',
        rx: 0.52, ry: 0.44, rw: 130, rh: 80
      },
      pump: {
        id: 'PUMP-HOUSING-MANIFOLD',
        name: 'CENTRIFUGAL CASING',
        type: 'MECHANICAL_SEAL',
        hint: 'Verify zero psi differential before bolt extraction',
        rx: 0.46, ry: 0.46, rw: 150, rh: 95
      },
      tccc: {
        id: 'TCCC-CAT-TOURNIQUET',
        name: 'FEMORAL ARTERY SITE',
        type: 'HEMORRHAGE_CONTROL',
        hint: 'Pinch windlass rod and lock into C-clip',
        rx: 0.50, ry: 0.48, rw: 140, rh: 85
      },
      tamper: {
        id: 'RACK-TAMPER-SEAL-R04',
        name: 'SECURITY VOID SEAL',
        type: 'PHYSICAL_TAMPER',
        hint: 'Trace holographic edge for micro-fractures',
        rx: 0.48, ry: 0.45, rw: 135, rh: 75
      }
    };

    let currentTargetKey = 'loto';
    let mouseX = 0.3;
    let mouseY = 0.6;
    let isHoveringCanvas = false;

    // Target buttons
    document.querySelectorAll('.target-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.target-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTargetKey = btn.dataset.target || 'loto';
        playBlip(750, 0.04, 'triangle');
        updateHudInstruction();
      });
    });

    canvas.addEventListener('pointerenter', () => { isHoveringCanvas = true; });
    canvas.addEventListener('pointerleave', () => { isHoveringCanvas = false; });
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });

    const instructionEl = document.getElementById('hudInstruction');
    function updateHudInstruction() {
      if (instructionEl && TARGETS[currentTargetKey]) {
        instructionEl.textContent = `AIM: ${TARGETS[currentTargetKey].name} — ${TARGETS[currentTargetKey].hint}`;
      }
    }
    updateHudInstruction();

    // Braille glyph generator
    const BRAILLE_CHARS = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
    let brailleIdx = 0;

    let t = 0;
    let verifiedCooldown = 0;

    function renderCanvas() {
      t += 0.03;
      brailleIdx = Math.floor(t * 8) % BRAILLE_CHARS.length;

      // Dark background
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, width, height);

      // Subtle Bayer Dither pattern on background
      ctx.fillStyle = 'rgba(245, 184, 46, 0.025)';
      for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
          const b = BAYER_4X4[(y/8)%4][(x/8)%4];
          if (b > 0.5) ctx.fillRect(x, y, 2, 2);
        }
      }

      // First-person FOV subtle grid
      ctx.strokeStyle = 'rgba(77, 232, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSpacing = 32;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Target geometry
      const tgt = TARGETS[currentTargetKey];
      const targetW = Math.min(tgt.rw, width * 0.4);
      const targetH = Math.min(tgt.rh, height * 0.45);
      const targetX = width * tgt.rx + Math.sin(t * 0.6) * (width * 0.02);
      const targetY = height * tgt.ry + Math.cos(t * 0.6) * (height * 0.02);

      // Target Bounding Box
      const boxLeft = targetX - targetW / 2;
      const boxTop = targetY - targetH / 2;

      ctx.strokeStyle = '#f5b82e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxLeft, boxTop, targetW, targetH);

      // Corner brackets (tactile HUD look)
      ctx.fillStyle = '#f5b82e';
      const c = 10;
      ctx.fillRect(boxLeft - 2, boxTop - 2, c, 3);
      ctx.fillRect(boxLeft - 2, boxTop - 2, 3, c);
      ctx.fillRect(boxLeft + targetW - c + 2, boxTop - 2, c, 3);
      ctx.fillRect(boxLeft + targetW - 1, boxTop - 2, 3, c);
      ctx.fillRect(boxLeft - 2, boxTop + targetH - 1, c, 3);
      ctx.fillRect(boxLeft - 2, boxTop + targetH - c + 2, 3, c);
      ctx.fillRect(boxLeft + targetW - c + 2, boxTop + targetH - 1, c, 3);
      ctx.fillRect(boxLeft + targetW - 1, boxTop + targetH - c + 2, 3, c);

      // Target Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f5b82e';
      ctx.fillText(`[FOV] ${tgt.id}`, boxLeft + 6, boxTop - 7);

      // Operator Skeletal Hand Position
      let operatorHandX, operatorHandY;
      if (isHoveringCanvas) {
        operatorHandX = width * mouseX;
        operatorHandY = height * mouseY;
      } else {
        // Autonomous trajectory when idle
        operatorHandX = width * (0.35 + Math.sin(t * 0.8) * 0.22);
        operatorHandY = height * (0.48 + Math.cos(t * 0.8) * 0.18);
      }

      // Check raycast intersection
      const inTarget = (
        operatorHandX >= boxLeft && operatorHandX <= boxLeft + targetW &&
        operatorHandY >= boxTop && operatorHandY <= boxTop + targetH
      );

      // Pinch dynamics
      const pinchOsc = inTarget ? 0.95 : (Math.sin(t * 3.0) + 1) / 2;
      const pinchDist = 12 * (1 - pinchOsc);

      const thumbX = operatorHandX - pinchDist;
      const thumbY = operatorHandY + pinchDist * 0.6;
      const indexX = operatorHandX + pinchDist;
      const indexY = operatorHandY - pinchDist * 0.6;

      // Draw Raycast line
      ctx.strokeStyle = inTarget ? 'rgba(78, 255, 155, 0.6)' : 'rgba(77, 232, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(operatorHandX, operatorHandY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Hand Landmarks
      ctx.fillStyle = inTarget ? '#4eff9b' : '#4de8ff';
      ctx.beginPath(); ctx.arc(thumbX, thumbY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(indexX, indexY, 3.5, 0, Math.PI * 2); ctx.fill();

      // Skeletal bone segment connecting thumb and index
      ctx.strokeStyle = inTarget ? 'rgba(78, 255, 155, 0.7)' : 'rgba(77, 232, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(thumbX, thumbY);
      ctx.lineTo(indexX, indexY);
      ctx.stroke();

      // Trigger verified sound and pulse when entering target
      if (inTarget && verifiedCooldown <= 0) {
        playConfirmChime();
        verifiedCooldown = 40; // frames
      }
      if (verifiedCooldown > 0) verifiedCooldown--;

      // HUD Monospace Overlay Information
      ctx.fillStyle = inTarget ? '#4eff9b' : '#f5b82e';
      ctx.font = '11px "JetBrains Mono", monospace';
      const statusText = inTarget 
        ? `${BRAILLE_CHARS[brailleIdx]} 100% GROUNDED · CONTACT VERIFIED (RAYCAST LOCKED)`
        : `${BRAILLE_CHARS[brailleIdx]} 38ms LATENCY · HANDS-BUSY TRACKING ACTIVE`;
      ctx.fillText(statusText, 14, height - 14);

      // Latency wave graph in bottom right
      const jitter = Math.round(34 + Math.sin(t * 1.5) * 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`EDGE COMPUTE: ${jitter}ms · 30 FPS`, width - 195, height - 14);

      requestAnimationFrame(renderCanvas);
    }
    requestAnimationFrame(renderCanvas);
  }

  // --- INTERACTIVE MISSION STATE MACHINE WORKBENCH ---
  const MISSIONS = {
    industrial: {
      name: 'Industrial Centrifugal Pump Overhaul',
      tag: 'INDUSTRIAL-REPAIR',
      steps: [
        {
          num: 1,
          id: 'STEP_01_LOTO_CONFIRM',
          title: 'Confirm 480V Breaker Lockout/Tagout',
          desc: 'Verify the padlock is secured around MCC Cubicle 4B and tag #4092 is attached. The system will raycast the shackle geometry.',
          voice: '"Lockout verified on 480V Breaker 4B. Pressure transducer shows zero residual voltage."',
          target: '480V_MCC_CUBICLE_4B',
          status: 'COMPLETED'
        },
        {
          num: 2,
          id: 'STEP_02_PRESSURE_BLEED',
          title: 'Bleed Suction and Discharge Manifolds',
          desc: 'Ensure suction valve V-101 and discharge valve V-102 are sealed. Open the petcock bleed valve until the needle reads 0.0 PSI.',
          voice: '"Manifold depressurized. 0.0 PSI confirmed. Proceed to casing removal."',
          target: 'GAUGE_PI_104_DIAL',
          status: 'ACTIVE'
        },
        {
          num: 3,
          id: 'STEP_03_CASING_DISASSEMBLY',
          title: 'Star-Pattern Casing Bolt Extraction',
          desc: 'Use torque wrench set to 85 ft-lb. Break bolts loose in diagonal cross pattern to avoid warped seal gland mating faces.',
          voice: '"Torque pattern followed. 8 of 8 bolts removed. Gland plate is free."',
          target: 'VOLUTE_GLAND_BOLT_01',
          status: 'PENDING'
        },
        {
          num: 4,
          id: 'STEP_04_SEAL_INSPECTION',
          title: 'Silicon-Carbide Mechanical Seal Audit',
          desc: 'Inspect primary ring and mating stationary face under high-intensity task light for heat checking or pitting.',
          voice: '"Silicon-carbide face inspected. Radial score line detected at 3 o\'clock. Replace seal."',
          target: 'SIC_ROTATING_FACE',
          status: 'PENDING'
        }
      ]
    },
    tccc: {
      name: 'Tactile Combat Casualty Care (TCCC)',
      tag: 'TACTICAL-EMERGENCY',
      steps: [
        {
          num: 1,
          id: 'STEP_01_FIRE_SUPPRESSION',
          title: 'Direct Casualty to Take Cover & Return Fire',
          desc: 'Care Under Fire doctrine. Ensure casualty is in defilade before hands-on physical medical contact.',
          voice: '"Cover established. Casualty responsive. Clear to deploy tourniquet."',
          target: 'THREAT_SECTOR_OVERWATCH',
          status: 'COMPLETED'
        },
        {
          num: 2,
          id: 'STEP_02_CAT_PLACEMENT',
          title: 'High-and-Tight Extremity Application',
          desc: 'Route Combat Application Tourniquet 2–3 inches above femoral wound site over uniform.',
          voice: '"Band routed through friction buckle. Pull tail snug. Zero slack."',
          target: 'UPPER_FEMORAL_JUNCTION',
          status: 'ACTIVE'
        },
        {
          num: 3,
          id: 'STEP_03_WINDLASS_ROTATION',
          title: 'Tighten Windlass Until Distal Pulse Stops',
          desc: 'Rotate windlass rod until bright red bleeding ceases and distal pedal pulse is absent.',
          voice: '"Bleeding arrested. Windlass locked in retention clip. Note time on strap."',
          target: 'CAT_WINDLASS_CLIP',
          status: 'PENDING'
        }
      ]
    },
    datacenter: {
      name: 'Datacenter Physical Tamper Sweep',
      tag: 'SECURITY-INSPECTION',
      steps: [
        {
          num: 1,
          id: 'STEP_01_CAGE_BIOMETRIC',
          title: 'Audit Biometric Access & Latch Engagement',
          desc: 'Verify that the caged suite door spring-latch firmly engages upon release without operator assist.',
          voice: '"Door closure confirmed. Latched within 2.1 seconds. Biometric relay reset."',
          target: 'SUITE_DOOR_STRIKE_PLATE',
          status: 'COMPLETED'
        },
        {
          num: 2,
          id: 'STEP_02_RACK_SEAL_AUDIT',
          title: 'Inspect Anti-Tamper Holographic Seals',
          desc: 'High-resolution scan of server tray seals. Detect microscopic void-pattern distortion or slit razor entries.',
          voice: '"Rack 04 seals pristine. No void micro-patterns detected. Integrity verified."',
          target: 'VOID_SEAL_RACK_04_A',
          status: 'ACTIVE'
        },
        {
          num: 3,
          id: 'STEP_03_HARDWARE_TAP_SWEEP',
          title: 'Inspect In-Line Management Bus Cables',
          desc: 'Audit OOBM management Ethernet cables for parasitic inline implants or rogue passive splitters.',
          voice: '"All OOBM lines trace directly to leaf switch. Zero rogue taps detected."',
          target: 'RJ45_PATCH_PANEL_LEAF2',
          status: 'PENDING'
        }
      ]
    }
  };

  let activeMissionKey = 'industrial';
  let activeStepIndex = 1;

  function renderMissionWorkbench() {
    const mission = MISSIONS[activeMissionKey];
    if (!mission) return;

    // Tabs
    document.querySelectorAll('.wb-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mission === activeMissionKey);
    });

    const step = mission.steps[activeStepIndex];
    const totalSteps = mission.steps.length;

    const titleEl = document.getElementById('wbStepTitle');
    const descEl = document.getElementById('wbStepDesc');
    const voiceEl = document.getElementById('wbVoiceText');
    const badgeEl = document.getElementById('wbStepBadge');
    const jsonEl = document.getElementById('wbJsonOutput');

    if (titleEl) titleEl.textContent = `Step ${step.num} of ${totalSteps}: ${step.title}`;
    if (descEl) descEl.textContent = step.desc;
    if (voiceEl) voiceEl.textContent = `PROACTIVE AUDIO: ${step.voice}`;
    if (badgeEl) badgeEl.textContent = `CHECKPOINT: ${step.id} · ${step.target}`;

    if (jsonEl) {
      const stateObj = {
        framework: "FieldKit v1.0",
        mission_id: activeMissionKey,
        current_step: step.num,
        step_id: step.id,
        required_target: step.target,
        hands_busy: true,
        edge_latency_ms: Math.round(36 + Math.random() * 8),
        tracking_confidence: 0.984,
        proactive_speech_dispatched: true
      };
      jsonEl.textContent = JSON.stringify(stateObj, null, 2);
    }
  }

  // Wire mission tabs
  document.querySelectorAll('.wb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeMissionKey = tab.dataset.mission || 'industrial';
      activeStepIndex = 0;
      playBlip(950, 0.04, 'triangle');
      renderMissionWorkbench();
    });
  });

  // Advance step button
  const advanceBtn = document.getElementById('wbAdvanceBtn');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', () => {
      const mission = MISSIONS[activeMissionKey];
      if (activeStepIndex < mission.steps.length - 1) {
        activeStepIndex++;
        playConfirmChime();
      } else {
        activeStepIndex = 0;
        playBlip(600, 0.05, 'sine');
      }
      renderMissionWorkbench();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('wbResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeStepIndex = 0;
      playBlip(500, 0.04, 'sine');
      renderMissionWorkbench();
    });
  }

  // Keybinding: Space bar advances step when workbench is in view
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
      const wb = document.getElementById('workbench');
      if (wb && isElementInViewport(wb)) {
        e.preventDefault();
        if (advanceBtn) advanceBtn.click();
      }
    }
  });

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= -200 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 200
    );
  }

  renderMissionWorkbench();

  // --- UNCOMMON WEB CHARACTER SCRAMBLE DECODE ---
  const GLYPHS = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏▦⬡⠿⠾⠽⠻01#_';
  document.querySelectorAll('.kicker, .nav-cta, .btn-primary, .spec-chip').forEach(el => {
    const orig = el.textContent;
    el.addEventListener('mouseenter', () => {
      playBlip(1250, 0.02, 'triangle', 0.015);
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        el.textContent = orig.split('').map((c, i) => {
          if (c === ' ' || i < frame / 2) return c;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join('');
        if (frame > orig.length * 2) {
          clearInterval(interval);
          el.textContent = orig;
        }
      }, 25);
    });
  });

  // Audio blip on all links and interactive buttons
  document.querySelectorAll('a, button, .wb-tab, .target-pill').forEach(el => {
    el.addEventListener('pointerenter', () => {
      playBlip(1100, 0.02, 'triangle', 0.015);
    });
  });

})();
