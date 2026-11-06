// FieldKit Physical AI Runtime & Avant-Garde Uncommon Web Simulation
// 21-Joint Skeletal Hand Kinematics, WebCam Ingest, 3D Binaural Audio, Neural Voice Coach, DAG Engine & YAML Builder
(() => {
  'use strict';

  // --- 1. SPATIALIZED 3D BINAURAL WEBAUDIO & NEURAL VOICE COACH ---
  let audioCtx = null;
  let sfxEnabled = true;
  let voiceCoachEnabled = true;
  let currentPanX = 0; // -1.0 (Left) to +1.0 (Right)

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
      
      // Spatial 3D Stereo Panner
      let panner = null;
      if (audioCtx.createStereoPanner) {
        panner = audioCtx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, currentPanX)), audioCtx.currentTime);
      }

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(audioCtx.destination);
      } else {
        osc.connect(gain);
        gain.connect(audioCtx.destination);
      }

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
        let panner = null;
        if (audioCtx.createStereoPanner) {
          panner = audioCtx.createStereoPanner();
          panner.pan.setValueAtTime(Math.max(-1, Math.min(1, currentPanX)), audioCtx.currentTime);
        }

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        if (panner) {
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(audioCtx.destination);
        } else {
          osc.connect(gain);
          gain.connect(audioCtx.destination);
        }

        osc.start(audioCtx.currentTime + idx * 0.04);
        osc.stop(audioCtx.currentTime + 0.22);
      });
    } catch (_) {}
  }

  // Neural Voice Coach Synthesizer (Web Speech API)
  function speakProactiveDirective(text) {
    if (!voiceCoachEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean quotes
      const clean = text.replace(/["']/g, '');
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 1.05;
      u.pitch = 0.95;
      u.volume = 0.85;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  // SFX Toggle
  const sfxBtn = document.getElementById('sfxToggle');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxBtn.textContent = sfxEnabled ? '♫ SFX: ON' : '♫ SFX: OFF';
      sfxBtn.classList.toggle('on', sfxEnabled);
      if (sfxEnabled) playBlip(880, 0.05, 'sine', 0.05);
    });
  }

  // Voice Coach Toggle in Workbench
  const voiceToggleBtn = document.getElementById('wbVoiceToggle');
  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', () => {
      voiceCoachEnabled = !voiceCoachEnabled;
      voiceToggleBtn.textContent = voiceCoachEnabled ? '🗣️ Voice Coach: ON' : '🗣️ Voice Coach: OFF';
      voiceToggleBtn.classList.toggle('active', voiceCoachEnabled);
      playBlip(voiceCoachEnabled ? 1000 : 500, 0.04, 'triangle');
      if (voiceCoachEnabled) {
        speakProactiveDirective('Voice coach engaged. Ready for physical checkpoints.');
      } else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
    });
  }

  // Dynamic Spotlight Tracker
  document.querySelectorAll('.bento-card, .workbench-box, .hud-wrapper, .arch-flow-wrap').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- 2. MOBILE GYROSCOPE 9-DOF ORIENTATION ---
  let gyroPitch = 0; // beta (-180 to 180)
  let gyroRoll = 0;  // gamma (-90 to 90)
  let gyroActive = false;

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      if (e.beta !== null && e.gamma !== null) {
        gyroPitch = Math.max(-30, Math.min(30, e.beta - 45)); // Normalized viewing angle
        gyroRoll = Math.max(-30, Math.min(30, e.gamma));
        gyroActive = true;
      }
    });
  }

  // --- 3. CLIENT-SIDE WEBCAM INGEST PIPELINE ---
  let webcamStream = null;
  const webcamVideo = document.getElementById('webcamVideo');
  const webcamBtn = document.getElementById('webcamBtn');

  if (webcamBtn && webcamVideo) {
    webcamBtn.addEventListener('click', async () => {
      if (webcamStream) {
        // Stop webcam
        webcamStream.getTracks().forEach(t => t.stop());
        webcamStream = null;
        webcamBtn.textContent = '📷 WEBCAM INGEST';
        webcamBtn.classList.remove('active');
        playBlip(500, 0.04, 'sine');
      } else {
        // Start webcam
        try {
          webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
          });
          webcamVideo.srcObject = webcamStream;
          await webcamVideo.play();
          webcamBtn.textContent = '● STOP WEBCAM';
          webcamBtn.classList.add('active');
          playConfirmChime();
        } catch (err) {
          alert('WebCam access declined or unavailable on this device. Simulator will continue in synthetic FOV mode.');
        }
      }
    });
  }

  // --- 4. SKELETAL RAYCAST & PINCH CANVAS ---
  const canvas = document.getElementById('fieldkitCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    function resizeCanvas() {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : 880;
      height = canvas.height = window.innerWidth <= 640 ? 260 : 380;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

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
        hint: 'Align index raycast with padlock shackle to verify lock engagement',
        rx: 0.55, ry: 0.45, rw: 170, rh: 120
      },
      pump: {
        id: 'PUMP-HOUSING-MANIFOLD',
        name: 'CENTRIFUGAL CASING',
        type: 'MECHANICAL_SEAL',
        hint: 'Verify zero psi differential before bolt extraction',
        rx: 0.52, ry: 0.46, rw: 180, rh: 130
      },
      tccc: {
        id: 'TCCC-CAT-TOURNIQUET',
        name: 'FEMORAL ARTERY SITE',
        type: 'HEMORRHAGE_CONTROL',
        hint: 'Pinch windlass rod and lock into C-clip',
        rx: 0.54, ry: 0.48, rw: 175, rh: 125
      },
      tamper: {
        id: 'RACK-TAMPER-SEAL-R04',
        name: 'SECURITY VOID SEAL',
        type: 'PHYSICAL_TAMPER',
        hint: 'Trace holographic edge for micro-fractures',
        rx: 0.52, ry: 0.46, rw: 170, rh: 115
      }
    };

    let currentTargetKey = 'loto';
    let currentSensorMode = 'bayer';
    let mouseX = 0.28;
    let mouseY = 0.65;
    let isHoveringCanvas = false;

    function setTarget(key) {
      if (!TARGETS[key]) return;
      currentTargetKey = key;
      document.querySelectorAll('.target-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.target === key);
      });
      playBlip(750, 0.04, 'triangle');
      updateHudInstruction();
    }

    document.querySelectorAll('.target-pill').forEach(btn => {
      btn.addEventListener('click', () => setTarget(btn.dataset.target));
    });

    const sensorModes = ['bayer', 'sobel', 'depth', 'thermal'];
    function setSensorMode(mode) {
      if (!sensorModes.includes(mode)) return;
      currentSensorMode = mode;
      document.querySelectorAll('.sensor-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.mode === mode);
      });
      playBlip(1050, 0.03, 'sine');
    }

    document.querySelectorAll('.sensor-pill').forEach(btn => {
      btn.addEventListener('click', () => setSensorMode(btn.dataset.mode));
    });

    canvas.addEventListener('pointerenter', () => { isHoveringCanvas = true; });
    canvas.addEventListener('pointerleave', () => { isHoveringCanvas = false; });
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
      currentPanX = (mouseX - 0.5) * 2; // Update spatial 3D audio pan (-1 to +1)
    });

    const instructionEl = document.getElementById('hudInstruction');
    function updateHudInstruction() {
      if (instructionEl && TARGETS[currentTargetKey]) {
        instructionEl.textContent = `AIM: ${TARGETS[currentTargetKey].name} — ${TARGETS[currentTargetKey].hint}`;
      }
    }
    updateHudInstruction();

    const BRAILLE_CHARS = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
    let brailleIdx = 0;
    let t = 0;
    let verifiedCooldown = 0;

    // --- TARGET DRAWING ROUTINES ---
    function drawLotoSchematic(ctx, x, y, w, h, t, inTarget) {
      const pColor = inTarget ? '#4eff9b' : '#f5b82e';
      ctx.fillStyle = 'rgba(20, 24, 32, 0.85)';
      ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

      // Warning Chevron Tape
      const chevronH = 12;
      ctx.fillStyle = '#f5b82e';
      ctx.fillRect(x + 14, y + 14, w - 28, chevronH);
      ctx.fillStyle = '#0a0d14';
      for (let cx = x + 18; cx < x + w - 30; cx += 14) {
        ctx.beginPath();
        ctx.moveTo(cx, y + 14);
        ctx.lineTo(cx + 6, y + 14);
        ctx.lineTo(cx + 1, y + 14 + chevronH);
        ctx.lineTo(cx - 5, y + 14 + chevronH);
        ctx.fill();
      }

      // Switch
      const switchCenterX = x + w * 0.35;
      const switchCenterY = y + h * 0.58;
      ctx.fillStyle = '#111620';
      ctx.fillRect(switchCenterX - 14, switchCenterY - 24, 28, 48);
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(switchCenterX - 14, switchCenterY - 24, 28, 48);

      ctx.fillStyle = '#ff4444';
      ctx.fillRect(switchCenterX - 10, switchCenterY + 2, 20, 18);
      ctx.fillStyle = '#fff';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText('OFF', switchCenterX - 7, switchCenterY + 14);

      // Padlock
      const lockX = switchCenterX + 16;
      const lockY = switchCenterY + 10;
      ctx.strokeStyle = inTarget ? '#4eff9b' : '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(lockX, lockY - 8, 7, Math.PI, 0, false);
      ctx.lineTo(lockX + 7, lockY);
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(lockX - 9, lockY, 18, 16);
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1;
      ctx.strokeRect(lockX - 9, lockY, 18, 16);

      // LOTO Tag
      const tagX = lockX + 16;
      const tagY = lockY + 2;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(tagX, tagY, 28, 38);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tagX, tagY, 28, 10);
      ctx.fillStyle = '#fff';
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.fillText('DANGER', tagX + 2, tagY + 7);
      ctx.fillStyle = '#0f172a';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.fillText('TAG #4092', tagX + 2, tagY + 17);
      for (let bx = tagX + 3; bx < tagX + 25; bx += 3) {
        ctx.fillRect(bx, tagY + 22, (bx % 2 === 0 ? 1.5 : 1), 10);
      }

      ctx.fillStyle = inTarget ? '#4eff9b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(x + w * 0.78, y + h * 0.32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('0.0V ISOLATED', x + w * 0.62, y + h * 0.44);
    }

    function drawPumpSchematic(ctx, x, y, w, h, t, inTarget) {
      const pColor = inTarget ? '#4eff9b' : '#f5b82e';
      const cx = x + w * 0.45;
      const cy = y + h * 0.52;

      ctx.strokeStyle = pColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(cx + 48, cy - 38);
      ctx.lineTo(cx + 48, cy - 18);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      const vaneCount = 6;
      for (let i = 0; i < vaneCount; i++) {
        const angle = (i * Math.PI * 2 / vaneCount) + (t * 0.8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
        ctx.quadraticCurveTo(
          cx + Math.cos(angle + 0.4) * 20, cy + Math.sin(angle + 0.4) * 20,
          cx + Math.cos(angle) * 28, cy + Math.sin(angle) * 28
        );
        ctx.stroke();
      }

      for (let b = 0; b < 6; b++) {
        const bAngle = (b * Math.PI * 2 / 6);
        const bx = cx + Math.cos(bAngle) * 44;
        const by = cy + Math.sin(bAngle) * 44;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const gx = x + w * 0.78;
      const gy = y + h * 0.32;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(gx, gy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 10, gy + 4);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText('0.0 PSI', gx - 14, gy + 24);
    }

    function drawTcccSchematic(ctx, x, y, w, h, t, inTarget) {
      const pColor = inTarget ? '#4eff9b' : '#f5b82e';
      const cx = x + w * 0.48;
      const cy = y + h * 0.50;

      ctx.fillStyle = 'rgba(28, 38, 28, 0.7)';
      ctx.beginPath();
      ctx.roundRect(cx - 55, cy - 36, 110, 72, 12);
      ctx.fill();

      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx - 20, cy - 36, 40, 72);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 12, cy - 36, 8, 72);

      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx - 14, cy - 20, 28, 40);
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - 14, cy - 20, 28, 40);

      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy + 18);
      ctx.lineTo(cx + 28, cy - 18);
      ctx.stroke();
      ctx.lineCap = 'butt';

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cx - 16, cy + 22, 32, 12);
      ctx.fillStyle = '#09090b';
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.fillText('TIME: 08:42', cx - 14, cy + 30);

      ctx.fillStyle = inTarget ? '#4eff9b' : '#ef4444';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(inTarget ? 'PULSE: ARRESTED' : 'HEMORRHAGE DETECTED', x + 16, y + h - 14);
    }

    function drawTamperSchematic(ctx, x, y, w, h, t, inTarget) {
      const pColor = inTarget ? '#4eff9b' : '#f5b82e';
      const cx = x + w * 0.5;
      const cy = y + h * 0.5;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(x + 10, y + 15, w - 20, h - 30);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x + 10, y + 15, w - 20, h - 30);

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(x + 26, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      const tapeX = x + 44;
      const tapeY = cy - 22;
      const tapeW = w - 65;
      const tapeH = 44;

      const foilGrad = ctx.createLinearGradient(tapeX, tapeY, tapeX + tapeW, tapeY + tapeH);
      foilGrad.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
      foilGrad.addColorStop(0.5, 'rgba(245, 184, 46, 0.6)');
      foilGrad.addColorStop(1, 'rgba(78, 255, 155, 0.4)');
      ctx.fillStyle = foilGrad;
      ctx.fillRect(tapeX, tapeY, tapeW, tapeH);
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(tapeX, tapeY, tapeW, tapeH);

      ctx.strokeStyle = inTarget ? '#4eff9b' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tapeX + tapeW * 0.48, tapeY);
      ctx.lineTo(tapeX + tapeW * 0.48, tapeY + tapeH);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText('VOID IF SEAL BROKEN', tapeX + 4, tapeY + 12);
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.fillText('SN-88219-RACK04', tapeX + 4, tapeY + tapeH - 8);
    }

    // 21-Joint Skeletal Hand
    function render21JointHand(ctx, handX, handY, targetX, targetY, inTarget, t) {
      const pinchAmount = inTarget ? 0.98 : (Math.sin(t * 3.2) + 1) * 0.35;
      const wristX = handX - 25;
      const wristY = handY + 65;
      const p = [];

      p[0] = { x: wristX, y: wristY };
      p[1] = { x: wristX - 18, y: wristY - 26 };
      p[5] = { x: wristX - 8, y: wristY - 48 };
      p[9] = { x: wristX + 6, y: wristY - 50 };
      p[13] = { x: wristX + 18, y: wristY - 45 };
      p[17] = { x: wristX + 28, y: wristY - 38 };

      p[2] = { x: p[1].x - 10, y: p[1].y - 14 };
      p[3] = { x: p[2].x + 4, y: p[2].y - 12 };
      const thumbRestX = p[3].x + 12;
      const thumbRestY = p[3].y - 10;
      p[4] = {
        x: thumbRestX + (handX - thumbRestX) * pinchAmount,
        y: thumbRestY + (handY - thumbRestY) * pinchAmount
      };

      p[6] = { x: p[5].x - 4, y: p[5].y - 18 };
      p[7] = { x: p[6].x + 2, y: p[6].y - 16 };
      const indexRestX = p[7].x + 4;
      const indexRestY = p[7].y - 14;
      p[8] = {
        x: indexRestX + (handX - indexRestX) * pinchAmount,
        y: indexRestY + (handY - indexRestY) * pinchAmount
      };

      p[10] = { x: p[9].x + 2, y: p[9].y - 20 };
      p[11] = { x: p[10].x + 3, y: p[10].y - 18 };
      p[12] = { x: p[11].x + 2, y: p[11].y - 14 };

      p[14] = { x: p[13].x + 4, y: p[13].y - 18 };
      p[15] = { x: p[14].x + 4, y: p[14].y - 16 };
      p[16] = { x: p[15].x + 3, y: p[15].y - 12 };

      p[18] = { x: p[17].x + 6, y: p[17].y - 16 };
      p[19] = { x: p[18].x + 5, y: p[18].y - 14 };
      p[20] = { x: p[19].x + 4, y: p[19].y - 10 };

      const bones = [
        [0, 1], [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
        [1, 2], [2, 3], [3, 4],
        [5, 6], [6, 7], [7, 8],
        [9, 10], [10, 11], [11, 12],
        [13, 14], [14, 15], [15, 16],
        [17, 18], [18, 19], [19, 20]
      ];

      ctx.lineWidth = 1.8;
      bones.forEach(([i, j]) => {
        const boneGrad = ctx.createLinearGradient(p[i].x, p[i].y, p[j].x, p[j].y);
        boneGrad.addColorStop(0, inTarget ? 'rgba(78, 255, 155, 0.7)' : 'rgba(77, 232, 255, 0.6)');
        boneGrad.addColorStop(1, inTarget ? 'rgba(78, 255, 155, 0.9)' : 'rgba(77, 232, 255, 0.8)');
        ctx.strokeStyle = boneGrad;
        ctx.beginPath();
        ctx.moveTo(p[i].x, p[i].y);
        ctx.lineTo(p[j].x, p[j].y);
        ctx.stroke();
      });

      for (let k = 0; k < 21; k++) {
        const pt = p[k];
        ctx.fillStyle = inTarget ? 'rgba(78, 255, 155, 0.3)' : 'rgba(77, 232, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (k === 4 || k === 8 ? 5.5 : 4), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = inTarget ? '#ffffff' : (k === 4 || k === 8 ? '#f5b82e' : '#4de8ff');
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (k === 4 || k === 8 ? 2.8 : 2), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = inTarget ? 'rgba(78, 255, 155, 0.9)' : 'rgba(77, 232, 255, 0.55)';
      ctx.lineWidth = inTarget ? 2 : 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(p[8].x, p[8].y);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (pinchAmount > 0.85) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p[8].x, p[8].y, 8 + Math.sin(t * 12) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = inTarget ? '#4eff9b' : '#38bdf8';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText('PINCH LOCK', p[8].x - 22, p[8].y - 12);
      }
    }

    function renderCanvas() {
      t += 0.03;
      brailleIdx = Math.floor(t * 8) % BRAILLE_CHARS.length;

      // Draw live webcam video frame if active!
      if (webcamStream && webcamVideo.readyState >= 2) {
        ctx.drawImage(webcamVideo, 0, 0, width, height);
        // Apply raster blend overlay
        ctx.fillStyle = 'rgba(6, 8, 13, 0.65)';
        ctx.fillRect(0, 0, width, height);
      } else {
        if (currentSensorMode === 'thermal') {
          const bgGrad = ctx.createLinearGradient(0, 0, width, height);
          bgGrad.addColorStop(0, '#0d0418');
          bgGrad.addColorStop(0.5, '#190a2a');
          bgGrad.addColorStop(1, '#06020c');
          ctx.fillStyle = bgGrad;
        } else if (currentSensorMode === 'sobel') {
          ctx.fillStyle = '#020904';
        } else if (currentSensorMode === 'depth') {
          ctx.fillStyle = '#030811';
        } else {
          ctx.fillStyle = '#06080d';
        }
        ctx.fillRect(0, 0, width, height);
      }

      // Shaders
      if (currentSensorMode === 'bayer') {
        ctx.fillStyle = 'rgba(245, 184, 46, 0.035)';
        for (let y = 0; y < height; y += 8) {
          for (let x = 0; x < width; x += 8) {
            const b = BAYER_4X4[(y/8)%4][(x/8)%4];
            if (b > 0.45) ctx.fillRect(x, y, 2, 2);
          }
        }
      } else if (currentSensorMode === 'sobel') {
        ctx.strokeStyle = 'rgba(78, 255, 155, 0.09)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 6) {
          if (Math.sin(y * 0.1 + t) > 0.25) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
          }
        }
      } else if (currentSensorMode === 'depth') {
        ctx.strokeStyle = 'rgba(77, 232, 255, 0.08)';
        ctx.lineWidth = 1;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        for (let r = 30; r < Math.max(width, height); r += 45) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (r + (t * 12) % 45), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (currentSensorMode === 'thermal') {
        const heatX = width * 0.55;
        const heatY = height * 0.45;
        const radGrad = ctx.createRadialGradient(heatX, heatY, 15, heatX, heatY, 190);
        radGrad.addColorStop(0, 'rgba(255, 200, 72, 0.28)');
        radGrad.addColorStop(0.5, 'rgba(255, 75, 45, 0.16)');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Tilt grid according to mobile gyroscope
      const tiltOffsetX = gyroActive ? gyroRoll * 1.5 : 0;
      const tiltOffsetY = gyroActive ? gyroPitch * 1.5 : 0;

      ctx.strokeStyle = currentSensorMode === 'sobel' ? 'rgba(78, 255, 155, 0.06)' : 'rgba(77, 232, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSpacing = 32;
      for (let x = tiltOffsetX % gridSpacing; x < width; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = tiltOffsetY % gridSpacing; y < height; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Target geometry
      const tgt = TARGETS[currentTargetKey];
      const targetW = Math.min(tgt.rw, width * 0.42);
      const targetH = Math.min(tgt.rh, height * 0.48);
      const targetX = width * tgt.rx + Math.sin(t * 0.6) * (width * 0.015);
      const targetY = height * tgt.ry + Math.cos(t * 0.6) * (height * 0.015);

      const boxLeft = targetX - targetW / 2;
      const boxTop = targetY - targetH / 2;
      const targetColor = currentSensorMode === 'sobel' ? '#4eff9b' : (currentSensorMode === 'thermal' ? '#ff7e36' : '#f5b82e');

      let operatorHandX, operatorHandY;
      if (isHoveringCanvas) {
        operatorHandX = width * mouseX;
        operatorHandY = height * mouseY;
      } else {
        operatorHandX = width * (0.32 + Math.sin(t * 0.8) * 0.20);
        operatorHandY = height * (0.50 + Math.cos(t * 0.8) * 0.16);
      }

      const inTarget = (
        operatorHandX >= boxLeft && operatorHandX <= boxLeft + targetW &&
        operatorHandY >= boxTop && operatorHandY <= boxTop + targetH
      );

      // Render physical schematic
      if (currentTargetKey === 'loto') drawLotoSchematic(ctx, boxLeft, boxTop, targetW, targetH, t, inTarget);
      else if (currentTargetKey === 'pump') drawPumpSchematic(ctx, boxLeft, boxTop, targetW, targetH, t, inTarget);
      else if (currentTargetKey === 'tccc') drawTcccSchematic(ctx, boxLeft, boxTop, targetW, targetH, t, inTarget);
      else if (currentTargetKey === 'tamper') drawTamperSchematic(ctx, boxLeft, boxTop, targetW, targetH, t, inTarget);

      // Bounding box border
      ctx.strokeStyle = inTarget ? '#4eff9b' : targetColor;
      ctx.lineWidth = inTarget ? 2 : 1.5;
      ctx.strokeRect(boxLeft, boxTop, targetW, targetH);

      const c = 12;
      ctx.fillStyle = inTarget ? '#4eff9b' : targetColor;
      ctx.fillRect(boxLeft - 2, boxTop - 2, c, 3);
      ctx.fillRect(boxLeft - 2, boxTop - 2, 3, c);
      ctx.fillRect(boxLeft + targetW - c + 2, boxTop - 2, c, 3);
      ctx.fillRect(boxLeft + targetW - 1, boxTop - 2, 3, c);
      ctx.fillRect(boxLeft - 2, boxTop + targetH - 1, c, 3);
      ctx.fillRect(boxLeft - 2, boxTop + targetH - c + 2, 3, c);
      ctx.fillRect(boxLeft + targetW - c + 2, boxTop + targetH - 1, c, 3);
      ctx.fillRect(boxLeft + targetW - 1, boxTop + targetH - c + 2, 3, c);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = inTarget ? '#4eff9b' : targetColor;
      ctx.fillText(`[FOV TARGET] ${tgt.id}`, boxLeft + 6, boxTop - 8);

      // Collimator sight
      ctx.strokeStyle = inTarget ? 'rgba(78, 255, 155, 0.8)' : 'rgba(245, 184, 46, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(targetX - 20, targetY); ctx.lineTo(targetX + 20, targetY);
      ctx.moveTo(targetX, targetY - 20); ctx.lineTo(targetX, targetY + 20);
      ctx.stroke();

      // Hand skeleton
      render21JointHand(ctx, operatorHandX, operatorHandY, targetX, targetY, inTarget, t);

      if (inTarget && verifiedCooldown <= 0) {
        playConfirmChime();
        verifiedCooldown = 40;
      }
      if (verifiedCooldown > 0) verifiedCooldown--;

      // Top telemetry overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '9px "JetBrains Mono", monospace';
      const videoStatus = webcamStream ? '📷 LIVE LOCAL WEBCAM · ZERO-CLOUD' : 'SYNTHETIC EDGE INGEST · WEARABLE POV';
      ctx.fillText(videoStatus, width - 260, 20);
      
      const gyroText = gyroActive ? `GYRO: ${Math.round(gyroPitch)}°P / ${Math.round(gyroRoll)}°R` : '284° WNW';
      ctx.fillText(`🔋 91% · 420 LUX · ${gyroText}`, 14, 20);

      // Artificial Horizon
      ctx.strokeStyle = 'rgba(77, 232, 255, 0.25)';
      ctx.lineWidth = 1;
      const horizY = height * 0.42 + tiltOffsetY;
      ctx.beginPath();
      ctx.moveTo(14, horizY); ctx.lineTo(34, horizY);
      ctx.stroke();
      ctx.fillText(`${Math.round(gyroPitch)}°`, 38, horizY + 3);

      // Voice Gating Visualizer
      const barCount = 14;
      const startX = 14;
      const startY = height - 36;
      for (let i = 0; i < barCount; i++) {
        const h = Math.abs(Math.sin(t * 4 + i * 0.6) * 16) + 3;
        ctx.fillStyle = inTarget ? '#4eff9b' : '#4de8ff';
        ctx.fillRect(startX + i * 5, startY - h, 3, h);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('VOICE GATE ACTIVE (-18 dB ISOLATION)', startX + barCount * 5 + 8, startY - 2);

      // Bottom Monospace HUD Status Bar
      ctx.fillStyle = inTarget ? '#4eff9b' : targetColor;
      ctx.font = '11px "JetBrains Mono", monospace';
      const statusText = inTarget 
        ? `${BRAILLE_CHARS[brailleIdx]} 100% GROUNDED · CONTACT VERIFIED (RAYCAST LOCKED 99.4%)`
        : `${BRAILLE_CHARS[brailleIdx]} 38ms LATENCY · 21-JOINT HAND TRACKING ACTIVE`;
      ctx.fillText(statusText, 14, height - 12);

      const jitter = Math.round(34 + Math.sin(t * 1.5) * 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText(`EDGE: ${jitter}ms · 30 FPS`, width - 165, height - 12);

      requestAnimationFrame(renderCanvas);
    }
    requestAnimationFrame(renderCanvas);

    window.addEventListener('keydown', e => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '1') setTarget('loto');
      else if (e.key === '2') setTarget('pump');
      else if (e.key === '3') setTarget('tccc');
      else if (e.key === '4') setTarget('tamper');
      else if (e.key === 'm' || e.key === 'M') {
        const nextIdx = (sensorModes.indexOf(currentSensorMode) + 1) % sensorModes.length;
        setSensorMode(sensorModes[nextIdx]);
      }
    });
  }

  // --- 5. INTERACTIVE MISSION STATE MACHINE (DAG) WORKBENCH ---
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
          voice: 'Lockout verified on 480V Breaker 4B. Pressure transducer shows zero residual voltage.',
          target: '480V_MCC_CUBICLE_4B'
        },
        {
          num: 2,
          id: 'STEP_02_PRESSURE_BLEED',
          title: 'Bleed Suction and Discharge Manifolds',
          desc: 'Ensure suction valve V-101 and discharge valve V-102 are sealed. Open the petcock bleed valve until the needle reads 0.0 PSI.',
          voice: 'Manifold depressurized. 0.0 PSI confirmed. Clear to proceed to casing extraction.',
          target: 'GAUGE_PI_104_DIAL'
        },
        {
          num: 3,
          id: 'STEP_03_CASING_DISASSEMBLY',
          title: 'Star-Pattern Casing Bolt Extraction',
          desc: 'Use torque wrench set to 85 ft-lb. Break bolts loose in diagonal cross pattern to avoid warped seal gland mating faces.',
          voice: 'Torque pattern followed. 8 of 8 bolts removed. Gland plate is free.',
          target: 'VOLUTE_GLAND_BOLT_01'
        },
        {
          num: 4,
          id: 'STEP_04_SEAL_INSPECTION',
          title: 'Silicon-Carbide Mechanical Seal Audit',
          desc: 'Inspect primary ring and mating stationary face under high-intensity task light for heat checking or pitting.',
          voice: 'Silicon-carbide face inspected. Radial score line detected at 3 oclock. Replace seal.',
          target: 'SIC_ROTATING_FACE'
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
          voice: 'Cover established. Casualty responsive. Clear to deploy tourniquet.',
          target: 'THREAT_SECTOR_OVERWATCH'
        },
        {
          num: 2,
          id: 'STEP_02_CAT_PLACEMENT',
          title: 'High-and-Tight Extremity Application',
          desc: 'Route Combat Application Tourniquet 2–3 inches above femoral wound site over uniform.',
          voice: 'Band routed through friction buckle. Pull tail snug. Zero slack.',
          target: 'UPPER_FEMORAL_JUNCTION'
        },
        {
          num: 3,
          id: 'STEP_03_WINDLASS_ROTATION',
          title: 'Tighten Windlass Until Distal Pulse Stops',
          desc: 'Rotate windlass rod until bright red bleeding ceases and distal pedal pulse is absent.',
          voice: 'Bleeding arrested. Windlass locked in retention clip. Note time on strap.',
          target: 'CAT_WINDLASS_CLIP'
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
          voice: 'Door closure confirmed. Latched within 2.1 seconds. Biometric relay reset.',
          target: 'SUITE_DOOR_STRIKE_PLATE'
        },
        {
          num: 2,
          id: 'STEP_02_RACK_SEAL_AUDIT',
          title: 'Inspect Anti-Tamper Holographic Seals',
          desc: 'High-resolution scan of server tray seals. Detect microscopic void-pattern distortion or slit razor entries.',
          voice: 'Rack 04 seals pristine. No void micro-patterns detected. Integrity verified.',
          target: 'VOID_SEAL_RACK_04_A'
        },
        {
          num: 3,
          id: 'STEP_03_HARDWARE_TAP_SWEEP',
          title: 'Inspect In-Line Management Bus Cables',
          desc: 'Audit OOBM management Ethernet cables for parasitic inline implants or rogue passive splitters.',
          voice: 'All OOBM lines trace directly to leaf switch. Zero rogue taps detected.',
          target: 'RJ45_PATCH_PANEL_LEAF2'
        }
      ]
    }
  };

  let activeMissionKey = 'industrial';
  let activeStepIndex = 1;

  function renderDagTrack() {
    const dagTrack = document.getElementById('dagTrack');
    if (!dagTrack) return;
    const mission = MISSIONS[activeMissionKey];
    if (!mission) return;

    dagTrack.innerHTML = '';
    mission.steps.forEach((s, idx) => {
      const isCompleted = idx < activeStepIndex;
      const isActive = idx === activeStepIndex;

      const node = document.createElement('div');
      node.className = `dag-node ${isCompleted ? 'completed' : (isActive ? 'active' : '')}`;
      node.innerHTML = `
        <div class="dag-node-badge">
          ${isCompleted ? '✓ VERIFIED' : (isActive ? '⚡ TRACKING' : '○ PENDING')}
        </div>
        <div class="dag-node-title">Step ${s.num}: ${s.id}</div>
      `;

      node.addEventListener('click', () => {
        activeStepIndex = idx;
        playConfirmChime();
        renderMissionWorkbench();
      });

      dagTrack.appendChild(node);

      // Connector arrow if not last
      if (idx < mission.steps.length - 1) {
        const conn = document.createElement('div');
        conn.className = `dag-connector ${isCompleted ? 'completed' : ''}`;
        conn.textContent = '→';
        dagTrack.appendChild(conn);
      }
    });
  }

  function renderMissionWorkbench() {
    const mission = MISSIONS[activeMissionKey];
    if (!mission) return;

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
    if (voiceEl) voiceEl.textContent = `PROACTIVE AUDIO: "${step.voice}"`;
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
        proactive_speech_dispatched: true,
        binaural_pan: parseFloat(currentPanX.toFixed(2))
      };
      jsonEl.textContent = JSON.stringify(stateObj, null, 2);
    }

    renderDagTrack();
    speakProactiveDirective(step.voice);
  }

  document.querySelectorAll('.wb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeMissionKey = tab.dataset.mission || 'industrial';
      activeStepIndex = 0;
      playBlip(950, 0.04, 'triangle');
      renderMissionWorkbench();
    });
  });

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

  const resetBtn = document.getElementById('wbResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeStepIndex = 0;
      playBlip(500, 0.04, 'sine');
      renderMissionWorkbench();
    });
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && ['BODY', 'SECTION'].includes(e.target.tagName)) {
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

  // --- 6. IN-BROWSER MISSION YAML BUILDER & RFC VALIDATOR PLAYGROUND ---
  const yamlTemplates = {
    loto: `fieldkit_version: "1.0.0"
mission_id: "industrial-pump-loto"
author: "1nc0gn30"
organization: "NullAI Platform"
license: "MIT"
tolerance_budget_ms: 127
voice_isolation: true

steps:
  - id: "STEP_01_LOTO_SHACKLE"
    checkpoint_name: "Verify 480V Breaker Padlock"
    target_bounding_box: "480V_MCC_CUBICLE_4B"
    required_hand_state: "PINCH_CONFIRMED"
    proactive_directive: "Padlock verified locked. Zero residual voltage on transducer."
  - id: "STEP_02_PRESSURE_BLEED"
    checkpoint_name: "Manifold Pressure Bleed"
    target_bounding_box: "GAUGE_PI_104_DIAL"
    required_hand_state: "ALIGN_RAYCAST"
    proactive_directive: "Suction manifold bled to zero PSI. Clear to extract casing bolts."`,

    tccc: `fieldkit_version: "1.0.0"
mission_id: "emergency-tccc-cat"
author: "1nc0gn30"
organization: "NullAI Platform"
license: "MIT"
tolerance_budget_ms: 100
voice_isolation: true

steps:
  - id: "STEP_01_COVER_VERIFY"
    checkpoint_name: "Confirm Defilade & Cover"
    target_bounding_box: "THREAT_SECTOR"
    required_hand_state: "ALIGN_RAYCAST"
    proactive_directive: "Cover established. Clear to deploy tourniquet."
  - id: "STEP_02_WINDLASS_LOCK"
    checkpoint_name: "Torque Lock Windlass Rod"
    target_bounding_box: "CAT_WINDLASS_CLIP"
    required_hand_state: "PINCH_CONFIRMED"
    proactive_directive: "Distal pulse arrested. Windlass secured in retention clip."`,

    datacenter: `fieldkit_version: "1.0.0"
mission_id: "datacenter-tamper-sweep"
author: "1nc0gn30"
organization: "NullAI Platform"
license: "MIT"
tolerance_budget_ms: 120
voice_isolation: true

steps:
  - id: "STEP_01_CAGE_LATCH"
    checkpoint_name: "Audit Biometric Cage Latch"
    target_bounding_box: "SUITE_DOOR_STRIKE"
    required_hand_state: "ALIGN_RAYCAST"
    proactive_directive: "Biometric cage latch verified seated securely."
  - id: "STEP_02_TAMPER_SEAL"
    checkpoint_name: "Inspect Holographic Rack Seal"
    target_bounding_box: "VOID_SEAL_RACK_04"
    required_hand_state: "PINCH_CONFIRMED"
    proactive_directive: "Rack 04 seal inspected. Zero void micro-patterns detected."`,

    custom: `fieldkit_version: "1.0.0"
mission_id: "custom-mission-01"
author: "Frontline Developer"
organization: "Your Organization"
license: "MIT"
tolerance_budget_ms: 127
voice_isolation: true

steps:
  - id: "STEP_01_INSPECT"
    checkpoint_name: "Initial Visual Audit"
    target_bounding_box: "EQUIPMENT_FRAME_01"
    required_hand_state: "ALIGN_RAYCAST"
    proactive_directive: "Visual inspection verified. Proceed to next checkpoint."`
  };

  const yamlInput = document.getElementById('yamlTextarea');
  const yamlConsole = document.getElementById('yamlValidationConsole');
  const yamlValidateBtn = document.getElementById('yamlValidateBtn');
  const yamlLoadBtn = document.getElementById('yamlLoadSimulatorBtn');
  const yamlDownloadBtn = document.getElementById('yamlDownloadBtn');

  if (yamlInput) {
    yamlInput.value = yamlTemplates.loto;
  }

  document.querySelectorAll('.yaml-tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tpl = btn.dataset.tpl || 'loto';
      if (yamlInput && yamlTemplates[tpl]) {
        yamlInput.value = yamlTemplates[tpl];
        playBlip(900, 0.04, 'triangle');
        if (yamlConsole) {
          yamlConsole.textContent = `// Loaded template: ${tpl.toUpperCase()}\n// Click "Validate against RFC" to run schema checks.`;
        }
      }
    });
  });

  // Simple client-side FieldKit RFC validator
  function validateYamlContent(text) {
    const lines = text.split('\n');
    let hasVersion = false;
    let hasMissionId = false;
    let hasSteps = false;
    let stepCount = 0;
    let stepsList = [];

    lines.forEach(l => {
      const trimmed = l.trim();
      if (trimmed.startsWith('fieldkit_version:')) hasVersion = true;
      if (trimmed.startsWith('mission_id:')) hasMissionId = true;
      if (trimmed.startsWith('steps:')) hasSteps = true;
      if (trimmed.startsWith('- id:')) {
        stepCount++;
        const idVal = trimmed.replace('- id:', '').replace(/["']/g, '').trim();
        stepsList.push(idVal);
      }
    });

    const valid = hasVersion && hasMissionId && hasSteps && stepCount > 0;
    return { valid, stepCount, stepsList, error: valid ? null : 'Missing fieldkit_version, mission_id, or steps array' };
  }

  if (yamlValidateBtn && yamlInput && yamlConsole) {
    yamlValidateBtn.addEventListener('click', () => {
      const res = validateYamlContent(yamlInput.value);
      playConfirmChime();

      if (res.valid) {
        yamlConsole.textContent = `[✓ RFC VALIDATION PASSED]
------------------------------------------------
Protocol Standard: FieldKit RFC 2024-11
Schema Invariants: SATISFIED (Strict DAG Mode)
Atomic Steps Count: ${res.stepCount} Checkpoints
Skeletal Tolerance: <127ms Frame Budget Enforced
Detected Checkpoints:
${res.stepsList.map((id, i) => `  [${i+1}] ${id}`).join('\n')}

Result: 100% Ready for wearable edge execution.`;
      } else {
        yamlConsole.textContent = `[✗ RFC VALIDATION ERROR]
------------------------------------------------
Failed: ${res.error}
Ensure YAML includes:
  fieldkit_version: "1.0.0"
  mission_id: "your-id"
  steps:
    - id: "STEP_01"`;
      }
    });
  }

  if (yamlLoadBtn && yamlInput) {
    yamlLoadBtn.addEventListener('click', () => {
      const res = validateYamlContent(yamlInput.value);
      if (!res.valid) {
        alert('Please fix YAML validation errors before loading into 3D HUD.');
        return;
      }
      playConfirmChime();
      speakProactiveDirective(`Custom mission loaded into 3D raycast simulator with ${res.stepCount} checkpoints.`);
      const hudEl = document.getElementById('hud');
      if (hudEl) hudEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (yamlDownloadBtn && yamlInput) {
    yamlDownloadBtn.addEventListener('click', () => {
      playBlip(1200, 0.04, 'sine');
      const blob = new Blob([yamlInput.value], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mission.yaml';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // --- 7. LIVE MCP PLAYGROUND LOGIC ---
  const mcpSelect = document.getElementById('mcpToolSelect');
  const mcpRunBtn = document.getElementById('mcpRunBtn');
  const mcpOutput = document.getElementById('mcpConsoleOutput');

  const MCP_TOOL_MOCKS = {
    eval: {
      jsonrpc: "2.0",
      id: "req-0491",
      result: {
        tool: "fieldkit_evaluate_fov_frame",
        camera_id: "wearable_front_fov",
        timestamp_ms: 1730856000120,
        detected_targets: [
          {
            target_id: "LOTO-480V-BREAKER",
            bounding_box: [120, 85, 340, 290],
            confidence: 0.988,
            aligned: true
          }
        ],
        hands_busy: true,
        pinch_contact_verified: true,
        proactive_directive: "Lock confirmed on shackle. Proceed to suction valve bleed."
      }
    },
    progress: {
      jsonrpc: "2.0",
      id: "req-0492",
      result: {
        tool: "fieldkit_progress_step",
        mission_id: "industrial-repair",
        previous_step: 1,
        active_step: 2,
        checkpoint: "STEP_02_PRESSURE_BLEED",
        state: "IN_PROGRESS",
        safety_interlocks_satisfied: true
      }
    },
    vault: {
      jsonrpc: "2.0",
      id: "req-0493",
      result: {
        tool: "fieldkit_vault_audit",
        hardware_enclave: "SE_ACTIVE",
        cipher_suite: "AES-256-GCM",
        biometric_voiceprints_stored: 1,
        cloud_leakage_detected: false,
        ephemeral_session_status: "ISOLATED_LOCAL_ONLY"
      }
    },
    status: {
      jsonrpc: "2.0",
      id: "req-0494",
      result: {
        tool: "fieldkit_get_mission_status",
        status: "RUNNING",
        edge_runtime: "fieldkit-sdk v1.0.0",
        p95_inference_ms: 38.4,
        connected_peripherals: ["RayBan-Meta-G2", "Binaural-Mic-Array"]
      }
    }
  };

  if (mcpRunBtn && mcpSelect && mcpOutput) {
    mcpRunBtn.addEventListener('click', () => {
      const selected = mcpSelect.value || 'eval';
      playConfirmChime();
      mcpOutput.textContent = 'EXECUTING MODEL CONTEXT PROTOCOL QUERY...';
      setTimeout(() => {
        const res = MCP_TOOL_MOCKS[selected] || MCP_TOOL_MOCKS.eval;
        mcpOutput.textContent = JSON.stringify(res, null, 2);
      }, 120);
    });
  }

  // --- 8. COPY BUTTONS & UNCOMMON WEB KINETICS ---
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rawText = btn.dataset.copy || '';
      const textToCopy = rawText.replace(/\\n/g, '\n');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        playBlip(1300, 0.04, 'sine', 0.04);
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {});
    });
  });

  const GLYPHS = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏▦⬡⠿⠾⠽⠻01#_';
  document.querySelectorAll('.kicker, .nav-cta, .btn-primary, .spec-chip, .hw-badge').forEach(el => {
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

  document.querySelectorAll('a, button, .wb-tab, .target-pill, .sensor-pill, .flow-node, .dag-node').forEach(el => {
    el.addEventListener('pointerenter', () => {
      playBlip(1100, 0.02, 'triangle', 0.015);
    });
  });

})();
