import { characterColor, characterIcon } from "@/config";
import { cn } from "@/lib/cn";
import { Character } from "@/types/Character";
import { FC, HTMLAttributes } from "react";

export interface CharacterBadgeProps extends HTMLAttributes<HTMLDivElement> {
  character: Character;
}
export const CharacterBadge: FC<CharacterBadgeProps> = ({
  className,
  character,
  style,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "relative flex p-2 items-center justify-center size-[40px] bg-muted rounded-full border border-background",
        className,
      )}
      style={{ background: characterColor[character], ...style }}
    >
      <img src={characterIcon[character]} className="w-full" />
      {children}
    </div>
  );
};
