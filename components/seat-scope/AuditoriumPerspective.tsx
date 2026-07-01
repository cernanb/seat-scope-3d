"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { DoubleSide } from "three";

import { getSeatCenter, listSeats } from "@/lib/auditorium/geometry";
import type {
  Auditorium,
  Position3D,
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
        className="h-[24rem] cursor-grab touch-none active:cursor-grabbing"
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
      >
        <Canvas
          aria-label={`3D view from seat ${metrics.seat.label}`}
          gl={{ preserveDrawingBuffer: true }}
          role="img"
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
  const rearZ =
    auditorium.geometry.frontClearanceMeters +
    (auditorium.rows.length - 1) * auditorium.geometry.rowSpacingMeters +
    2.5;
  const roomWidth = auditorium.screen.widthMeters + 6;

  return (
    <>
      <color attach="background" args={["#18181b"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[0, 6, 7]} intensity={1.8} />
      <FixedSeatCamera position={metrics.viewingPosition} target={target} />

      <mesh position={[0, -0.04, rearZ / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, rearZ]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>

      <mesh
        position={[
          0,
          auditorium.screen.bottomHeightMeters + auditorium.screen.heightMeters / 2,
          -0.08,
        ]}
      >
        <planeGeometry
          args={[
            auditorium.screen.widthMeters,
            auditorium.screen.heightMeters,
          ]}
        />
        <meshStandardMaterial
          color="#fafafa"
          emissive="#ffffff"
          emissiveIntensity={0.18}
          side={DoubleSide}
        />
      </mesh>

      <mesh
        position={[
          0,
          auditorium.screen.bottomHeightMeters +
            auditorium.screen.heightMeters +
            0.15,
          -0.15,
        ]}
      >
        <boxGeometry args={[auditorium.screen.widthMeters + 0.4, 0.18, 0.12]} />
        <meshStandardMaterial color="#52525b" roughness={0.6} />
      </mesh>

      {seats.map((seat) => {
        const isSelected = seat.label === metrics.seat.label;
        const seatCenter = getSeatCenter(auditorium, seat);

        return (
          <mesh
            key={seat.label}
            position={[seatCenter.x, seatCenter.y, seatCenter.z]}
          >
            <boxGeometry
              args={isSelected ? [0.46, 0.26, 0.34] : [0.34, 0.18, 0.26]}
            />
            <meshStandardMaterial
              color={
                isSelected
                  ? "#22c55e"
                  : seat.availability === "available"
                    ? "#71717a"
                    : "#3f3f46"
              }
              roughness={0.7}
            />
          </mesh>
        );
      })}
    </>
  );
}

function FixedSeatCamera({
  position,
  target,
}: {
  position: Position3D;
  target: Position3D;
}) {
  return (
    <PerspectiveCamera
      makeDefault
      fov={50}
      near={0.1}
      far={100}
      position={[position.x, position.y, position.z]}
      onUpdate={(camera) => {
        camera.lookAt(target.x, target.y, target.z);
        camera.updateProjectionMatrix();
      }}
    />
  );
}
