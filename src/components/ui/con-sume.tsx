export function Consume({ className }: { className?: string }) {
  return (
    <>
      <span
        className={
          "bg-gradient-to-br from-blue-300 to-[hsl(202,62%,80%)] bg-clip-text font-extrabold text-transparent " +
          className
        }
      >
        CONSUME
      </span>
    </>
  );
}
