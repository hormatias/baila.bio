"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Copy, ExternalLink, Trash, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import type { SupabaseLink } from "@/lib/types"

export default function SavedLinks() {
  const [links, setLinks] = useState<SupabaseLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("links").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setLinks(data || [])
    } catch (error) {
      console.error("Error fetching links:", error)
      toast({
        title: "Error",
        description: "Failed to load saved links",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from("links").delete().eq("id", id)

      if (error) {
        throw error
      }

      setLinks(links.filter((link) => link.id !== id))

      toast({
        title: "Link deleted",
        description: "The link has been removed from your saved links",
      })
    } catch (error) {
      console.error("Error deleting link:", error)
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = (link: SupabaseLink) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const linkUrl = link.slug ? `${baseUrl}/s/${link.slug}` : `${baseUrl}/link/${link.id}`

    navigator.clipboard.writeText(linkUrl)
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })
  }

  const getBaseUrl = () => {
    return typeof window !== "undefined" ? window.location.origin : ""
  }

  const getLinkUrl = (link: SupabaseLink) => {
    return link.slug ? `/s/${link.slug}` : `/link/${link.id}`
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading saved links...</p>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No saved links yet</h3>
        <p className="text-muted-foreground mb-4">Create your first mobile-friendly link to get started</p>
        <Link href="/?tab=create">
          <Button>Create a Link</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Saved Links</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{link.title}</CardTitle>
              <p className="text-xs text-muted-foreground">Created: {new Date(link.created_at).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              {link.slug && (
                <div className="flex items-center gap-1 mb-3 text-sm">
                  <LinkIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{getBaseUrl()}/s/</span>
                  <span className="font-medium">{link.slug}</span>
                </div>
              )}
              <div className="h-24 overflow-hidden bg-gray-50 rounded mb-4 p-2">
                <code className="text-xs text-gray-600">{link.html_content.substring(0, 150)}...</code>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDeleteLink(link.id)}>
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyLink(link)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Link href={getLinkUrl(link)} target="_blank">
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Toaster />
    </div>
  )
}

