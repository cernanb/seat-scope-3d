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

export type Auditorium = {
  id: string;
  name: string;
  unit: "meters";
  screen: Screen;
  geometry: AuditoriumGeometry;
  rows: Row[];
  defaultSeatLabel: SeatLabel;
};

export type SeatMetrics = {
  seat: Seat;
  viewingPosition: Position3D;
  distanceToScreenMeters: number;
  horizontalViewingAngleDegrees: number;
  verticalViewingAngleDegrees: number;
};
