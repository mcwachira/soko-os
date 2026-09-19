'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow shortcuts with Ctrl/Cmd even in inputs for some cases
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const matches = 
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.metaKey === !!shortcut.metaKey;

      if (matches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Default POS shortcuts
export function createDefaultShortcuts(actions: {
  focusSearch: () => void;
  addProduct: () => void;
  holdSale: () => void;
  resumeSale: () => void;
  checkout: () => void;
  cancel: () => void;
  payment: () => void;
  printReceipt: () => void;
  newSale: () => void;
}) {
  return [
    { key: 'f', ctrlKey: true, action: actions.focusSearch, description: 'Focus product search' },
    { key: 'Enter', ctrlKey: true, action: actions.checkout, description: 'Proceed to checkout' },
    { key: 'h', ctrlKey: true, action: actions.holdSale, description: 'Hold/Suspend sale' },
    { key: 'r', ctrlKey: true, action: actions.resumeSale, description: 'Resume held sale' },
    { key: 'Escape', action: actions.cancel, description: 'Cancel current action' },
    { key: 'p', ctrlKey: true, action: actions.payment, description: 'Open payment screen' },
    { key: 'PrintScreen', action: actions.printReceipt, description: 'Print receipt' },
    { key: 'n', ctrlKey: true, action: actions.newSale, description: 'Start new sale' },
  ];
}
