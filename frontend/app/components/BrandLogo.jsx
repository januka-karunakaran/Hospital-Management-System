import Image from "next/image";

export default function BrandLogo({ size = 40, className = "" }) {
  return (
    <Image
      src="/medicore-logo.png"
      alt="MediCore logo"
      width={size}
      height={size}
      className={className}
      priority
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
