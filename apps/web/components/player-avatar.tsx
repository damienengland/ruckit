import { IconShirtFilled } from "@tabler/icons-react";

type PlayerAvatarProps = {
  playerId: string;
  number?: number;     // defaults to 4
  size?: number;       // shirt icon size in px
  className?: string;
};

export function PlayerAvatar({
  playerId,
  number = 4,
  size = 44,
  className,
}: PlayerAvatarProps) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <div className="relative">
        <IconShirtFilled size={size} />

        {/* Number overlay */}
        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2
                     rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-white
                     backdrop-blur"
        >
          {number}
        </div>
      </div>

      {/* Player ID */}
      <div className="mt-1 max-w-[120px] truncate text-[11px] font-semibold text-white/90">
        {playerId}
      </div>
    </div>
  );
}