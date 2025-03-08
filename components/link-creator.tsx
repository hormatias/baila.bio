"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Smartphone, ArrowUp, ArrowDown, Trash, LinkIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockSelector from "@/components/block-selector"
import BlockEditor from "@/components/block-editor"
import type { Block } from "@/lib/types"
import { supabase } from "@/lib/supabase"

// Define a type for JSON-compatible values
type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export default function LinkCreator() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugError, setSlugError] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [backgroundVideo, setBackgroundVideo] = useState("")

  const getBaseUrl = () => {
    return typeof window !== "undefined" ? window.location.origin : ""
  }

  const handleAddBlock = (blockType: string) => {
    const newBlock: Block = {
      id: uuidv4(),
      type: blockType,
      content: getDefaultContentForType(blockType),
      position: blocks.length,
    }

    setBlocks([...blocks, newBlock])
  }

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId))
  }

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blocks.findIndex((block) => block.id === blockId)
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) {
      return
    }

    const newBlocks = [...blocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    // Swap blocks
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]

    // Update positions
    newBlocks.forEach((block, idx) => {
      block.position = idx
    })

    setBlocks(newBlocks)
  }

  const handleUpdateBlockContent = (blockId: string, content: any) => {
    setBlocks(blocks.map((block) => (block.id === blockId ? { ...block, content } : block)))
  }

  const getDefaultContentForType = (type: string): any => {
    switch (type) {
      case "heading":
        return { text: "New Heading", size: "large" }
      case "text":
        return { text: "Add your text here" }
      case "image":
        return { src: "/placeholder.svg?height=200&width=400", alt: "Image description" }
      case "button":
        return { text: "Click Me", url: "#", style: "primary" }
      case "divider":
        return { style: "solid" }
      case "spacer":
        return { height: "medium" }
      default:
        return {}
    }
  }

  const generateHtmlFromBlocks = (): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            const headingSize = block.content.size === "large" ? "h1" : block.content.size === "medium" ? "h2" : "h3"
            const headingClass =
              block.content.size === "large"
                ? "text-3xl font-bold mb-4"
                : block.content.size === "medium"
                  ? "text-2xl font-semibold mb-3"
                  : "text-xl font-medium mb-2"
            return `<${headingSize} class="${headingClass}">${block.content.text}</${headingSize}>`

          case "text":
            return `<p class="mb-4 text-gray-700">${block.content.text}</p>`

          case "image":
            return `<img src="${block.content.src}" alt="${block.content.alt}" class="w-full rounded-lg mb-4" />`

          case "button":
            const btnClass =
              block.content.style === "primary"
                ? "inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg text-center w-full mb-4 hover:bg-blue-700"
                : "inline-block px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg text-center w-full mb-4 hover:bg-gray-300"
            return `<a href="${block.content.url}" class="${btnClass}">${block.content.text}</a>`

          case "divider":
            const dividerStyle =
              block.content.style === "solid"
                ? "border-t-2"
                : block.content.style === "dashed"
                  ? "border-t-2 border-dashed"
                  : "border-t-2 border-dotted"
            return `<hr class="${dividerStyle} border-gray-200 my-6" />`

          case "spacer":
            const spacerHeight =
              block.content.height === "small" ? "h-4" : block.content.height === "medium" ? "h-8" : "h-16"
            return `<div class="${spacerHeight}"></div>`

          default:
            return ""
        }
      })
      .join("\n")
  }

  // Helper function to sanitize content for JSONB
  const sanitizeContentForJsonb = (content: any): JsonValue => {
    // Convert any undefined values to null
    if (content === undefined) return null

    // Handle objects recursively
    if (content && typeof content === "object" && !Array.isArray(content)) {
      const sanitized: Record<string, JsonValue> = {}
      for (const key in content) {
        sanitized[key] = sanitizeContentForJsonb(content[key])
      }
      return sanitized
    }

    // Handle arrays recursively
    if (Array.isArray(content)) {
      return content.map((item) => sanitizeContentForJsonb(item))
    }

    // Return primitive values as is
    return content
  }

  // Generate a slug from the title
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one
      .trim()
  }

  // Check if a slug is already in use
  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck) return

    setIsCheckingSlug(true)
    setSlugError(null)

    try {
      const { data, error } = await supabase.from("links").select("id").eq("slug", slugToCheck).single()

      if (error && error.code === "PGRST116") {
        // No rows returned, slug is available
        return true
      } else if (data) {
        // Slug already exists
        setSlugError("This URL is already taken. Please choose another.")
        return false
      }
    } catch (error) {
      console.error("Error checking slug:", error)
    } finally {
      setIsCheckingSlug(false)
    }
  }

  // Handle slug change
  const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^\w-]/g, "") // Only allow letters, numbers, and hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one

    setSlug(newSlug)

    if (newSlug) {
      await checkSlugAvailability(newSlug)
    } else {
      setSlugError(null)
    }
  }

  // Generate slug from title when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    if (!slug && newTitle) {
      const generatedSlug = generateSlugFromTitle(newTitle)
      setSlug(generatedSlug)
      checkSlugAvailability(generatedSlug)
    }
  }

  // Generate HTML with background video if provided
  const generateFullHtml = () => {
    const videoBackground = backgroundVideo
      ? `
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
        <video autoplay muted loop playsinline class="absolute min-w-full min-h-full object-cover">
          <source src="${backgroundVideo}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>
      </div>
    `
      : ""

    const bgColorStyle = backgroundVideo ? "" : `background-color: ${backgroundColor};`

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body {
            ${bgColorStyle}
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .content-container {
            flex: 1;
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
            padding: 1rem;
            position: relative;
            z-index: 1;
            background-color: ${backgroundVideo ? "rgba(255, 255, 255, 0.9)" : "transparent"};
            border-radius: ${backgroundVideo ? "0.5rem" : "0"};
            box-shadow: ${backgroundVideo ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none"};
          }
          @media (max-width: 640px) {
            .content-container {
              padding: 1rem;
              max-width: 100%;
              border-radius: 0;
              box-shadow: none;
              background-color: ${backgroundVideo ? "rgba(255, 255, 255, 0.9)" : "transparent"};
            }
          }
        </style>
      </head>
      <body>
        ${videoBackground}
        <div class="content-container">
          ${generateHtmlFromBlocks()}
        </div>
      </body>
      </html>
    `
  }

  const handleSaveLink = async () => {
    console.log("Saving link with title:", title)
    console.log("Slug:", slug)
    console.log("Blocks:", blocks)

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please add a title for your link",
        variant: "destructive",
      })
      return
    }

    if (blocks.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one content block",
        variant: "destructive",
      })
      return
    }

    if (slug && slugError) {
      toast({
        title: "Error",
        description: slugError,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const htmlContent = generateFullHtml()

      console.log("Inserting link into Supabase...")

      // Check slug availability one more time before saving
      if (slug) {
        const isAvailable = await checkSlugAvailability(slug)
        if (!isAvailable) {
          throw new Error("This URL is already taken. Please choose another.")
        }
      }

      // Insert link into Supabase
      const { data: linkData, error: linkError } = await supabase
        .from("links")
        .insert({
          title,
          slug: slug || null, // Use null if no slug is provided
          html_content: htmlContent,
        })
        .select()
        .single()

      if (linkError) {
        console.error("Supabase link insert error:", linkError)
        throw new Error(`Failed to save link: ${linkError.message}`)
      }

      console.log("Link inserted successfully:", linkData)

      if (!linkData || !linkData.id) {
        throw new Error("No link ID returned from database")
      }

      // Insert blocks one by one to avoid potential issues with batch insert
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]

        // Sanitize the content to ensure it's JSONB compatible
        const sanitizedContent = sanitizeContentForJsonb(block.content)

        console.log(`Inserting block ${i + 1}/${blocks.length}:`, {
          link_id: linkData.id,
          type: block.type,
          position: i,
          content: sanitizedContent,
        })

        const { error: blockError } = await supabase.from("blocks").insert({
          link_id: linkData.id,
          type: block.type,
          content: sanitizedContent,
          position: i,
        })

        if (blockError) {
          console.error(`Error inserting block ${i + 1}:`, blockError)
          throw new Error(`Failed to save block ${i + 1}: ${blockError.message}`)
        }
      }

      console.log("All blocks inserted successfully")

      toast({
        title: "Success!",
        description: "Your link has been created and saved to the database",
      })

      // Navigate to the new link using the slug if available, otherwise use the ID
      const path = slug ? `/s/${slug}` : `/link/${linkData.id}`
      router.push(path)
    } catch (error: any) {
      console.error("Error saving link:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Link Title</Label>
            <Input id="title" placeholder="Enter a title for your link" value={title} onChange={handleTitleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              Custom URL
            </Label>
            <div className="flex items-center">
              <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md text-muted-foreground">
                {getBaseUrl()}/s/
              </span>
              <Input
                id="slug"
                placeholder="your-custom-url"
                value={slug}
                onChange={handleSlugChange}
                className={`rounded-l-none ${slugError ? "border-red-500" : ""}`}
              />
            </div>
            {isCheckingSlug && <p className="text-xs text-muted-foreground">Checking availability...</p>}
            {slugError && <p className="text-xs text-red-500">{slugError}</p>}
            {slug && !slugError && !isCheckingSlug && <p className="text-xs text-green-500">✓ This URL is available</p>}
            <p className="text-xs text-muted-foreground">Leave blank to use an automatically generated URL</p>
          </div>

          <Tabs defaultValue="blocks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blocks">Content Blocks</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="space-y-4">
              <BlockSelector onAddBlock={handleAddBlock} />

              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium">Your Content Blocks</h3>

                {blocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Add blocks to create your mobile link</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <div key={block.id} className="bg-white border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{block.type}</span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveBlock(block.id, "up")}
                              disabled={index === 0}
                              className="h-7 w-7"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveBlock(block.id, "down")}
                              disabled={index === blocks.length - 1}
                              className="h-7 w-7"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveBlock(block.id)}
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <BlockEditor
                          block={block}
                          onUpdateContent={(content) => handleUpdateBlockContent(block.id, content)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        id="backgroundColor"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundVideo" className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      Background Video URL
                    </Label>
                    <Input
                      id="backgroundVideo"
                      placeholder="https://example.com/video.mp4"
                      value={backgroundVideo}
                      onChange={(e) => setBackgroundVideo(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to an MP4 video file (will overlay the background color)
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button onClick={() => setPreviewMode(!previewMode)}>{previewMode ? "Edit" : "Preview"}</Button>
            <Button variant="default" onClick={handleSaveLink} disabled={isSaving || isCheckingSlug}>
              {isSaving ? "Saving..." : "Save Link"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Preview
          </h3>

          <Card className="border-2 w-[320px] mx-auto h-[568px] overflow-hidden">
            <CardContent className="p-0 h-full">
              {previewMode ? (
                <div className="w-full h-full">
                  <iframe
                    srcDoc={generateFullHtml()}
                    title="Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                  {blocks.length > 0 ? (
                    <p>Click Preview to see how your link will look</p>
                  ) : (
                    <p>Add blocks to see a preview</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

