# FieldKit Terminology & Standard Lexicon

> **The Sovereign Vocabulary for Real-World, Hands-Busy Physical AI Systems.**  
> Coined by **1nc0gn30** • [NullAI Platform](https://nullai.tech) • Official Repo: [NullAITech/fieldkit](https://github.com/NullAITech/fieldkit)

---

## 1. Core Paradigm Concepts

### Physical AI
* **Definition**: Artificial intelligence systems engineered to perceive, reason, and act in real-time physical space rather than inside virtual desktop windows or text-based conversation prompts.
* **Why it matters**: Desktop AI assumes static posture, keyboards, and clean screen crops. Physical AI assumes moving bodies, occluded perspectives, dirty hands, dynamic lighting, and environmental audio noise.

### Hands-Busy State
* **Definition**: An operational posture where the user's hands are physically engaged—holding power tools, turning medical instruments, wearing grease-coated gloves, steering vehicles, or climbing ladders.
* **Invariant**: In a Hands-Busy State, UI interactions requiring touching screens, typing, or clicking buttons are strictly prohibited. The system must communicate via spatial voice, bone-conduction audio, or ambient HUD glances.

### Proactive Anticipation
* **Definition**: An operational mode where the AI system observes physical progress, deduces the immediate next requirement, and speaks the guidance *before* the operator is forced to halt and ask.
* **Contrast**: Traditional conversational AI is **reactive** (*User prompts ➔ Model answers*). FieldKit is **proactive** (*State transitions detected ➔ Agent guides*).

### First-Person POV Sensory Ingest
* **Definition**: Continuous real-time ingestion of ego-centric audio and video captured from head-mounted or body-worn sensors (smart glasses, chest cameras, helmet sensors, inspection drones).
* **Key Characteristic**: The camera frame pans, pitches, and shakes synchronously with user head and torso movement.

---

## 2. Temporal & Spatial Architecture

### Spatial Grounding
* **Definition**: Tying semantic tokens and neural inferences to exact normalized 3D bounding coordinates ($[y_{\min}, x_{\min}, y_{\max}, x_{\max}]$) and physical world surfaces in real time.
* **Application**: Distinguishing between identical bolts, identifying the exact circuit breaker to pull, or confirming a wire harness connection.

### Temporal State Machine (TSM)
* **Definition**: A deterministic directed graph ($G = (V, E)$) modeling procedural missions. Each node represents a discrete, verifiable physical checkpoint (e.g., `"clamp_loosened"`, `"housing_removed"`, `"filter_seated"`).
* **Guarantees**: Guarantees zero missed steps, prevents catastrophic ordering errors (e.g., powering on before grounding), and alerts operators upon state drift.

### Skeletal Landmark Raycasting
* **Definition**: Geometric intersection testing between tracked human hand joints (e.g., thumb tip landmark $L_4$ and index tip landmark $L_8$) and the 3D bounding envelope of targeted physical assets.
* **Utility**: Used to physically verify that a user actually touched, rotated, or inserted a component before advancing the mission step.

---

## 3. Acoustic & Privacy Engineering

### Acoustic Near-Field Attenuation (Voice Gating)
* **Definition**: Algorithmic suppression of ambient sound originating beyond a 1.0-meter radius using directional beamforming microphone arrays.
* **Requirement**: Attenuates background noise by $\ge 18\text{ dB}$, ensuring loud machinery, coworkers, or traffic do not trigger false agent state transitions.

### Sovereign Biometric Vault
* **Definition**: Hardware-isolated on-device storage for facial vectors, voiceprint embeddings, and identity tokens using AES-256-GCM.
* **Standard**: Master keys are maintained inside device secure elements (e.g., Android KeyStore / StrongBox Keymaster) with zero raw biometric data ever leaving edge memory.

### Ephemeral Ingest
* **Definition**: A camera and audio ingest lifecycle where raw sensor frames reside exclusively in volatile memory buffers for immediate inference and are discarded within milliseconds unless explicit operator confirmation is provided for long-term audit archiving.

---

## 4. Hardware & Edge Protocol Terms

### Edge Relay
* **Definition**: A local compute bridge (e.g., a pocket smartphone, wearable belt unit, or vehicle station) running a low-latency FieldKit daemon that connects low-power smart glasses to heavier multimodal edge models.

### Sub-127ms Tracking Budget
* **Definition**: The hard ceiling for glass-to-ear latency. The time elapsed between a physical state change occurring in the user's field of view and the audio coach confirming the step into the user's ear must remain under 127 milliseconds.
