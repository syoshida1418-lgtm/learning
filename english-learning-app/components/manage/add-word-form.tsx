"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AudioPlayer } from "@/components/audio/audio-player"
import { Plus, Save, RotateCcw } from "lucide-react"
import { CustomVocabularyManager } from "@/lib/custom-vocabulary"
import { useToast } from "@/hooks/use-toast"

interface AddWordFormProps {
  onWordAdded?: () => void
}

export function AddWordForm({ onWordAdded }: AddWordFormProps) {
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    exampleSentence: "",
    blankPosition: 0,
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    category: "daily" as "business" | "travel" | "daily" | "academic",
    partOfSpeech: "noun",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-calculate blank position when example sentence changes
    if (field === "exampleSentence" && typeof value === "string") {
      const words = value.split(" ")
      const wordIndex = words.findIndex((w) => w.toLowerCase().includes(formData.word.toLowerCase()))
      if (wordIndex !== -1) {
        setFormData((prev) => ({ ...prev, blankPosition: wordIndex }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.word.trim() || !formData.definition.trim() || !formData.exampleSentence.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Check if word exists in example sentence
      const words = formData.exampleSentence.split(" ")
      const wordExists = words.some((w) => w.toLowerCase().replace(/[.,!?]/g, "") === formData.word.toLowerCase())

      if (!wordExists) {
        toast({
          title: "Validation Error",
          description: "The word must appear in the example sentence.",
          variant: "destructive",
        })
        return
      }

      // Add the word
      const customVocabManager = CustomVocabularyManager.getInstance()
      const newWord = customVocabManager.addWord(formData)

      toast({
        title: "Word Added Successfully!",
        description: `"${newWord.word}" has been added to your custom vocabulary.`,
      })

      // Reset form
      setFormData({
        word: "",
        definition: "",
        exampleSentence: "",
        blankPosition: 0,
        difficulty: "intermediate",
        category: "daily",
        partOfSpeech: "noun",
      })

      onWordAdded?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add word. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      word: "",
      definition: "",
      exampleSentence: "",
      blankPosition: 0,
      difficulty: "intermediate",
      category: "daily",
      partOfSpeech: "noun",
    })
  }

  // Preview the sentence with blank
  const previewSentence = () => {
    if (!formData.exampleSentence) return ""
    const words = formData.exampleSentence.split(" ")
    return words.map((w, index) => (index === formData.blankPosition ? "______" : w)).join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Word
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Word Input */}
          <div className="space-y-2">
            <Label htmlFor="word">Word *</Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) => handleInputChange("word", e.target.value)}
              placeholder="Enter the vocabulary word"
              required
            />
          </div>

          {/* Part of Speech and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partOfSpeech">Part of Speech</Label>
              <Select value={formData.partOfSpeech} onValueChange={(value) => handleInputChange("partOfSpeech", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                  <SelectItem value="adverb">Adverb</SelectItem>
                  <SelectItem value="preposition">Preposition</SelectItem>
                  <SelectItem value="conjunction">Conjunction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="daily">Daily Life</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <Label htmlFor="definition">Definition *</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => handleInputChange("definition", e.target.value)}
              placeholder="Enter the definition of the word"
              rows={3}
              required
            />
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="exampleSentence">Example Sentence *</Label>
            <Textarea
              id="exampleSentence"
              value={formData.exampleSentence}
              onChange={(e) => handleInputChange("exampleSentence", e.target.value)}
              placeholder="Enter an example sentence using the word"
              rows={3}
              required
            />
            <p className="text-sm text-muted-foreground">
              Make sure the word appears in the sentence. It will be used for fill-in-the-blank questions.
            </p>
          </div>

          {/* Blank Position */}
          <div className="space-y-2">
            <Label htmlFor="blankPosition">Blank Position</Label>
            <Input
              id="blankPosition"
              type="number"
              min="0"
              max={formData.exampleSentence.split(" ").length - 1}
              value={formData.blankPosition}
              onChange={(e) => handleInputChange("blankPosition", Number.parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Position of the word in the sentence (0-based index). Auto-calculated when you enter the sentence.
            </p>
          </div>

          {/* Preview */}
          {formData.exampleSentence && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="bg-muted p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formData.partOfSpeech}</Badge>
                    <Badge
                      variant={
                        formData.difficulty === "beginner"
                          ? "default"
                          : formData.difficulty === "intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {formData.difficulty}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {formData.category}
                    </Badge>
                  </div>
                  <p className="font-medium">{formData.word}</p>
                  <p className="text-sm text-muted-foreground">{formData.definition}</p>
                  <p className="text-sm">
                    <strong>Quiz question:</strong> {previewSentence()}
                  </p>
                  {formData.word && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Pronunciation:</span>
                      <AudioPlayer text={formData.word} rate={0.7} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Adding..." : "Add Word"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
