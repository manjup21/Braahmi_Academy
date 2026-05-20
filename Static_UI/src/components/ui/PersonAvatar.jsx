function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PersonAvatar({ name, image, className = '' }) {
  if (image) {
    return (
      <img
        alt={name}
        className={`photo-crisp object-cover ${className}`}
        src={image}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-linear-to-br from-primary to-secondary font-display text-2xl font-bold text-white ${className}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
