"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import AnimatedTransition from "@/components/animated-transition"

interface TopicSelectionProps {
  selectedTopics: string[]
  setSelectedTopics: (topics: string[]) => void
  onContinue: () => void
}

export default function TopicSelection({ selectedTopics, setSelectedTopics, onContinue }: TopicSelectionProps) {
  const [showAlert, setShowAlert] = useState(false)

  const topics = [
    { id: "finance", label: "Finanzen" },
    { id: "biorhythm", label: "Biorhythmus & Schlafgewohnheiten" },
    { id: "temperature", label: "Temperatur-Präferenzen" },
    { id: "animals", label: "Tiere & Tierpflege" },
    { id: "business", label: "Eigenes Geschäft & Karriere" },
    { id: "walking", label: "Spazieren gehen & Outdoor-Aktivitäten" },
    { id: "travel", label: "Reisen & Urlaub" },
    { id: "cooking", label: "Kochen & Ernährung" },
    { id: "social", label: "Sozialleben & Freundschaften" },
    { id: "technology", label: "Technologie & Digitales" },
    { id: "spirituality", label: "Spiritualität & Glaube" },
    { id: "health", label: "Gesundheit & Fitness" },
    { id: "education", label: "Bildung & Lernen" },
    { id: "creativity", label: "Kreativität & Hobbys" },
    { id: "environment", label: "Umweltbewusstsein & Nachhaltigkeit" },
    { id: "politics", label: "Politik & gesellschaftliches Engagement" },
    { id: "humor", label: "Humor & Unterhaltung" },
    { id: "space", label: "Persönlicher Raum & Privatsphäre" },
    { id: "conflict", label: "Konfliktlösung & Kommunikation" },
    { id: "future", label: "Zukunftsplanung & Lebensziele" },
    { id: "leisure", label: "Freizeitgestaltung & Entspannung" },
    { id: "traditions", label: "Traditionen & Feiertage" },
  ]

  const handleTopicChange = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId))
    } else {
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  const handleContinue = () => {
    if (selectedTopics.length < 5) {
      setShowAlert(true)
      return
    }
    onContinue()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Themenauswahl</CardTitle>
        <CardDescription>Wähle die Themen aus, die für eure Beziehung relevant sind</CardDescription>
      </CardHeader>
      <CardContent>
        {showAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Zu wenige Themen ausgewählt</AlertTitle>
            <AlertDescription>
              Bitte wähle mindestens 5 Themen aus, um ein aussagekräftiges Ergebnis zu erhalten.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((topic, index) => (
            <AnimatedTransition key={topic.id} show={true} animation="scale" duration={300 + index * 30}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={topic.id}
                  checked={selectedTopics.includes(topic.id)}
                  onCheckedChange={() => handleTopicChange(topic.id)}
                />
                <Label htmlFor={topic.id} className="cursor-pointer">
                  {topic.label}
                </Label>
              </div>
            </AnimatedTransition>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} className="w-full sm:w-auto ml-auto animate-pulse-gentle">
          Weiter <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
