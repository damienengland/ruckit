import { cn } from "@/lib/utils";

type FieldPostProps = {
  className?: string;
  postColor?: string;
  padColor?: string;
};

export function FieldPost({
  className,
  postColor = "#FFFFFF",
  padColor = "#38bdf8",
}: FieldPostProps) {
  return (
    <svg
      viewBox="0 0 160 200"
      className={cn(
        "w-24 h-44 drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]",
        className
      )}
      role="img"
      aria-label="Rugby union goal post at the try line"
    >
      <rect x="32" y="24" width="12" height="145" rx="5" fill={postColor} />
      <rect x="116" y="24" width="12" height="145" rx="5" fill={postColor} />
      <rect x="42" y="82" width="76" height="10" rx="4" fill={postColor} />
      <rect x="28" y="144" width="18" height="26" rx="5" fill={padColor} />
      <rect x="114" y="144" width="18" height="26" rx="5" fill={padColor} />
    </svg>
  );
}
