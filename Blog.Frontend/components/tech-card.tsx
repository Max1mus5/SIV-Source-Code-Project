interface TechCardProps {
  name: string
  icon: "unity" | "aseprite" | "csharp"
}

function UnityIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="currentColor">
      <path d="M57.81 27.67L46.17 7.33l-8.23 14.34L29.71 7.33l-3.88 20.34L17.6 13.33 6.19 33.67l8.23-0.01L26.06 48l3.65-20.34L37.94 48l11.64-14.34 8.23 0.01z" fill="#EFF0F3"/>
    </svg>
  )
}

function AsepriteIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect x="16" y="16" width="32" height="32" rx="4" fill="#7B5EA7" />
      <rect x="22" y="22" width="8" height="8" rx="1" fill="#EFF0F3" />
      <rect x="34" y="22" width="8" height="8" rx="1" fill="#EFF0F3" />
      <rect x="22" y="34" width="20" height="6" rx="1" fill="#EFF0F3" />
    </svg>
  )
}

function CSharpIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z" fill="#68217A"/>
      <text x="32" y="40" textAnchor="middle" fill="#EFF0F3" fontSize="24" fontWeight="bold" fontFamily="sans-serif">{"C#"}</text>
    </svg>
  )
}

export function TechCard({ name, icon }: TechCardProps) {
  const icons = {
    unity: <UnityIcon />,
    aseprite: <AsepriteIcon />,
    csharp: <CSharpIcon />,
  }

  return (
    <div className="flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(5,242,155,0.1)]">
      {icons[icon]}
      <span className="text-sm font-bold text-card-foreground">{name}</span>
    </div>
  )
}
