# Seat Scope 3D

Seat Scope 3D models a movie theater seating experience so a user can choose a seat and understand the screen view from that position.

## Language

**Auditorium**:
A reusable theater geometry profile that defines the physical viewing environment for a seating chart and seat perspective.
_Avoid_: Theater, venue, room, preset

**Medium auditorium**:
The default auditorium scale for the first experience, representing a plausible mid-sized movie theater rather than an exaggerated demonstration space.
_Avoid_: Demo theater, sample room, exaggerated auditorium

**Raked floor**:
An auditorium floor where seating rows rise progressively farther from the screen.
_Avoid_: Stadium seating, elevation algorithm, stepped rows

**Screen**:
The front display surface that the user evaluates from a selected seat perspective.
_Avoid_: Projection plane, canvas, movie image

**Seat**:
A visible place in the auditorium seating chart that may or may not be available for selection.
_Avoid_: Grid cell, chair, slot

**Seat availability**:
Whether a visible seat can be selected by the user.
Unavailable seats remain part of the seating chart.
_Avoid_: Hidden seats, removed seats, disabled buttons

**Seat label**:
The user-facing identifier for a seat, formed from the row letter and seat number.
_Avoid_: Grid coordinate, cell id, position id

**Row**:
A horizontal group of seats at a shared distance band from the screen.
_Avoid_: Grid line, tier, rank

**Apparent screen size**:
How large the screen appears from a viewing position.
It can be understood visually through the seat perspective and numerically through a viewing angle.
_Avoid_: Screen scale, zoom level, screen rating

**Aisle**:
Walkable auditorium space between groups of seats.
An aisle is not a seat and is not counted in seat numbering.
_Avoid_: Disabled seat, empty seat, spacer

**Seat perspective**:
The view from a selected seat's viewing position toward the screen.
It preserves the selected seat's distance, angle, and height instead of centering or beautifying the screen.
_Avoid_: 3D preview, virtual tour, model viewer

**Viewing position**:
The seated viewer's approximate eye point for a selected seat.
It is distinct from the seat's physical center.
_Avoid_: Camera position, seat center, viewpoint
