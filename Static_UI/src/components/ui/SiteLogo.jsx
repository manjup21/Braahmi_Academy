export function SiteLogo({ alt, src, className = '' }) {
  return (
    <span className={`site-logo relative inline-block shrink-0 overflow-hidden ${className}`}>
      <img
        alt={alt}
        src={src}
        className="absolute left-1/2 top-1/2 h-full w-[166.666%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
      />
    </span>
  );
}
