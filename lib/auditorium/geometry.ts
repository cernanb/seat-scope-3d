import type {
  Auditorium,
  Position3D,
  Row,
  Seat,
  SeatLabel,
  SeatMetrics,
} from "./types";

const toDegrees = (radians: number) => radians * (180 / Math.PI);

export function listSeats(auditorium: Auditorium): Seat[] {
  return auditorium.rows.flatMap((row, rowIndex) =>
    Array.from({ length: row.seatCount }, (_, index) => {
      const seatNumber = index + 1;

      return {
        label: `${row.label}${seatNumber}` as SeatLabel,
        rowLabel: row.label,
        rowIndex,
        seatNumber,
        availability: row.unavailableSeatNumbers.includes(seatNumber)
          ? "unavailable"
          : "available",
      };
    }),
  );
}

export function findSeatByLabel(
  auditorium: Auditorium,
  label: string,
): Seat | undefined {
  return listSeats(auditorium).find((seat) => seat.label === label);
}

export function getDefaultSeat(auditorium: Auditorium): Seat {
  const defaultSeat = findSeatByLabel(auditorium, auditorium.defaultSeatLabel);

  if (!defaultSeat || defaultSeat.availability !== "available") {
    throw new Error("The default seat must exist and be available.");
  }

  return defaultSeat;
}

export function resolveSelectableSeat(
  auditorium: Auditorium,
  label: string | null | undefined,
): Seat {
  const seat = label ? findSeatByLabel(auditorium, label) : undefined;

  if (!seat || seat.availability !== "available") {
    return getDefaultSeat(auditorium);
  }

  return seat;
}

export function getSeatCenter(
  auditorium: Auditorium,
  seat: Seat,
): Position3D {
  const row = auditorium.rows[seat.rowIndex];

  return {
    x: getSeatX(auditorium, row, seat.seatNumber),
    y:
      auditorium.geometry.seatCenterHeightMeters +
      seat.rowIndex * auditorium.geometry.rowElevationMeters,
    z:
      auditorium.geometry.frontClearanceMeters +
      seat.rowIndex * auditorium.geometry.rowSpacingMeters,
  };
}

export function getViewingPosition(
  auditorium: Auditorium,
  seat: Seat,
): Position3D {
  const seatCenter = getSeatCenter(auditorium, seat);

  return {
    x: seatCenter.x,
    y:
      seat.rowIndex * auditorium.geometry.rowElevationMeters +
      auditorium.geometry.eyeHeightMeters,
    z: seatCenter.z - auditorium.geometry.eyeForwardOffsetMeters,
  };
}

export function calculateSeatMetrics(
  auditorium: Auditorium,
  label: string | null | undefined,
): SeatMetrics {
  const seat = resolveSelectableSeat(auditorium, label);
  const viewingPosition = getViewingPosition(auditorium, seat);
  const screenCenter = getScreenCenter(auditorium);
  const distanceToScreenMeters = distanceBetween(viewingPosition, screenCenter);

  return {
    seat,
    viewingPosition,
    distanceToScreenMeters,
    horizontalViewingAngleDegrees: calculateViewingAngle(
      auditorium.screen.widthMeters,
      distanceToScreenMeters,
    ),
    verticalViewingAngleDegrees: calculateViewingAngle(
      auditorium.screen.heightMeters,
      distanceToScreenMeters,
    ),
  };
}

function getSeatX(auditorium: Auditorium, row: Row, seatNumber: number) {
  const visualWidth =
    (row.seatCount - 1) * auditorium.geometry.seatSpacingMeters +
    row.aisleAfterSeatNumbers.length * auditorium.geometry.aisleWidthMeters;
  const aisleOffset =
    row.aisleAfterSeatNumbers.filter((aisleAfter) => aisleAfter < seatNumber)
      .length * auditorium.geometry.aisleWidthMeters;
  const seatOffset =
    (seatNumber - 1) * auditorium.geometry.seatSpacingMeters + aisleOffset;

  return seatOffset - visualWidth / 2;
}

function getScreenCenter(auditorium: Auditorium): Position3D {
  return {
    x: 0,
    y:
      auditorium.screen.bottomHeightMeters +
      auditorium.screen.heightMeters / 2,
    z: 0,
  };
}

function distanceBetween(a: Position3D, b: Position3D) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function calculateViewingAngle(sizeMeters: number, distanceMeters: number) {
  return toDegrees(2 * Math.atan(sizeMeters / (2 * distanceMeters)));
}
