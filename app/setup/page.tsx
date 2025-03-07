"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSetup, setIsSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      setIsLoading(true)

      // Check if tables exist
      const { data: linksData, error: linksError } = await supabase.from("links").select("id").limit(1)

      if (linksError) {
        if (linksError.code === "42P01") {
          // Table doesn't exist
          setIsSetup(false)
        } else {
          throw linksError
        }
      } else {
        setIsSetup(true)
      }
    } catch (err: any) {
      console.error("Error checking database:", err)
      setError(err.message || "Failed to check database status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetup = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Enable UUID extension
      const enableUuidSql = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `

      // Create SQL for tables
      const createLinksSql = `
        CREATE TABLE IF NOT EXISTS links (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          html_content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      const createBlocksSql = `
        CREATE TABLE IF NOT EXISTS blocks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          content JSONB NOT NULL,
          position INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS blocks_link_id_position_idx ON blocks(link_id, position);
      `

      // Execute SQL
      console.log("Enabling UUID extension...")
      const { error: uuidError } = await supabase.rpc("exec_sql", { sql: enableUuidSql })
      if (uuidError) {
        console.error("UUID extension error:", uuidError)
        throw uuidError
      }

      console.log("Creating links table...")
      const { error: linksError } = await supabase.rpc("exec_sql", { sql: createLinksSql })
      if (linksError) {
        console.error("Links table error:", linksError)
        throw linksError
      }

      console.log("Creating blocks table...")
      const { error: blocksError } = await supabase.rpc("exec_sql", { sql: createBlocksSql })
      if (blocksError) {
        console.error("Blocks table error:", blocksError)
        throw blocksError
      }

      setIsSetup(true)
    } catch (err: any) {
      console.error("Error setting up database:", err)
      setError(err.message || "Failed to set up database")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Set up the Supabase database for your mobile link creator</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Checking database status...</p>
          ) : isSetup ? (
            <div className="text-green-600">
              <p>✅ Database is set up and ready to use!</p>
            </div>
          ) : (
            <div>
              <p className="mb-4">Database tables need to be created.</p>
              {error && <p className="text-red-500 mb-4">{error}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isSetup && (
            <Button onClick={handleSetup} disabled={isLoading}>
              {isLoading ? "Setting up..." : "Set Up Database"}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

