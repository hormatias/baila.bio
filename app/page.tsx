import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LinkCreator from "@/components/link-creator"
import SavedLinks from "@/components/saved-links"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mobile Link Creator</h1>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="create">Create Link</TabsTrigger>
          <TabsTrigger value="saved">Saved Links</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <LinkCreator />
        </TabsContent>

        <TabsContent value="saved">
          <SavedLinks />
        </TabsContent>
      </Tabs>
    </main>
  )
}

