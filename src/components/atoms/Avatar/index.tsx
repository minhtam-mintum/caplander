interface IAvatarProps {
  src?: string
  initials?: string
  size?: number
}

export function Avatar({ src, initials = 'U', size = 32 }: IAvatarProps) {
  return (
    <div
      className="rounded-full bg-primary-container text-on-primary-container font-semibold flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
