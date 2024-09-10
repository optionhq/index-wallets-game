import { characterIcon } from "@/config";
import { cn } from "@/lib/cn";
import { Character } from "@/types/Character";
import { FC, HTMLAttributes } from "react";

export interface CharacterIcon extends HTMLAttributes<HTMLSpanElement> {
  character: Character;
  iconClassName?: string;
}
export const CharacterIcon: FC<CharacterIcon> = ({
  className,
  iconClassName,
  character,
  children,
  ...props
}) => {
  return (
    <span
      {...props}
      className={cn(
        "relative flex size-[40px] items-center justify-center rounded-full border-2 border-border bg-background p-2",
        className,
      )}

      // style={{ background: characterColor[character], ...style }}
    >
      <span
        className={cn("relative block size-full bg-current", iconClassName)}
        style={{
          maskImage: `url(${characterIcon[character]})`,
          WebkitMaskImage: `url(${characterIcon[character]})`,
          maskSize: "100% 100%",
        }}
      />
      {children}
    </span>
  );
};
