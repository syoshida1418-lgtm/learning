"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AudioPlayer } from "@/components/audio/audio-player"
import { Search, Trash2, BookOpen, Play } from "lucide-react"
import { CustomVocabularyManager, type CustomWord } from "@/lib/custom-vocabulary"
import { useToast } from "@/hooks/use-toast"

interface WordListProps {
  onRefresh?: () => void
}

export function WordList({ onRefresh }: WordListProps) {
  const [customWords, setCustomWords] = useState<CustomWord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredWords, setFilteredWords] = useState<CustomWord[]>([])
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadWords()
  }, [])

  useEffect(() => {
    // Filter words based on search query
    if (searchQuery.trim()) {
      const customVocabManager = CustomVocabularyManager.getInstance()
      const results = customVocabManager.searchWords(searchQuery)
      setFilteredWords(results)
    } else {
      setFilteredWords(customWords)
    }
  }, [searchQuery, customWords])

  const loadWords = () => {
    const customVocabManager = CustomVocabularyManager.getInstance()
    const words = customVocabManager.getCustomWords()
    setCustomWords(words)
    onRefresh?.()
  }

  const handleDeleteWord = (id: string, word: string) => {
    if (window.confirm(`Are you sure you want to delete "${word}"?`)) {
      const customVocabManager = CustomVocabularyManager.getInstance()
      const success = customVocabManager.deleteWord(id)

      if (success) {
        toast({
          title: "Word Deleted",
          description: `"${word}" has been removed from your vocabulary.`,
        })
        loadWords()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete word. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const createQuizWithWord = (word: CustomWord) => {
    // Store the word for quiz creation
    if (typeof window !== "undefined") {
      localStorage.setItem("customQuizWord", JSON.stringify(word))
      window.open("/quiz/custom", "_blank")
    }
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Your Custom Words ({customWords.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Word List */}
        {filteredWords.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No words found" : "No custom words yet"}</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "Add your first custom word using the form above."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWords.map((word) => (
              <Card key={word.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{word.word}</h3>
                      <Badge variant="outline">{word.partOfSpeech}</Badge>
                      <Badge
                        variant={
                          word.difficulty === "beginner"
                            ? "default"
                            : word.difficulty === "intermediate"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {word.difficulty}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {word.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AudioPlayer text={word.word} rate={0.7} />
                      <Button variant="ghost" size="sm" onClick={() => createQuizWithWord(word)} className="gap-1">
                        <Play className="w-4 h-4" />
                        Quiz
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWord(word.id, word.word)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-muted-foreground">{word.definition}</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Example:</p>
                      <p className="text-sm">{word.exampleSentence}</p>
                      <div className="mt-2">
                        <AudioPlayer text={word.exampleSentence} showText rate={0.8} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Added on {word.createdAt.toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
