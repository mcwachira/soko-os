'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  maxLength?: number;
  scanTimeout?: number;
}

export function useBarcodeScanner({
  onScan,
  minLength = 8,
  maxLength = 50,
  scanTimeout = 100,
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Handle Enter key (common barcode scanner terminator)
    if (event.key === 'Enter') {
      event.preventDefault();
      const barcode = bufferRef.current.trim();
      
      if (barcode.length >= minLength && barcode.length <= maxLength) {
        onScan(barcode);
      }
      bufferRef.current = '';
      setIsScanning(false);
      return;
    }

    // Ignore modifier keys
    if (event.key.length > 1 && event.key !== 'Backspace') {
      return;
    }

    // Handle regular characters
    if (event.key.length === 1) {
      bufferRef.current += event.key;
      setIsScanning(true);
    }

    // Handle backspace
    if (event.key === 'Backspace') {
      bufferRef.current = bufferRef.current.slice(0, -1);
    }

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      bufferRef.current = '';
      setIsScanning(false);
    }, scanTimeout);
  }, [onScan, minLength, maxLength, scanTimeout]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return { isScanning };
}
