from __future__ import annotations

import asyncio
import json
import math
import os
import random
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    import redis.asyncio as redis  # type: ignore
except Exception:  # pragma: no cover
    redis = None


def keyspace(campaign_id: str, segment: str) -> str:
    return f"arms:{campaign_id}:{segment}"


class SelectRequest(BaseModel):
    campaignId: str
    segment: str
    arms: List[str]
    context: Optional[dict] = None


class SelectResponse(BaseModel):
    variantId: str
    explore: bool = False


class RewardRequest(BaseModel):
    campaignId: str
    segment: str
    variantId: str
    reward: float = 1.0
    assignmentId: Optional[str] = None


@dataclass
class ArmParams:
    alpha: float = 1.0
    beta: float = 1.0

    def to_json(self) -> str:
        return json.dumps({"alpha": self.alpha, "beta": self.beta})

    @staticmethod
    def from_json(s: str) -> "ArmParams":
        d = json.loads(s)
        return ArmParams(alpha=float(d.get("alpha", 1.0)), beta=float(d.get("beta", 1.0)))


class Store:
    def __init__(self) -> None:
        self._mem: Dict[str, Dict[str, ArmParams]] = {}
        self._r = None
        url = os.environ.get("REDIS_URL")
        if url and redis:
            self._r = redis.from_url(url, decode_responses=True)

    async def get_all(self, key: str) -> Dict[str, ArmParams]:
        if self._r is None:
            return self._mem.get(key, {}).copy()
        # Redis hash of armId -> json
        vals = await self._r.hgetall(key)
        return {k: ArmParams.from_json(v) for k, v in vals.items()}

    async def set_arm(self, key: str, arm_id: str, params: ArmParams) -> None:
        if self._r is None:
            self._mem.setdefault(key, {})[arm_id] = params
            return
        await self._r.hset(key, arm_id, params.to_json())


store = Store()
app = FastAPI(title="Ad-Astra Bandit Service", version="0.1.0")


def sample_beta(alpha: float, beta: float) -> float:
    # Simple Beta sampling via two Gamma RVs (shape-scale with scale=1)
    x = random.gammavariate(alpha, 1.0)
    y = random.gammavariate(beta, 1.0)
    return x / (x + y)


@app.post("/select", response_model=SelectResponse)
async def select(req: SelectRequest) -> SelectResponse:
    if not req.arms:
        raise HTTPException(status_code=400, detail="arms list must be non-empty")
    ks = keyspace(req.campaignId, req.segment)
    params = await store.get_all(ks)
    # Ensure all arms exist with priors
    for arm in req.arms:
        if arm not in params:
            params[arm] = ArmParams()
            await store.set_arm(ks, arm, params[arm])

    # Thompson sampling
    scored = [(arm, sample_beta(p.alpha, p.beta)) for arm, p in params.items() if arm in req.arms]
    if not scored:
        # fallback: pick first
        return SelectResponse(variantId=req.arms[0], explore=True)
    scored.sort(key=lambda t: t[1], reverse=True)
    winner = scored[0][0]
    return SelectResponse(variantId=winner, explore=True)


@app.post("/reward")
async def reward(req: RewardRequest) -> dict:
    ks = keyspace(req.campaignId, req.segment)
    params = await store.get_all(ks)
    arm = params.get(req.variantId, ArmParams())
    # Treat positive reward as success; non-positive as failure
    if req.reward > 0:
        arm.alpha += req.reward
    else:
        arm.beta += abs(req.reward)
    await store.set_arm(ks, req.variantId, arm)
    return {"ok": True, "alpha": arm.alpha, "beta": arm.beta}


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


