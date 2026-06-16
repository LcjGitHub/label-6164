import { useMemo } from 'react';
import { parseColor, getContrastColor, extractStreetName } from '../utils/signUtils';

interface StreetSignPreviewProps {
  backgroundColor?: string;
  fontDescription?: string;
  city?: string;
  width?: number | string;
  height?: number;
  className?: string;
}

export default function StreetSignPreview({
  backgroundColor = '#1E4D8C',
  fontDescription = '',
  city = '',
  width = '100%',
  height = 100,
  className = '',
}: StreetSignPreviewProps) {
  const parsedBgColor = useMemo(() => parseColor(backgroundColor), [backgroundColor]);
  const textColor = useMemo(() => getContrastColor(parsedBgColor), [parsedBgColor]);
  const displayText = useMemo(
    () => extractStreetName(fontDescription, city),
    [fontDescription, city],
  );

  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: parsedBgColor,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 8,
          right: 8,
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: 8,
          right: 8,
          height: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}
      />

      <span
        style={{
          color: textColor,
          fontSize: 20,
          fontWeight: 'bold',
          letterSpacing: 2,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          padding: '0 16px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {displayText}
      </span>
    </div>
  );
}
