"""Complex / multi-cloud scenario definitions (C01–C08). 8 scenarios × 25 prompts = 200 examples."""

from .helpers import N, E, D

SCENARIOS = []

# ── helpers ────────────────────────────────────────────────────────────────────
def AW(nid, shape, x, y, label, accent):
    return N(nid, shape, x, y, 90, 90, label, "#FFFFFF", "#D1D5DB",
             sw=2, ss="solid", tc="#111827", fs=11, fw="600",
             zi=2, op=1.0, cloud=True, accent=accent)

def GC(nid, shape, x, y, label, accent):
    return N(nid, shape, x, y, 90, 90, label, "#FFFFFF", "#D1D5DB",
             sw=2, ss="solid", tc="#111827", fs=11, fw="600",
             zi=2, op=1.0, cloud=True, accent=accent)

def zone(zid, x, y, w, h, fill, stroke, label=""):
    return N(zid, "rect", x, y, w, h, label, fill, stroke,
             sw=1, ss="dashed", tc="#374151", fs=12, fw="400", zi=0, op=0.5)

def zlabel(lid, x, y, label):
    return N(lid, "textbox", x, y, 160, 30, label, "#00000000", "#00000000",
             sw=0, tc="#374151", fs=12, fw="700", zi=1)

# ── C01 AWS + GCP Hybrid Cloud ─────────────────────────────────────────────────
_c01_nodes = [
    # Internet / DNS
    AW("c01_r53",   "aws-route53",    250,  30, "Route 53",      "#8C4FFF"),
    # AWS side
    zone("c01_zaw",  20, 120, 420, 380, "#FFF7ED", "#F97316", "AWS Region"),
    AW("c01_cf",    "aws-cloudfront",  70, 160, "CloudFront",    "#8C4FFF"),
    AW("c01_apigw", "aws-apigateway", 220, 160, "API Gateway",   "#8C4FFF"),
    AW("c01_lam",   "aws-lambda",     370, 160, "Lambda Auth",   "#FF9900"),
    AW("c01_s3",    "aws-s3",          70, 320, "S3 Assets",     "#3F8624"),
    AW("c01_rds",   "aws-rds",        370, 320, "RDS Postgres",  "#3B48CC"),
    # GCP side
    zone("c01_zgcp", 540, 120, 380, 380, "#EFF6FF", "#3B82F6", "GCP Project"),
    GC("c01_lb",    "gcp-loadbalancer", 590, 160, "Cloud LB",    "#4285F4"),
    GC("c01_cr",    "gcp-cloudrun",     740, 160, "Cloud Run API","#4285F4"),
    GC("c01_sql",   "gcp-cloudsql",     590, 320, "Cloud SQL",   "#5BB974"),
    GC("c01_bq",    "gcp-bigquery",     740, 320, "BigQuery",    "#AECBFA"),
    # VPN tunnel connector
    N("c01_vpn", "rect", 455, 285, 80, 50, "VPN Tunnel", "#F3F4F6", "#6B7280",
      sw=2, ss="dashed", tc="#374151", fs=10, zi=3),
]
_c01_edges = [
    E("c01_e1","c01_r53","c01_cf",   "bottom","top",    "DNS → CDN"),
    E("c01_e2","c01_r53","c01_lb",   "bottom","top",    "DNS → LB"),
    E("c01_e3","c01_cf","c01_apigw", "right", "left",   "Cache miss"),
    E("c01_e4","c01_cf","c01_s3",    "bottom","top",    "Static"),
    E("c01_e5","c01_apigw","c01_lam","right","left",    "Auth"),
    E("c01_e6","c01_apigw","c01_rds","bottom","top",    "Read/Write"),
    E("c01_e7","c01_lb","c01_cr",    "right","left",    "Route"),
    E("c01_e8","c01_cr","c01_sql",   "bottom","top",    "Query"),
    E("c01_e9","c01_cr","c01_bq",    "right","left",    "Analytics"),
    E("c01_e10","c01_rds","c01_vpn", "right","left",    "Replicate", "#6B7280", 2, "dashed"),
    E("c01_e11","c01_vpn","c01_sql", "right","left",    "Sync",      "#6B7280", 2, "dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c01", "AWS + GCP Hybrid Cloud", _c01_nodes, _c01_edges, vx=0, vy=0, vz=0.8),
    "prompts": [
        "Design a hybrid cloud architecture using both AWS and GCP",
        "Show a multi-cloud setup with AWS for auth and GCP for analytics",
        "Create a hybrid architecture diagram with AWS CloudFront and GCP Cloud Run",
        "Draw a multi-cloud deployment spanning AWS and Google Cloud",
        "Generate a hybrid AWS-GCP architecture with database replication",
        "Diagram a system using AWS API Gateway and GCP BigQuery together",
        "Show a hybrid cloud setup with VPN tunnel between AWS and GCP",
        "Create a multi-cloud diagram with AWS Lambda and GCP Cloud Run",
        "Design a system that uses AWS for CDN and GCP for ML workloads",
        "Draw a hybrid architecture with Route53 routing to both clouds",
        "Generate a multi-cloud diagram with data replication via VPN",
        "Show an architecture that spans AWS and GCP regions",
        "Create a hybrid cloud deployment for a global SaaS application",
        "Design a multi-cloud setup using the best services from AWS and GCP",
        "Diagram a hybrid cloud system with unified DNS routing",
        "Show a cross-cloud architecture with AWS S3 and GCP BigQuery",
        "Create a multi-cloud data platform diagram using AWS and GCP",
        "Draw an enterprise hybrid cloud architecture across two providers",
        "Generate a diagram for a multi-cloud strategy with AWS and GCP",
        "Show a failover architecture spanning AWS and GCP",
        "Create a hybrid cloud diagram for a fintech company",
        "Design a multi-cloud platform with centralized VPN connectivity",
        "Diagram a system using AWS RDS and GCP CloudSQL together",
        "Show a hybrid deployment with AWS Lambda and GCP Cloud Functions",
        "Create a multi-cloud architecture with shared analytics pipeline",
    ],
})

# ── C02 Complex Microservices Platform ─────────────────────────────────────────
_c02_nodes = [
    # Entry
    AW("c02_r53",   "aws-route53",    350,  20, "Route 53",      "#8C4FFF"),
    AW("c02_cf",    "aws-cloudfront", 350, 160, "CloudFront",    "#8C4FFF"),
    AW("c02_alb",   "aws-elb",        350, 300, "ALB",           "#8C4FFF"),
    # Services
    zone("c02_zsvc", 30, 410, 720, 220, "#EEF2FF", "#818CF8", "ECS Services"),
    AW("c02_usersvc","aws-ecs",  80, 460, "User Svc",      "#FF9900"),
    AW("c02_ordersvc","aws-ecs", 230, 460, "Order Svc",    "#FF9900"),
    AW("c02_paymentsvc","aws-ecs",380, 460, "Payment Svc", "#FF9900"),
    AW("c02_notifysvc","aws-ecs",530, 460, "Notify Svc",  "#FF9900"),
    AW("c02_searchsvc","aws-ecs",680, 460, "Search Svc",  "#FF9900"),
    # Messaging
    AW("c02_sns",   "aws-sns",        200, 630, "SNS Topics",    "#E7157B"),
    AW("c02_sqs",   "aws-sqs",        400, 630, "SQS Queues",    "#E7157B"),
    # Data
    zone("c02_zdata", 30, 730, 720, 150, "#F0FDF4", "#4ADE80", "Data Layer"),
    AW("c02_rds",   "aws-rds",         80, 780, "Aurora",        "#3B48CC"),
    AW("c02_dynamo","aws-dynamodb",    280, 780, "DynamoDB",      "#3B48CC"),
    AW("c02_cache", "aws-elasticache", 480, 780, "ElastiCache",   "#3B48CC"),
    AW("c02_s3",    "aws-s3",          680, 780, "S3",            "#3F8624"),
    # Observability
    AW("c02_cw",    "aws-cloudwatch", 810, 460, "CloudWatch",    "#E7157B"),
]
_c02_edges = [
    E("c02_e1","c02_r53","c02_cf",       "bottom","top"),
    E("c02_e2","c02_cf","c02_alb",       "bottom","top"),
    E("c02_e3","c02_alb","c02_usersvc",  "bottom","top"),
    E("c02_e4","c02_alb","c02_ordersvc", "bottom","top"),
    E("c02_e5","c02_alb","c02_paymentsvc","bottom","top"),
    E("c02_e6","c02_alb","c02_searchsvc","bottom","top"),
    E("c02_e7","c02_ordersvc","c02_sns", "bottom","top", "Events"),
    E("c02_e8","c02_sns","c02_sqs",      "bottom","top", "Fan-out"),
    E("c02_e9","c02_sqs","c02_notifysvc","top","bottom", "Consume"),
    E("c02_e10","c02_usersvc","c02_rds", "bottom","top"),
    E("c02_e11","c02_ordersvc","c02_dynamo","bottom","top"),
    E("c02_e12","c02_paymentsvc","c02_rds","bottom","top"),
    E("c02_e13","c02_usersvc","c02_cache","bottom","top"),
    E("c02_e14","c02_searchsvc","c02_s3","bottom","top"),
    E("c02_e15","c02_cw","c02_usersvc",  "left","right", "Metrics", "#6B7280", 1, "dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c02", "Complex Microservices Platform", _c02_nodes, _c02_edges, vx=0, vy=0, vz=0.7),
    "prompts": [
        "Design a complex microservices platform on AWS with 5 services",
        "Create a full microservices architecture with messaging and data layers",
        "Show a production microservices system with ECS, SNS/SQS, and multiple databases",
        "Draw a complex AWS microservices deployment with observability",
        "Generate a microservices platform with user, order, payment, notification, and search services",
        "Diagram a large-scale microservices system on AWS ECS",
        "Design an enterprise microservices architecture with event-driven messaging",
        "Show a complex ECS platform with Aurora, DynamoDB, and ElastiCache",
        "Create a microservices diagram with fan-out messaging via SNS and SQS",
        "Draw a production-grade microservices system on AWS",
        "Generate a multi-service AWS architecture with CloudWatch monitoring",
        "Show a complex microservices backend with layered data stores",
        "Create an ECS-based microservices platform with SNS event bus",
        "Design a large-scale AWS application with 5+ microservices",
        "Diagram a microservices system with user, order, and payment services",
        "Show an AWS architecture with multiple ECS services and messaging",
        "Create a complex backend platform with service mesh on AWS",
        "Draw a microservices system with separate databases per service",
        "Generate an AWS microservices architecture with search capability",
        "Show a production ECS platform with notification service",
        "Create a complex AWS system with DynamoDB and Aurora together",
        "Design a microservices platform with ElastiCache caching layer",
        "Diagram an AWS architecture with CloudFront, ALB, and multiple ECS services",
        "Show a complete AWS microservices stack from DNS to data layer",
        "Create a large-scale microservices system with 5 bounded contexts",
    ],
})

# ── C03 Disaster Recovery ──────────────────────────────────────────────────────
_c03_nodes = [
    # Primary region
    zone("c03_zprimary", 20, 20, 380, 420, "#EFF6FF", "#3B82F6", "Primary: us-east-1"),
    AW("c03_alb_p", "aws-elb",        80,  80, "ALB Primary",  "#8C4FFF"),
    AW("c03_ecs_p", "aws-ecs",        80, 220, "ECS Primary",  "#FF9900"),
    AW("c03_rds_p", "aws-rds",        80, 360, "RDS Primary",  "#3B48CC"),
    AW("c03_s3_p",  "aws-s3",        270,  80, "S3 Primary",   "#3F8624"),
    AW("c03_cw",    "aws-cloudwatch", 270, 220, "CloudWatch",  "#E7157B"),
    # DR region
    zone("c03_zdr", 520, 20, 380, 420, "#FFF7ED", "#F97316", "DR: us-west-2"),
    AW("c03_alb_d", "aws-elb",        580, 80, "ALB Standby",  "#8C4FFF"),
    AW("c03_ecs_d", "aws-ecs",        580, 220, "ECS Standby",  "#FF9900"),
    AW("c03_rds_d", "aws-rds",        580, 360, "RDS Read Replica","#3B48CC"),
    AW("c03_s3_d",  "aws-s3",         770, 80, "S3 Replica",   "#3F8624"),
    # Global routing
    AW("c03_r53",   "aws-route53",    295,  530, "Route 53\nHealth Check","#8C4FFF"),
]
_c03_edges = [
    E("c03_e1","c03_r53","c03_alb_p",  "left","bottom",  "Active",  "#4ADE80"),
    E("c03_e2","c03_r53","c03_alb_d",  "right","bottom", "Failover","#FB7185", 2, "dashed"),
    E("c03_e3","c03_alb_p","c03_ecs_p","bottom","top"),
    E("c03_e4","c03_ecs_p","c03_rds_p","bottom","top"),
    E("c03_e5","c03_alb_d","c03_ecs_d","bottom","top"),
    E("c03_e6","c03_ecs_d","c03_rds_d","bottom","top"),
    E("c03_e7","c03_rds_p","c03_rds_d","right","left",   "Replication","#6B7280", 2, "dashed"),
    E("c03_e8","c03_s3_p","c03_s3_d",  "right","left",   "Cross-region replication","#6B7280", 2, "dashed"),
    E("c03_e9","c03_cw","c03_r53",     "bottom","top",   "Health", "#E7157B", 1, "dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c03", "Disaster Recovery Architecture", _c03_nodes, _c03_edges, vx=0, vy=0, vz=0.85),
    "prompts": [
        "Design a disaster recovery architecture across two AWS regions",
        "Show a warm standby DR setup with active/passive failover on AWS",
        "Create a multi-region disaster recovery diagram with RDS replication",
        "Draw an AWS DR architecture with Route 53 health checks",
        "Generate a disaster recovery setup with us-east-1 primary and us-west-2 standby",
        "Diagram an AWS active-passive architecture with cross-region replication",
        "Design a DR strategy with automatic failover using Route 53",
        "Show an AWS disaster recovery setup with S3 cross-region replication",
        "Create a business continuity diagram with primary and DR regions",
        "Draw a warm standby architecture on AWS with RDS read replica",
        "Generate a multi-region DR architecture with CloudWatch health monitoring",
        "Show a disaster recovery plan with ECS primary and standby clusters",
        "Create an AWS DR diagram with cross-region S3 bucket replication",
        "Design a failover architecture with DNS-based routing",
        "Diagram a two-region AWS setup for disaster recovery",
        "Show an active-passive DR architecture on AWS",
        "Create a disaster recovery architecture with data replication",
        "Draw an AWS architecture for RPO/RTO compliance with DR",
        "Generate a multi-region failover architecture for a web application",
        "Show a DR setup with CloudWatch alarms triggering Route 53 failover",
        "Create a warm standby diagram for a financial application on AWS",
        "Design an AWS multi-region architecture for high availability",
        "Diagram a disaster recovery system with automated failover",
        "Show an AWS DR architecture for a critical production system",
        "Create a cross-region backup and restore architecture on AWS",
    ],
})

# ── C04 Multi-region Active-Active ─────────────────────────────────────────────
_c04_nodes = [
    # Global
    AW("c04_r53",   "aws-route53",    390,  20, "Route 53\nGeolocation",  "#8C4FFF"),
    AW("c04_cf",    "aws-cloudfront", 390, 160, "CloudFront",             "#8C4FFF"),
    # Region 1: us-east-1
    zone("c04_z1", 20, 300, 320, 380, "#EFF6FF", "#3B82F6", "us-east-1"),
    AW("c04_alb1",  "aws-elb",         60, 360, "ALB East",   "#8C4FFF"),
    AW("c04_ecs1",  "aws-ecs",         60, 500, "ECS East",   "#FF9900"),
    AW("c04_rds1",  "aws-rds",        220, 500, "Aurora East","#3B48CC"),
    # Region 2: eu-west-1
    zone("c04_z2", 440, 300, 320, 380, "#F0FDF4", "#4ADE80", "eu-west-1"),
    AW("c04_alb2",  "aws-elb",        480, 360, "ALB EU",     "#8C4FFF"),
    AW("c04_ecs2",  "aws-ecs",        480, 500, "ECS EU",     "#FF9900"),
    AW("c04_rds2",  "aws-rds",        640, 500, "Aurora EU",  "#3B48CC"),
    # Region 3: ap-southeast-1
    zone("c04_z3", 860, 300, 320, 380, "#FDF2F8", "#F472B6", "ap-southeast-1"),
    AW("c04_alb3",  "aws-elb",        900, 360, "ALB APAC",   "#8C4FFF"),
    AW("c04_ecs3",  "aws-ecs",        900, 500, "ECS APAC",   "#FF9900"),
    AW("c04_rds3",  "aws-rds",       1060, 500, "Aurora APAC","#3B48CC"),
    # Global DynamoDB
    AW("c04_dax",   "aws-dynamodb",   390, 720, "DynamoDB\nGlobal Tables","#3B48CC"),
]
_c04_edges = [
    E("c04_e1","c04_r53","c04_cf",   "bottom","top"),
    E("c04_e2","c04_cf","c04_alb1",  "bottom","top", "US"),
    E("c04_e3","c04_cf","c04_alb2",  "bottom","top", "EU"),
    E("c04_e4","c04_cf","c04_alb3",  "bottom","top", "APAC"),
    E("c04_e5","c04_alb1","c04_ecs1","bottom","top"),
    E("c04_e6","c04_alb2","c04_ecs2","bottom","top"),
    E("c04_e7","c04_alb3","c04_ecs3","bottom","top"),
    E("c04_e8","c04_ecs1","c04_rds1","right","left"),
    E("c04_e9","c04_ecs2","c04_rds2","right","left"),
    E("c04_e10","c04_ecs3","c04_rds3","right","left"),
    E("c04_e11","c04_ecs1","c04_dax","bottom","top"),
    E("c04_e12","c04_ecs2","c04_dax","bottom","top"),
    E("c04_e13","c04_ecs3","c04_dax","bottom","top"),
    E("c04_e14","c04_rds1","c04_rds2","bottom","top","Global replication","#6B7280",1,"dashed"),
    E("c04_e15","c04_rds2","c04_rds3","bottom","top","Global replication","#6B7280",1,"dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c04", "Multi-region Active-Active", _c04_nodes, _c04_edges, vx=0, vy=0, vz=0.65),
    "prompts": [
        "Design a multi-region active-active architecture across three AWS regions",
        "Show a global AWS deployment with us-east-1, eu-west-1, and ap-southeast-1",
        "Create a three-region active-active architecture with geolocation routing",
        "Draw a global multi-region AWS setup with CloudFront and Route 53",
        "Generate an active-active deployment across US, EU, and APAC",
        "Diagram a three-region AWS architecture with DynamoDB Global Tables",
        "Design a globally distributed AWS platform for low latency",
        "Show a multi-region ECS deployment with Aurora global clusters",
        "Create a three-region architecture with Route 53 geolocation routing",
        "Draw a global AWS deployment with regional Aurora databases",
        "Generate a multi-region active-active AWS architecture for global users",
        "Show a three-region deployment with CloudFront global distribution",
        "Create an AWS global platform with active nodes in three regions",
        "Design a globally distributed system with active-active failover",
        "Diagram a multi-region deployment for a global web application",
        "Show a three-region AWS setup with DynamoDB global table replication",
        "Create a global SaaS architecture spanning three AWS regions",
        "Draw a multi-region active-active architecture for zero-downtime",
        "Generate a three-region AWS deployment with cross-region replication",
        "Show a global AWS architecture for a high-availability application",
        "Create a multi-region architecture with geolocation-based routing",
        "Design a global AWS platform for a multi-national company",
        "Diagram a three-region active-active system with global data sync",
        "Show an AWS global infrastructure with regional ECS clusters",
        "Create a multi-region architecture for a mission-critical application",
    ],
})

# ── C05 Full Platform with Observability ───────────────────────────────────────
_c05_nodes = [
    # Entry
    AW("c05_r53",  "aws-route53",    300,  20, "Route 53",   "#8C4FFF"),
    AW("c05_cf",   "aws-cloudfront", 300, 160, "CloudFront", "#8C4FFF"),
    AW("c05_apigw","aws-apigateway", 300, 300, "API Gateway","#8C4FFF"),
    # Services
    AW("c05_lam1", "aws-lambda",     150, 450, "Auth Lambda","#FF9900"),
    AW("c05_ecs",  "aws-ecs",        300, 450, "App ECS",    "#FF9900"),
    AW("c05_lam2", "aws-lambda",     450, 450, "Job Lambda", "#FF9900"),
    # Data
    AW("c05_rds",  "aws-rds",        150, 600, "RDS",        "#3B48CC"),
    AW("c05_dyn",  "aws-dynamodb",   300, 600, "DynamoDB",   "#3B48CC"),
    AW("c05_s3",   "aws-s3",         450, 600, "S3",         "#3F8624"),
    # Observability
    zone("c05_zobs", 650, 100, 270, 550, "#FFFBEB", "#F59E0B", "Observability"),
    AW("c05_cw",   "aws-cloudwatch", 700, 160, "CloudWatch", "#E7157B"),
    AW("c05_iam",  "aws-iam",        700, 310, "IAM",        "#DD344C"),
    # Messaging
    AW("c05_sqs",  "aws-sqs",        150, 750, "SQS",        "#E7157B"),
    AW("c05_sns",  "aws-sns",        300, 750, "SNS",        "#E7157B"),
]
_c05_edges = [
    E("c05_e1","c05_r53","c05_cf",    "bottom","top"),
    E("c05_e2","c05_cf","c05_apigw",  "bottom","top"),
    E("c05_e3","c05_apigw","c05_lam1","bottom","top"),
    E("c05_e4","c05_apigw","c05_ecs", "bottom","top"),
    E("c05_e5","c05_apigw","c05_lam2","bottom","top"),
    E("c05_e6","c05_ecs","c05_rds",   "bottom","top"),
    E("c05_e7","c05_ecs","c05_dyn",   "bottom","top"),
    E("c05_e8","c05_lam1","c05_rds",  "bottom","top"),
    E("c05_e9","c05_lam2","c05_s3",   "bottom","top"),
    E("c05_e10","c05_ecs","c05_sqs",  "bottom","top", "Async"),
    E("c05_e11","c05_sqs","c05_sns",  "right","left"),
    E("c05_e12","c05_cw","c05_ecs",   "left","right",  "Monitor","#F59E0B",1,"dashed"),
    E("c05_e13","c05_cw","c05_apigw", "left","right",  "Metrics","#F59E0B",1,"dashed"),
    E("c05_e14","c05_iam","c05_lam1", "left","right",  "Policy", "#DD344C",1,"dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c05", "Full Platform with Observability", _c05_nodes, _c05_edges, vx=0, vy=0, vz=0.75),
    "prompts": [
        "Design a full AWS platform with observability, monitoring, and security",
        "Show a complete AWS architecture with CloudWatch monitoring and IAM",
        "Create a production AWS platform with observability layer",
        "Draw a full-stack AWS application with CloudWatch and security controls",
        "Generate an AWS architecture diagram with built-in observability",
        "Diagram a production platform with metrics, logging, and IAM policies",
        "Design an AWS application with comprehensive monitoring setup",
        "Show a complete AWS stack with CloudWatch, IAM, and messaging",
        "Create a full AWS platform diagram including observability zone",
        "Draw an AWS architecture with SQS, SNS, and CloudWatch integration",
        "Generate a production AWS system with security and monitoring layers",
        "Show a complete AWS deployment with Lambda, ECS, and CloudWatch",
        "Create an AWS platform with observability for compliance requirements",
        "Design a monitored AWS architecture with IAM role boundaries",
        "Diagram an AWS system with full observability and alerting",
        "Show a production AWS platform with CloudWatch dashboards",
        "Create a complete AWS architecture with security and observability",
        "Draw a full AWS deployment with monitoring for all services",
        "Generate an AWS platform with SNS alerting and CloudWatch alarms",
        "Show an AWS architecture with layered observability stack",
        "Create a production-ready AWS platform with comprehensive monitoring",
        "Design an AWS system with distributed tracing and metrics",
        "Diagram a full AWS platform with security, messaging, and monitoring",
        "Show a complete AWS application stack from Route53 to data layer",
        "Create an AWS architecture diagram with observability best practices",
    ],
})

# ── C06 Real-time Streaming Platform ───────────────────────────────────────────
_c06_nodes = [
    # Ingest
    zone("c06_zingest", 20, 20, 280, 200, "#FFF7ED", "#F97316", "Data Ingest"),
    AW("c06_iot",   "aws-lambda",      60,  80, "IoT Ingest",   "#FF9900"),
    AW("c06_apigw", "aws-apigateway", 220,  80, "API Events",   "#8C4FFF"),
    # Stream
    AW("c06_kinesis","aws-sqs",        180, 280, "Kinesis Stream","#E7157B"),
    AW("c06_firehose","aws-s3",        180, 420, "Firehose → S3","#3F8624"),
    # Processing
    zone("c06_zproc", 440, 200, 280, 300, "#EEF2FF", "#818CF8", "Stream Processing"),
    AW("c06_lam1",  "aws-lambda",     490, 280, "Filter Lambda","#FF9900"),
    AW("c06_lam2",  "aws-lambda",     490, 420, "Enrich Lambda","#FF9900"),
    # Serving
    zone("c06_zserve", 800, 200, 280, 300, "#F0FDF4", "#4ADE80", "Serving Layer"),
    AW("c06_dynamo","aws-dynamodb",   850, 280, "DynamoDB Hot", "#3B48CC"),
    AW("c06_rds",   "aws-rds",        850, 420, "RDS Analytics","#3B48CC"),
    # Analytics
    GC("c06_bq",    "gcp-bigquery",   600, 600, "BigQuery",     "#AECBFA"),
    AW("c06_cw",    "aws-cloudwatch", 180, 600, "CloudWatch",   "#E7157B"),
]
_c06_edges = [
    E("c06_e1","c06_iot","c06_kinesis",    "bottom","top",  "Stream"),
    E("c06_e2","c06_apigw","c06_kinesis",  "bottom","top",  "Events"),
    E("c06_e3","c06_kinesis","c06_lam1",   "right","left",  "Process"),
    E("c06_e4","c06_kinesis","c06_firehose","bottom","top", "Archive"),
    E("c06_e5","c06_lam1","c06_lam2",      "bottom","top",  "Filtered"),
    E("c06_e6","c06_lam1","c06_dynamo",    "right","left",  "Hot write"),
    E("c06_e7","c06_lam2","c06_rds",       "right","left",  "Analytics write"),
    E("c06_e8","c06_firehose","c06_bq",    "bottom","top",  "Export"),
    E("c06_e9","c06_cw","c06_kinesis",     "top","bottom",  "Monitor","#E7157B",1,"dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c06", "Real-time Streaming Platform", _c06_nodes, _c06_edges, vx=0, vy=0, vz=0.8),
    "prompts": [
        "Design a real-time data streaming platform on AWS with analytics",
        "Show a streaming architecture with Kinesis, Lambda, and DynamoDB",
        "Create a real-time event processing pipeline diagram",
        "Draw a streaming data platform with ingest, processing, and serving layers",
        "Generate a real-time analytics architecture using AWS streaming services",
        "Diagram a data streaming system with hot and cold storage paths",
        "Design an IoT data pipeline with real-time stream processing",
        "Show a streaming platform with Lambda enrichment and DynamoDB serving",
        "Create a real-time data pipeline with S3 archival via Firehose",
        "Draw an event streaming architecture with multi-cloud analytics",
        "Generate a real-time data platform with Kinesis and BigQuery",
        "Show a streaming system with filter and enrichment stages",
        "Create a real-time pipeline with DynamoDB for hot path and RDS for analytics",
        "Design a streaming data platform with CloudWatch monitoring",
        "Diagram a real-time event processing system with layered architecture",
        "Show an IoT streaming architecture with real-time processing",
        "Create a data streaming platform with Firehose to S3 and BigQuery",
        "Draw a real-time analytics pipeline with Lambda processing",
        "Generate a streaming platform for event-driven data processing",
        "Show an AWS streaming architecture for high-throughput data",
        "Create a real-time data ingestion and processing diagram",
        "Design a streaming platform with separate hot and cold query paths",
        "Diagram a real-time data lake with streaming ingestion",
        "Show an event streaming platform with cross-cloud analytics export",
        "Create a real-time data platform for IoT sensor data processing",
    ],
})

# ── C07 Complete Enterprise Backend ────────────────────────────────────────────
_c07_nodes = [
    # Users
    N("c07_users","pill", 300, 20, 120, 50, "Users",
      "#ECFDF5","#34D399", tc="#064E3B", zi=2),
    # CDN / Edge
    AW("c07_cf",    "aws-cloudfront", 300, 130, "CloudFront",    "#8C4FFF"),
    AW("c07_waf",   "aws-iam",        490, 130, "WAF",           "#DD344C"),
    # API
    AW("c07_apigw", "aws-apigateway", 300, 270, "API Gateway",   "#8C4FFF"),
    AW("c07_cog",   "aws-iam",        490, 270, "Cognito",       "#DD344C"),
    # Compute
    zone("c07_zcompute", 20, 390, 520, 170, "#FFF7ED", "#F97316", "Compute"),
    AW("c07_ecs",   "aws-ecs",         60, 450, "App Services",  "#FF9900"),
    AW("c07_lam",   "aws-lambda",     220, 450, "Workers",       "#FF9900"),
    AW("c07_eks",   "aws-eks",        380, 450, "EKS Jobs",      "#FF9900"),
    # Messaging
    AW("c07_sns",   "aws-sns",        100, 610, "SNS",           "#E7157B"),
    AW("c07_sqs",   "aws-sqs",        250, 610, "SQS",           "#E7157B"),
    # Data
    zone("c07_zdata", 20, 700, 520, 170, "#EFF6FF", "#3B82F6", "Data"),
    AW("c07_aurora","aws-aurora",      60, 760, "Aurora",        "#3B48CC"),
    AW("c07_dynamo","aws-dynamodb",   220, 760, "DynamoDB",      "#3B48CC"),
    AW("c07_s3",    "aws-s3",         380, 760, "S3",            "#3F8624"),
    # Observability
    AW("c07_cw",    "aws-cloudwatch", 620, 450, "CloudWatch",    "#E7157B"),
]
_c07_edges = [
    E("c07_e1","c07_users","c07_cf",    "bottom","top"),
    E("c07_e2","c07_cf","c07_waf",      "right","left",   "Inspect"),
    E("c07_e3","c07_cf","c07_apigw",    "bottom","top"),
    E("c07_e4","c07_apigw","c07_cog",   "right","left",   "Auth"),
    E("c07_e5","c07_apigw","c07_ecs",   "bottom","top"),
    E("c07_e6","c07_apigw","c07_lam",   "bottom","top"),
    E("c07_e7","c07_ecs","c07_sns",     "bottom","top",   "Publish"),
    E("c07_e8","c07_sns","c07_sqs",     "right","left",   "Fan-out"),
    E("c07_e9","c07_sqs","c07_lam",     "top","bottom",   "Trigger"),
    E("c07_e10","c07_ecs","c07_aurora", "bottom","top"),
    E("c07_e11","c07_lam","c07_dynamo", "bottom","top"),
    E("c07_e12","c07_eks","c07_s3",     "bottom","top"),
    E("c07_e13","c07_cw","c07_ecs",     "left","right",   "Observe","#F59E0B",1,"dashed"),
    E("c07_e14","c07_cw","c07_lam",     "left","bottom",  "Observe","#F59E0B",1,"dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c07", "Complete Enterprise Backend", _c07_nodes, _c07_edges, vx=0, vy=0, vz=0.75),
    "prompts": [
        "Design a complete enterprise backend on AWS with compute, data, and security layers",
        "Show a full enterprise AWS architecture with Cognito, ECS, EKS, and Aurora",
        "Create a production enterprise backend diagram with WAF and CloudFront",
        "Draw a complete AWS enterprise architecture from edge to data layer",
        "Generate an enterprise-grade AWS backend with messaging and observability",
        "Diagram a full enterprise AWS platform with SNS/SQS event bus",
        "Design a complete backend for an enterprise SaaS application on AWS",
        "Show an AWS enterprise architecture with ECS, Lambda, and EKS compute",
        "Create an enterprise backend with Aurora, DynamoDB, and S3 storage",
        "Draw a complete enterprise AWS system with WAF security layer",
        "Generate a full-stack enterprise AWS architecture diagram",
        "Show an enterprise backend with Cognito authentication and API Gateway",
        "Create a production AWS enterprise platform with all standard layers",
        "Design an enterprise AWS architecture with microservices and event messaging",
        "Diagram a complete enterprise application platform on AWS",
        "Show an AWS architecture with WAF, CloudFront, and Cognito security",
        "Create a multi-compute enterprise backend with ECS and EKS",
        "Draw an enterprise AWS system with SNS fan-out and SQS queues",
        "Generate a complete enterprise backend with compute, messaging, and data zones",
        "Show an AWS enterprise platform with CloudWatch observability",
        "Create a production enterprise system with layered AWS architecture",
        "Design an enterprise-ready AWS backend with security controls",
        "Diagram a full enterprise platform with Aurora and DynamoDB",
        "Show a complete AWS enterprise deployment from users to data layer",
        "Create an enterprise AWS architecture following well-architected framework",
    ],
})

# ── C08 Full Production Platform Extended ──────────────────────────────────────
_c08_nodes = [
    # Entry
    AW("c08_r53",   "aws-route53",    440, 20,  "Route 53",       "#8C4FFF"),
    AW("c08_cf",    "aws-cloudfront", 440, 160, "CloudFront",     "#8C4FFF"),
    # Security
    AW("c08_waf",   "aws-iam",        660, 160, "WAF",            "#DD344C"),
    AW("c08_cog",   "aws-iam",        660, 300, "Cognito",        "#DD344C"),
    # API
    AW("c08_apigw", "aws-apigateway", 440, 300, "API GW",         "#8C4FFF"),
    # Microservices
    zone("c08_zsvc", 20, 440, 840, 180, "#EEF2FF", "#818CF8", "ECS Cluster"),
    AW("c08_svc1",  "aws-ecs",         60, 500, "Auth Svc",       "#FF9900"),
    AW("c08_svc2",  "aws-ecs",        210, 500, "Product Svc",    "#FF9900"),
    AW("c08_svc3",  "aws-ecs",        360, 500, "Order Svc",      "#FF9900"),
    AW("c08_svc4",  "aws-ecs",        510, 500, "Payment Svc",    "#FF9900"),
    AW("c08_svc5",  "aws-ecs",        660, 500, "Notify Svc",     "#FF9900"),
    AW("c08_svc6",  "aws-ecs",        810, 500, "Search Svc",     "#FF9900"),
    # Messaging
    AW("c08_sns",   "aws-sns",        250, 680, "SNS",            "#E7157B"),
    AW("c08_sqs",   "aws-sqs",        440, 680, "SQS",            "#E7157B"),
    AW("c08_eb",    "aws-lambda",     630, 680, "EventBridge",    "#FF9900"),
    # Data
    zone("c08_zdata", 20, 810, 840, 180, "#EFF6FF", "#3B82F6", "Data"),
    AW("c08_aurora","aws-aurora",      60, 870, "Aurora",         "#3B48CC"),
    AW("c08_dynamo","aws-dynamodb",   230, 870, "DynamoDB",       "#3B48CC"),
    AW("c08_cache", "aws-elasticache",400, 870, "ElastiCache",    "#3B48CC"),
    AW("c08_s3",    "aws-s3",         570, 870, "S3",             "#3F8624"),
    AW("c08_es",    "aws-rds",        740, 870, "OpenSearch",     "#3B48CC"),
    # Observability
    AW("c08_cw",    "aws-cloudwatch", 940, 500, "CloudWatch",     "#E7157B"),
    AW("c08_iam",   "aws-iam",        940, 660, "IAM",            "#DD344C"),
]
_c08_edges = [
    E("c08_e1","c08_r53","c08_cf",      "bottom","top"),
    E("c08_e2","c08_cf","c08_waf",      "right","left",   "Inspect"),
    E("c08_e3","c08_cf","c08_apigw",    "bottom","top"),
    E("c08_e4","c08_apigw","c08_cog",   "right","left",   "Auth"),
    E("c08_e5","c08_apigw","c08_svc1",  "bottom","top"),
    E("c08_e6","c08_apigw","c08_svc2",  "bottom","top"),
    E("c08_e7","c08_apigw","c08_svc3",  "bottom","top"),
    E("c08_e8","c08_apigw","c08_svc4",  "bottom","top"),
    E("c08_e9","c08_apigw","c08_svc6",  "bottom","top"),
    E("c08_e10","c08_svc3","c08_sns",   "bottom","top",   "Order events"),
    E("c08_e11","c08_sns","c08_sqs",    "right","left",   "Fan-out"),
    E("c08_e12","c08_sqs","c08_svc5",   "top","bottom",   "Notify"),
    E("c08_e13","c08_svc4","c08_eb",    "bottom","top",   "Payment event"),
    E("c08_e14","c08_svc1","c08_aurora","bottom","top"),
    E("c08_e15","c08_svc2","c08_dynamo","bottom","top"),
    E("c08_e16","c08_svc3","c08_aurora","bottom","top"),
    E("c08_e17","c08_svc4","c08_aurora","bottom","top"),
    E("c08_e18","c08_svc1","c08_cache", "bottom","top"),
    E("c08_e19","c08_svc2","c08_cache", "bottom","top"),
    E("c08_e20","c08_svc6","c08_es",    "bottom","top",   "Search index"),
    E("c08_e21","c08_svc5","c08_s3",    "bottom","top",   "Store"),
    E("c08_e22","c08_cw","c08_svc1",    "left","right",   "Monitor","#F59E0B",1,"dashed"),
    E("c08_e23","c08_iam","c08_svc4",   "left","right",   "Policy","#DD344C",1,"dashed"),
]

SCENARIOS.append({
    "diagram": D("d_c08", "Full Production Platform Extended", _c08_nodes, _c08_edges, vx=0, vy=0, vz=0.6),
    "prompts": [
        "Design a full production AWS platform with 6 microservices and all supporting layers",
        "Show a complete large-scale AWS architecture for a production e-commerce platform",
        "Create an enterprise AWS diagram with auth, product, order, payment, notification, and search services",
        "Draw a comprehensive AWS production system with messaging, data, and observability layers",
        "Generate a complete AWS microservices diagram for a production e-commerce backend",
        "Diagram a large-scale AWS platform with ECS, Aurora, DynamoDB, and ElastiCache",
        "Design a full production AWS system with SNS/SQS fan-out and EventBridge",
        "Show a complete AWS architecture with 6 ECS services and multiple databases",
        "Create a production-grade AWS platform with WAF, Cognito, and API Gateway",
        "Draw a large-scale AWS system with search, caching, and messaging layers",
        "Generate a comprehensive AWS architecture for a large SaaS application",
        "Show a full AWS production stack with OpenSearch and ElastiCache",
        "Create a complete AWS diagram for an enterprise e-commerce platform",
        "Design a large AWS system with separate data stores per service",
        "Diagram a full AWS production platform with CloudWatch and IAM",
        "Show a comprehensive AWS architecture with 6 microservices",
        "Create a large-scale AWS deployment with all infrastructure layers",
        "Draw a full production AWS system for a high-traffic application",
        "Generate a complete AWS architecture with payment, order, and auth services",
        "Show a production AWS platform with event-driven microservices",
        "Create a large AWS architecture diagram with cross-service messaging",
        "Design a complete production platform with AWS best practices",
        "Diagram a full AWS system for a scalable e-commerce application",
        "Show a comprehensive AWS production deployment for an enterprise",
        "Create a full production platform diagram following AWS well-architected framework",
    ],
})
