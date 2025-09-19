export interface CustomWord extends Omit<import("./vocabulary-data").VocabularyWord, "id"> {
  id: string
  isCustom: true
  createdAt: Date
  createdBy: string
}

export class CustomVocabularyManager {
  private static instance: CustomVocabularyManager
  private customWords: CustomWord[] = []

  private constructor() {
    this.loadCustomWords()
  }

  static getInstance(): CustomVocabularyManager {
    if (!CustomVocabularyManager.instance) {
      CustomVocabularyManager.instance = new CustomVocabularyManager()
    }
    return CustomVocabularyManager.instance
  }

  private loadCustomWords(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customVocabulary")
      if (saved) {
        const parsed = JSON.parse(saved)
        this.customWords = parsed.map((word: any) => ({
          ...word,
          createdAt: new Date(word.createdAt),
        }))
      }
    }
  }

  private saveCustomWords(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("customVocabulary", JSON.stringify(this.customWords))
    }
  }

  addWord(wordData: Omit<CustomWord, "id" | "isCustom" | "createdAt" | "createdBy">): CustomWord {
    const newWord: CustomWord = {
      ...wordData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date(),
      createdBy: "user",
    }

    this.customWords.push(newWord)
    this.saveCustomWords()
    return newWord
  }

  updateWord(id: string, updates: Partial<Omit<CustomWord, "id" | "isCustom" | "createdAt" | "createdBy">>): boolean {
    const index = this.customWords.findIndex((word) => word.id === id)
    if (index === -1) return false

    this.customWords[index] = { ...this.customWords[index], ...updates }
    this.saveCustomWords()
    return true
  }

  deleteWord(id: string): boolean {
    const index = this.customWords.findIndex((word) => word.id === id)
    if (index === -1) return false

    this.customWords.splice(index, 1)
    this.saveCustomWords()
    return true
  }

  getCustomWords(): CustomWord[] {
    return [...this.customWords]
  }

  getWordById(id: string): CustomWord | undefined {
    return this.customWords.find((word) => word.id === id)
  }

  getWordsByCategory(category: CustomWord["category"]): CustomWord[] {
    return this.customWords.filter((word) => word.category === category)
  }

  getWordsByDifficulty(difficulty: CustomWord["difficulty"]): CustomWord[] {
    return this.customWords.filter((word) => word.difficulty === difficulty)
  }

  searchWords(query: string): CustomWord[] {
    const lowercaseQuery = query.toLowerCase()
    return this.customWords.filter(
      (word) =>
        word.word.toLowerCase().includes(lowercaseQuery) ||
        word.definition.toLowerCase().includes(lowercaseQuery) ||
        word.exampleSentence.toLowerCase().includes(lowercaseQuery),
    )
  }

  clearAllWords(): void {
    this.customWords = []
    this.saveCustomWords()
  }

  exportWords(): string {
    return JSON.stringify(this.customWords, null, 2)
  }

  importWords(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const words = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      if (!Array.isArray(words)) {
        return { success: false, imported: 0, errors: ["Invalid format: expected an array of words"] }
      }

      words.forEach((wordData, index) => {
        try {
          // Validate required fields
          if (!wordData.word || !wordData.definition || !wordData.exampleSentence) {
            errors.push(`Word ${index + 1}: Missing required fields`)
            return
          }

          // Add the word
          this.addWord({
            word: wordData.word,
            definition: wordData.definition,
            exampleSentence: wordData.exampleSentence,
            blankPosition: wordData.blankPosition || 0,
            difficulty: wordData.difficulty || "intermediate",
            category: wordData.category || "daily",
            partOfSpeech: wordData.partOfSpeech || "noun",
          })
          imported++
        } catch (error) {
          errors.push(`Word ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      })

      return { success: imported > 0, imported, errors }
    } catch (error) {
      return { success: false, imported: 0, errors: ["Invalid JSON format"] }
    }
  }
}
