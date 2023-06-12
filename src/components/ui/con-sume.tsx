import Link from "next/link";

export function Consume({ className }: { className?: string }) {
  return (
    <div
      className={
        "bg-gradient-to-br from-[#3b82f6] to-[#76b9ce] bg-clip-text font-extrabold text-transparent " +
        className
      }
    >
      CONSUME
    </div>
  );
}
