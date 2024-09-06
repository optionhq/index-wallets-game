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
        "relative flex p-2 items-center justify-center size-[40px] bg-background  rounded-full border-2 border-border",
        className,
      )}

      // style={{ background: characterColor[character], ...style }}
    >
      <span
        className={cn("block relative size-full bg-current", iconClassName)}
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
