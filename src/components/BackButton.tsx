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
        "text-md absolute left-0 top-0 w-fit p-0 text-primary no-underline",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="inline-block shrink-0" /> Back
    </Button>
  );
};
