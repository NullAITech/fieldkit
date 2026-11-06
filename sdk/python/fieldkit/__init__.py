"""FieldKit Python SDK & Edge Runtime Engine.

The reference implementation of the FieldKit Physical AI Operating Specification (RFC-FK-001).
Coined and engineered by 1nc0gn30 • NullAI Platform.
"""

__version__ = "1.0.0"
__author__ = "1nc0gn30"
__license__ = "MIT"

from .mission import Mission, Step, StateTransitionError
from .sensory import BoundingBox, LandmarkPoint, GestureDetector, RaycastEvaluator
from .voice import NearFieldVoiceGate
from .vault import SovereignBiometricVault

__all__ = [
    "Mission",
    "Step",
    "StateTransitionError",
    "BoundingBox",
    "LandmarkPoint",
    "GestureDetector",
    "RaycastEvaluator",
    "NearFieldVoiceGate",
    "SovereignBiometricVault",
]
