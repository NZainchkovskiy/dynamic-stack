"use client";

import type React from "react";
import { useState, useEffect } from "react";

interface StackItem {
  id: string | number;
  content: React.ReactNode;
}

export const useItemWidths = (hiddenItemsRef: React.RefObject<HTMLDivElement | null>, items: StackItem[]): number[] => {
  const [itemWidths, setItemWidths] = useState<number[]>([]);

  useEffect(() => {
    if (!hiddenItemsRef.current || items.length === 0) {
      setItemWidths([]);
      return;
    }

    const hiddenChildren = Array.from(hiddenItemsRef.current.children);
    if (hiddenChildren.length !== items.length) {
      // Wait for hidden items to render
      return;
    }
    const widths = hiddenChildren.map((child) => (child as HTMLElement).offsetWidth);

    // Check if widths actually changed to prevent infinite loops
    if (JSON.stringify(widths) !== JSON.stringify(itemWidths)) {
      setItemWidths(widths);
    }
  }, [hiddenItemsRef, items, itemWidths]); // Include itemWidths in dependency array

  return itemWidths;
};
