import type { ReactNode } from "react";
import { FieldPost } from "@/components/field-post";
import { Logo } from "./logo";

export function FieldHalf({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full bg-red-700 overflow-hidden">
      {/* Padding wrapper – DOES NOT increase screen height */}
      <div className="relative h-full w-full p-10 box-border">
        {/* Field container shrinks to fit padding */}
        <div className="relative h-full w-full bg-white/20">
          {/* Rugby Field Background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Deadball line */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "8px",
                background: "white",
              }}
            />

            {/* Branding text */}
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: 0,
                right: 0,
                height: "calc(13% - 8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
              className="text-white/50 text-3xl tracking-widest"
            >
              <Logo size="lg" className="text-white/50"/>
            </div>

            {/* Try line */}
            <div
              style={{
                position: "absolute",
                bottom: "13%",
                left: 0,
                right: 0,
                height: "8px",
                background: "white",
              }}
            />

            {/* 22m line */}
            <div
              style={{
                position: "absolute",
                bottom: "50%",
                left: 0,
                right: 0,
                height: "4px",
                background: "white",
              }}
            />

            {/* 22 label */}
            <div
              style={{
                position: "absolute",
                bottom: "50%",
                left: "26px",
                transform: "translateY(50%)",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <span className="bg-red-700 py-2">
                <span className="bg-white/20 p-2">22</span>
              </span>
            </div>

            {/* 40m line */}
            <div
              style={{
                position: "absolute",
                bottom: "82%",
                left: 0,
                right: 0,
                height: "2px",
                background:
                  "repeating-linear-gradient(to right, white 0px, white 8px, transparent 8px, transparent 16px)",
              }}
            />

            {/* 40 label */}
            <div
              style={{
                position: "absolute",
                bottom: "82%",
                left: "26px",
                transform: "translateY(50%)",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <span className="bg-red-700 py-2">
                <span className="bg-white/20 p-2">40</span>
              </span>
            </div>

            {/* 5m line */}
            <div
              style={{
                position: "absolute",
                bottom: "24%",
                left: 0,
                right: 0,
                height: "2px",
                background:
                  "repeating-linear-gradient(to right, white 0px, white 8px, transparent 8px, transparent 16px)",
              }}
            />

            {/* 5 label */}
            <div
              style={{
                position: "absolute",
                bottom: "24%",
                left: "26px",
                transform: "translateY(50%)",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <span className="bg-red-700 py-2">
                <span className="bg-white/20 p-2">05</span>
              </span>
            </div>

            {/* Halfway line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "8px",
                background: "white",
              }}
            />

            {/* Side lines */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "8px",
                background: "white",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: "8px",
                background: "white",
              }}
            />

            {/* Goal posts */}
            <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2">
              <FieldPost />
            </div>
          </div>

          {/* Children overlay (inside padded field) */}
          <div className="absolute inset-0 pointer-events-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}