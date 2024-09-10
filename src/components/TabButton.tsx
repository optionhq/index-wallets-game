import { TabsTrigger } from "@/components/ui/tabs";
import { TabsTriggerProps } from "@radix-ui/react-tabs";
import { FC } from "react";

export interface TabButtonProps extends TabsTriggerProps {}

export const TabButton: FC<TabButtonProps> = ({ ...props }) => (
  <TabsTrigger {...props} className="flex h-full flex-grow gap-2" />
);
