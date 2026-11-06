# FieldKit MCP Server for AI Agents

> **The Model Context Protocol (MCP) bridge for Physical AI, Wearable First-Person Ingestion, and Proactive Guidance.**  
> Engineered by **1nc0gn30** • [NullAI Platform](https://nullai.tech)

---

## ⚡ Overview

The **FieldKit MCP Server** enables frontier LLM agents (Claude Desktop, Cursor, Cline, OpenCode, Hermes Agent, Antigravity) to act as proactive real-world physical coaches. Instead of only chatting in a window, agents connect to FieldKit state machines, evaluate first-person FOV visual/audio cues, enforce safety sequences, and dispatch audio cues directly to operator smart glasses and bone-conduction headsets.

---

## 🛠️ Provided Tools

| Tool | Purpose |
| :--- | :--- |
| `fieldkit_create_mission` | Initialize a custom physical mission with a deterministic state graph. |
| `fieldkit_load_template` | Instantiate reference templates (`industrial_pump`, `tccc_tourniquet`, `datacenter_sweep`). |
| `fieldkit_get_mission_status` | Query active step, hands-busy state, elapsed time, and next audio cue. |
| `fieldkit_progress_step` | Advance to the next checkpoint once sensory manipulation is physically verified. |
| `fieldkit_evaluate_fov_frame` | Analyze detected objects and hand landmarks in operator first-person POV. |
| `fieldkit_vault_audit` | Verify AES-256-GCM hardware keymaster integrity and zero-egress invariants. |

---

## 🔌 Quick Integration

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "fieldkit": {
      "command": "python3",
      "args": ["/path/to/NullAITech/fieldkit/mcp/fieldkit_mcp_server.py"]
    }
  }
}
```

### Cursor / Cline (`mcp.json`)
```json
{
  "mcpServers": {
    "fieldkit": {
      "command": "python3",
      "args": ["/path/to/NullAITech/fieldkit/mcp/fieldkit_mcp_server.py"],
      "env": {}
    }
  }
}
```

### Hermes Agent (`~/.hermes/config.yaml` or direct command)
```bash
hermes mcp add fieldkit -- python3 /home/zoth/NullAITech/fieldkit/mcp/fieldkit_mcp_server.py
```
