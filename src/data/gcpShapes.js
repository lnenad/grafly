import {
  COLOR_TEXT_DEFAULT,
  COLOR_BORDER_DEFAULT,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_STROKE_STYLE,
  DEFAULT_OPACITY,
} from '../utils/styleConstants'

const makeDefaults = (shapeType, label, accentColor) => ({
  shapeType,
  label,
  fillColor: '#FFFFFF',
  strokeColor: COLOR_BORDER_DEFAULT,
  strokeWidth: 1,
  strokeStyle: DEFAULT_STROKE_STYLE,
  textColor: COLOR_TEXT_DEFAULT,
  fontSize: 12,
  fontWeight: DEFAULT_FONT_WEIGHT,
  opacity: DEFAULT_OPACITY,
  accentColor,
  isCloudShape: true,
})

export const GCP_SHAPES = [
  // ── Compute ──
  {
    id: 'gcp-compute',
    name: 'Compute Engine',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-compute', 'Compute Engine', '#4285F4'),
  },
  {
    id: 'gcp-cloudrun',
    name: 'Cloud Run',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-cloudrun', 'Cloud Run', '#4285F4'),
  },
  {
    id: 'gcp-gke',
    name: 'GKE',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-gke', 'GKE', '#4285F4'),
  },
  {
    id: 'gcp-functions',
    name: 'Cloud Functions',
    category: 'Compute',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-functions', 'Cloud Functions', '#4285F4'),
  },
  // ── Storage ──
  {
    id: 'gcp-storage',
    name: 'Cloud Storage',
    category: 'Storage',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-storage', 'Cloud Storage', '#AECBFA'),
  },
  {
    id: 'gcp-filestore',
    name: 'Filestore',
    category: 'Storage',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-filestore', 'Filestore', '#AECBFA'),
  },
  // ── Database ──
  {
    id: 'gcp-cloudsql',
    name: 'Cloud SQL',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-cloudsql', 'Cloud SQL', '#5BB974'),
  },
  {
    id: 'gcp-spanner',
    name: 'Spanner',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-spanner', 'Spanner', '#5BB974'),
  },
  {
    id: 'gcp-bigquery',
    name: 'BigQuery',
    category: 'Analytics',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-bigquery', 'BigQuery', '#AECBFA'),
  },
  {
    id: 'gcp-firestore',
    name: 'Firestore',
    category: 'Database',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-firestore', 'Firestore', '#FFA826'),
  },
  // ── Networking ──
  {
    id: 'gcp-vpc',
    name: 'VPC Network',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-vpc', 'VPC Network', '#4285F4'),
  },
  {
    id: 'gcp-loadbalancer',
    name: 'Load Balancing',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-loadbalancer', 'Load Balancing', '#4285F4'),
  },
  {
    id: 'gcp-cdn',
    name: 'Cloud CDN',
    category: 'Networking',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-cdn', 'Cloud CDN', '#4285F4'),
  },
  // ── Messaging ──
  {
    id: 'gcp-pubsub',
    name: 'Pub/Sub',
    category: 'Messaging',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-pubsub', 'Pub/Sub', '#EA4335'),
  },
  // ── AI & ML ──
  {
    id: 'gcp-vertexai',
    name: 'Vertex AI',
    category: 'AI & ML',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-vertexai', 'Vertex AI', '#FF6D00'),
  },
  {
    id: 'gcp-firebase',
    name: 'Firebase',
    category: 'Development',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-firebase', 'Firebase', '#FFA826'),
  },
  // ── Management ──
  {
    id: 'gcp-monitoring',
    name: 'Cloud Monitoring',
    category: 'Management',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-monitoring', 'Cloud Monitoring', '#34A853'),
  },
  {
    id: 'gcp-cloudbuild',
    name: 'Cloud Build',
    category: 'Management',
    defaultWidth: 90,
    defaultHeight: 90,
    defaultData: makeDefaults('gcp-cloudbuild', 'Cloud Build', '#4285F4'),
  },
]

// SVG icons (32×32 viewBox)
export const GCP_ICONS = {
  'gcp-compute': (color) => (
    `<g>
      <rect x="5" y="8" width="22" height="16" rx="2" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <circle cx="10" cy="16" r="2" fill="${color}"/>
      <rect x="14" y="13" width="9" height="2" rx="1" fill="${color}"/>
      <rect x="14" y="17" width="6" height="2" rx="1" fill="${color}"/>
      <line x1="10" y1="7" x2="10" y2="8" stroke="${color}" stroke-width="1.5"/>
      <line x1="16" y1="7" x2="16" y2="8" stroke="${color}" stroke-width="1.5"/>
      <line x1="22" y1="7" x2="22" y2="8" stroke="${color}" stroke-width="1.5"/>
      <line x1="10" y1="24" x2="10" y2="25" stroke="${color}" stroke-width="1.5"/>
      <line x1="16" y1="24" x2="16" y2="25" stroke="${color}" stroke-width="1.5"/>
      <line x1="22" y1="24" x2="22" y2="25" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'gcp-cloudrun': (color) => (
    `<g>
      <path d="M16 5 C10 5 5 10 5 16 C5 22 10 27 16 27 C22 27 27 22 27 16 C27 10 22 5 16 5" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <path d="M16 9 L20 13 L20 19 L16 23 L12 19 L12 13 Z" fill="${color}" opacity="0.4"/>
      <path d="M13 14 L16 12 L19 14 L19 18 L16 20 L13 18 Z" fill="${color}"/>
    </g>`
  ),
  'gcp-gke': (color) => (
    `<g>
      <polygon points="16,4 25,9 25,23 16,28 7,23 7,9" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="4" fill="${color}" opacity="0.3"/>
      <circle cx="16" cy="8" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="23" cy="12" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="23" cy="20" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="16" cy="24" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="9" cy="20" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="9" cy="12" r="2.5" fill="${color}" opacity="0.5"/>
    </g>`
  ),
  'gcp-functions': (color) => (
    `<g>
      <path d="M10 6 L14 16 L10 26" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M16 6 L20 16 L16 26" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 6 L26 16 L22 26" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>`
  ),
  'gcp-storage': (color) => (
    `<g>
      <path d="M6 10 L16 6 L26 10 L26 22 L16 26 L6 22 Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <path d="M6 10 L16 14 L26 10" stroke="${color}" stroke-width="1.5" fill="none"/>
      <path d="M16 14 L16 26" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'gcp-filestore': (color) => (
    `<g>
      <rect x="5" y="7" width="22" height="18" rx="2" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <path d="M9 12 L15 12" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9 16 L20 16" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9 20 L17 20" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
    </g>`
  ),
  'gcp-cloudsql': (color) => (
    `<g>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="10" width="20" height="12" fill="${color}" opacity="0.08"/>
      <line x1="6" y1="10" x2="6" y2="22" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="10" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="22" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'gcp-spanner': (color) => (
    `<g>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <rect x="6" y="10" width="20" height="12" fill="${color}" opacity="0.08"/>
      <line x1="6" y1="10" x2="6" y2="22" stroke="${color}" stroke-width="1.5"/>
      <line x1="26" y1="10" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="22" rx="10" ry="4" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <path d="M11 16 L16 12 L21 16 L16 20 Z" fill="${color}" opacity="0.5"/>
    </g>`
  ),
  'gcp-bigquery': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <rect x="10" y="19" width="3" height="5" rx="1" fill="${color}" opacity="0.7"/>
      <rect x="14.5" y="15" width="3" height="9" rx="1" fill="${color}" opacity="0.8"/>
      <rect x="19" y="12" width="3" height="12" rx="1" fill="${color}"/>
      <circle cx="22" cy="10" r="3" fill="none" stroke="${color}" stroke-width="1.5"/>
      <path d="M24.5 12.5 L27 15" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
    </g>`
  ),
  'gcp-firestore': (color) => (
    `<g>
      <path d="M16 5 L23 9 L23 23 L16 27 L9 23 L9 9 Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <path d="M13 20 L16 8 L19 20 L16 26 Z" fill="${color}" opacity="0.6"/>
    </g>`
  ),
  'gcp-vpc': (color) => (
    `<g>
      <rect x="4" y="4" width="24" height="24" rx="3" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 2"/>
      <rect x="9" y="9" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="17" y="9" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="9" y="17" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
      <rect x="17" y="17" width="6" height="6" rx="1" fill="${color}" opacity="0.4"/>
    </g>`
  ),
  'gcp-loadbalancer': (color) => (
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
  'gcp-cdn': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="16" cy="16" rx="6" ry="11" fill="none" stroke="${color}" stroke-width="1"/>
      <line x1="5" y1="16" x2="27" y2="16" stroke="${color}" stroke-width="1"/>
      <path d="M8 10 Q16 13 24 10" fill="none" stroke="${color}" stroke-width="1"/>
      <path d="M8 22 Q16 19 24 22" fill="none" stroke="${color}" stroke-width="1"/>
    </g>`
  ),
  'gcp-pubsub': (color) => (
    `<g>
      <circle cx="16" cy="14" r="4" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="1.5"/>
      <circle cx="7" cy="23" r="3" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="1"/>
      <circle cx="25" cy="23" r="3" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="1"/>
      <line x1="13" y1="17" x2="9" y2="21" stroke="${color}" stroke-width="1.5"/>
      <line x1="19" y1="17" x2="23" y2="21" stroke="${color}" stroke-width="1.5"/>
    </g>`
  ),
  'gcp-vertexai': (color) => (
    `<g>
      <path d="M16 5 L28 12 L28 20 L16 27 L4 20 L4 12 Z" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <path d="M16 9 L22 13 L22 19 L16 23 L10 19 L10 13 Z" fill="${color}" opacity="0.2"/>
      <path d="M16 13 L19 15 L19 17 L16 19 L13 17 L13 15 Z" fill="${color}" opacity="0.6"/>
      <circle cx="16" cy="16" r="1.5" fill="${color}"/>
    </g>`
  ),
  'gcp-firebase': (color) => (
    `<g>
      <path d="M9 24 L12 14 L9 10 L16 24 Z" fill="${color}" opacity="0.4"/>
      <path d="M9 10 L14 5 L17 14 L9 24 Z" fill="${color}" opacity="0.7"/>
      <path d="M17 14 L23 9 L23 24 L9 24 Z" fill="${color}"/>
    </g>`
  ),
  'gcp-monitoring': (color) => (
    `<g>
      <circle cx="16" cy="16" r="11" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="1.5"/>
      <polyline points="7,20 11,14 14,17 18,11 21,15 25,13" stroke="${color}" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    </g>`
  ),
  'gcp-cloudbuild': (color) => (
    `<g>
      <circle cx="16" cy="16" r="8" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
      <path d="M13 16 L15 18 L19 14" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 5 L19 8 L16 11 L13 8 Z" fill="${color}" opacity="0.5"/>
      <path d="M16 21 L19 24 L16 27 L13 24 Z" fill="${color}" opacity="0.5"/>
      <path d="M5 16 L8 19 L11 16 L8 13 Z" fill="${color}" opacity="0.5"/>
      <path d="M21 16 L24 19 L27 16 L24 13 Z" fill="${color}" opacity="0.5"/>
    </g>`
  ),
}
