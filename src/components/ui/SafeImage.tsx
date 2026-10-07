"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
}

export function SafeImage({ src, alt, className, fill, width, height, priority, fallbackSrc, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);
  
  if (!src && !fallbackSrc) return null;
  
  const imageSrc = error ? (fallbackSrc || "") : (src || fallbackSrc || "");
  if (!imageSrc) return null;

  // We only enable Next.js image optimization for known safe domains.
  // Arbitrary user-provided URLs are rendered with unoptimized={true} 
  // to prevent Next.js Invalid src errors without requiring wildcard remotePatterns.
  const isOptimizable = 
    imageSrc.startsWith("https://images.unsplash.com/") ||
    imageSrc.startsWith("https://avatars.githubusercontent.com/") ||
    imageSrc.startsWith("https://lh3.googleusercontent.com/");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      unoptimized={!isOptimizable}
      onError={() => setError(true)}
      {...props}
    />
  );
}


