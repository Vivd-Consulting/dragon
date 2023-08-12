interface PreviewImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
export function PreviewImage({ src, width, height, alt, ...rest }: PreviewImageProps) {
  return <img src={src} alt={alt} />;
}
