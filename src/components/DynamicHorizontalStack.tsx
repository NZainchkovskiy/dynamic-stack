import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, Stack, Menu, MenuItem, IconButton } from "@mui/material";
import { useItemWidths } from "../hooks/useItemWidths";
import { useThrottledMeasure } from "../hooks/useThrottledMeasure";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface StackItem {
  id: string | number;
  content: React.ReactNode;
}

interface DynamicHorizontalStackProps {
  items: StackItem[];
  gap?: number;
}

const THROTTLE_TIMEOUT = 100;

interface OverflowMenuProps {
  overflowItems: StackItem[];
}

const OverflowMenu: React.FC<OverflowMenuProps> = ({ overflowItems }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={open ? "overflow-menu" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="overflow-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "overflow-menu-button",
          },
        }}
      >
        {overflowItems.map((item) => (
          <MenuItem key={item.id} onClick={handleClose}>
            {item.content}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const DynamicHorizontalStack = (props: DynamicHorizontalStackProps) => {
  const { items, gap = 8 } = props;
  const [visibleItems, setVisibleItems] = useState<StackItem[]>([]);
  const [overflowItems, setOverflowItems] = useState<StackItem[]>([]);
  const [containerRef, { width: containerWidth }] = useThrottledMeasure<HTMLDivElement>(THROTTLE_TIMEOUT);
  const [menuButtonRef, { width: menuWidth }] = useThrottledMeasure<HTMLDivElement>(THROTTLE_TIMEOUT);
  const hiddenItemsRef = useRef<HTMLDivElement>(null);

  const itemWidths = useItemWidths(hiddenItemsRef, items);

  useEffect(() => {
    if (itemWidths.length === 0 || containerWidth === 0) return;

    let availableWidth = containerWidth;
    let newVisibleCount = 0;
    let requiresMenu = false;

    const totalItemsWidth = itemWidths.reduce((sum, width) => sum + width, 0) + (items.length - 1) * gap;
    if (totalItemsWidth > containerWidth) {
      availableWidth = containerWidth - (menuWidth || 30);
      requiresMenu = true;
    }

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

    if (requiresMenu && accumulatedWidth > availableWidth) {
      newVisibleCount = Math.max(newVisibleCount - 1, 0);
    }
    if (newVisibleCount !== visibleItems.length) {
      setVisibleItems(items.slice(0, newVisibleCount));
      setOverflowItems(items.slice(newVisibleCount));
    }
  }, [itemWidths, visibleItems, gap, items, containerWidth, menuWidth]);

  return (
    <Box flexShrink={0} overflow="hidden">
      <Stack
        ref={containerRef}
        direction="row"
        alignItems="center"
        spacing={`${gap}px`}
        sx={{
          width: "100%",
          overflow: "hidden",
          flexWrap: "nowrap",
        }}
      >
        {visibleItems.map((item) => (
          <Box key={item.id} display="flex" alignItems="center">
            {item.content}
          </Box>
        ))}
        {overflowItems.length > 0 && (
          <Box ref={menuButtonRef} sx={{ flexShrink: 0 }}>
            <OverflowMenu overflowItems={overflowItems} />
          </Box>
        )}
      </Stack>
      <Box
        ref={hiddenItemsRef}
        sx={{
          position: "absolute",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          gap: `${gap}px`,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {item.content}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
