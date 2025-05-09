"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import AnimatedTransition from "@/components/animated-transition"

interface SelfAssessmentProps {
  selectedTopics: string[]
  assessment: Record<string, number>
  setAssessment: (assessment: Record<string, number>) => void
  onContinue: () => void
}

export default function SelfAssessment({ selectedTopics, assessment, setAssessment, onContinue }: SelfAssessmentProps) {
  const [showAlert, setShowAlert] = useState(false)

  const topicLabels: Record<string, string> = {
    finance: "Finanzen",
    biorhythm: "Biorhythmus & Schlafgewohnheiten",
    temperature: "Temperatur-Präferenzen",
    animals: "Tiere & Tierpflege",
    business: "Eigenes Geschäft & Karriere",
    walking: "Spazieren gehen & Outdoor-Aktivitäten",
    travel: "Reisen & Urlaub",
    cooking: "Kochen & Ernährung",
    social: "Sozialleben & Freundschaften",
    technology: "Technologie & Digitales",
    spirituality: "Spiritualität & Glaube",
    health: "Gesundheit & Fitness",
    education: "Bildung & Lernen",
    creativity: "Kreativität & Hobbys",
    environment: "Umweltbewusstsein & Nachhaltigkeit",
    politics: "Politik & gesellschaftliches Engagement",
    humor: "Humor & Unterhaltung",
    space: "Persönlicher Raum & Privatsphäre",
    conflict: "Konfliktlösung & Kommunikation",
    future: "Zukunftsplanung & Lebensziele",
    leisure: "Freizeitgestaltung & Entspannung",
    traditions: "Traditionen & Feiertage",
  }

  const topicDescriptions: Record<string, string> = {
    finance: "Wie wichtig ist dir finanzielle Stabilität und gemeinsame Finanzplanung?",
    biorhythm: "Wie wichtig sind dir kompatible Schlaf- und Wachzeiten?",
    temperature: "Wie wichtig ist dir eine ähnliche Temperaturpräferenz (Raumtemperatur, etc.)?",
    animals: "Wie wichtig sind dir Tiere und Tierpflege in deinem Leben?",
    business: "Wie wichtig ist dir beruflicher Erfolg und Karriereentwicklung?",
    walking: "Wie wichtig sind dir regelmäßige Spaziergänge und Outdoor-Aktivitäten?",
    travel: "Wie wichtig ist dir das Reisen und neue Orte zu entdecken?",
    cooking: "Wie wichtig sind dir Kochen und gemeinsame Mahlzeiten?",
    social: "Wie wichtig ist dir ein aktives Sozialleben und Freundschaften?",
    technology: "Wie wichtig ist dir Technologie im Alltag?",
    spirituality: "Wie wichtig ist dir Spiritualität oder religiöser Glaube?",
    health: "Wie wichtig sind dir Gesundheit und Fitness?",
    education: "Wie wichtig sind dir Bildung und lebenslanges Lernen?",
    creativity: "Wie wichtig sind dir kreative Aktivitäten und Hobbys?",
    environment: "Wie wichtig ist dir Umweltbewusstsein und Nachhaltigkeit?",
    politics: "Wie wichtig ist dir politisches und gesellschaftliches Engagement?",
    humor: "Wie wichtig ist dir Humor und gemeinsames Lachen?",
    space: "Wie wichtig ist dir persönlicher Raum und Privatsphäre?",
    conflict: "Wie wichtig ist dir konstruktive Konfliktlösung und offene Kommunikation?",
    future: "Wie wichtig ist dir gemeinsame Zukunftsplanung und das Setzen von Lebenszielen?",
    leisure: "Wie wichtig ist dir gemeinsame Freizeitgestaltung und Entspannung?",
    traditions: "Wie wichtig sind dir Traditionen und das Feiern besonderer Anlässe?",
  }

  const handleSliderChange = (topicId: string, value: number[]) => {
    setAssessment({
      ...assessment,
      [topicId]: value[0],
    })
  }

  const handleContinue = () => {
    const unansweredTopics = selectedTopics.filter((topic) => assessment[topic] === undefined)
    if (unansweredTopics.length > 0) {
      setShowAlert(true)
      return
    }
    onContinue()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Deine Bewertung</CardTitle>
        <CardDescription>Bewerte, wie wichtig dir die folgenden Themen in einer Beziehung sind</CardDescription>
      </CardHeader>
      <CardContent>
        {showAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nicht alle Themen bewertet</AlertTitle>
            <AlertDescription>Bitte bewerte alle ausgewählten Themen, bevor du fortfährst.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {selectedTopics.map((topicId, index) => (
            <AnimatedTransition key={topicId} show={true} animation="slide-right" duration={400 + index * 50}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-medium">{topicLabels[topicId]}</h3>
                  <span className="text-muted-foreground">
                    {assessment[topicId] !== undefined ? `${assessment[topicId]}%` : "Nicht bewertet"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{topicDescriptions[topicId]}</p>
                <Slider
                  defaultValue={[assessment[topicId] || 50]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleSliderChange(topicId, value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Unwichtig</span>
                  <span>Neutral</span>
                  <span>Sehr wichtig</span>
                </div>
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
