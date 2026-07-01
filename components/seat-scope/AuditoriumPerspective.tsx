"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  DoubleSide,
  Vector3,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from "three";

import { getSeatCenter, listSeats } from "@/lib/auditorium/geometry";
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

export function AuditoriumPerspective({
  auditorium,
  metrics,
}: AuditoriumPerspectiveProps) {
  const [lookOffset, setLookOffset] = useState<LookOffset>({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }

    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    dragStart.current = { x: event.clientX, y: event.clientY };
    setLookOffset((current) => ({
      x: clamp(current.x - deltaX * 0.025, -3.2, 3.2),
      y: clamp(current.y + deltaY * 0.015, -1.2, 1.2),
    }));
  };

  return (
    <section
      aria-label="3D auditorium perspective"
      className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 shadow-sm"
    >
      <div
        aria-label={`3D view from seat ${metrics.seat.label}`}
        className="h-[24rem] w-full cursor-grab touch-none active:cursor-grabbing lg:h-[34rem] xl:h-[38rem] 2xl:h-[42rem]"
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
    auditorium.geometry.frontClearanceMeters +
    (auditorium.rows.length - 1) * auditorium.geometry.rowSpacingMeters +
    2.5;
  const screenTop =
    auditorium.screen.bottomHeightMeters + auditorium.screen.heightMeters;

  return (
    <>
      <color attach="background" args={["#0b0a0d"]} />
      <fog attach="fog" args={["#0b0a0d", 16, 46]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[0, 7, 6]} intensity={1.7} />
      <pointLight
        position={[0, screenTop + 1.2, 2.5]}
        color="#fff3d6"
        intensity={1.8}
        distance={26}
        decay={2}
      />
      <FixedSeatCamera
        auditorium={auditorium}
        position={metrics.viewingPosition}
        target={target}
      />

      <TheaterShell roomWidth={roomWidth} rearZ={rearZ} />
      <TheaterFloor auditorium={auditorium} roomWidth={roomWidth} />
      <Screen auditorium={auditorium} />
      <AisleLights auditorium={auditorium} roomWidth={roomWidth} />

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
}: {
  roomWidth: number;
  rearZ: number;
}) {
  const wallHeight = 8.5;
  const halfWidth = roomWidth / 2;

  return (
    <>
      <mesh position={[0, wallHeight / 2, rearZ]}>
        <planeGeometry args={[roomWidth, wallHeight]} />
        <meshStandardMaterial color="#221e29" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[-halfWidth, wallHeight / 2, rearZ / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[rearZ, wallHeight]} />
        <meshStandardMaterial color="#1c1823" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[halfWidth, wallHeight / 2, rearZ / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[rearZ, wallHeight]} />
        <meshStandardMaterial color="#1c1823" roughness={1} side={DoubleSide} />
      </mesh>

      <mesh
        position={[0, wallHeight, rearZ / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, rearZ]} />
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
  const stepDepth = geometry.rowSpacingMeters;
  const stageFrontZ = geometry.frontClearanceMeters - stepDepth / 2;

  return (
    <>
      <mesh
        position={[0, -0.03, stageFrontZ / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, stageFrontZ]} />
        <meshStandardMaterial color="#2c1920" roughness={0.9} />
      </mesh>

      {rows.map((row, index) => {
        const topY = index * geometry.rowElevationMeters;
        const centerZ =
          geometry.frontClearanceMeters + index * geometry.rowSpacingMeters;

        return (
          <group key={row.label}>
            <mesh position={[0, topY - 0.03, centerZ]}>
              <boxGeometry args={[roomWidth, 0.06, stepDepth]} />
              <meshStandardMaterial color="#432635" roughness={0.95} />
            </mesh>
            {index > 0 ? (
              <mesh position={[0, topY / 2, centerZ - stepDepth / 2]}>
                <boxGeometry args={[roomWidth, topY, 0.06]} />
                <meshStandardMaterial color="#22131a" roughness={0.95} />
              </mesh>
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
  const frameThickness = 0.32;
  const frameDepth = 0.16;
  const halfWidth = screen.widthMeters / 2;

  return (
    <group position={[0, 0, -0.1]}>
      <mesh position={[0, centerY, 0.02]}>
        <planeGeometry args={[screen.widthMeters, screen.heightMeters]} />
        <meshStandardMaterial
          color="#fafafa"
          emissive="#ffffff"
          emissiveIntensity={0.32}
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
        <meshStandardMaterial color="#3f3f46" roughness={0.45} />
      </mesh>
      <mesh position={[0, bottom - frameThickness / 2, 0]}>
        <boxGeometry
          args={[
            screen.widthMeters + frameThickness * 2,
            frameThickness,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color="#3f3f46" roughness={0.45} />
      </mesh>
      <mesh position={[-halfWidth - frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, screen.heightMeters, frameDepth]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.45} />
      </mesh>
      <mesh position={[halfWidth + frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, screen.heightMeters, frameDepth]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.45} />
      </mesh>
    </group>
  );
}

function AisleLights({
  auditorium,
  roomWidth,
}: {
  auditorium: Auditorium;
  roomWidth: number;
}) {
  const { rows, geometry } = auditorium;
  const aisleX = roomWidth / 2 - 0.5;

  return (
    <>
      {rows.map((row, index) => {
        const topY = index * geometry.rowElevationMeters;
        const centerZ =
          geometry.frontClearanceMeters + index * geometry.rowSpacingMeters;

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
  const color = isSelected
    ? "#22c55e"
    : seat.availability === "available"
      ? "#71717f"
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
          color="#22c55e"
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
