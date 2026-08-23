export function GithubIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export function LinkedinIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function TwitterIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m2.464-2.464l6.768-6.768" />
    </svg>
  )
}

export function DiscordIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6h0a14.5 14.5 0 0 0-4-1.2 11.5 11.5 0 0 0-.5 1.7 13.9 13.9 0 0 0-3 0 11.5 11.5 0 0 0-.5-1.7A14.5 14.5 0 0 0 6 6c-2.5 4-3 8-3 12a14.8 14.8 0 0 0 4.5 2.3 11 11 0 0 0 1-1.6 9.6 9.6 0 0 1-1.5-.7.7.7 0 0 1 0-.1c.1-.1.2-.1.3-.2a10.6 10.6 0 0 0 9.4 0c.1.1.2.1.3.2a.7.7 0 0 1 0 .1 9.6 9.6 0 0 1-1.5.7 11 11 0 0 0 1 1.6A14.8 14.8 0 0 0 21 18c0-4-.5-8-3-12z" />
      <circle cx="8.5" cy="12.5" r="1.5" fill={color} />
      <circle cx="15.5" cy="12.5" r="1.5" fill={color} />
    </svg>
  )
}
