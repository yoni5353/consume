import { type ProgressDisplayProps } from "./progressNode";
import png0 from "../../../public/images/progress/5steps/5steps-0.png";
import png1 from "../../../public/images/progress/5steps/5steps-1.png";
import png2 from "../../../public/images/progress/5steps/5steps-2.png";
import png3 from "../../../public/images/progress/5steps/5steps-3.png";
import png4 from "../../../public/images/progress/5steps/5steps-4.png";
import png5 from "../../../public/images/progress/5steps/5steps-5.png";

import Image from "next/image";
import { Button } from "../ui/button";

const images = [png0, png1, png2, png3, png4, png5];

export function StepsProgress({
  value,
  isHovering,
  onValueCommit,
}: ProgressDisplayProps) {
  const imageSrc = images[value] ?? png0;

  return (
    <>
      <div className="relative h-full">
        {isHovering && (
          <div className="absolute flex w-full flex-row opacity-40">
            <Button
              className="h-6 w-full"
              variant="ghost"
              onClick={() => value > 0 && onValueCommit(value - 1)}
            >
              -
            </Button>
            <Button
              className="h-6 w-full"
              variant="ghost"
              onClick={() => value < 5 && onValueCommit(value + 1)}
            >
              +
            </Button>
          </div>
        )}
        <Image src={imageSrc} alt="item progress" width={100} />
      </div>
    </>
  );
}
