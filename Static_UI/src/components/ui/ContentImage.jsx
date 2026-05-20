export function ContentImage({ src, alt, className = '', priority = false, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? 'eager' : 'lazy'}
      className={`photo-crisp object-cover ${className}`}
      {...props}
    />
  );
}
