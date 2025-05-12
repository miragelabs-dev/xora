import EmojiPickerReact, { Theme } from 'emoji-picker-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  children: React.ReactNode
}

export const EmojiPicker = ({ onEmojiSelect, children }: EmojiPickerProps) => {
  const customStyles = {
    "--epr-picker-border-radius": "calc(var(--radius))",
    "--epr-hover-bg-color": "hsl(var(--accent))",
    "--epr-bg-color": "hsl(var(--popover))",
    "--epr-category-label-bg-color": "hsl(var(--popover))",
    "--epr-text-color": "hsl(var(--popover-foreground))",
    "--epr-category-icon-active-color": "hsl(var(--primary))",
    "--epr-search-border-color": "hsl(var(--border))",
    "--epr-search-background-color": "hsl(var(--background))",
    "--epr-search-text-color": "hsl(var(--foreground))",
    "--epr-search-placeholder-color": "hsl(var(--muted-foreground))",
    "--epr-search-input-bg-color": "hsl(var(--secondary))",
    '--epr-search-input-bg-color-active': 'hsl(var(--background))',


  } as React.CSSProperties;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-full border-none p-0 shadow-none">
        <EmojiPickerReact
          style={customStyles}
          theme={Theme.DARK}
          onEmojiClick={(data) => onEmojiSelect(data.emoji)}
          skinTonesDisabled={true}
        />
      </PopoverContent>
    </Popover>
  )
}
