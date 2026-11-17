"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Item {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const GROUPS: Item[][] = [
  [
    {
      icon: BoldIcon,
      isActive: (e) => e.isActive("bold"),
      label: "Bold",
      run: (e) => e.chain().focus().toggleBold().run(),
      shortcut: "Mod+B",
    },
    {
      icon: ItalicIcon,
      isActive: (e) => e.isActive("italic"),
      label: "Italic",
      run: (e) => e.chain().focus().toggleItalic().run(),
      shortcut: "Mod+I",
    },
    {
      icon: UnderlineIcon,
      isActive: (e) => e.isActive("underline"),
      label: "Underline",
      run: (e) => e.chain().focus().toggleUnderline().run(),
      shortcut: "Mod+U",
    },
  ],
  [1, 2, 3].map((level) => ({
    icon: [Heading1Icon, Heading2Icon, Heading3Icon][level - 1],
    isActive: (e: Editor) => e.isActive("heading", { level }),
    label: `Heading ${level}`,
    run: (e: Editor) =>
      e
        .chain()
        .focus()
        .toggleHeading({ level: level as 1 | 2 | 3 })
        .run(),
    shortcut: `Mod+Alt+${level}`,
  })),
  [
    {
      icon: ListIcon,
      isActive: (e) => e.isActive("bulletList"),
      label: "Bulleted list",
      run: (e) => e.chain().focus().toggleBulletList().run(),
      shortcut: "Mod+Shift+8",
    },
    {
      icon: ListOrderedIcon,
      isActive: (e) => e.isActive("orderedList"),
      label: "Numbered list",
      run: (e) => e.chain().focus().toggleOrderedList().run(),
      shortcut: "Mod+Shift+7",
    },
  ],
];

const ITEMS = GROUPS.flat();

/** Index into ITEMS of each group's first item. */
const GROUP_OFFSETS = GROUPS.map((_, g) =>
  GROUPS.slice(0, g).reduce((sum, group) => sum + group.length, 0)
);

const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/u.test(navigator.platform);

const formatShortcut = (shortcut: string) =>
  isMac()
    ? shortcut
        .replace("Mod", "⌘")
        .replace("Alt", "⌥")
        .replace("Shift", "⇧")
        .replaceAll("+", "")
    : shortcut.replace("Mod", "Ctrl");

export const Toolbar = ({ editor }: { editor: Editor }) => {
  // Re-render only when the active formatting changes.
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ITEMS.map((item) => item.isActive(e)),
  });

  return (
    <div
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-1"
      role="toolbar"
    >
      {GROUPS.map((group, groupIndex) => (
        <div className="flex items-center gap-1" key={group[0].label}>
          {groupIndex > 0 ? (
            <Separator className="mx-1 h-5" orientation="vertical" />
          ) : null}
          {group.map((item, itemIndex) => {
            const isOn = active[GROUP_OFFSETS[groupIndex] + itemIndex];
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger
                  aria-label={item.label}
                  aria-pressed={isOn}
                  className={cn(
                    "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring inline-flex size-8 items-center justify-center rounded-md transition-colors focus-visible:outline-2",
                    isOn && "bg-muted text-foreground"
                  )}
                  onClick={() => item.run(editor)}
                  // Keep the text selection while clicking the toolbar.
                  onMouseDown={(event) => event.preventDefault()}
                  type="button"
                >
                  <Icon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  {item.label}
                  <span className="opacity-60">
                    {formatShortcut(item.shortcut)}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
};
