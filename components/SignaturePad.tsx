import React, { useRef, useEffect, useImperativeHandle, useState } from 'react';
import { NeumorphicButton } from './UI';

export type SignaturePadHandle = {
  getSignatureAsDataURL: () => string;
  clear: () => void;
  isSigned: () => boolean;
};

interface SignaturePadProps {
  label: string;
  onSignatureStateChange?: (isSigned: boolean) => void;
}

const SignaturePad = React.forwardRef<SignaturePadHandle, SignaturePadProps>(({ label, onSignatureStateChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    onSignatureStateChange?.(hasSigned);
  }, [hasSigned, onSignatureStateChange]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 200; // Fixed height
      const ctx = getCanvasContext();
      if(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoords = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = getCoords(event.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = getCoords(event.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  useImperativeHandle(ref, () => ({
    getSignatureAsDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas || !hasSigned) return '';
      return canvas.toDataURL('image/png');
    },
    clear: clearCanvas,
    isSigned: () => hasSigned
  }));

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative w-full h-[200px] bg-slate-100 shadow-[inset_5px_5px_10px_#c7ced4,inset_-5px_-5px_10px_#ffffff] rounded-lg cursor-crosshair touch-none ring-1 ring-slate-400">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full rounded-lg"
        />
      </div>
       <div className="mt-4 flex justify-center sm:justify-end">
        <NeumorphicButton type="button" onClick={clearCanvas}>
          Limpiar Firma
        </NeumorphicButton>
      </div>
    </div>
  );
});

export default SignaturePad;