# Stadium seating is modeled as floor-profile sections, not per-row data

Real stadium auditoriums are not a uniform rake: they have a flat or gently sloped front section, a cross-aisle walkway, and a steeply risered stadium section behind it.
We chose to describe this as an optional ordered list of `SeatingSection` entries on an `Auditorium` (row count, per-row riser height, optional step-up, optional cross-aisle depth) rather than per-row elevation/depth overrides.
Sections match how theaters actually describe their houses, keep hand-authored Theater data to a handful of numbers, and make inconsistent data (a mis-set single row) impossible to express.
A single derived helper, `listRowPlacements`, converts sections into each row's floor elevation and screen distance, and is the only source of that math for both seat metrics and the 3D renderer, so the numbers and the picture can never drift apart.
When `seatingSections` is absent, placement falls back to the existing uniform `rowElevationMeters`/`rowSpacingMeters` rake, so screen-size presets and already-authored Theaters are unaffected.
Section row counts must sum to the auditorium's row count; `listRowPlacements` throws otherwise, which unit tests assert for every shipped Theater.
Riser and walkway dimensions for real Theaters follow ADR 0002's approximation policy: typical stadium dimensions unless the venue's numbers are published, disclosed in each Theater's source note.
