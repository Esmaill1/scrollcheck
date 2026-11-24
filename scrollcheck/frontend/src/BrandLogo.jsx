export default function BrandLogo({ size = "md" }) {
  return (
    <img
      src="/scrollcheck-logo-light.png"
      alt="ScrollCheck"
      className={`brand-logo-img brand-logo-${size}`}
    />
  );
}
