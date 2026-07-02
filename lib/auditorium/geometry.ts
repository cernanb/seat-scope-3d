import type {
  Auditorium,
  Position3D,
  Row,
  Seat,
  SeatingSection,
  SeatLabel,
  SeatMetrics,
} from "./types";

const toDegrees = (radians: number) => radians * (180 / Math.PI);

export type RowPlacement = {
  /** Height of this row's floor tier above the front of the house. */
  floorElevationMeters: number;
  /** Distance of this row's seat centers from the screen plane. */
  rowCenterZMeters: number;
  /** Walkway depth inserted just in front of this row (0 for most rows). */
  crossAisleDepthBeforeMeters: number;
};

/**
 * The single source of truth for where each row's floor sits, shared by
 * seat metrics and the 3D renderer. Walks the auditorium's seating sections
 * front to back; without sections it reproduces the classic uniform rake.
 */
export function listRowPlacements(auditorium: Auditorium): RowPlacement[] {
  const { geometry, rows } = auditorium;
  const sections: SeatingSection[] = auditorium.seatingSections ?? [
    { rowCount: rows.length, riserHeightMeters: geometry.rowElevationMeters },
  ];
  const sectionRowCount = sections.reduce(
    (sum, section) => sum + section.rowCount,
    0,
  );

  if (sectionRowCount !== rows.length) {
    throw new Error("The seating sections must cover every row exactly.");
  }

  const placements: RowPlacement[] = [];
  let elevation = 0;
  let z = geometry.frontClearanceMeters;

  for (const section of sections) {
    const crossAisleDepth = section.crossAisleDepthMeters ?? 0;

    elevation += section.stepUpMeters ?? 0;
    z += crossAisleDepth;

    for (let rowInSection = 0; rowInSection < section.rowCount; rowInSection += 1) {
      if (rowInSection > 0) {
        elevation += section.riserHeightMeters;
        z += geometry.rowSpacingMeters;
      } else if (placements.length > 0) {
        z += geometry.rowSpacingMeters;
      }

      placements.push({
        floorElevationMeters: elevation,
        rowCenterZMeters: z,
        crossAisleDepthBeforeMeters: rowInSection === 0 ? crossAisleDepth : 0,
      });
    }
  }

  return placements;
}

export function getRowPlacement(
  auditorium: Auditorium,
  rowIndex: number,
): RowPlacement {
  const placement = listRowPlacements(auditorium)[rowIndex];

  if (!placement) {
    throw new Error(`Row index ${rowIndex} is outside the auditorium.`);
  }

  return placement;
}

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
  const placement = getRowPlacement(auditorium, seat.rowIndex);

  return {
    x: getSeatX(auditorium, row, seat.seatNumber),
    y:
      auditorium.geometry.seatCenterHeightMeters +
      placement.floorElevationMeters,
    z: placement.rowCenterZMeters,
  };
}

export function getViewingPosition(
  auditorium: Auditorium,
  seat: Seat,
): Position3D {
  const seatCenter = getSeatCenter(auditorium, seat);
  const placement = getRowPlacement(auditorium, seat.rowIndex);

  return {
    x: seatCenter.x,
    y: placement.floorElevationMeters + auditorium.geometry.eyeHeightMeters,
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
