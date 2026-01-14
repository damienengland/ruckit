// components/player/player-avatar.tsx
import { IconShirtFilled } from "@tabler/icons-react";

export function PlayerAvatar({
  name,
  number,
}: {
  name: string;
  number: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <IconShirtFilled className="h-12 w-12 opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[12px] font-extrabold leading-none text-white">
            {number}
          </div>
        </div>
      </div>

      <div className="mt-1 max-w-[110px] truncate text-[11px] font-medium opacity-80">
        {name}
      </div>
    </div>
  );
}