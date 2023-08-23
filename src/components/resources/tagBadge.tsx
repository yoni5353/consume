import { Badge } from "../ui/badge";

export function TagBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge className="h-min px-[5px] py-0" style={{ backgroundColor: color }}>
      {name}
    </Badge>
  );
}
