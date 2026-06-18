import Image from 'next/image';

interface Props {
  variant?: 'bar' | 'hero';
}

// Proporção real do arquivo recortado: 1297 x 407
const RATIO = 1297 / 407;

/** Logo oficial SAMBA Innovations (arquivo em /public/samba-logo.png). */
export function Logo({ variant = 'bar' }: Props) {
  const hero = variant === 'hero';
  const height = hero ? 72 : 34;
  const width = Math.round(height * RATIO);

  return (
    <Image
      src="/samba-logo.png"
      alt="Samba Innovations"
      width={width}
      height={height}
      priority
      className="object-contain select-none"
      style={{ height, width: 'auto' }}
    />
  );
}
