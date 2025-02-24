import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Search } from "lucide-react";
import React, { useMemo, useRef, useState } from 'react';

interface Emoji {
  symbol: string;
  name: string;
  keywords: string[];
}

interface EmojiPickerProps {
  children: React.ReactNode;
  onEmojiSelect?: (emoji: string) => void;
}

const emojis: Emoji[] = [
  // Vacation & Travel
  { symbol: "🏖️", name: "Beach", keywords: ["vacation", "summer", "holiday", "beach"] },
  { symbol: "🌴", name: "Palm Tree", keywords: ["vacation", "tropical", "beach"] },
  { symbol: "✈️", name: "Airplane", keywords: ["travel", "vacation", "flight"] },
  { symbol: "🏝️", name: "Desert Island", keywords: ["vacation", "tropical", "holiday"] },
  { symbol: "🏕️", name: "Camping", keywords: ["outdoor", "vacation", "nature"] },
  { symbol: "⛰️", name: "Mountain", keywords: ["hiking", "outdoor", "adventure"] },
  { symbol: "🚗", name: "Car", keywords: ["travel", "road trip", "driving"] },
  { symbol: "🏨", name: "Hotel", keywords: ["accommodation", "stay", "vacation"] },
  { symbol: "🎡", name: "Theme Park", keywords: ["fun", "vacation", "entertainment"] },
  { symbol: "🏰", name: "Castle", keywords: ["sightseeing", "tourism", "vacation"] },

  // Health & Medical
  { symbol: "🤒", name: "Sick Face", keywords: ["sick", "illness", "medical"] },
  { symbol: "🤧", name: "Sneezing", keywords: ["sick", "cold", "allergy"] },
  { symbol: "🤢", name: "Nauseous", keywords: ["sick", "illness", "unwell"] },
  { symbol: "🏥", name: "Hospital", keywords: ["medical", "health", "emergency"] },
  { symbol: "💊", name: "Medicine", keywords: ["health", "medical", "treatment"] },
  { symbol: "🩺", name: "Stethoscope", keywords: ["doctor", "medical", "health"] },
  { symbol: "🦠", name: "Virus", keywords: ["sick", "covid", "illness"] },
  { symbol: "🤕", name: "Injury", keywords: ["hurt", "medical", "bandage"] },

  // Family & Personal
  { symbol: "👶", name: "Baby", keywords: ["parental", "family", "newborn"] },
  { symbol: "👨‍👩‍👦", name: "Family", keywords: ["parental", "family", "personal"] },
  { symbol: "💑", name: "Couple", keywords: ["marriage", "relationship", "personal"] },
  { symbol: "👰", name: "Wedding", keywords: ["marriage", "celebration", "personal"] },
  { symbol: "🤰", name: "Pregnant", keywords: ["maternity", "parental", "family"] },
  { symbol: "👨‍👩‍👧‍👦", name: "Extended Family", keywords: ["family", "personal", "home"] },

  // Education & Work
  { symbol: "🎓", name: "Graduation", keywords: ["education", "study", "school"] },
  { symbol: "📚", name: "Books", keywords: ["study", "education", "learning"] },
  { symbol: "👨‍🏫", name: "Teacher", keywords: ["education", "training", "learning"] },
  { symbol: "💻", name: "Laptop", keywords: ["work", "remote", "computer"] },
  { symbol: "🏡", name: "Home Office", keywords: ["remote", "work", "home"] },
  { symbol: "📝", name: "Study", keywords: ["education", "exam", "learning"] },

  // Activities & Hobbies
  { symbol: "⚽", name: "Sports", keywords: ["activity", "exercise", "game"] },
  { symbol: "🎨", name: "Art", keywords: ["creative", "hobby", "personal"] },
  { symbol: "🎭", name: "Performance", keywords: ["art", "entertainment", "culture"] },
  { symbol: "🎮", name: "Gaming", keywords: ["entertainment", "hobby", "recreation"] },
  { symbol: "🎪", name: "Circus", keywords: ["entertainment", "show", "performance"] },
  { symbol: "🎯", name: "Target", keywords: ["goal", "aim", "focus"] },

  // Other
  { symbol: "🧘", name: "Meditation", keywords: ["wellness", "mental health", "relaxation"] },
  { symbol: "🏆", name: "Achievement", keywords: ["success", "award", "winning"] },
  { symbol: "🎉", name: "Celebration", keywords: ["party", "event", "special"] },
  { symbol: "⭐", name: "Special", keywords: ["star", "important", "priority"] },
  { symbol: "🔋", name: "Energy", keywords: ["power", "recharge", "break"] }
];

export function EmojiPicker({ children, onEmojiSelect }: EmojiPickerProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredEmojis = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return emojis;

    return emojis.filter(emoji =>
      emoji.name.toLowerCase().includes(query) ||
      emoji.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleEmojiSelect = (emoji: Emoji): void => {
    setSelectedEmoji(emoji);
    onEmojiSelect?.(emoji.symbol);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 w-[var(--trigger-width)] max-w-[250px]"
        style={{ '--trigger-width': triggerRef.current ? `${triggerRef.current.offsetWidth}px` : 'auto' } as React.CSSProperties}
      >
        <div className="p-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div
            className="grid grid-cols-6 gap-2 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {filteredEmojis.map((emoji) => (
              <Button
                key={emoji.name}
                variant="ghost"
                className="h-8 text-lg hover:bg-slate-100 transition-colors"
                onClick={() => handleEmojiSelect(emoji)}
                title={emoji.name}
                type="button"
              >
                {emoji.symbol}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};