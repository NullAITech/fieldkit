from __future__ import annotations

import math
from typing import List, Optional


class NearFieldVoiceGate:
    """Acoustic gating algorithm enforcing near-field wearer isolation and ambient speech rejection."""

    def __init__(self, min_similarity_threshold: float = 0.82, attenuation_db: float = 18.0):
        self.min_similarity_threshold = min_similarity_threshold
        self.attenuation_db = attenuation_db
        self.enrolled_embedding: Optional[List[float]] = None

    def enroll_voiceprint(self, spectral_embedding: List[float]):
        """Register the wearer's 128-dimensional acoustic vocal fingerprint."""
        norm = math.sqrt(sum(x * x for x in spectral_embedding))
        if norm > 0:
            self.enrolled_embedding = [x / norm for x in spectral_embedding]
        else:
            self.enrolled_embedding = spectral_embedding

    def verify_speaker(self, incoming_embedding: List[float]) -> bool:
        """Calculate cosine similarity against enrolled wearer voiceprint."""
        if not self.enrolled_embedding:
            # If no voiceprint is enrolled, pass with caution
            return True

        if len(incoming_embedding) != len(self.enrolled_embedding):
            return False

        norm = math.sqrt(sum(x * x for x in incoming_embedding))
        if norm == 0:
            return False
        normalized_in = [x / norm for x in incoming_embedding]

        similarity = sum(a * b for a, b in zip(self.enrolled_embedding, normalized_in))
        return similarity >= self.min_similarity_threshold

    def is_near_field(self, estimated_distance_meters: float) -> bool:
        """Verify audio source originated within the 1.0-meter near-field boundary."""
        return estimated_distance_meters <= 1.0
