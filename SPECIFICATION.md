# FieldKit Architectural Specification (RFC-FK-001)

**Status**: Draft Standard  
**Author**: 1nc0gn30 (`@1nc0gn30`)  
**Organization**: NullAI Platform  
**Date**: November 2026  

---

## Abstract

This document specifies the technical requirements and communication protocols for **FieldKit**, an architectural framework designed to bring artificial intelligence models into physical, real-world operational environments. 

FieldKit defines interfaces for first-person POV sensor ingestion, low-latency spatial grounding, acoustic near-field wearer isolation, on-device biometric security, and proactive finite-state machine orchestration.

---

## 1. Sensor Transport Requirements (STR)

### 1.1 Ingestion Latency Budget
* Maximum glass-to-model frame transport latency: **<= 65 ms**.
* Video resolution: Minimum **1080p (1920x1080)** at **30 frames per second**.
* Transport protocol: Native device SDK (e.g., Meta DAT SDK 1.0.1) over encrypted Wi-Fi Direct or WebRTC data channels with VP8/H.264 hardware encoding.

### 1.2 Multi-Mic PCM Audio Stream
* Minimum sampling rate: **16 kHz / 16-bit mono** for speech processing; **48 kHz stereo** for ambient awareness channels.
* Dynamic jitter buffer: Max headroom of **35 ms** to prevent conversational delay during full-duplex interactions.

---

## 2. Spatial Grounding Specification (SGS)

### 2.1 Bounding Box Format
Spatial targets detected by edge vision models MUST be normalized according to:

$$\text{Box} = [y_{\min}, x_{\min}, y_{\max}, x_{\max}]$$

Where values are floating-point scalars in the range $[0.0, 1.0]$.

### 2.2 Skeletal Hand Intersections
To verify physical manipulation before progressing task states, the system MUST compute ray-casting intersections between:
1. MediaPipe index finger tip landmark ($L_8$) and thumb tip landmark ($L_4$),
2. The 2D/3D bounding volume of the targeted physical object.

A pinch or grasp event is verified when:

$$\text{Distance}(L_8, L_4) < \theta_{\text{pinch}} \quad \text{AND} \quad \text{Centroid}(L_{8,4}) \in \text{TargetBox}$$

---

## 3. Acoustic Wearer Isolation (Voice Gate Protocol)

### 3.1 Proximity & Spectral Gate
Ambient speech in industrial or open environments must not trigger agent state transitions.
* **Near-Field Attenuation**: Sound pressure levels from sources $> 1.0\text{ m}$ must be attenuated by at least **18 dB** using directional beamforming.
* **Timbre Verification**: User vocal enrollment generates a 128-dimensional spectral embedding. Incoming wake attempts require a cosine similarity score:

$$\text{Sim}(v_{\text{incoming}}, v_{\text{enrolled}}) \ge 0.82$$

Attempts below this threshold are dropped silently without waking the LLM inference loop.

---

## 4. On-Device Biometric People Vault (BPV)

### 4.1 Cryptographic Storage Standard
* All face landmark vectors ($192\text{-dim}$ embeddings) and identity labels MUST be stored locally on the client hub.
* Cipher: **AES-256-GCM** with a 128-bit authentication tag.
* Key Management: Keys are generated via Android `KeyGenParameterSpec` with `PURPOSE_ENCRYPT | PURPOSE_DECRYPT`, stored inside the hardware-backed Android KeyStore / StrongBox Keymaster.
* Hardware Enclave Guarantee: Master keys NEVER leave the device's secure element.

---

## 5. Proactive State Machine Orchestration (PSMO)

### 5.1 Directed Acyclic Task Graphs
Tasks are represented as stateful directed graphs:

$$G = (V, E)$$

Where:
* $V$ represents discrete physical conditions (e.g., `PANEL_CLOSED`, `SCREWS_REMOVED`, `FILTER_EXTRACTED`).
* $E$ represents transitions triggered by verified vision events $T_v$ or acoustic confirmations $T_a$.

```
[State 0: Housing Latched]
           │
           ▼ (Event: Latch Opened & Hands Free)
[State 1: Housing Open] ── Proactive Audio: "Pull out the pleated filter cartridge."
           │
           ▼ (Event: Cartridge Removed)
[State 2: Bay Empty]   ── Proactive Audio: "Insert the new oiled filter."
```

### 5.2 Anti-Hallucination Guardrails
The system MUST NOT emit audio coaching unless:
1. Target state change has been held stable across at least **3 consecutive video frames** ($\ge 100\text{ ms}$).
2. Confidence score of the vision detector exceeds $0.85$.
