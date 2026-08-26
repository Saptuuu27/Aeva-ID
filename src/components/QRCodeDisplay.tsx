import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showCorners?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 220,
  className = '',
  showCorners = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setRenderError(null);

    const renderQR = async () => {
      try {
        // Try Level M for high data capacity and sharp density
        const url = await QRCode.toDataURL(value, {
          width: size * 2, // 2x for retina sharpness
          margin: 1,
          color: {
            dark: '#002D62', // Deep medical blue
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });

        if (isMounted) {
          setDataUrl(url);
        }

        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, value, {
            width: size,
            margin: 1,
            color: {
              dark: '#002D62',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
          });
        }
      } catch (err: any) {
        console.warn('QR render error, attempting Level L fallback:', err);
        try {
          // Fallback to Level L (lowest overhead, maximum data storage)
          const fallbackUrl = await QRCode.toDataURL(value, {
            width: size * 2,
            margin: 1,
            color: {
              dark: '#002D62',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'L',
          });

          if (isMounted) {
            setDataUrl(fallbackUrl);
          }

          if (canvasRef.current) {
            await QRCode.toCanvas(canvasRef.current, value, {
              width: size,
              margin: 1,
              color: {
                dark: '#002D62',
                light: '#FFFFFF',
              },
              errorCorrectionLevel: 'L',
            });
          }
        } catch (fallbackErr: any) {
          console.error('QR code render fallback failed:', fallbackErr);
          if (isMounted) {
            setRenderError(fallbackErr.message || 'QR render error');
          }
        }
      }
    };

    renderQR();

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div className={`relative inline-block bg-white p-3 rounded-2xl shadow-sm ${className}`}>
      {showCorners && (
        <>
          {/* Top Left Corner */}
          <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-[#003882] rounded-tl-lg pointer-events-none" />
          {/* Top Right Corner */}
          <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-[#003882] rounded-tr-lg pointer-events-none" />
          {/* Bottom Left Corner */}
          <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-[#003882] rounded-bl-lg pointer-events-none" />
          {/* Bottom Right Corner */}
          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-[#003882] rounded-br-lg pointer-events-none" />
        </>
      )}

      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Emergency Aeva ID QR Code"
          style={{ width: size, height: size }}
          className="rounded-lg block mx-auto object-contain"
        />
      ) : (
        <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-lg block mx-auto" />
      )}

      {/* Hidden canvas for direct downloads */}
      <canvas ref={canvasRef} className="hidden" />

      {renderError && (
        <div className="text-[10px] text-rose-600 font-bold mt-1 text-center">
          QR render warning: using compact format
        </div>
      )}
    </div>
  );
};
