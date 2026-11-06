from __future__ import annotations

import time
import yaml
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Callable


class StateTransitionError(Exception):
    """Raised when an illegal or out-of-order step transition is attempted."""
    pass


@dataclass
class Step:
    id: str
    name: str
    prompt_speech: str
    expected_action: Optional[str] = None
    verification_rules: Dict[str, Any] = field(default_factory=dict)
    on_success: Optional[str] = None
    on_failure: Optional[str] = None
    completed_at: Optional[float] = None
    verification_evidence: Optional[str] = None

    @property
    def is_completed(self) -> bool:
        return self.completed_at is not None


class Mission:
    """Deterministic Directed Acyclic Graph (DAG) state machine for physical operations."""

    def __init__(
        self,
        mission_id: str,
        title: str,
        category: str = "general",
        initial_step: Optional[str] = None,
        failure_step: Optional[str] = None
    ):
        self.mission_id = mission_id
        self.title = title
        self.category = category
        self.initial_step_id = initial_step
        self.failure_step_id = failure_step
        self.steps: Dict[str, Step] = {}
        self.ordered_step_ids: List[str] = []
        self.current_step_id: Optional[str] = None
        self.started_at: float = time.time()
        self.completed_at: Optional[float] = None
        self.listeners: List[Callable[[str, Step], None]] = []

    @classmethod
    def from_yaml_file(cls, filepath: str) -> Mission:
        with open(filepath, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return cls.from_dict(data)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Mission:
        sm = data.get("state_machine", {})
        m = cls(
            mission_id=data.get("mission_id", f"mission-{int(time.time())}"),
            title=data.get("title", "Untitled Physical Mission"),
            category=data.get("category", "general"),
            initial_step=sm.get("initial_step"),
            failure_step=sm.get("failure_step")
        )

        for step_data in sm.get("steps", []):
            s = Step(
                id=step_data["id"],
                name=step_data["name"],
                prompt_speech=step_data["prompt_speech"],
                expected_action=step_data.get("expected_action"),
                verification_rules=step_data.get("verification_rules", {}),
                on_success=step_data.get("on_success"),
                on_failure=step_data.get("on_failure")
            )
            m.add_step(s)

        if m.ordered_step_ids and not m.current_step_id:
            m.current_step_id = m.initial_step_id or m.ordered_step_ids[0]

        return m

    def add_step(self, step: Step):
        self.steps[step.id] = step
        if step.id not in self.ordered_step_ids:
            self.ordered_step_ids.append(step.id)
        if not self.current_step_id:
            self.current_step_id = step.id

    def subscribe(self, callback: Callable[[str, Step], None]):
        """Subscribe to step advancement events (e.g. for audio TTS dispatch)."""
        self.listeners.append(callback)

    @property
    def current_step(self) -> Optional[Step]:
        if not self.current_step_id or self.current_step_id not in self.steps:
            return None
        return self.steps[self.current_step_id]

    @property
    def is_finished(self) -> bool:
        return self.completed_at is not None or self.current_step is None

    @property
    def progress_percentage(self) -> float:
        if not self.ordered_step_ids:
            return 100.0 if self.completed_at else 0.0
        completed = sum(1 for sid in self.ordered_step_ids if self.steps[sid].is_completed)
        return round((completed / len(self.ordered_step_ids)) * 100.0, 1)

    def advance(self, evidence: str = "Sensory verification confirmed") -> Optional[Step]:
        """Verify the current step and transition forward in the DAG."""
        if self.is_finished:
            return None

        curr = self.current_step
        if not curr:
            return None

        curr.completed_at = time.time()
        curr.verification_evidence = evidence

        # Notify listeners
        for listener in self.listeners:
            try:
                listener("step_verified", curr)
            except Exception:
                pass

        next_step_id = curr.on_success
        if not next_step_id or next_step_id in ["mission_complete", "complete"]:
            self.current_step_id = None
            self.completed_at = time.time()
            return None

        if next_step_id not in self.steps:
            # Fall back to next sequential step in list
            try:
                cur_idx = self.ordered_step_ids.index(curr.id)
                if cur_idx + 1 < len(self.ordered_step_ids):
                    next_step_id = self.ordered_step_ids[cur_idx + 1]
                else:
                    self.current_step_id = None
                    self.completed_at = time.time()
                    return None
            except ValueError:
                self.current_step_id = None
                self.completed_at = time.time()
                return None

        self.current_step_id = next_step_id
        new_step = self.current_step

        for listener in self.listeners:
            try:
                listener("step_activated", new_step)
            except Exception:
                pass

        return new_step

    def abort(self, reason: str = "Safety threshold violated"):
        """Abort mission to failure safety state."""
        self.current_step_id = self.failure_step_id
        self.completed_at = time.time()
        for listener in self.listeners:
            try:
                listener("mission_aborted", Step(id="abort", name="ABORT", prompt_speech=reason))
            except Exception:
                pass
