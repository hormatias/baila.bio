"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Block } from "@/lib/types"

interface BlockEditorProps {
  block: Block
  onUpdateContent: (content: any) => void
}

export default function BlockEditor({ block, onUpdateContent }: BlockEditorProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateContent({ ...block.content, text: e.target.value })
  }

  const handleSelectChange = (field: string, value: string) => {
    onUpdateContent({ ...block.content, [field]: value })
  }

  const handleInputChange = (field: string, value: string) => {
    onUpdateContent({ ...block.content, [field]: value })
  }

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`heading-text-${block.id}`}>Heading Text</Label>
            <Input id={`heading-text-${block.id}`} value={block.content.text} onChange={handleTextChange} />
          </div>
          <div>
            <Label htmlFor={`heading-size-${block.id}`}>Size</Label>
            <Select value={block.content.size} onValueChange={(value) => handleSelectChange("size", value)}>
              <SelectTrigger id={`heading-size-${block.id}`}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="small">Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case "text":
      return (
        <div>
          <Label htmlFor={`text-content-${block.id}`}>Text Content</Label>
          <Textarea id={`text-content-${block.id}`} value={block.content.text} onChange={handleTextChange} rows={3} />
        </div>
      )

    case "image":
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`image-src-${block.id}`}>Image URL</Label>
            <Input
              id={`image-src-${block.id}`}
              value={block.content.src}
              onChange={(e) => handleInputChange("src", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label htmlFor={`image-alt-${block.id}`}>Alt Text</Label>
            <Input
              id={`image-alt-${block.id}`}
              value={block.content.alt}
              onChange={(e) => handleInputChange("alt", e.target.value)}
              placeholder="Image description"
            />
          </div>
        </div>
      )

    case "button":
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`button-text-${block.id}`}>Button Text</Label>
            <Input id={`button-text-${block.id}`} value={block.content.text} onChange={handleTextChange} />
          </div>
          <div>
            <Label htmlFor={`button-url-${block.id}`}>URL</Label>
            <Input
              id={`button-url-${block.id}`}
              value={block.content.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor={`button-style-${block.id}`}>Style</Label>
            <Select value={block.content.style} onValueChange={(value) => handleSelectChange("style", value)}>
              <SelectTrigger id={`button-style-${block.id}`}>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case "divider":
      return (
        <div>
          <Label htmlFor={`divider-style-${block.id}`}>Style</Label>
          <Select value={block.content.style} onValueChange={(value) => handleSelectChange("style", value)}>
            <SelectTrigger id={`divider-style-${block.id}`}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

    case "spacer":
      return (
        <div>
          <Label htmlFor={`spacer-height-${block.id}`}>Height</Label>
          <Select value={block.content.height} onValueChange={(value) => handleSelectChange("height", value)}>
            <SelectTrigger id={`spacer-height-${block.id}`}>
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

    default:
      return <div>Unknown block type</div>
  }
}

