"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface LinkPageProps {
  params: {
    id: string
  }
}

interface LinkData {
  id: string
  title: string
  html_content: string
}

export default function LinkPage({ params }: LinkPageProps) {
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLink() {
      try {
        const { data, error } = await supabase.from("links").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (data) {
          setLinkData(data)
          // Set the page title
          document.title = data.title
        }
      } catch (error) {
        console.error("Error fetching link:", error)
        setLinkData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLink()
  }, [params.id])

  // Show 404 if link not found
  if (!loading && !linkData) {
    notFound()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // Render the HTML content
  return <div dangerouslySetInnerHTML={{ __html: linkData?.html_content || "" }} className="min-h-screen w-full" />
}

