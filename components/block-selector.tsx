"use client"

import { Button } from "@/components/ui/button"
import { Type, Image, Square, SeparatorHorizontal, Heading, AlignJustify } from "lucide-react"

interface BlockSelectorProps {
  onAddBlock: (blockType: string) => void
}

export default function BlockSelector({ onAddBlock }: BlockSelectorProps) {
  const blockTypes = [
    { type: "heading", icon: <Heading className="h-4 w-4 mr-2" />, label: "Heading" },
    { type: "text", icon: <AlignJustify className="h-4 w-4 mr-2" />, label: "Text" },
    { type: "image", icon: <Image className="h-4 w-4 mr-2" />, label: "Image" },
    { type: "button", icon: <Square className="h-4 w-4 mr-2" />, label: "Button" },
    { type: "divider", icon: <SeparatorHorizontal className="h-4 w-4 mr-2" />, label: "Divider" },
    { type: "spacer", icon: <Type className="h-4 w-4 mr-2" />, label: "Spacer" },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Add Content Block</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {blockTypes.map((block) => (
          <Button key={block.type} variant="outline" className="justify-start" onClick={() => onAddBlock(block.type)}>
            {block.icon}
            {block.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

