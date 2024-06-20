import { gameIdAtom } from "@/components/Game.state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import { Link, useLocation } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { CopyIcon, EllipsisIcon, LogOutIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

export const TripleDotMenu = () => {
  const gameId = useAtomValue(gameIdAtom);
  const { href } = useLocation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(gameId);
            toast("Copied to clipboard!", {
              duration: 1500,
              position: "top-right",
            });
          }}
        >
          <span>
            Game code: <strong>{gameId}</strong>
          </span>
          <CopyIcon className="ml-2 size-3" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Exit game</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(!navigator.share && "hidden")}
          onClick={() => {
            navigator.share({
              text: `Join my Index Wallets game: ${gameId}`,
              url: href,
            });
          }}
        >
          <UserPlusIcon className="mr-2 h-4 w-4" />
          <span>Invite players</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
