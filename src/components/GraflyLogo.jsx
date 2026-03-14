export default function GraflyLogo({ size = 28, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <mask id="grafly-depth-mask">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon stroke="black" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"
            points="35,40 65,35 60,70 25,60" />
          <line stroke="black" strokeWidth="8" strokeLinecap="round"
            x1="35" y1="40" x2="60" y2="70" />
        </mask>
      </defs>

      {/* Outer hexagon */}
      <polygon
        points="50,10 85,30 85,70 50,90 15,70 15,30"
        fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Background depth lines (masked) */}
      <g mask="url(#grafly-depth-mask)" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="15" y1="30" x2="35" y2="40" />
        <line x1="15" y1="30" x2="25" y2="60" />
        <line x1="50" y1="10" x2="65" y2="35" />
        <line x1="85" y1="30" x2="65" y2="35" />
        <line x1="85" y1="70" x2="60" y2="70" />
        <line x1="50" y1="90" x2="25" y2="60" />
        <line x1="15" y1="70" x2="25" y2="60" />
      </g>

      {/* Foreground shape */}
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="35,40 65,35 60,70 25,60" />
        <line x1="35" y1="40" x2="60" y2="70" />
        <line x1="50" y1="10" x2="35" y2="40" />
        <line x1="50" y1="90" x2="60" y2="70" />
        <line x1="85" y1="70" x2="65" y2="35" />
      </g>
    </svg>
  )
}
