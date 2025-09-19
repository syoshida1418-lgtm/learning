"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  text: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  showText?: boolean
  rate?: number
  pitch?: number
  voice?: "male" | "female" | "auto"
}

export function AudioPlayer({
  text,
  className,
  variant = "ghost",
  size = "sm",
  showText = false,
  rate = 0.8,
  pitch = 1,
  voice = "auto",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      setIsSupported(false)
    }

    // Cleanup on unmount
    return () => {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  const getVoice = () => {
    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // Filter English voices
    const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"))

    if (voice === "male") {
      return englishVoices.find((v) => v.name.toLowerCase().includes("male")) || englishVoices[0]
    } else if (voice === "female") {
      return englishVoices.find((v) => v.name.toLowerCase().includes("female")) || englishVoices[1]
    }

    // Return first available English voice
    return englishVoices[0] || voices[0]
  }

  const playAudio = async () => {
    if (!isSupported || isPlaying) return

    setIsLoading(true)

    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      // Wait for voices to load if they haven't already
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise((resolve) => {
          const checkVoices = () => {
            if (speechSynthesis.getVoices().length > 0) {
              resolve(true)
            } else {
              setTimeout(checkVoices, 100)
            }
          }
          checkVoices()
        })
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch

      const selectedVoice = getVoice()
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsLoading(false)
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Audio playback failed:", error)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

  if (!isSupported) {
    return (
      <Button variant="ghost" size={size} disabled className={cn("gap-2", className)}>
        <VolumeX className="w-4 h-4" />
        {showText && "Audio not supported"}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isPlaying ? stopAudio : playAudio}
      disabled={isLoading}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className={cn("w-4 h-4", isPlaying && "text-primary")} />
      )}
      {showText && (isLoading ? "Loading..." : isPlaying ? "Playing..." : "Listen")}
    </Button>
  )
}
