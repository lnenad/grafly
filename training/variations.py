"""
Diagram variation engine.

vary_diagram(diagram, variant_idx) returns a deep copy of a Grafly diagram
with:
  - labels substituted using synonym maps (so each of 25 prompts gets a
    slightly different label vocabulary)
  - fill/stroke/textColor swapped to an alternate palette for non-cloud shapes
    (cloud accentColors are never touched — they're spec-defined)
"""

import copy

# ── Synonym table ──────────────────────────────────────────────────────────────
# key → 5 alternatives (index 0 is the "default" used in handwritten scenarios)
# Keys may be multi-word; matching is case-insensitive.
SYNONYMS: dict[str, list[str]] = {
    # Control flow
    "Start":          ["Start",       "Begin",       "Entry",        "Init",         "Launch"],
    "End":            ["End",         "Finish",      "Exit",         "Done",         "Complete"],
    "Stop":           ["Stop",        "Halt",        "Terminate",    "Abort",        "End"],
    # Auth / identity
    "Login":          ["Login",       "Sign In",     "Authenticate", "Log In",       "Auth"],
    "Logout":         ["Logout",      "Sign Out",    "Deauthenticate","Log Out",     "End Session"],
    "Register":       ["Register",    "Sign Up",     "Create Account","Enroll",      "Join"],
    "Auth":           ["Auth",        "Authenticate","Verify Identity","Authz",      "IAM Check"],
    "Authorize":      ["Authorize",   "Authz",       "Grant Access", "Permit",       "Allow"],
    "Validate":       ["Validate",    "Verify",      "Check",        "Inspect",      "Assert"],
    "Token":          ["Token",       "JWT",         "Access Token", "Bearer",       "Credential"],
    # Data ops
    "Fetch":          ["Fetch",       "Read",        "Retrieve",     "Query",        "Load"],
    "Store":          ["Store",       "Save",        "Persist",      "Write",        "Archive"],
    "Update":         ["Update",      "Modify",      "Edit",         "Patch",        "Mutate"],
    "Delete":         ["Delete",      "Remove",      "Purge",        "Drop",         "Erase"],
    "Upload":         ["Upload",      "Ingest",      "Import",       "Receive",      "Accept"],
    "Download":       ["Download",    "Export",      "Extract",      "Pull",         "Retrieve"],
    "Process":        ["Process",     "Handle",      "Execute",      "Run",          "Compute"],
    "Transform":      ["Transform",   "Convert",     "Normalize",    "Map",          "Reshape"],
    "Enrich":         ["Enrich",      "Augment",     "Annotate",     "Append",       "Enhance"],
    "Ingest":         ["Ingest",      "Collect",     "Capture",      "Receive",      "Accept"],
    # Infra / services
    "User":           ["User",        "Client",      "Customer",     "Requester",    "Actor"],
    "Users":          ["Users",       "Clients",     "Customers",    "Requesters",   "Actors"],
    "Server":         ["Server",      "Backend",     "Service",      "App Server",   "Node"],
    "Gateway":        ["Gateway",     "GW",          "Proxy",        "Entry Point",  "Front Door"],
    "Queue":          ["Queue",       "Message Queue","Job Queue",   "Task Queue",   "MQ"],
    "Cache":          ["Cache",       "Redis",       "Memcache",     "Hot Store",    "In-Memory"],
    "Database":       ["Database",    "DB",          "Data Store",   "Storage",      "Repository"],
    "Monitor":        ["Monitor",     "Observe",     "Watch",        "Track",        "Measure"],
    "Notify":         ["Notify",      "Alert",       "Inform",       "Message",      "Send Alert"],
    "Route":          ["Route",       "Direct",      "Forward",      "Dispatch",     "Relay"],
    "Deploy":         ["Deploy",      "Release",     "Publish",      "Ship",         "Rollout"],
    "Build":          ["Build",       "Compile",     "Package",      "Assemble",     "Bundle"],
    "Test":           ["Test",        "QA",          "Verify",       "Validate",     "Check"],
    # Business
    "Order":          ["Order",       "Purchase",    "Transaction",  "Request",      "Booking"],
    "Orders":         ["Orders",      "Purchases",   "Transactions", "Requests",     "Bookings"],
    "Payment":        ["Payment",     "Charge",      "Billing",      "Invoice",      "Settlement"],
    "Product":        ["Product",     "Item",        "Listing",      "SKU",          "Catalog Item"],
    "Search":         ["Search",      "Find",        "Lookup",       "Query",        "Discover"],
    "Filter":         ["Filter",      "Screen",      "Select",       "Exclude",      "Prune"],
    "Approve":        ["Approve",     "Accept",      "Confirm",      "Authorize",    "Green-light"],
    "Reject":         ["Reject",      "Deny",        "Decline",      "Refuse",       "Block"],
    # State / result
    "Success":        ["Success",     "Approved",    "Confirmed",    "Accepted",     "OK"],
    "Error":          ["Error",       "Failure",     "Failed",       "Rejected",     "Exception"],
    "Pending":        ["Pending",     "In Progress", "Queued",       "Waiting",      "Scheduled"],
    # Networking / zones
    "Load Balancer":  ["Load Balancer","ALB",        "LB",           "Traffic Router","Ingress"],
    "API Gateway":    ["API Gateway", "API GW",      "REST API",     "HTTP API",     "API Layer"],
    "CDN":            ["CDN",         "Edge Cache",  "Content Cache","Edge Network", "CDN Edge"],
    "VPN":            ["VPN",         "Tunnel",      "Private Link", "Secure Tunnel","VPN Link"],
    # Zones / labels
    "Compute":        ["Compute",     "Runtime",     "Processing",   "Execution",    "Workers"],
    "Data":           ["Data",        "Storage",     "Persistence",  "Data Layer",   "Datastore"],
    "Observability":  ["Observability","Monitoring", "Telemetry",    "Ops",          "Insights"],
    "Security":       ["Security",    "Auth Layer",  "IAM",          "Access Control","Policy"],
}

# ── Color palettes ─────────────────────────────────────────────────────────────
# role → (fillColor, strokeColor, textColor)
# Semantic roles that must stay consistent (error=red, success=green, start=green)
# only "process", "io", "db", "note", "decision" are varied across palettes.

PALETTES: list[dict] = [
    # 0: default indigo/purple (matches handwritten scenarios)
    {
        "process":  ("#EEF2FF", "#818CF8", "#1E1B4B"),
        "success":  ("#F0FDF4", "#4ADE80", "#14532D"),
        "error":    ("#FFF1F2", "#FB7185", "#881337"),
        "start":    ("#ECFDF5", "#34D399", "#064E3B"),
        "decision": ("#FDF2F8", "#F472B6", "#831843"),
        "io":       ("#F0F9FF", "#38BDF8", "#0C4A6E"),
        "db":       ("#EFF6FF", "#60A5FA", "#1E3A8A"),
        "note":     ("#FFFBEB", "#F59E0B", "#78350F"),
        "neutral":  ("#F9FAFB", "#D1D5DB", "#374151"),
    },
    # 1: teal/emerald
    {
        "process":  ("#F0FDFA", "#2DD4BF", "#134E4A"),
        "success":  ("#F0FDF4", "#4ADE80", "#14532D"),
        "error":    ("#FFF1F2", "#FB7185", "#881337"),
        "start":    ("#ECFDF5", "#34D399", "#064E3B"),
        "decision": ("#FDF4FF", "#C084FC", "#581C87"),
        "io":       ("#ECFEFF", "#22D3EE", "#164E63"),
        "db":       ("#F0FDFA", "#2DD4BF", "#134E4A"),
        "note":     ("#FEFCE8", "#EAB308", "#713F12"),
        "neutral":  ("#F9FAFB", "#D1D5DB", "#374151"),
    },
    # 2: orange/amber
    {
        "process":  ("#FFF7ED", "#FB923C", "#7C2D12"),
        "success":  ("#F0FDF4", "#4ADE80", "#14532D"),
        "error":    ("#FFF1F2", "#FB7185", "#881337"),
        "start":    ("#ECFDF5", "#34D399", "#064E3B"),
        "decision": ("#FDF2F8", "#F472B6", "#831843"),
        "io":       ("#FFFBEB", "#FBBF24", "#78350F"),
        "db":       ("#FFF7ED", "#FB923C", "#7C2D12"),
        "note":     ("#FFFBEB", "#F59E0B", "#78350F"),
        "neutral":  ("#F9FAFB", "#D1D5DB", "#374151"),
    },
    # 3: slate (neutral dark)
    {
        "process":  ("#F1F5F9", "#64748B", "#0F172A"),
        "success":  ("#F0FDF4", "#4ADE80", "#14532D"),
        "error":    ("#FFF1F2", "#FB7185", "#881337"),
        "start":    ("#ECFDF5", "#34D399", "#064E3B"),
        "decision": ("#F5F3FF", "#A78BFA", "#4C1D95"),
        "io":       ("#F8FAFC", "#94A3B8", "#0F172A"),
        "db":       ("#1E293B", "#334155", "#F1F5F9"),
        "note":     ("#FFFBEB", "#F59E0B", "#78350F"),
        "neutral":  ("#F9FAFB", "#D1D5DB", "#374151"),
    },
    # 4: rose/pink
    {
        "process":  ("#FFF1F2", "#FDA4AF", "#881337"),
        "success":  ("#F0FDF4", "#4ADE80", "#14532D"),
        "error":    ("#FFF1F2", "#FB7185", "#881337"),
        "start":    ("#ECFDF5", "#34D399", "#064E3B"),
        "decision": ("#FDF2F8", "#F472B6", "#831843"),
        "io":       ("#FFF1F2", "#FDA4AF", "#881337"),
        "db":       ("#EFF6FF", "#60A5FA", "#1E3A8A"),
        "note":     ("#FFFBEB", "#F59E0B", "#78350F"),
        "neutral":  ("#F9FAFB", "#D1D5DB", "#374151"),
    },
]

# Map default palette-0 colors → role name (for color substitution)
_PALETTE0_FILL_TO_ROLE: dict[str, str] = {
    v[0]: k for k, v in PALETTES[0].items()
}


def _vary_label(label: str, variant_idx: int) -> str:
    """Substitute synonym words/phrases in a label."""
    if not label:
        return label
    slot = variant_idx % 5

    # Full-label match first (handles multi-word keys like "Load Balancer")
    for key, alts in SYNONYMS.items():
        if label.strip().lower() == key.lower():
            return alts[slot]

    # Line-by-line word substitution
    lines = label.split("\n")
    out_lines = []
    for line in lines:
        words = line.split()
        i = 0
        new_words = []
        while i < len(words):
            matched = False
            # Try multi-word keys first (longest first)
            for key, alts in sorted(SYNONYMS.items(), key=lambda x: -len(x[0].split())):
                key_parts = key.split()
                n = len(key_parts)
                phrase = " ".join(words[i : i + n])
                if phrase.lower() == key.lower():
                    new_words.append(alts[slot])
                    i += n
                    matched = True
                    break
            if not matched:
                new_words.append(words[i])
                i += 1
        out_lines.append(" ".join(new_words))
    return "\n".join(out_lines)


def vary_diagram(diagram: dict, variant_idx: int) -> dict:
    """
    Return a deep copy of *diagram* with label synonyms applied and
    non-cloud shape colors swapped to the palette for *variant_idx*.
    Cloud shapes (isCloudShape=True) are never color-modified.
    """
    d = copy.deepcopy(diagram)
    d["id"] = f"{d['id']}_v{variant_idx}"
    d["name"] = f"{d.get('name', '')} (v{variant_idx + 1})"

    palette = PALETTES[variant_idx % len(PALETTES)]

    for node in d.get("nodes", []):
        data = node.get("data", {})

        # Always vary labels (skip textbox zone labels with empty/short text)
        lbl = data.get("label", "")
        if lbl and len(lbl) > 1:
            data["label"] = _vary_label(lbl, variant_idx)

        # Color variation — cloud shapes are off-limits
        if not data.get("isCloudShape"):
            fill = data.get("fillColor", "")
            role = _PALETTE0_FILL_TO_ROLE.get(fill)
            if role and role in palette:
                f, s, t = palette[role]
                data["fillColor"] = f
                data["strokeColor"] = s
                data["textColor"] = t

    # Vary edge labels too
    for edge in d.get("edges", []):
        data = edge.get("data", {})
        lbl = data.get("label", "")
        if lbl and len(lbl) > 1:
            data["label"] = _vary_label(lbl, variant_idx)

    return d
