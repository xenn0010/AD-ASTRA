from __future__ import annotations

from typing import Dict, List


def apply_edits(text: str, edits: List[Dict]) -> str:
    """
    Apply simple structured edits to ad copy.
    Supported ops: replace, prepend, append, strengthen_claim (naive boost).
    """
    result = text
    for e in edits:
        op = e.get("op")
        if op == "replace":
            target = str(e.get("target", ""))
            value = str(e.get("value", ""))
            result = result.replace(target, value)
        elif op == "prepend":
            value = str(e.get("value", ""))
            result = f"{value} {result}".strip()
        elif op == "append":
            value = str(e.get("value", ""))
            result = f"{result} {value}".strip()
        elif op == "strengthen_claim":
            target = str(e.get("target", ""))
            constraint = str(e.get("constraint", ""))
            if target and target in result:
                result = result.replace(target, f"{target} ({constraint})")
    return result


