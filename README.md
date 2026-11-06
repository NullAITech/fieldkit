# FieldKit

> **The Sovereign Framework & Standard for Bridging Artificial Intelligence into the Physical World.**
>
> Engineered by **1nc0gn30** (`@1nc0gn30`) • **NullAI Platform**  
> Portal: [`https://nullai-fieldkit.netlify.app`](https://nullai-fieldkit.netlify.app) • Domain: [`nullai.tech`](https://nullai.tech)

---

```
                       ┌──────────────────────────────────────────────┐
                       │                   FIELDKIT                   │
                       │   Real-World Edge AI Operating Specification │
                       └──────────────────────┬───────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌──────────────────┐               ┌───────────────────────┐             ┌──────────────────┐
│   PHYSICAL FOV   │               │   TEMPORAL GROUNDING  │             │  WEARER PRIVACY  │
│  Camera / Audio  │               │   Sub-127ms Tracking  │             │  On-Device Vault │
│  Sensors (Glasses│               │   State Transitions   │             │  Voice Isolation │
│  Bodycam, Drone) │               │   Skeletal Overlays   │             │  AES-256 at Rest │
└────────┬─────────┘               └───────────┬───────────┘             └─────────┬────────┘
         │                                     │                                   │
         └─────────────────────────────────────┼───────────────────────────────────┘
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │     PROACTIVE ANTICIPATION       │
                              │ Speaks next step before you ask  │
                              └──────────────────────────────────┘
```

---

## 1. Executive Definition: What is "FieldKit"?

**FieldKit** is an open architectural specification, runtime paradigm, and software suite coined by **1nc0gn30**. 

It defines how foundation vision, speech, and multimodal intelligence models can break out of static browser chatboxes, server terminals, and IDE screens to operate **reliably, safely, and proactively in real-world physical environments**.

Where traditional AI tooling assumes:
1. A quiet office or desk environment,
2. High-speed, unmetered, low-jitter Wi-Fi,
3. A user with two free hands to type, tap, and click,
4. A reactive request-response conversational loop (*"User asks ➔ Model responds"*),

**FieldKit introduces the inverse reality for frontline edge operations**:
1. **Hands-Busy Operations**: Hands are greasy, gloved, holding power tools, steering, or working delicate hardware.
2. **First-Person POV Sensors**: Video feeds tilt, shake, occlude, and pan dynamically with the human head or body.
3. **Proactive Anticipation**: The system observes state transitions across time and **acts/speaks without being prompted**.
4. **Zero-Trust Physical Privacy**: Ambient bystanders, customer faces, and private property must never leak to unencrypted cloud databases.

---

## 2. The Core Pillars of FieldKit

FieldKit formalizes five non-negotiable architectural layers that every real-world AI implementation must satisfy:

```
[Layer 5] ── Proactive Orchestration Layer  (Meta Muse Wonder / Finite State Machines)
[Layer 4] ── Spatial Grounding & Tracking    (Sub-127ms Bounding Boxes & MediaPipe Hand Rays)
[Layer 3] ── Acoustic Isolation & Timbre    (Wearer-Only Voice Gating)
[Layer 2] ── Local Cryptographic Isolation   (On-Device Biometric People Vault & KeyStore)
[Layer 1] ── Sensor Ingestion & Transport   (DAT SDK 1.0.1, WebRTC, RTSP, BLE Low-Latency)
```

### Pillar I — Proactive Anticipation (The Anti-Prompt)
Standard AI waits for input. FieldKit systems track **Physical State Milestones**.
* Given a goal (*e.g., "Replace hydraulic seal"*), FieldKit compiles a directed acyclic graph (DAG) of physical sub-states.
* The vision system watches for spatial transitions (e.g., `RETAINER_RING_REMOVED`, `SEAL_SEATED`).
* As soon as a milestone is confirmed, FieldKit issues the next procedural instruction directly to the wearer's spatial speakers—eliminating the need to ask *"What's next?"*.

### Pillar II — Sub-130ms Spatial Grounding
Real-world AI cannot rely on 2-second cloud round trips. FieldKit standardizes:
* Micro-edge model streaming pipelines (e.g., Meta Muse Spark, TensorRT, vLLM).
* First-person coordinate mapping translating pixel coordinates `[ymin, xmin, ymax, xmax]` into real 3D pointing vectors.
* Skeletal hand-tracking intersection tests to verify which physical component the user's fingers are touching before validating a completed action.

### Pillar III — Wearer-Only Acoustic Isolation (Voice Gate)
In industrial and outdoor environments, ambient noise (machinery, chatter, wind, street noise) causes catastrophic false triggers in standard voice AI. FieldKit enforces:
* **Near-Field Vocal Gating**: Calibrated acoustic thresholds that measure vocal proximity and spectral signatures.
* **Bystander Rejection**: Even if a colleague next to the wearer shouts an instruction, the AI rejects the input unless it originates from the wearer's verified acoustic footprint.

### Pillar IV — Zero-Leakage On-Device Biometric Vault
Deploying cameras in public or semi-private workplaces creates massive surveillance risks. FieldKit mandates:
* **Local-Only Biometric Embeddings**: Facial landmarks and body geometry vectors are processed on-device (via MediaPipe BlazeFace / FaceMesh) and stored strictly locally.
* **Hardware-Backed Cryptography**: Stored vectors are encrypted at rest with **AES-256-GCM** using keys generated inside the hardware enclave (e.g., Android KeyStore / Apple Secure Enclave).
* **Zero Cloud Face Storage**: Raw biometric video is never stored in central databases or used for unconsented model training.

### Pillar V — Dual-Mode Presence (Companion vs. Silent Observer)
FieldKit recognizes that workers fluctuate between deep focus and open troubleshooting:
* **Silent Spotter Mode**: Zero visual distractions; the AI silently observes physical state changes and chimes in with short audio prompts only when necessary.
* **Full-Duplex Companion Mode**: An interactive, low-latency conversational mode featuring 2D/3D viseme avatars (e.g. dynamic Fibonacci or morph target avatars) capable of conversational interruptions, humor, and complex diagnostic back-and-forth.

---

## 3. Flagship Implementations

FieldKit is not just a theoretical standard; it powers production real-world projects:

| Implementation | Description | Target Hardware |
| :--- | :--- | :--- |
| **[Spotter](https://github.com/NullAITech/nullai-fieldkit)** | Proactive smart-glasses co-pilot built for the Meta Global AI Developer Hackathon 2026. Guides mechanical and electronic repairs hands-free. | Ray-Ban Meta Smart Glasses (DAT SDK 1.0.1) + Pixel 10 Pro |
| **FieldKit Relay Hub** | Ultra-low latency Android / Linux bridge daemon managing streaming WebRTC channels, local cryptographic vaults, and model endpoints. | Android AOSP / Linux Embedded |

---

## 4. Technical Architecture

```
                    ┌────────────────────────┐
                    │ Ray-Ban Meta / Wearable │
                    │ (Camera + Microphones) │
                    └───────────┬────────────┘
                                │ 1080p @ 30fps + Multi-Mic PCM
                                ▼
                    ┌────────────────────────┐
                    │    FieldKit Relay Hub  │
                    │   (Pixel 10 Pro / Host)│
                    ├────────────────────────┤
                    │ • Wearer Voice Gate    │
                    │ • AES-256 People Vault │
                    │ • MediaPipe Hands      │
                    └───────────┬────────────┘
                                │ WebRTC / Low-Latency Stream
                                ▼
         ┌──────────────────────────────────────────────┐
         │          Multimodal Reasoning Core           │
         ├──────────────────────┬───────────────────────┤
         │ Meta Muse Spark 1.1  │ Meta Muse Wonder      │
         │ (Spatial Grounding & │ (Procedural State DAG │
         │  State Detection)    │  & Task Orchestration)│
         └──────────────────────┴───────────────────────┘
                                │
                                ▼ Proactive Step Confirmation
                    ┌────────────────────────┐
                    │  Spatial Audio Prompt  │
                    │ (Delivered to Glasses) │
                    └────────────────────────┘
```

---

## 5. Specification Standard: What Qualifies as "FieldKit-Compliant"?

For a software system or hardware suite to be designated **FieldKit-Compliant**, it must adhere to the **FieldKit Manifesto**:

1. **Non-Intrusive by Default**: Never require screen touches or text prompts to progress through a physical workflow.
2. **Proactive State Awareness**: Vision models must detect real-world task progression without user prompting.
3. **Hardware-Enforced Privacy**: User biometric data must be encrypted with device-bound hardware keys and never transmitted in plaintext.
4. **Deterministic Noise Rejection**: Must maintain strict wearer voice isolation against ambient environmental sound.
5. **Open & Sovereign**: 100% unlocked core functionality with zero paywalls or artificial subscription barriers.

---

## 6. Directory Structure & Reference Design

```
fieldkit/
├── README.md                      # Complete FieldKit Specification & Standard
├── SPECIFICATION.md               # Formal RFC-style architecture guidelines
├── site/                          # Avant-Garde Uncommon Web Portal (webdev.teknium.io)
│   ├── index.html                 # Semantic HTML5, Schema.org graph, Live HUD & Workbench
│   ├── style.css                  # Pure CSS conic border beam, responsive triple-viewport
│   └── app.js                     # Bayer 4x4 dither canvas, Braille tracker & WebAudio
├── mcp/                           # Official FieldKit MCP Server for AI Agents
│   ├── fieldkit_mcp_server.py     # Executable JSON-RPC stdio Model Context Protocol server
│   └── README.md                  # Claude Desktop, Cursor & Hermes setup instructions
├── sdk/python/                    # Python 3.9+ Edge SDK Runtime
│   └── fieldkit/                  # Mission DAG, Sensory Ingest, Voice Gate, Biometric Vault
├── cli/                           # Interactive Terminal Runner (fieldkit)
├── templates/                     # Production-ready YAML Mission Task Schemas
│   ├── industrial-repair/         # 480V LOTO & Centrifugal Mechanical Seal Overhaul
│   ├── emergency-medical/         # TCCC Care Under Fire Extremity Tourniquet
│   └── security-inspection/       # Datacenter Biometric & Anti-Tamper Seal Sweep
├── architecture/
│   ├── 01_sensor_transport.md     # DAT SDK, WebRTC, low-latency video pipelines
│   ├── 02_spatial_grounding.md    # Sub-130ms bounding box & hand tracking spec
│   ├── 03_voice_gating.md         # Acoustic near-field spectral isolation
│   ├── 04_biometric_vault.md      # AES-256-GCM on-device KeyStore protocol
│   └── 05_proactive_loop.md       # State-machine DAG & proactive coaching
└── docs/
    ├── FAQ.md                     # Terminology breakdown & industry contrast
    └── TERMINOLOGY.md             # Formal lexicon & 10 architectural definitions
```

---

## 7. Origin & Attribution

**FieldKit** was conceived and engineered by **1nc0gn30**, founder of the **NullAI Platform**.

* **GitHub**: [@1nc0gn30](https://github.com/1nc0gn30)
* **Organization**: [@NullAITech](https://github.com/NullAITech)
* **Website**: [nullai.tech](https://nullai.tech)
* **Support**: [Buy Us a Coffee](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X) • Solana: `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`

---

## License

MIT License. Open-source, open-access, sovereign software for the physical computing era.
