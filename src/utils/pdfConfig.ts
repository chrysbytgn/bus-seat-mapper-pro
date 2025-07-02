
/**
 * PDF configuration constants and settings
 */
export const PDF_CONFIG = {
  // Page settings
  RECEIPTS_PER_PAGE: 3,
  RECEIPT_HEIGHT: 90,
  RECEIPT_WIDTH: 180,
  MARGIN_LEFT: 15,
  MARGIN_TOP: 10,
  VERTICAL_GAP: 8,
  
  // Layout dimensions
  STUB_WIDTH: 40,
  MAIN_RECEIPT_WIDTH: 135,
  DIVIDER_LINE_X_OFFSET: 2,
  MAIN_RECEIPT_LEFT_OFFSET: 5,
  
  // Font sizes
  FONTS: {
    SMALL: 6,
    NORMAL: 7,
    MEDIUM: 8,
    LARGE: 9,
    XLARGE: 10,
    TITLE: 11,
  },
  
  // Colors
  COLORS: {
    WHITE: [255, 255, 255] as [number, number, number],
    BLACK: [0, 0, 0] as [number, number, number],
    LIGHT_GRAY: [180, 180, 180] as [number, number, number],
    MEDIUM_GRAY: [120, 120, 120] as [number, number, number],
    DARK_GRAY: [80, 80, 80] as [number, number, number],
    FIELD_GRAY: [100, 100, 100] as [number, number, number],
    TEXT_GRAY: [50, 50, 50] as [number, number, number],
  },
} as const;
