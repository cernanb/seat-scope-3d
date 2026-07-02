export type SeatAvailability = "available" | "unavailable";

export type SeatLabel = `${string}${number}`;

export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export type Screen = {
  widthMeters: number;
  heightMeters: number;
  bottomHeightMeters: number;
};

export type Row = {
  label: string;
  seatCount: number;
  aisleAfterSeatNumbers: number[];
  unavailableSeatNumbers: number[];
};

export type Seat = {
  label: SeatLabel;
  rowLabel: string;
  rowIndex: number;
  seatNumber: number;
  availability: SeatAvailability;
};

/**
 * One consecutive run of rows sharing a floor profile, counted from the
 * front of the house. Stadium-style auditoriums are a list of these: e.g. a
 * near-flat front section, then a steeply risered stadium section entered
 * across a walkway (cross-aisle) and up a step.
 */
export type SeatingSection = {
  rowCount: number;
  /** Floor rise from each row in this section to the next (0 = flat floor). */
  riserHeightMeters: number;
  /**
   * One-time floor jump from the previous row up to this section's first
   * row. Applied even for the first section (a raised front section).
   */
  stepUpMeters?: number;
  /**
   * Extra depth for a walkway in front of this section, added on top of the
   * normal row spacing. Applied even for the first section (extra front
   * clearance).
   */
  crossAisleDepthMeters?: number;
};

export type AuditoriumGeometry = {
  frontClearanceMeters: number;
  rowSpacingMeters: number;
  seatSpacingMeters: number;
  aisleWidthMeters: number;
  rowElevationMeters: number;
  seatCenterHeightMeters: number;
  eyeHeightMeters: number;
  eyeForwardOffsetMeters: number;
};

export type TheaterInfo = {
  name: string;
  city: string;
  screenFormatLabel: string;
  sourceNote: string;
  sourceUrl: string;
};

export type Auditorium = {
  id: string;
  name: string;
  unit: "meters";
  screen: Screen;
  geometry: AuditoriumGeometry;
  rows: Row[];
  /**
   * Optional stadium-seating floor profile. Section row counts must sum to
   * rows.length. When absent, every row rises uniformly by
   * geometry.rowElevationMeters and sits geometry.rowSpacingMeters behind
   * the previous one.
   */
  seatingSections?: SeatingSection[];
  defaultSeatLabel: SeatLabel;
  /**
   * Present when this Auditorium is modeled after a specific real-world
   * Theater rather than a purely synthetic screen-size category.
   */
  theater?: TheaterInfo;
};

export type SeatMetrics = {
  seat: Seat;
  viewingPosition: Position3D;
  distanceToScreenMeters: number;
  horizontalViewingAngleDegrees: number;
  verticalViewingAngleDegrees: number;
};
