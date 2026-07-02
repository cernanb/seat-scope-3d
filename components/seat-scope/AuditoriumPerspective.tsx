"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  AdditiveBlending,
  DoubleSide,
  Object3D,
  Vector3,
  type InstancedMesh,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from "three";

import {
  getSeatCenter,
  listRowPlacements,
  listSeats,
} from "@/lib/auditorium/geometry";
import { createFilmFrameTexture } from "./film-frame-texture";
import type {
  Auditorium,
  Position3D,
  Seat,
  SeatMetrics,
} from "@/lib/auditorium/types";

type AuditoriumPerspectiveProps = {
  auditorium: Auditorium;
  metrics: SeatMetrics;
};

type LookOffset = {
  x: number;
  y: number;
};

const screenCenter = (auditorium: Auditorium): Position3D => ({
  x: 0,
  y: auditorium.screen.bottomHeightMeters + auditorium.screen.heightMeters / 2,
  z: 0,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const minimumWallHeightMeters = 8.5;
// The room needs a wall just behind the screen plane; without it, seats with
// a wide view see the screen floating in a black void.
const screenWallZ = -0.4;

// Giant-format screens (IMAX 15/70 tops out above 23 m) and tall stadium
// sections both need the room to grow with them, or the fixed ceiling plane
// slices the picture off / pins the back rows to the ceiling.
const roomWallHeight = (auditorium: Auditorium) => {
  const backRowFloor =
    listRowPlacements(auditorium).at(-1)?.floorElevationMeters ?? 0;

  return Math.max(
    minimumWallHeightMeters,
    auditorium.screen.bottomHeightMeters + auditorium.screen.heightMeters + 1.5,
    backRowFloor + 3,
  );
};

export function AuditoriumPerspective({
  auditorium,
  metrics,
}: AuditoriumPerspectiveProps) {
  const [lookOffset, setLookOffset] = useState<LookOffset>({ x: 0, y: 0 });
  const [hasLookedAround, setHasLookedAround] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }

    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    dragStart.current = { x: event.clientX, y: event.clientY };
    setHasLookedAround(true);
    setLookOffset((current) => ({
      x: clamp(current.x - deltaX * 0.025, -3.2, 3.2),
      y: clamp(current.y + deltaY * 0.015, -1.2, 1.2),
    }));
  };

  return (
    <section
      aria-label="3D auditorium perspective"
      className="relative overflow-hidden rounded-t-2xl border border-b-0 border-line bg-[#0b0a0d]"
    >
      <div
        aria-label={`3D view from seat ${metrics.seat.label}`}
        className="h-[24rem] w-full cursor-grab touch-none active:cursor-grabbing lg:h-[34rem] xl:h-[max(26rem,calc(100dvh-36rem))]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          dragStart.current = null;
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
        role="img"
      >
        <Canvas
          className="h-full w-full"
          gl={{ preserveDrawingBuffer: true }}
          shadows
        >
          <PerspectiveScene
            auditorium={auditorium}
            metrics={metrics}
            lookOffset={lookOffset}
          />
        </Canvas>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-4 rounded-full border border-projection/10 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-projection/90 backdrop-blur-sm"
      >
        View from {metrics.seat.label}
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-projection/10 bg-black/55 px-3 py-1 text-[11px] font-medium text-projection/80 backdrop-blur-sm transition-opacity duration-500 ${
          hasLookedAround ? "opacity-0" : "opacity-100"
        }`}
      >
        Drag to look around
      </div>
    </section>
  );
}

function PerspectiveScene({
  auditorium,
  metrics,
  lookOffset,
}: AuditoriumPerspectiveProps & { lookOffset: LookOffset }) {
  const target = useMemo(() => {
    const center = screenCenter(auditorium);

    return {
      x: center.x + lookOffset.x,
      y: center.y + lookOffset.y,
      z: center.z,
    };
  }, [auditorium, lookOffset.x, lookOffset.y]);
  const seats = useMemo(() => listSeats(auditorium), [auditorium]);
  const roomWidth = auditorium.screen.widthMeters + 6;
  const rearZ =
    (listRowPlacements(auditorium).at(-1)?.rowCenterZMeters ??
      auditorium.geometry.frontClearanceMeters) + 2.5;
  const screenCenterY =
    auditorium.screen.bottomHeightMeters + auditorium.screen.heightMeters / 2;
  const wallHeight = roomWallHeight(auditorium);

  return (
    <>
      <color attach="background" args={["#0b0a0d"]} />
      <fog attach="fog" args={["#0b0a0d", 16, Math.max(46, rearZ + 18)]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[0, 7, 6]} intensity={1.7} />
      {/* Light spill from the projected picture washing back into the room. */}
      <pointLight
        position={[0, screenCenterY, 2.2]}
        color="#f6d2a6"
        intensity={2.2}
        distance={rearZ + 12}
        decay={2}
      />
      <FixedSeatCamera
        auditorium={auditorium}
        position={metrics.viewingPosition}
        target={target}
      />

      <TheaterShell roomWidth={roomWidth} rearZ={rearZ} wallHeight={wallHeight} />
      <TheaterFloor auditorium={auditorium} roomWidth={roomWidth} />
      <Screen auditorium={auditorium} />
      <AisleLights auditorium={auditorium} roomWidth={roomWidth} />
      <CeilingStars roomWidth={roomWidth} rearZ={rearZ} wallHeight={wallHeight} />
      <SideAccentBeams roomWidth={roomWidth} wallHeight={wallHeight} />

      {seats.map((seat) => (
        <SeatMesh
          key={seat.label}
          seat={seat}
          isSelected={seat.label === metrics.seat.label}
          center={getSeatCenter(auditorium, seat)}
        />
      ))}
    </>
  );
}

function TheaterShell({
  roomWidth,
  rearZ,
  wallHeight,
}: {
  roomWidth: number;
  rearZ: number;
  wallHeight: number;
}) {
  const halfWidth = roomWidth / 2;
  const roomDepth = rearZ - screenWallZ;
  const roomCenterZ = (rearZ + screenWallZ) / 2;

  return (
    <>
      <mesh position={[0, wallHeight / 2, screenWallZ]}>
        <planeGeometry args={[roomWidth, wallHeight]} />
        <meshStandardMaterial color="#17131d" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh position={[0, wallHeight / 2, rearZ]}>
        <planeGeometry args={[roomWidth, wallHeight]} />
        <meshStandardMaterial color="#221e29" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[-halfWidth, wallHeight / 2, roomCenterZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, wallHeight]} />
        <meshStandardMaterial color="#1c1823" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[halfWidth, wallHeight / 2, roomCenterZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, wallHeight]} />
        <meshStandardMaterial color="#1c1823" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[0, wallHeight, roomCenterZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#161320" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh position={[-halfWidth + 0.4, wallHeight / 2 - 0.5, 3]}>
        <boxGeometry args={[0.5, wallHeight - 1, 3.2]} />
        <meshStandardMaterial color="#611a28" roughness={0.85} />
      </mesh>
      <mesh position={[halfWidth - 0.4, wallHeight / 2 - 0.5, 3]}>
        <boxGeometry args={[0.5, wallHeight - 1, 3.2]} />
        <meshStandardMaterial color="#611a28" roughness={0.85} />
      </mesh>
    </>
  );
}

function TheaterFloor({
  auditorium,
  roomWidth,
}: {
  auditorium: Auditorium;
  roomWidth: number;
}) {
  const { rows, geometry } = auditorium;
  const placements = useMemo(() => listRowPlacements(auditorium), [auditorium]);
  const stepDepth = geometry.rowSpacingMeters;
  const stageFrontZ =
    (placements[0]?.rowCenterZMeters ?? geometry.frontClearanceMeters) -
    stepDepth / 2;

  return (
    <>
      <mesh
        position={[0, -0.03, (stageFrontZ + screenWallZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, stageFrontZ - screenWallZ]} />
        <meshStandardMaterial color="#2c1920" roughness={0.9} />
      </mesh>

      {rows.map((row, index) => {
        const placement = placements[index];
        const topY = placement.floorElevationMeters;
        const centerZ = placement.rowCenterZMeters;
        const walkwayDepth = placement.crossAisleDepthBeforeMeters;
        const previousElevation =
          index > 0 ? placements[index - 1].floorElevationMeters : 0;

        return (
          <group key={row.label}>
            <mesh position={[0, topY - 0.03, centerZ]}>
              <boxGeometry args={[roomWidth, 0.06, stepDepth]} />
              <meshStandardMaterial color="#432635" roughness={0.95} />
            </mesh>
            {topY > 0.001 ? (
              <mesh position={[0, topY / 2, centerZ - stepDepth / 2]}>
                <boxGeometry args={[roomWidth, topY, 0.06]} />
                <meshStandardMaterial color="#22131a" roughness={0.95} />
              </mesh>
            ) : null}
            {walkwayDepth > 0 && index > 0 ? (
              // Cross-aisle walkway landing at the previous section's floor
              // level, with a safety light strip along the riser it runs
              // against.
              <group>
                <mesh
                  position={[
                    0,
                    previousElevation - 0.03,
                    centerZ - stepDepth / 2 - walkwayDepth / 2,
                  ]}
                >
                  <boxGeometry args={[roomWidth, 0.06, walkwayDepth]} />
                  <meshStandardMaterial color="#33202b" roughness={0.95} />
                </mesh>
                <mesh
                  position={[
                    0,
                    previousElevation + 0.02,
                    centerZ - stepDepth / 2 - 0.1,
                  ]}
                >
                  <boxGeometry args={[roomWidth - 1.6, 0.02, 0.08]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#f59e0b"
                    emissiveIntensity={0.7}
                  />
                </mesh>
              </group>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

function Screen({ auditorium }: { auditorium: Auditorium }) {
  const { screen } = auditorium;
  const bottom = screen.bottomHeightMeters;
  const top = bottom + screen.heightMeters;
  const centerY = (bottom + top) / 2;
  // A real cinema screen's masking blends into the dark surrounding wall
  // rather than showing a visible frame, so this masking is a near-black
  // match for the background/wall tones instead of a lighter bezel color.
  const frameThickness = 0.22;
  const frameDepth = 0.12;
  const maskingColor = "#0c0b0e";
  const halfWidth = screen.widthMeters / 2;
  const aspectRatio = screen.widthMeters / screen.heightMeters;
  // The projected picture is a basic (unlit, untonemapped) material so it
  // reads as self-emitting light rather than a surface lit by the room.
  const frameTexture = useMemo(
    () => createFilmFrameTexture(aspectRatio),
    [aspectRatio],
  );

  useEffect(() => () => frameTexture.dispose(), [frameTexture]);

  return (
    <group position={[0, 0, -0.1]}>
      <mesh position={[0, centerY, 0.02]}>
        <planeGeometry args={[screen.widthMeters, screen.heightMeters]} />
        <meshBasicMaterial
          map={frameTexture}
          toneMapped={false}
          side={DoubleSide}
          fog={false}
        />
      </mesh>

      <mesh position={[0, top + frameThickness / 2, 0]}>
        <boxGeometry
          args={[
            screen.widthMeters + frameThickness * 2,
            frameThickness,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={maskingColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, bottom - frameThickness / 2, 0]}>
        <boxGeometry
          args={[
            screen.widthMeters + frameThickness * 2,
            frameThickness,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={maskingColor} roughness={0.9} />
      </mesh>
      <mesh position={[-halfWidth - frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, screen.heightMeters, frameDepth]} />
        <meshStandardMaterial color={maskingColor} roughness={0.9} />
      </mesh>
      <mesh position={[halfWidth + frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, screen.heightMeters, frameDepth]} />
        <meshStandardMaterial color={maskingColor} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Generated once at module load (not during render) so the starfield
// pattern stays stable across re-renders without calling Math.random() from
// inside a component. Each star is stored as unit factors that get scaled to
// the current room's actual dimensions when rendered.
const ceilingStarUnits = Array.from({ length: 160 }, () => ({
  xFactor: Math.random() - 0.5,
  zFactor: Math.random(),
  scale: 0.5 + Math.random() * 0.9,
}));

function CeilingStars({
  roomWidth,
  rearZ,
  wallHeight,
}: {
  roomWidth: number;
  rearZ: number;
  wallHeight: number;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    ceilingStarUnits.forEach((star, index) => {
      dummy.position.set(
        star.xFactor * (roomWidth - 1),
        wallHeight - 0.05,
        star.zFactor * (rearZ - 1) + 0.5,
      );
      dummy.scale.setScalar(star.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, roomWidth, rearZ, wallHeight]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, ceilingStarUnits.length]}
    >
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshBasicMaterial color="#e8ecff" fog={false} />
    </instancedMesh>
  );
}

function SideAccentBeams({
  roomWidth,
  wallHeight,
}: {
  roomWidth: number;
  wallHeight: number;
}) {
  const halfWidth = roomWidth / 2;
  const beams = [-0.6, -0.25, 0.1, 0.45];
  const beamLength = wallHeight * 0.76;

  return (
    <>
      {[-1, 1].map((side) =>
        beams.map((tilt, index) => (
          <mesh
            key={`${side}-${index}`}
            position={[
              side * (halfWidth - 0.05),
              wallHeight * 0.42,
              2.4 + index * 0.2,
            ]}
            rotation={[0, 0, side * (0.55 + tilt * 0.35)]}
          >
            <planeGeometry args={[0.5, beamLength]} />
            <meshBasicMaterial
              color="#5b8def"
              transparent
              opacity={0.12}
              side={DoubleSide}
              depthWrite={false}
              blending={AdditiveBlending}
              fog={false}
            />
          </mesh>
        )),
      )}
    </>
  );
}

function AisleLights({
  auditorium,
  roomWidth,
}: {
  auditorium: Auditorium;
  roomWidth: number;
}) {
  const { rows } = auditorium;
  const placements = useMemo(() => listRowPlacements(auditorium), [auditorium]);
  const aisleX = roomWidth / 2 - 0.5;

  return (
    <>
      {rows.map((row, index) => {
        const topY = placements[index].floorElevationMeters;
        const centerZ = placements[index].rowCenterZMeters;

        return (
          <group key={row.label}>
            <mesh position={[-aisleX, topY + 0.02, centerZ]}>
              <boxGeometry args={[0.12, 0.02, 0.3]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.9}
              />
            </mesh>
            <mesh position={[aisleX, topY + 0.02, centerZ]}>
              <boxGeometry args={[0.12, 0.02, 0.3]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.9}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function SeatMesh({
  seat,
  isSelected,
  center,
}: {
  seat: Seat;
  isSelected: boolean;
  center: Position3D;
}) {
  // The picked seat glows aisle-light amber - the same accent that marks it
  // on the 2D map and the ticket stub.
  const color = isSelected
    ? "#f59e0b"
    : seat.availability === "available"
      ? "#7d7267"
      : "#6b2c3a";

  return (
    <group position={[center.x, center.y, center.z]}>
      <mesh position={[0, -0.07, -0.04]}>
        <boxGeometry args={[0.42, 0.14, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0.16]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.42, 0.4, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {isSelected ? (
        <pointLight
          position={[0, 0.5, 0.2]}
          color="#f59e0b"
          intensity={0.5}
          distance={1.4}
          decay={2}
        />
      ) : null}
    </group>
  );
}

function FixedSeatCamera({
  auditorium,
  position,
  target,
}: {
  auditorium: Auditorium;
  position: Position3D;
  target: Position3D;
}) {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const size = useThree((state) => state.size);
  const fov = useMemo(
    () => calculateScreenFramingFov(auditorium, position, target, size),
    [auditorium, position, size, target],
  );

  useLayoutEffect(() => {
    const camera = cameraRef.current;

    if (!camera) {
      return;
    }

    camera.position.set(position.x, position.y, position.z);
    camera.fov = fov;
    camera.lookAt(target.x, target.y, target.z);
    camera.updateProjectionMatrix();
  }, [
    fov,
    position.x,
    position.y,
    position.z,
    target.x,
    target.y,
    target.z,
  ]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={fov}
      near={0.1}
      far={100}
      position={[position.x, position.y, position.z]}
    />
  );
}

function calculateScreenFramingFov(
  auditorium: Auditorium,
  position: Position3D,
  target: Position3D,
  size: { width: number; height: number },
) {
  const cameraPosition = new Vector3(position.x, position.y, position.z);
  const lookTarget = new Vector3(target.x, target.y, target.z);
  const forward = lookTarget.sub(cameraPosition).normalize();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0));

  if (right.lengthSq() === 0) {
    return 50;
  }

  right.normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  const aspectRatio = size.height > 0 ? size.width / size.height : 1;
  const halfWidth = auditorium.screen.widthMeters / 2;
  const bottom = auditorium.screen.bottomHeightMeters;
  const top = bottom + auditorium.screen.heightMeters;
  const screenCorners = [
    new Vector3(-halfWidth, bottom, 0),
    new Vector3(halfWidth, bottom, 0),
    new Vector3(-halfWidth, top, 0),
    new Vector3(halfWidth, top, 0),
  ];
  let halfHorizontalFov = 0;
  let halfVerticalFov = 0;

  for (const corner of screenCorners) {
    const toCorner = corner.sub(cameraPosition);
    const depth = toCorner.dot(forward);

    if (depth <= 0) {
      continue;
    }

    halfHorizontalFov = Math.max(
      halfHorizontalFov,
      Math.atan(Math.abs(toCorner.dot(right)) / depth),
    );
    halfVerticalFov = Math.max(
      halfVerticalFov,
      Math.atan(Math.abs(toCorner.dot(up)) / depth),
    );
  }

  const horizontalAsVerticalFov = Math.atan(
    Math.tan(halfHorizontalFov) / aspectRatio,
  );
  const framingPaddingDegrees = 8;
  const fovDegrees =
    (Math.max(halfVerticalFov, horizontalAsVerticalFov) * 2 * 180) / Math.PI +
    framingPaddingDegrees;

  return clamp(fovDegrees, 50, 82);
}
