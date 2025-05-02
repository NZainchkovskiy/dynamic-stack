import type React from 'react';
import { useState, useEffect, useRef } from 'react';

interface StackItem {
  id: string | number;
  content: React.ReactNode;
}

interface DynamicHorizontalStackProps {
  items: StackItem[];
  gap?: number;
}

const DynamicHorizontalStack: React.FC<DynamicHorizontalStackProps> = ({ items, gap = 8 }) => {
  const [visibleItems, setVisibleItems] = useState<StackItem[]>([]);
  const [overflowItems, setOverflowItems] = useState<StackItem[]>([]);
  const [menuWidth, setMenuWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hiddenItemsRef = useRef<HTMLDivElement>(null);

  // Measure items and calculate layout
  useEffect(() => {
    if (!hiddenItemsRef.current || !containerRef.current) return;

    const hiddenChildren = Array.from(hiddenItemsRef.current.children);
    const itemWidths = hiddenChildren.map(child => (child as HTMLElement).offsetWidth);
    const containerWidth = containerRef.current.offsetWidth;

    let availableWidth = containerWidth;
    let newVisibleCount = 0;
    let requiresMenu = false;

    // Check if menu is needed
    const totalItemsWidth = itemWidths.reduce((sum, width) => sum + width, 0) + (items.length - 1) * gap;
    if (totalItemsWidth > containerWidth) {
      availableWidth = containerWidth - menuWidth;
      requiresMenu = true;
    }

    // Calculate visible items
    let accumulatedWidth = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      const width = itemWidths[i];
      if (accumulatedWidth + width + (i > 0 ? gap : 0) <= availableWidth - gap) {
        accumulatedWidth += width + (i > 0 ? gap : 0);
        newVisibleCount++;
      } else {
        break;
      }
    }

    // Handle case where menu itself causes overflow
    if (requiresMenu && accumulatedWidth > availableWidth) {
      newVisibleCount = Math.max(newVisibleCount - 1, 0);
    }
    if (newVisibleCount !== visibleItems.length) {
      setVisibleItems(items.slice(0, newVisibleCount));
      setOverflowItems(items.slice(newVisibleCount));
    }
  }, [items, menuWidth, visibleItems, gap]);

  // Measure menu width
  useEffect(() => {
    if (overflowItems.length > 0 && menuRef.current) {
      setMenuWidth(menuRef.current.offsetWidth);
    }
  }, [overflowItems]);

  // Handle window resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Trigger recalculation
      setVisibleItems(v => [...v]);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Visible items container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          flexWrap: 'nowrap',
          gap: `${gap}px`,
        }}
      >
        {visibleItems.map((item) => (
          <div key={item.id}>{item.content}</div>
        ))}
        {overflowItems.length > 0 && (
          <div ref={menuRef} style={{ flexShrink: 0 }}>
            <button type="button">⋯</button>
          </div>
        )}
      </div>

      {/* Hidden measurement container */}
      <div
        ref={hiddenItemsRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 0,
          overflow: 'hidden',
        }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              position: 'absolute',
              whiteSpace: 'nowrap'
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicHorizontalStack;