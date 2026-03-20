"""Helper functions for building Grafly diagram JSON."""
import json


def N(nid, shape, x, y, w, h, label, fill, stroke,
      sw=2, ss="solid", tc="#111827", fs=13, fw="600",
      zi=0, op=1.0, cloud=False, accent=None):
    """Create a Grafly node dict."""
    d = {
        "shapeType": shape, "label": label,
        "fillColor": fill, "strokeColor": stroke,
        "strokeWidth": sw, "strokeStyle": ss,
        "textColor": tc, "fontSize": fs, "fontWeight": fw,
        "fontStyle": "normal", "textDecoration": "none",
        "textAlign": "center", "opacity": op,
    }
    if cloud:
        d["isCloudShape"] = True
        d["accentColor"] = accent
    return {
        "id": nid, "type": "shape",
        "position": {"x": x, "y": y},
        "width": w, "height": h, "zIndex": zi, "data": d
    }


def E(eid, src, tgt, sh, th, label="", color="#6B7280", ew=2,
      es="solid", anim=False, pt="smoothstep", at="filled",
      astart=False, wp=None):
    """Create a Grafly edge dict."""
    return {
        "id": eid, "type": "custom",
        "source": src, "target": tgt,
        "sourceHandle": sh, "targetHandle": th,
        "data": {
            "label": label, "edgeStyle": es, "edgeColor": color,
            "edgeWidth": ew, "animated": anim, "pathType": pt,
            "arrowType": at, "arrowStart": astart, "waypoint": wp
        }
    }


def D(did, name, nodes, edges, vx=50, vy=50, vz=1.0):
    """Create a Grafly diagram dict."""
    return {
        "id": did, "name": name,
        "nodes": nodes, "edges": edges,
        "viewport": {"x": vx, "y": vy, "zoom": vz}
    }


def make_example(system_message, prompt, diagram):
    """Wrap a diagram in an OpenAI-compatible chat training example."""
    return {
        "messages": [
            {"role": "system",    "content": system_message},
            {"role": "user",      "content": prompt},
            {"role": "assistant", "content": json.dumps(diagram, separators=(',', ':'))}
        ]
    }
