import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ChevronLeftIcon } from "lucide-react";
import { FC } from "react";

export interface BackButtonProps extends ButtonProps {}

export const BackButton: FC<BackButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      variant="link"
      className={cn(
        "absolute left-0 p-0 w-fit top-0 text-md no-underline text-primary",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="inline-block shrink-0" /> Back
    </Button>
  );
};
