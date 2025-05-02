import type React from "react";
import { useState, useRef } from "react";
import { Box, Stack, Menu, MenuItem, IconButton } from "@mui/material";
import { useItemWidths } from "../hooks/useItemWidths";
import { useThrottledMeasure } from "../hooks/useThrottledMeasure";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface IStackItem {
  id: string | number;
  content: React.ReactNode;
}

interface IDynamicHorizontalStackProps {
  items: IStackItem[];
  gap?: number;
}

const THROTTLE_TIMEOUT = 100;

interface IOverflowMenuProps {
  overflowItems: IStackItem[];
}

const OverflowMenu: React.FC<IOverflowMenuProps> = ({ overflowItems }) => {
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

export const DynamicHorizontalStack = (props: IDynamicHorizontalStackProps) => {
  const { items, gap = 8 } = props;
  const [containerRef, { width: containerWidth }] = useThrottledMeasure<HTMLDivElement>(THROTTLE_TIMEOUT);
  const [menuButtonRef, { width: menuWidth }] = useThrottledMeasure<HTMLDivElement>(THROTTLE_TIMEOUT);
  const hiddenItemsRef = useRef<HTMLDivElement>(null);

  const itemWidths = useItemWidths(hiddenItemsRef, items);

  let calculatedVisibleItems: IStackItem[] = [];
  let calculatedOverflowItems: IStackItem[] = [];

  if (itemWidths.length > 0 && containerWidth > 0) {
    let availableWidth = containerWidth;
    let requiresMenu = false;

    const effectiveMenuWidth = menuWidth > 0 ? menuWidth : 30;

    const totalItemsWidth =
      itemWidths.reduce((sum, width) => sum + width, 0) + (items.length > 0 ? (items.length - 1) * gap : 0);

    if (totalItemsWidth > containerWidth && items.length > 0) {
      availableWidth = containerWidth - effectiveMenuWidth;
      requiresMenu = true;
    }

    let accumulatedWidth = 0;
    let visibleCount = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      const itemWidth = itemWidths[i];
      const widthWithGap = itemWidth + (visibleCount > 0 ? gap : 0);

      if (accumulatedWidth + widthWithGap <= availableWidth) {
        accumulatedWidth += widthWithGap;
        visibleCount++;
      } else {
        break;
      }
    }

    if (requiresMenu && visibleCount === items.length) {
      visibleCount = Math.max(0, items.length - 1);
    }

    if (requiresMenu && visibleCount === 0 && items.length > 0 && itemWidths[0] > availableWidth) {
      visibleCount = 0;
    }

    calculatedVisibleItems = items.slice(0, visibleCount);
    calculatedOverflowItems = items.slice(visibleCount);
  } else if (items.length > 0 && containerWidth <= 0) {
    calculatedOverflowItems = items;
  } else {
    calculatedVisibleItems = [];
    calculatedOverflowItems = items;
  }

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
        {calculatedVisibleItems.map((item) => (
          <Box key={item.id} display="flex" alignItems="center">
            {item.content}
          </Box>
        ))}
        {calculatedOverflowItems.length > 0 ? (
          <Box ref={menuButtonRef} sx={{ flexShrink: 0 }}>
            <OverflowMenu overflowItems={calculatedOverflowItems} />
          </Box>
        ) : null}
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
