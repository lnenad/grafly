# Grafly Diagram Format

This document describes the JSON format used to define diagrams in **Grafly** — a browser-based diagramming tool. The goal is to give you enough detail to generate valid, well-laid-out diagrams that Grafly can load directly.

---

## How to load a diagram

Paste the JSON into `localStorage` in the browser console:

```js
const diagram = { /* your JSON */ }
const id = diagram.id
const all = JSON.parse(localStorage.getItem('grafly_diagrams') || '{}')
all[id] = { ...diagram, updatedAt: Date.now() }
localStorage.setItem('grafly_diagrams', JSON.stringify(all))
localStorage.setItem('grafly_active_diagram', id)
location.reload()
```

---

## Top-level structure

```json
{
  "id": "diagram_1700000000000_abc123",
  "name": "My Diagram",
  "nodes": [ ...node objects... ],
  "edges": [ ...edge objects... ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

| Field      | Type   | Description |
|------------|--------|-------------|
| `id`       | string | Unique diagram ID. Use format `diagram_<timestamp>_<6 random chars>` |
| `name`     | string | Display name shown in the toolbar |
| `nodes`    | array  | All shape nodes (see Node schema) |
| `edges`    | array  | All connections between nodes (see Edge schema) |
| `viewport` | object | Initial pan/zoom. `x`, `y` are offsets in pixels; `zoom` is scale factor (1 = 100%) |

---

## Node schema

Each node represents one shape on the canvas.

```json
{
  "id": "n_1700000000000_a1b2",
  "type": "shape",
  "position": { "x": 200, "y": 150 },
  "width": 160,
  "height": 80,
  "zIndex": 0,
  "data": {
    "shapeType": "rect",
    "label": "My Shape",
    "fillColor": "#EEF2FF",
    "strokeColor": "#818CF8",
    "strokeWidth": 2,
    "strokeStyle": "solid",
    "textColor": "#1E1B4B",
    "fontSize": 14,
    "fontWeight": "600",
    "fontStyle": "normal",
    "textDecoration": "none",
    "textAlign": "center",
    "opacity": 1
  }
}
```

### Node top-level fields

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `id`       | string | yes | Unique. Format: `n_<timestamp>_<4 random alphanum>` |
| `type`     | string | yes | Always `"shape"` |
| `position` | object | yes | `{ x, y }` — top-left corner of the node in canvas coordinates |
| `width`    | number | yes | Width in pixels |
| `height`   | number | yes | Height in pixels |
| `zIndex`   | number | no  | Stacking order. Default `0`. Higher = in front |

### Node `data` fields

| Field           | Type   | Default    | Description |
|-----------------|--------|------------|-------------|
| `shapeType`     | string | —          | Shape to render. See **Shape Types** below |
| `label`         | string | `""`       | Text displayed inside the shape |
| `fillColor`     | string | `"#EEF2FF"` | CSS color or `"transparent"` |
| `strokeColor`   | string | `"#818CF8"` | CSS color or `"transparent"` |
| `strokeWidth`   | number | `2`        | Border thickness in pixels. Common values: `1`, `2`, `3`, `4`, `6` |
| `strokeStyle`   | string | `"solid"`  | `"solid"` \| `"dashed"` \| `"dotted"` |
| `textColor`     | string | `"#111827"` | Label text color |
| `fontSize`      | number | `13`       | Label font size in pixels. Range: `8`–`72` |
| `fontWeight`    | string | `"600"`    | `"600"` (normal) \| `"700"` (bold) |
| `fontStyle`     | string | `"normal"` | `"normal"` \| `"italic"` |
| `textDecoration`| string | `"none"`   | `"none"` \| `"underline"` |
| `textAlign`     | string | `"center"` | `"left"` \| `"center"` \| `"right"` |
| `opacity`       | number | `1`        | `0` (invisible) to `1` (fully opaque) |

**For cloud shapes (AWS/GCP) only**, add these fields inside `data`:

| Field          | Type    | Description |
|----------------|---------|-------------|
| `isCloudShape` | boolean | Always `true` for AWS/GCP nodes |
| `accentColor`  | string  | The icon's accent color. See shape tables below |

Cloud shapes typically use:
- `fillColor: "#FFFFFF"` (white card background)
- `strokeColor: "#E5E7EB"` (light gray border)
- `strokeWidth: 1`
- `fontSize: 12`
- `width: 90`, `height: 90`

---

## Edge schema

Each edge connects two nodes.

```json
{
  "id": "e_1700000000000_c3d4",
  "type": "custom",
  "source": "n_1700000000000_a1b2",
  "target": "n_1700000000000_e5f6",
  "sourceHandle": "right",
  "targetHandle": "left",
  "data": {
    "label": "",
    "edgeStyle": "solid",
    "edgeColor": "#6B7280",
    "edgeWidth": 2,
    "animated": false,
    "pathType": "smoothstep",
    "arrowType": "filled",
    "arrowStart": false,
    "waypoint": null
  }
}
```

### Edge top-level fields

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| `id`           | string | yes | Unique. Format: `e_<timestamp>_<4 random alphanum>` |
| `type`         | string | yes | Always `"custom"` |
| `source`       | string | yes | `id` of the source node |
| `target`       | string | yes | `id` of the target node |
| `sourceHandle` | string | no  | Which side of the source to connect from: `"top"` \| `"right"` \| `"bottom"` \| `"left"` |
| `targetHandle` | string | no  | Which side of the target to connect to: `"top"` \| `"right"` \| `"bottom"` \| `"left"` |

### Edge `data` fields

| Field       | Type    | Default        | Description |
|-------------|---------|----------------|-------------|
| `label`     | string  | `""`           | Optional text label in the middle of the edge |
| `edgeStyle` | string  | `"solid"`      | `"solid"` \| `"dashed"` \| `"dotted"` |
| `edgeColor` | string  | `"#6B7280"`    | CSS color for the line |
| `edgeWidth` | number  | `2`            | Line thickness. `1`–`4` |
| `animated`  | boolean | `false`        | Animated flowing dashes |
| `pathType`  | string  | `"smoothstep"` | `"smoothstep"` (rounded corners) \| `"bezier"` (smooth curve) \| `"straight"` (direct line) |
| `arrowType` | string  | `"filled"`     | `"filled"` (solid triangle) \| `"open"` (chevron) |
| `arrowStart`| boolean | `false`        | Add a second arrowhead at the source end (bidirectional) |
| `waypoint`  | object  | `null`         | `{ x, y }` bend point to curve the edge, or `null` for auto-routing |

---

## Shape types

### Basic shapes

| `shapeType`     | Name          | Default size | Typical use |
|-----------------|---------------|--------------|-------------|
| `rect`          | Rectangle     | 160 × 80     | Generic box, step, component |
| `roundedRect`   | Rounded Rect  | 160 × 80     | Softer step, card, service |
| `circle`        | Circle        | 100 × 100    | State, event, endpoint |
| `diamond`       | Diamond       | 140 × 100    | Decision / branching |
| `triangle`      | Triangle      | 120 × 100    | Direction, gate |
| `parallelogram` | Parallelogram | 160 × 80     | Input / Output |
| `cylinder`      | Cylinder      | 120 × 120    | Database, storage volume |
| `hexagon`       | Hexagon       | 140 × 100    | Process, preparation |
| `pill`          | Pill          | 160 × 60     | Start / End (terminator) |
| `callout`       | Callout       | 160 × 100    | Annotation, note, comment |
| `textbox`       | Text          | 160 × 60     | Free text label (no border) |

### AWS shapes

All AWS shapes use `width: 90`, `height: 90`, `isCloudShape: true`.

| `shapeType`         | Label          | Category   | `accentColor` |
|---------------------|----------------|------------|---------------|
| `aws-ec2`           | EC2            | Compute    | `#FF9900`     |
| `aws-lambda`        | Lambda         | Compute    | `#FF9900`     |
| `aws-ecs`           | ECS            | Compute    | `#FF9900`     |
| `aws-eks`           | EKS            | Compute    | `#FF9900`     |
| `aws-s3`            | S3             | Storage    | `#3F8624`     |
| `aws-ebs`           | EBS            | Storage    | `#3F8624`     |
| `aws-efs`           | EFS            | Storage    | `#3F8624`     |
| `aws-rds`           | RDS            | Database   | `#3B48CC`     |
| `aws-dynamodb`      | DynamoDB       | Database   | `#3B48CC`     |
| `aws-aurora`        | Aurora         | Database   | `#3B48CC`     |
| `aws-elasticache`   | ElastiCache    | Database   | `#3B48CC`     |
| `aws-vpc`           | VPC            | Networking | `#8C4FFF`     |
| `aws-elb`           | Load Balancer  | Networking | `#8C4FFF`     |
| `aws-cloudfront`    | CloudFront     | Networking | `#8C4FFF`     |
| `aws-route53`       | Route 53       | Networking | `#8C4FFF`     |
| `aws-apigateway`    | API Gateway    | Networking | `#8C4FFF`     |
| `aws-sns`           | SNS            | Messaging  | `#E7157B`     |
| `aws-sqs`           | SQS            | Messaging  | `#E7157B`     |
| `aws-iam`           | IAM            | Security   | `#DD344C`     |
| `aws-cloudwatch`    | CloudWatch     | Management | `#E7157B`     |

### GCP shapes

All GCP shapes use `width: 90`, `height: 90`, `isCloudShape: true`.

| `shapeType`         | Label            | Category   | `accentColor` |
|---------------------|------------------|------------|---------------|
| `gcp-compute`       | Compute Engine   | Compute    | `#4285F4`     |
| `gcp-cloudrun`      | Cloud Run        | Compute    | `#4285F4`     |
| `gcp-gke`           | GKE              | Compute    | `#4285F4`     |
| `gcp-functions`     | Cloud Functions  | Compute    | `#4285F4`     |
| `gcp-storage`       | Cloud Storage    | Storage    | `#AECBFA`     |
| `gcp-filestore`     | Filestore        | Storage    | `#AECBFA`     |
| `gcp-cloudsql`      | Cloud SQL        | Database   | `#5BB974`     |
| `gcp-spanner`       | Spanner          | Database   | `#5BB974`     |
| `gcp-firestore`     | Firestore        | Database   | `#FFA826`     |
| `gcp-bigquery`      | BigQuery         | Analytics  | `#AECBFA`     |
| `gcp-vpc`           | VPC Network      | Networking | `#4285F4`     |
| `gcp-loadbalancer`  | Load Balancing   | Networking | `#4285F4`     |
| `gcp-cdn`           | Cloud CDN        | Networking | `#4285F4`     |
| `gcp-pubsub`        | Pub/Sub          | Messaging  | `#EA4335`     |
| `gcp-vertexai`      | Vertex AI        | AI & ML    | `#FF6D00`     |
| `gcp-firebase`      | Firebase         | Dev        | `#FFA826`     |
| `gcp-monitoring`    | Cloud Monitoring | Management | `#34A853`     |
| `gcp-cloudbuild`    | Cloud Build      | Management | `#4285F4`     |

---

## Layout tips

- **Canvas origin** is (0, 0). Positive x goes right, positive y goes down.
- **Left-to-right flow**: space nodes ~200–280px apart horizontally.
- **Top-to-bottom flow**: space nodes ~120–160px apart vertically.
- **Cloud icons** (90×90) look good with ~140px horizontal and ~140px vertical spacing.
- Use `sourceHandle`/`targetHandle` to control which port the edge exits/enters from. For a left-to-right flow, use `sourceHandle: "right"` and `targetHandle: "left"`.
- Avoid overlapping nodes — always account for `width` and `height` when calculating positions.
- For a top-to-bottom flow, `position.x` should be centered relative to the node width. To center a 160px-wide node at x=300, set `position.x = 220`.

---

## Example 1 — Simple flowchart

A top-to-bottom user login flow using basic shapes.

```json
{
  "id": "diagram_example_001",
  "name": "User Login Flow",
  "viewport": { "x": 220, "y": 40, "zoom": 1 },
  "nodes": [
    {
      "id": "n_001_start",
      "type": "shape",
      "position": { "x": 170, "y": 40 },
      "width": 160,
      "height": 60,
      "zIndex": 0,
      "data": {
        "shapeType": "pill",
        "label": "Start",
        "fillColor": "#ECFDF5",
        "strokeColor": "#34D399",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#064E3B",
        "fontSize": 14,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_002_input",
      "type": "shape",
      "position": { "x": 170, "y": 160 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "parallelogram",
        "label": "Enter credentials",
        "fillColor": "#F0F9FF",
        "strokeColor": "#38BDF8",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#0C4A6E",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_003_validate",
      "type": "shape",
      "position": { "x": 170, "y": 300 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "rect",
        "label": "Validate credentials",
        "fillColor": "#EEF2FF",
        "strokeColor": "#818CF8",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#1E1B4B",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_004_decision",
      "type": "shape",
      "position": { "x": 155, "y": 440 },
      "width": 190,
      "height": 110,
      "zIndex": 0,
      "data": {
        "shapeType": "diamond",
        "label": "Valid?",
        "fillColor": "#FDF2F8",
        "strokeColor": "#F472B6",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#831843",
        "fontSize": 14,
        "fontWeight": "700",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_005_dashboard",
      "type": "shape",
      "position": { "x": 370, "y": 620 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "roundedRect",
        "label": "Go to dashboard",
        "fillColor": "#F0FDF4",
        "strokeColor": "#4ADE80",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#14532D",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_006_error",
      "type": "shape",
      "position": { "x": -50, "y": 620 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "callout",
        "label": "Show error message",
        "fillColor": "#FFF1F2",
        "strokeColor": "#FB7185",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#881337",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_007_end",
      "type": "shape",
      "position": { "x": 370, "y": 760 },
      "width": 160,
      "height": 60,
      "zIndex": 0,
      "data": {
        "shapeType": "pill",
        "label": "End",
        "fillColor": "#ECFDF5",
        "strokeColor": "#34D399",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#064E3B",
        "fontSize": 14,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    }
  ],
  "edges": [
    {
      "id": "e_001_002",
      "type": "custom",
      "source": "n_001_start",
      "target": "n_002_input",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_002_003",
      "type": "custom",
      "source": "n_002_input",
      "target": "n_003_validate",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_003_004",
      "type": "custom",
      "source": "n_003_validate",
      "target": "n_004_decision",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_004_005",
      "type": "custom",
      "source": "n_004_decision",
      "target": "n_005_dashboard",
      "sourceHandle": "right",
      "targetHandle": "top",
      "data": { "label": "Yes", "edgeStyle": "solid", "edgeColor": "#4ADE80", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_004_006",
      "type": "custom",
      "source": "n_004_decision",
      "target": "n_006_error",
      "sourceHandle": "left",
      "targetHandle": "top",
      "data": { "label": "No", "edgeStyle": "solid", "edgeColor": "#FB7185", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_005_007",
      "type": "custom",
      "source": "n_005_dashboard",
      "target": "n_007_end",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    }
  ]
}
```

---

## Example 2 — AWS architecture diagram

A standard three-tier web application on AWS.

```json
{
  "id": "diagram_example_002",
  "name": "AWS Three-Tier Web App",
  "viewport": { "x": 60, "y": 40, "zoom": 0.9 },
  "nodes": [
    {
      "id": "n_r53",
      "type": "shape",
      "position": { "x": 355, "y": 40 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-route53",
        "label": "Route 53",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#8C4FFF",
        "isCloudShape": true
      }
    },
    {
      "id": "n_cf",
      "type": "shape",
      "position": { "x": 355, "y": 200 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-cloudfront",
        "label": "CloudFront",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#8C4FFF",
        "isCloudShape": true
      }
    },
    {
      "id": "n_s3_static",
      "type": "shape",
      "position": { "x": 560, "y": 200 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-s3",
        "label": "S3 (Static)",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#3F8624",
        "isCloudShape": true
      }
    },
    {
      "id": "n_alb",
      "type": "shape",
      "position": { "x": 355, "y": 360 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-elb",
        "label": "Load Balancer",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#8C4FFF",
        "isCloudShape": true
      }
    },
    {
      "id": "n_ec2_a",
      "type": "shape",
      "position": { "x": 200, "y": 520 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-ec2",
        "label": "EC2",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#FF9900",
        "isCloudShape": true
      }
    },
    {
      "id": "n_ec2_b",
      "type": "shape",
      "position": { "x": 510, "y": 520 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-ec2",
        "label": "EC2",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#FF9900",
        "isCloudShape": true
      }
    },
    {
      "id": "n_rds",
      "type": "shape",
      "position": { "x": 280, "y": 680 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-rds",
        "label": "RDS (Primary)",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 11,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#3B48CC",
        "isCloudShape": true
      }
    },
    {
      "id": "n_cache",
      "type": "shape",
      "position": { "x": 430, "y": 680 },
      "width": 90,
      "height": 90,
      "zIndex": 0,
      "data": {
        "shapeType": "aws-elasticache",
        "label": "ElastiCache",
        "fillColor": "#FFFFFF",
        "strokeColor": "#E5E7EB",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 11,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1,
        "accentColor": "#3B48CC",
        "isCloudShape": true
      }
    }
  ],
  "edges": [
    {
      "id": "e_r53_cf",
      "type": "custom",
      "source": "n_r53",
      "target": "n_cf",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_cf_s3",
      "type": "custom",
      "source": "n_cf",
      "target": "n_s3_static",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": { "label": "static assets", "edgeStyle": "dashed", "edgeColor": "#9CA3AF", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "open", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_cf_alb",
      "type": "custom",
      "source": "n_cf",
      "target": "n_alb",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "API requests", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_alb_ec2a",
      "type": "custom",
      "source": "n_alb",
      "target": "n_ec2_a",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_alb_ec2b",
      "type": "custom",
      "source": "n_alb",
      "target": "n_ec2_b",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_ec2a_rds",
      "type": "custom",
      "source": "n_ec2_a",
      "target": "n_rds",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_ec2b_cache",
      "type": "custom",
      "source": "n_ec2_b",
      "target": "n_cache",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_ec2a_cache",
      "type": "custom",
      "source": "n_ec2_a",
      "target": "n_cache",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": { "label": "", "edgeStyle": "dotted", "edgeColor": "#D1D5DB", "edgeWidth": 1, "animated": false, "pathType": "smoothstep", "arrowType": "open", "arrowStart": false, "waypoint": null }
    }
  ]
}
```

---

## Example 3 — Mixed diagram with annotations

An event-driven processing pipeline using shapes and text labels.

```json
{
  "id": "diagram_example_003",
  "name": "Event Processing Pipeline",
  "viewport": { "x": 80, "y": 80, "zoom": 1 },
  "nodes": [
    {
      "id": "n_title",
      "type": "shape",
      "position": { "x": 120, "y": 20 },
      "width": 300,
      "height": 50,
      "zIndex": 0,
      "data": {
        "shapeType": "textbox",
        "label": "Event Processing Pipeline",
        "fillColor": "transparent",
        "strokeColor": "transparent",
        "strokeWidth": 0,
        "strokeStyle": "solid",
        "textColor": "#111827",
        "fontSize": 20,
        "fontWeight": "700",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "left",
        "opacity": 1
      }
    },
    {
      "id": "n_producer",
      "type": "shape",
      "position": { "x": 40, "y": 140 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "roundedRect",
        "label": "Event Producer",
        "fillColor": "#F0F9FF",
        "strokeColor": "#38BDF8",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#0C4A6E",
        "fontSize": 14,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_queue",
      "type": "shape",
      "position": { "x": 270, "y": 140 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "cylinder",
        "label": "Message Queue",
        "fillColor": "#EFF6FF",
        "strokeColor": "#60A5FA",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#1E3A8A",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_processor",
      "type": "shape",
      "position": { "x": 500, "y": 140 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "hexagon",
        "label": "Processor",
        "fillColor": "#F5F3FF",
        "strokeColor": "#A78BFA",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#2E1065",
        "fontSize": 14,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_decision",
      "type": "shape",
      "position": { "x": 515, "y": 290 },
      "width": 130,
      "height": 100,
      "zIndex": 0,
      "data": {
        "shapeType": "diamond",
        "label": "Valid?",
        "fillColor": "#FDF2F8",
        "strokeColor": "#F472B6",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#831843",
        "fontSize": 14,
        "fontWeight": "700",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_store",
      "type": "shape",
      "position": { "x": 500, "y": 460 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "cylinder",
        "label": "Data Store",
        "fillColor": "#EFF6FF",
        "strokeColor": "#60A5FA",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "textColor": "#1E3A8A",
        "fontSize": 14,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_dlq",
      "type": "shape",
      "position": { "x": 720, "y": 310 },
      "width": 160,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "roundedRect",
        "label": "Dead Letter Queue",
        "fillColor": "#FFF1F2",
        "strokeColor": "#FB7185",
        "strokeWidth": 2,
        "strokeStyle": "dashed",
        "textColor": "#881337",
        "fontSize": 13,
        "fontWeight": "600",
        "fontStyle": "normal",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 1
      }
    },
    {
      "id": "n_note",
      "type": "shape",
      "position": { "x": 720, "y": 430 },
      "width": 180,
      "height": 80,
      "zIndex": 0,
      "data": {
        "shapeType": "callout",
        "label": "Retry up to 3×, then discard",
        "fillColor": "#FFFBEB",
        "strokeColor": "#F59E0B",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "textColor": "#78350F",
        "fontSize": 12,
        "fontWeight": "600",
        "fontStyle": "italic",
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 0.9
      }
    }
  ],
  "edges": [
    {
      "id": "e_prod_queue",
      "type": "custom",
      "source": "n_producer",
      "target": "n_queue",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": { "label": "publish", "edgeStyle": "solid", "edgeColor": "#38BDF8", "edgeWidth": 2, "animated": true, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_queue_proc",
      "type": "custom",
      "source": "n_queue",
      "target": "n_processor",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": { "label": "consume", "edgeStyle": "solid", "edgeColor": "#A78BFA", "edgeWidth": 2, "animated": true, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_proc_dec",
      "type": "custom",
      "source": "n_processor",
      "target": "n_decision",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "", "edgeStyle": "solid", "edgeColor": "#6B7280", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_dec_store",
      "type": "custom",
      "source": "n_decision",
      "target": "n_store",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "data": { "label": "Yes", "edgeStyle": "solid", "edgeColor": "#4ADE80", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    },
    {
      "id": "e_dec_dlq",
      "type": "custom",
      "source": "n_decision",
      "target": "n_dlq",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": { "label": "No", "edgeStyle": "dashed", "edgeColor": "#FB7185", "edgeWidth": 2, "animated": false, "pathType": "smoothstep", "arrowType": "filled", "arrowStart": false, "waypoint": null }
    }
  ]
}
```

---

## Generation guidelines for LLMs

When generating a Grafly diagram JSON, follow these rules:

1. **Every node must have a unique `id`.** Use the pattern `n_<timestamp>_<4chars>` or descriptive strings like `n_login_step`.

2. **Every edge must have a unique `id`.** Use `e_<source>_<target>` or `e_<timestamp>_<4chars>`.

3. **`type` is always `"shape"` for nodes and `"custom"` for edges.** Never omit these.

4. **All `data` fields should be present.** If you have no preference for a field, use the defaults listed in the schema tables above.

5. **Position nodes so they do not overlap.** Account for `width` and `height`. Minimum gap between shapes: ~20px.

6. **For flowcharts**, choose `"pill"` for start/end, `"diamond"` for decisions, `"rect"` or `"roundedRect"` for steps, `"parallelogram"` for input/output, `"cylinder"` for databases.

7. **For cloud diagrams**, use the exact AWS or GCP `shapeType` IDs from the tables above. Always include `isCloudShape: true` and the correct `accentColor`.

8. **Connect nodes logically.** Use `sourceHandle` and `targetHandle` to route edges cleanly — for horizontal flows use `right`→`left`, for vertical flows use `bottom`→`top`.

9. **Use color to communicate meaning.** Red/rose for errors or danger, green for success or start/end, blue for data/storage, purple for process, orange for AWS compute.

10. **`animated: true` on edges** works well for data flow or streaming connections.

11. **Use `"textbox"` shape** for section labels or headings (set `fillColor: "transparent"`, `strokeColor: "transparent"`, larger `fontSize`, `fontWeight: "700"`).

12. **Keep labels concise.** Two to four words per shape work best visually.

13. **Output only valid JSON.** The diagram is loaded directly — no extra keys, no JavaScript, no comments inside the JSON.
