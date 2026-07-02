import { baseGeometryErgonomics, scaleGeometryToScreenWidth } from "./geometry-constants";
import type { Auditorium, Row } from "./types";

/**
 * See docs/adr/0002-approximate-real-theater-data.md: every entry below is a
 * researched approximation, not an exact seat-for-seat map. Screen
 * dimensions and total seating capacity are sourced from public reporting
 * where available (see each entry's `theater.sourceNote`); row and seat
 * layout is hand-authored per theater to roughly match that capacity, not
 * generated from a shared formula.
 */

function rowLabels(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    String.fromCharCode(65 + index),
  );
}

function buildRows(
  labels: string[],
  seatCount: number,
  aisleAfterSeatNumbers: number[],
  unavailableByRow: Record<string, number[]> = {},
): Row[] {
  return labels.map((label) => ({
    label,
    seatCount,
    aisleAfterSeatNumbers,
    unavailableSeatNumbers: unavailableByRow[label] ?? [],
  }));
}

export const theaters: Auditorium[] = [
  {
    id: "tcl-chinese-theatre",
    name: "TCL Chinese Theatre - IMAX",
    unit: "meters",
    screen: { widthMeters: 28.7, heightMeters: 14, bottomHeightMeters: 2.2 },
    geometry: {
      ...baseGeometryErgonomics,
      ...scaleGeometryToScreenWidth(28.7),
    },
    // 20 rows x 47 seats (2 aisles) = 940, close to the real 932-seat capacity.
    rows: buildRows(rowLabels(20), 47, [16, 31], {
      A: [1, 47],
      T: [24],
    }),
    defaultSeatLabel: "J24",
    theater: {
      name: "TCL Chinese Theatre",
      city: "Hollywood, CA",
      screenFormatLabel: "IMAX (the real screen is curved; rendered flat here)",
      sourceNote:
        "Seating capacity (932) and IMAX screen size (94 x 46 ft) are publicly documented. Row and seat layout is an approximation, not the theater's actual seat chart.",
      sourceUrl:
        "https://www.laweekly.com/chinese-theatre-is-now-the-worlds-highest-capacity-imax-venue/",
    },
  },
  {
    id: "amc-century-city-15-auditorium-15",
    name: "AMC Century City 15 - Auditorium 15",
    unit: "meters",
    screen: { widthMeters: 13.4, heightMeters: 7.3, bottomHeightMeters: 1.6 },
    geometry: {
      ...baseGeometryErgonomics,
      ...scaleGeometryToScreenWidth(13.4),
    },
    // 12 rows x 25 seats (2 aisles) = 300, matching the real capacity exactly.
    rows: buildRows(rowLabels(12), 25, [8, 17], {
      L: [1],
    }),
    defaultSeatLabel: "F13",
    theater: {
      name: "AMC Century City 15",
      city: "Century City, Los Angeles, CA",
      screenFormatLabel: "Standard flagship auditorium",
      sourceNote:
        "Seating capacity (300) and screen width (44 ft) for the complex's largest auditorium are publicly documented; screen height is estimated, and row/seat layout is an approximation.",
      sourceUrl:
        "https://losangelestheatres.blogspot.com/2024/11/century-city.html",
    },
  },
  {
    id: "egyptian-theatre-hollywood",
    name: "Egyptian Theatre",
    unit: "meters",
    screen: { widthMeters: 16.2, heightMeters: 8.2, bottomHeightMeters: 1.5 },
    geometry: {
      ...baseGeometryErgonomics,
      ...scaleGeometryToScreenWidth(16.2),
    },
    // 12 rows x 43 seats (2 aisles) = 516, matching the real capacity exactly.
    rows: buildRows(rowLabels(12), 43, [14, 29], {
      A: [1, 43],
    }),
    defaultSeatLabel: "F22",
    theater: {
      name: "Egyptian Theatre",
      city: "Hollywood, CA",
      screenFormatLabel: "Historic single-screen (2023 Netflix restoration)",
      sourceNote:
        "Seating capacity (516) and screen size (53 x 27 ft) are publicly documented from the 2023 restoration. Row/seat layout is an approximation, not the actual seat chart.",
      sourceUrl:
        "https://lamag.com/old-hollywood/netflix-revives-egyptian-theatre-inside-restoration/",
    },
  },
  {
    id: "regal-edwards-irvine-spectrum-auditorium-12-imax",
    name: "Regal Edwards Irvine Spectrum - Auditorium 12 (IMAX)",
    unit: "meters",
    screen: { widthMeters: 26.8, heightMeters: 20.6, bottomHeightMeters: 1.8 },
    geometry: {
      ...baseGeometryErgonomics,
      ...scaleGeometryToScreenWidth(26.8),
    },
    // Row counts for A, B, C, and the row J=39/seat-20 center point were read
    // directly off the venue's real seat map; the 7 uniform 39-seat rows
    // (D-K), the wheelchair row (L), and the split final row (M) are sized
    // to reconcile those confirmed numbers with the venue's real 387-seat
    // total. Row letters skip "I" to match common cinema convention.
    rows: [
      { label: "A", seatCount: 22, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "B", seatCount: 20, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "C", seatCount: 26, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "D", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "E", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "F", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "G", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "H", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "J", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "K", seatCount: 39, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "L", seatCount: 33, aisleAfterSeatNumbers: [], unavailableSeatNumbers: [] },
      { label: "M", seatCount: 13, aisleAfterSeatNumbers: [6], unavailableSeatNumbers: [] },
    ],
    // Stadium layout: rows A-C sit on a near-flat floor under the screen,
    // then a cross-aisle walkway and a step up into the stadium tiers (D-M).
    // Riser and walkway dimensions are typical stadium-auditorium numbers,
    // not measured from the venue.
    seatingSections: [
      { rowCount: 3, riserHeightMeters: 0.12 },
      {
        rowCount: 9,
        riserHeightMeters: 0.45,
        stepUpMeters: 0.9,
        crossAisleDepthMeters: 1.8,
      },
    ],
    defaultSeatLabel: "J20",
    theater: {
      name: "Regal Edwards Irvine Spectrum - Auditorium 12 (IMAX)",
      city: "Irvine, CA (Orange County)",
      screenFormatLabel: "IMAX",
      sourceNote:
        "Screen size (87.9 x 67.6 ft) and total seating capacity (387) came directly from the venue's real seat map, along with exact counts for rows A, B, and C. Row and seat layout below reconciles those numbers with the map's overall shape; it is not an exact transcription. The stadium floor profile (flat front rows, cross-aisle, stepped tiers) matches the auditorium's style, but riser heights are typical stadium dimensions, not measurements.",
      sourceUrl:
        "https://www.regmovies.com/theatres/regal-edwards-irvine-spectrum-1010",
    },
  },
  {
    id: "la-paloma-theatre-encinitas",
    name: "La Paloma Theatre",
    unit: "meters",
    screen: { widthMeters: 15.2, heightMeters: 7.6, bottomHeightMeters: 1.3 },
    geometry: {
      ...baseGeometryErgonomics,
      ...scaleGeometryToScreenWidth(15.2),
    },
    // 12 rows x 45 seats (2 aisles) = 540, matching the real capacity exactly.
    rows: buildRows(rowLabels(12), 45, [15, 30]),
    defaultSeatLabel: "F23",
    theater: {
      name: "La Paloma Theatre",
      city: "Encinitas, CA (San Diego County)",
      screenFormatLabel: "Historic single-screen",
      sourceNote:
        "Seating capacity (540) is publicly documented; screen size was not found published anywhere and is estimated from a comparably sized historic single-screen theater of the same era.",
      sourceUrl: "https://en.wikipedia.org/wiki/La_Paloma_Theatre",
    },
  },
];

export const defaultTheaterId = theaters[0]!.id;

export function findTheater(id: string | null | undefined): Auditorium {
  return theaters.find((theater) => theater.id === id) ?? theaters[0]!;
}
