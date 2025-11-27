"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

interface HistoryIconButtonProps {
  onClick: () => void;
  tooltipMessage: string;
  ariaLabel: string;
  rowId: string;
  itemId: string;
  hoveredTooltip: {
    type: "ip" | "company";
    id: string;
    message: string;
    rowId: string;
  } | null;
  onTooltipChange: (tooltip: {
    type: "ip" | "company";
    id: string;
    message: string;
    rowId: string;
  } | null) => void;
  type: "ip" | "company";
}

export default function HistoryIconButton({
  onClick,
  tooltipMessage,
  ariaLabel,
  rowId,
  itemId,
  hoveredTooltip,
  onTooltipChange,
  type,
}: HistoryIconButtonProps) {
  const handleMouseEnter = () => {
    onTooltipChange({
      type,
      id: itemId,
      message: tooltipMessage,
      rowId,
    });
  };

  const handleMouseLeave = () => {
    // Só limpa se for o tooltip atual desta linha
    if (hoveredTooltip?.rowId === rowId) {
      onTooltipChange(null);
    }
  };

  const isTooltipVisible =
    hoveredTooltip?.rowId === rowId &&
    hoveredTooltip?.type === type &&
    hoveredTooltip.id === itemId;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
        aria-label={ariaLabel}
      >
        <Eye className="h-4 w-4" />
      </button>
      {isTooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap z-50 pointer-events-none">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
}

