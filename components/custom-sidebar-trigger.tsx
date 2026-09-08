import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CustomSidebarTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger aria-label="Toggle navigation sidebar" />
      </TooltipTrigger>
      <TooltipContent side="right">
        Toggle navigation sidebar
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}
