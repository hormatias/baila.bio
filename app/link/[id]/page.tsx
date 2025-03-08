import { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface LinkData {
  id: string
  title: string
  html_content: string
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const id = props.params?.id
  try {
    const { data } = await supabase
      .from("links")
      .select("title")
      .eq("id", id)
      .single()
    return {
      title: data?.title || "Link"
    }
  } catch (error) {
    return {
      title: "Link"
    }
  }
}

export default async function LinkPage(props: any) {
  const id = props.params?.id
  try {
    const { data: linkData, error } = await supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !linkData) {
      notFound()
    }

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: linkData.html_content }} 
        className="min-h-screen w-full"
      />
    )
  } catch (error) {
    notFound()
  }
}

