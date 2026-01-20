"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

type JoystickProps = {
  /** called with normalized values in range [-1, 1] */
  onChange: (v: Vec2) => void;

  /** pixel size of the joystick base */
  size?: number;

  /** deadzone radius (0..1) where output becomes 0 */
  deadzone?: number;

  /** smoothing factor (0..1). Higher = smoother but more lag */
  smoothing?: number;

  /** show debug text under joystick */
  debug?: boolean;

  /** disable input */
  disabled?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function applyDeadzone(v: Vec2, deadzone: number): Vec2 {
  const mag = Math.hypot(v.x, v.y);
  if (mag <= deadzone) return { x: 0, y: 0 };

  // re-scale so movement starts at 0 right outside the deadzone
  const scaled = (mag - deadzone) / (1 - deadzone);
  const nx = (v.x / mag) * scaled;
  const ny = (v.y / mag) * scaled;
  return { x: clamp(nx, -1, 1), y: clamp(ny, -1, 1) };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Joystick({
  onChange,
  size = 160,
  deadzone = 0.12,
  smoothing = 0.2,
  debug = false,
  disabled = false,
}: JoystickProps) {
  const radius = size / 2;
  const knobRadius = Math.round(size * 0.22);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const [dragging, setDragging] = useState(false);
  const [knobPx, setKnobPx] = useState<Vec2>({ x: 0, y: 0 }); // knob offset in px

  // internal refs so we can smooth without re-rendering constantly
  const targetRef = useRef<Vec2>({ x: 0, y: 0 }); // [-1..1] before smoothing
  const smoothRef = useRef<Vec2>({ x: 0, y: 0 }); // [-1..1] after smoothing

  const maxKnobDistance = useMemo(() => radius - knobRadius - 6, [radius, knobRadius]);

  useEffect(() => {
    if (!disabled) return;
    setKnobPx({ x: 0, y: 0 });
    targetRef.current = { x: 0, y: 0 };
    smoothRef.current = { x: 0, y: 0 };
  }, [disabled]);

  // Emit smoothed values at animation-frame pace
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const t = clamp(smoothing, 0, 0.95);

      // smooth towards target
      const sx = lerp(smoothRef.current.x, targetRef.current.x, 1 - t);
      const sy = lerp(smoothRef.current.y, targetRef.current.y, 1 - t);

      smoothRef.current = { x: sx, y: sy };

      // apply deadzone to smoothed output
      const out = applyDeadzone(smoothRef.current, deadzone);
      onChange(out);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [deadzone, onChange, smoothing]);

  const setFromPointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // limit to circle radius
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxKnobDistance);
    const angle = Math.atan2(dy, dx);

    const px = clampedDist * Math.cos(angle);
    const py = clampedDist * Math.sin(angle);

    setKnobPx({ x: px, y: py });

    // normalize to [-1..1]
    const nx = clamp(px / maxKnobDistance, -1, 1);
    const ny = clamp(py / maxKnobDistance, -1, 1);

    targetRef.current = { x: nx, y: ny };
  };

  const reset = () => {
    setKnobPx({ x: 0, y: 0 });
    targetRef.current = { x: 0, y: 0 };
    // don't snap smoothRef instantly; smoothing will settle naturally
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className={`touch-none select-none rounded-full border bg-white/5 backdrop-blur ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          if (disabled) return;
          // lock to one pointer (important for mobile)
          pointerIdRef.current = e.pointerId;
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

          setDragging(true);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (disabled) return;
          if (!dragging) return;
          if (pointerIdRef.current !== e.pointerId) return;
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (disabled) return;
          if (pointerIdRef.current !== e.pointerId) return;
          setDragging(false);
          pointerIdRef.current = null;
          reset();
        }}
        onPointerCancel={() => {
          if (disabled) return;
          setDragging(false);
          pointerIdRef.current = null;
          reset();
        }}
      >
        {/* inner ring */}
        <div className="absolute inset-6 rounded-full border border-white/10" />

        {/* knob */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full border bg-white/20 backdrop-blur"
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            transform: `translate(calc(-50% + ${knobPx.x}px), calc(-50% + ${knobPx.y}px))`,
          }}
        />
      </div>

      {debug ? (
        <div className="text-xs opacity-70">
          target: {targetRef.current.x.toFixed(2)}, {targetRef.current.y.toFixed(2)}
        </div>
      ) : null}
    </div>
  );
}
