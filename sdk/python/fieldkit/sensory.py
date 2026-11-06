from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Tuple, Optional


@dataclass
class BoundingBox:
    """Normalized spatial bounding envelope: [ymin, xmin, ymax, xmax] in range 0.0 to 1.0."""
    ymin: float
    xmin: float
    ymax: float
    xmax: float
    label: str = ""
    confidence: float = 1.0

    def contains_point(self, x: float, y: float) -> bool:
        return self.xmin <= x <= self.xmax and self.ymin <= y <= self.ymax

    @property
    def center(self) -> Tuple[float, float]:
        return ((self.xmin + self.xmax) / 2.0, (self.ymin + self.ymax) / 2.0)

    @property
    def area(self) -> float:
        return max(0.0, self.xmax - self.xmin) * max(0.0, self.ymax - self.ymin)


@dataclass
class LandmarkPoint:
    """MediaPipe style 3D skeletal landmark coordinate."""
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0

    def distance_to(self, other: LandmarkPoint) -> float:
        return math.sqrt(
            (self.x - other.x) ** 2 +
            (self.y - other.y) ** 2 +
            (self.z - other.z) ** 2
        )


class GestureDetector:
    """Calculates physical hand grasp/pinch interactions in operator FOV."""

    PINCH_THRESHOLD = 0.065  # normalized coordinate distance

    @classmethod
    def is_pinch(cls, thumb_tip: LandmarkPoint, index_tip: LandmarkPoint) -> bool:
        """Verify index and thumb tip proximity representing fine motor pinch."""
        dist = thumb_tip.distance_to(index_tip)
        return dist < cls.PINCH_THRESHOLD

    @classmethod
    def get_pinch_centroid(cls, thumb_tip: LandmarkPoint, index_tip: LandmarkPoint) -> Tuple[float, float]:
        return ((thumb_tip.x + index_tip.x) / 2.0, (thumb_tip.y + index_tip.y) / 2.0)


class RaycastEvaluator:
    """Intersects hand landmarks with 3D bounded physical hardware targets."""

    @classmethod
    def verify_manipulation(
        cls,
        target_box: BoundingBox,
        thumb_tip: LandmarkPoint,
        index_tip: LandmarkPoint
    ) -> Tuple[bool, float]:
        """Returns (is_manipulating, confidence)."""
        is_pinching = GestureDetector.is_pinch(thumb_tip, index_tip)
        cx, cy = GestureDetector.get_pinch_centroid(thumb_tip, index_tip)
        in_target = target_box.contains_point(cx, cy)

        if is_pinching and in_target:
            return True, 0.95
        elif in_target:
            return False, 0.40
        return False, 0.0
