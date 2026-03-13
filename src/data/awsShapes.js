// AWS service icons rendered as inline SVG
// Each shape has a renderIcon function returning SVG elements (no wrapper svg)

const makeDefaults = (shapeType, label, accentColor) => ({
  shapeType,
  label,
  fillColor: '#FFFFFF',
  strokeColor: '#E5E7EB',
  strokeWidth: 1,
  strokeStyle: 'solid',
  textColor: '#111827',
  fontSize: 12,
  fontWeight: '500',
  opacity: 1,
  accentColor,
  isCloudShape: true,
})

export const AWS_SHAPES = [
  // ── Compute ──
  {
    id: 'aws-ec2',
    name: 'EC2',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-ec2', 'EC2', '#FF9900'),
  },
  {
    id: 'aws-lambda',
    name: 'Lambda',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-lambda', 'Lambda', '#FF9900'),
  },
  {
    id: 'aws-ecs',
    name: 'ECS',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-ecs', 'ECS', '#FF9900'),
  },
  {
    id: 'aws-eks',
    name: 'EKS',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-eks', 'EKS', '#FF9900'),
  },
  // ── Storage ──
  {
    id: 'aws-s3',
    name: 'S3',
    category: 'Storage',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-s3', 'S3', '#3F8624'),
  },
  {
    id: 'aws-ebs',
    name: 'EBS',
    category: 'Storage',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-ebs', 'EBS', '#3F8624'),
  },
  {
    id: 'aws-efs',
    name: 'EFS',
    category: 'Storage',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-efs', 'EFS', '#3F8624'),
  },
  // ── Database ──
  {
    id: 'aws-rds',
    name: 'RDS',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-rds', 'RDS', '#3B48CC'),
  },
  {
    id: 'aws-dynamodb',
    name: 'DynamoDB',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-dynamodb', 'DynamoDB', '#3B48CC'),
  },
  {
    id: 'aws-aurora',
    name: 'Aurora',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-aurora', 'Aurora', '#3B48CC'),
  },
  {
    id: 'aws-elasticache',
    name: 'ElastiCache',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-elasticache', 'ElastiCache', '#3B48CC'),
  },
  // ── Networking ──
  {
    id: 'aws-vpc',
    name: 'VPC',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-vpc', 'VPC', '#8C4FFF'),
  },
  {
    id: 'aws-elb',
    name: 'Load Balancer',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-elb', 'Load Balancer', '#8C4FFF'),
  },
  {
    id: 'aws-cloudfront',
    name: 'CloudFront',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-cloudfront', 'CloudFront', '#8C4FFF'),
  },
  {
    id: 'aws-route53',
    name: 'Route 53',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-route53', 'Route 53', '#8C4FFF'),
  },
  {
    id: 'aws-apigateway',
    name: 'API Gateway',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-apigateway', 'API Gateway', '#8C4FFF'),
  },
  // ── Messaging ──
  {
    id: 'aws-sns',
    name: 'SNS',
    category: 'Messaging',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-sns', 'SNS', '#E7157B'),
  },
  {
    id: 'aws-sqs',
    name: 'SQS',
    category: 'Messaging',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-sqs', 'SQS', '#E7157B'),
  },
  // ── Security & IAM ──
  {
    id: 'aws-iam',
    name: 'IAM',
    category: 'Security',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-iam', 'IAM', '#DD344C'),
  },
  // ── Management ──
  {
    id: 'aws-cloudwatch',
    name: 'CloudWatch',
    category: 'Management',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('aws-cloudwatch', 'CloudWatch', '#E7157B'),
  },
]

// SVG icon paths for each AWS service (32×32 viewBox)
export const AWS_ICONS = {
  'aws-ec2': (color) => (
    `<g>
      <rect x="4" y="8" width="24" height="16" rx="2" fill="${color}" opacity="0.15"/>
      <rect x="4" y="8" width="24" height="16" rx="2" stroke="${color}" stroke-width="1.5" fill="none"/>
      <rect x="8" y="12" width="16" height="2" rx="1" fill="${color}"/>
      <rect x="8" y="16" width="12" height="2" rx="1" fill="${color}"/>
      <rect x="8" y="20" width="8" height="2" rx="1" fill="${color}"/>
      <circle cx="25" cy="22" r="2" fill="${color}"/>
    </g>`
  ),
  'aws-lambda': (color) => (
    `<g>
      <path d="M8 24 L13 10 L16 17 L19 10 L24 24" stroke="${color}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <circle cx="16" cy="8" r="3" fill="${color}" opacity="0.3"/>
      <circle cx="16" cy="8" r="3" stroke="${color}" stroke-width="1.5" fill="none"/>
    </g>`
  ),
  'aws-ecs': (color) => (
    `<g>
      <rect x="6" y="6" width="8" height="8" rx="1.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="18" y="6" width="8" height="8" rx="1.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="18" width="8" height="8" rx="1.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="18" y="18" width="8" height="8" rx="1.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-eks': (color) => (
    `<g>
      <polygon points="16,4 26,10 26,22 16,28 6,22 6,10" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <polygon points="16,9 21,12 21,20 16,23 11,20 11,12" fill="${color}" opacity="0.3"/>
      <circle cx="16" cy="16" r="2.5" fill="${color}"/>
    </g>`
  ),
  'aws-s3': (color) => (
    `<g>
      <path d="M16 6 L26 11 L26 21 L16 26 L6 21 L6 11 Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <path d="M6 11 L16 16 L26 11" stroke="${color}" stroke-width="1.5" fill="none"/>
      <path d="M16 16 L16 26" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-ebs': (color) => (
    `<g>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="10" width="20" height="12" fill="${color}" opacity="0.1"/>
      <line x1="6" y1="10" x2="6" y2="22" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="10" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="22" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-efs': (color) => (
    `<g>
      <rect x="5" y="7" width="22" height="18" rx="2" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <line x1="9" y1="12" x2="23" y2="12" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="9" y1="16" x2="23" y2="16" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="9" y1="20" x2="23" y2="20" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2"/>
    </g>`
  ),
  'aws-rds': (color) => (
    `<g>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="10" width="20" height="12" fill="${color}" opacity="0.1"/>
      <line x1="6" y1="10" x2="6" y2="22" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="10" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="22" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-dynamodb': (color) => (
    `<g>
      <ellipse cx="16" cy="8" rx="10" ry="3.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="8" width="20" height="16" fill="${color}" opacity="0.08"/>
      <line x1="6" y1="8" x2="6" y2="24" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="8" x2="26" y2="24" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="24" rx="10" ry="3.5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <path d="M16 4 L20 8 L16 6 L12 8 Z" fill="${color}"/>
    </g>`
  ),
  'aws-aurora': (color) => (
    `<g>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="10" width="20" height="12" fill="${color}" opacity="0.08"/>
      <line x1="6" y1="10" x2="6" y2="22" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="10" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="22" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <path d="M13 16 L16 11 L19 16 L16 21 Z" fill="${color}" opacity="0.6"/>
    </g>`
  ),
  'aws-elasticache': (color) => (
    `<g>
      <rect x="5" y="9" width="22" height="14" rx="7" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <circle cx="11" cy="16" r="3" fill="${color}" opacity="0.4"/>
      <circle cx="16" cy="16" r="3" fill="${color}" opacity="0.6"/>
      <circle cx="21" cy="16" r="3" fill="${color}" opacity="0.4"/>
    </g>`
  ),
  'aws-vpc': (color) => (
    `<g>
      <rect x="4" y="4" width="24" height="24" rx="3" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 2"/>
      <rect x="9" y="9" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="17" y="9" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="9" y="17" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="17" y="17" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
    </g>`
  ),
  'aws-elb': (color) => (
    `<g>
      <circle cx="16" cy="16" r="4" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="1.5"/>
      <circle cx="6" cy="10" r="3" fill="${color}" opacity="0.6" stroke="${color}" stroke-width="1"/>
      <circle cx="6" cy="22" r="3" fill="${color}" opacity="0.6" stroke="${color}" stroke-width="1"/>
      <circle cx="26" cy="10" r="3" fill="${color}" opacity="0.6" stroke="${color}" stroke-width="1"/>
      <circle cx="26" cy="22" r="3" fill="${color}" opacity="0.6" stroke="${color}" stroke-width="1"/>
      <line x1="9" y1="11" x2="13" y2="14" stroke="${color}" stroke-width="1.5"/>
      <line x1="9" y1="21" x2="13" y2="18" stroke="${color}" stroke-width="1.5"/>
      <line x1="23" y1="11" x2="19" y2="14" stroke="${color}" stroke-width="1.5"/>
      <line x1="23" y1="21" x2="19" y2="18" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-cloudfront': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="16" rx="6" ry="11" fill="none" stroke="${color}" stroke-width="1"/>
      <line x1="5" y1="16" x2="27" y2="16" stroke="${color}" stroke-width="1"/>
      <path d="M8 10 Q16 14 24 10" fill="none" stroke="${color}" stroke-width="1"/>
      <path d="M8 22 Q16 18 24 22" fill="none" stroke="${color}" stroke-width="1"/>
    </g>`
  ),
  'aws-route53': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold" font-family="monospace">53</text>
    </g>`
  ),
  'aws-apigateway': (color) => (
    `<g>
      <rect x="5" y="9" width="22" height="14" rx="3" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <text x="16" y="18.5" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold" font-family="monospace">API</text>
      <path d="M4 16 L5 16" stroke="${color}" stroke-width="2"/>
      <path d="M27 16 L28 16" stroke="${color}" stroke-width="2"/>
    </g>`
  ),
  'aws-sns': (color) => (
    `<g>
      <circle cx="16" cy="14" r="4" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="1.5"/>
      <circle cx="7" cy="23" r="3" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="1"/>
      <circle cx="25" cy="23" r="3" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="1"/>
      <line x1="13" y1="17" x2="9" y2="21" stroke="${color}" stroke-width="1.5"/>
      <line x1="19" y1="17" x2="23" y2="21" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'aws-sqs': (color) => (
    `<g>
      <rect x="4" y="10" width="24" height="12" rx="2" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <rect x="7" y="13" width="6" height="6" rx="1" fill="${color}" opacity="0.5"/>
      <rect x="15" y="13" width="6" height="6" rx="1" fill="${color}" opacity="0.5"/>
      <path d="M26 6 L30 10 L26 14" stroke="${color}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    </g>`
  ),
  'aws-iam': (color) => (
    `<g>
      <circle cx="16" cy="11" r="5" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <path d="M7 26 C7 20 25 20 25 26" stroke="${color}" stroke-width="1.5" fill="none"/>
      <rect x="13" y="17" width="6" height="5" rx="1" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="1"/>
    </g>`
  ),
  'aws-cloudwatch': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <polyline points="7,20 11,14 14,17 18,11 21,15 25,13" stroke="${color}" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="1.5" fill="${color}"/>
    </g>`
  ),
}
