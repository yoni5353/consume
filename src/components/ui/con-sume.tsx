import Link from "next/link";

export function Consume({ className }: { className?: string }) {
  return (
    <>
      <Link
        href="/"
        className={
          "bg-gradient-to-br from-blue-300 to-[hsl(202,62%,80%)] bg-clip-text font-extrabold text-transparent " +
          className
        }
      >
        CONSUME
      </Link>
    </>
  );
}
