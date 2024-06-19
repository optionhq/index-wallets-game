import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
} from "@tanstack/react-router";
import { CopyIcon, EllipsisIcon, LogOutIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_game-layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const { gameId } = Route.useParams<{ gameId: string }>();
  const { href } = useLocation();
  return (
    <>
      {/* <p className="fixed left-2 top-2 text-muted-foreground/50 font-bold tracking-widest">
        {gameId}
      </p> */}
      <DropdownMenu>
        <DropdownMenuTrigger className="fixed top-4 right-4">
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

      <Outlet />
    </>
  );
}
