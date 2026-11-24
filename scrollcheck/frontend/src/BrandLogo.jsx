export default function BrandLogo({ theme = "burnout", size = "md" }) {
  const src = theme === "burnout" ? "/scrollcheck-logo-dark.png" : "/scrollcheck-logo-light.png";
  return (
    <img
      src={src}
      alt="ScrollCheck"
      className={`brand-logo-img brand-logo-${size}`}
    />
  );
}
