import { playerAtom } from "@/components/Game.state";
import { cn } from "@/lib/cn";
import { useAtomValue } from "jotai";
import { FC, HTMLAttributes } from "react";

export interface PlayerTokenProps extends HTMLAttributes<HTMLDivElement> {
  playerId: string;
}
export const PlayerToken: FC<PlayerTokenProps> = ({
  className,
  playerId,
  ...props
}) => {
  const player = useAtomValue(playerAtom(playerId));

  return (
    <div
      {...props}
      className={cn(
        "relative flex items-center justify-center size-[40px] bg-muted rounded-full",
        className,
      )}
    />
  );
};
