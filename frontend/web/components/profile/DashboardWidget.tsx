/*
 * A common component for the dashboard widgets on /profile
 *
 * Author: @codyduong
 * Revisions:
 * - 2025-02-27 - initial creation
 */

import type React from "react";
import { memo } from "react";
import { Card, Title, ActionIcon } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export const DashboardWidget = memo(function DashboardWidget({
  id,
  title,
  children,
}: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={`h-full ${isDragging ? "shadow-lg" : ""}`}
      >
        <div className="flex justify-between items-start mb-2">
          <Title order={4}>{title}</Title>
          <ActionIcon
            variant="subtle"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <IconGripVertical size={16} />
          </ActionIcon>
        </div>
        <div className="h-[200px] overflow-y-auto">{children}</div>
      </Card>
    </div>
  );
});
