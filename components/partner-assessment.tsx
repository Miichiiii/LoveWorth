"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PartnerAssessmentProps {
  selectedTopics: string[]
  assessment: Record<string, number>
  setAssessment: (assessment: Record<string, number>) => void
  multipleChoiceAnswers: Record<string, string>
  setMultipleChoiceAnswers: (answers: Record<string, string>) => void
  onContinue: () => void
}

export default function PartnerAssessment({
  selectedTopics,
  assessment,
  setAssessment,
  multipleChoiceAnswers,
  setMultipleChoiceAnswers,
  onContinue,
}: PartnerAssessmentProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [activeTab, setActiveTab] = useState("topics")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

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
    finance: "Wie wichtig ist deinem Partner finanzielle Stabilität und gemeinsame Finanzplanung?",
    biorhythm: "Wie wichtig sind deinem Partner kompatible Schlaf- und Wachzeiten?",
    temperature: "Wie wichtig ist deinem Partner eine ähnliche Temperaturpräferenz?",
    animals: "Wie wichtig sind deinem Partner Tiere und Tierpflege?",
    business: "Wie wichtig ist deinem Partner beruflicher Erfolg und Karriereentwicklung?",
    walking: "Wie wichtig sind deinem Partner regelmäßige Spaziergänge und Outdoor-Aktivitäten?",
    travel: "Wie wichtig ist deinem Partner das Reisen und neue Orte zu entdecken?",
    cooking: "Wie wichtig sind deinem Partner Kochen und gemeinsame Mahlzeiten?",
    social: "Wie wichtig ist deinem Partner ein aktives Sozialleben und Freundschaften?",
    technology: "Wie wichtig ist deinem Partner Technologie im Alltag?",
    spirituality: "Wie wichtig ist deinem Partner Spiritualität oder religiöser Glaube?",
    health: "Wie wichtig sind deinem Partner Gesundheit und Fitness?",
    education: "Wie wichtig sind deinem Partner Bildung und lebenslanges Lernen?",
    creativity: "Wie wichtig sind deinem Partner kreative Aktivitäten und Hobbys?",
    environment: "Wie wichtig ist deinem Partner Umweltbewusstsein und Nachhaltigkeit?",
    politics: "Wie wichtig ist deinem Partner politisches und gesellschaftliches Engagement?",
    humor: "Wie wichtig ist deinem Partner Humor und gemeinsames Lachen?",
    space: "Wie wichtig ist deinem Partner persönlicher Raum und Privatsphäre?",
    conflict: "Wie wichtig ist deinem Partner konstruktive Konfliktlösung und offene Kommunikation?",
    future: "Wie wichtig ist deinem Partner gemeinsame Zukunftsplanung und das Setzen von Lebenszielen?",
    leisure: "Wie wichtig ist deinem Partner gemeinsame Freizeitgestaltung und Entspannung?",
    traditions: "Wie wichtig sind deinem Partner Traditionen und das Feiern besonderer Anlässe?",
  }

  const questions = [
    {
      id: "conflict_style",
      question: "Wie geht dein Partner typischerweise mit Konflikten in der Beziehung um?",
      options: [
        { value: "discuss", label: "Er/Sie spricht Probleme direkt an und sucht nach einer Lösung" },
        { value: "compromise", label: "Er/Sie sucht nach Kompromissen, auch wenn er/sie nachgeben muss" },
        { value: "avoid", label: "Er/Sie vermeidet Konflikte und wartet, bis sich die Situation beruhigt" },
        { value: "emotional", label: "Er/Sie drückt seine/ihre Gefühle aus, auch wenn es emotional wird" },
      ],
    },
    {
      id: "activities",
      question: "Welche gemeinsamen Aktivitäten bevorzugt dein Partner in einer Beziehung?",
      options: [
        { value: "active", label: "Aktive Unternehmungen wie Sport oder Wandern" },
        { value: "cultural", label: "Kulturelle Aktivitäten wie Museen oder Konzerte" },
        { value: "social", label: "Soziale Treffen mit Freunden oder Familie" },
        { value: "quiet", label: "Ruhige Aktivitäten zu Hause wie Filme schauen oder Lesen" },
      ],
    },
    {
      id: "affection",
      question: "Wie drückt dein Partner Zuneigung am liebsten aus?",
      options: [
        { value: "words", label: "Durch Worte und verbale Bestätigung" },
        { value: "touch", label: "Durch körperliche Nähe und Berührungen" },
        { value: "gifts", label: "Durch Geschenke und Aufmerksamkeiten" },
        { value: "acts", label: "Durch Hilfsbereitschaft und unterstützende Handlungen" },
      ],
    },
    {
      id: "freedom",
      question: "Wie viel persönliche Freiheit braucht dein Partner in einer Beziehung?",
      options: [
        { value: "high", label: "Viel Freiraum für eigene Aktivitäten und Freundschaften" },
        { value: "moderate", label: "Ein ausgewogenes Verhältnis zwischen Gemeinsamen und Eigenem" },
        { value: "low", label: "Er/Sie verbringt am liebsten viel Zeit mit seinem/ihrem Partner" },
        { value: "flexible", label: "Unterschiedlich, je nach Situation und Lebensphase" },
      ],
    },
    {
      id: "finances",
      question: "Wie geht dein Partner mit finanziellen Entscheidungen um?",
      options: [
        { value: "conservative", label: "Er/Sie ist vorsichtig und spart lieber für die Zukunft" },
        { value: "balanced", label: "Er/Sie versucht, Sparen und Ausgeben in Balance zu halten" },
        { value: "spontaneous", label: "Er/Sie entscheidet oft spontan und genießt den Moment" },
        { value: "planning", label: "Er/Sie plant genau und hält sich an ein Budget" },
      ],
    },
  ]

  const handleSliderChange = (topicId: string, value: number[]) => {
    setAssessment({
      ...assessment,
      [topicId]: value[0],
    })
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setMultipleChoiceAnswers({
      ...multipleChoiceAnswers,
      [questionId]: value,
    })
  }

  const handleNext = () => {
    if (activeTab === "topics") {
      const unansweredTopics = selectedTopics.filter((topic) => assessment[topic] === undefined)
      if (unansweredTopics.length > 0) {
        setShowAlert(true)
        return
      }
      setActiveTab("questions")
      setShowAlert(false)
    } else if (activeTab === "questions") {
      if (!multipleChoiceAnswers[questions[currentQuestionIndex].id]) {
        setShowAlert(true)
        return
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setShowAlert(false)
      } else {
        const unansweredQuestions = questions.filter((q) => !multipleChoiceAnswers[q.id])
        if (unansweredQuestions.length > 0) {
          setShowAlert(true)
          return
        }
        onContinue()
      }
    }
  }

  const handlePrevious = () => {
    if (activeTab === "questions" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowAlert(false)
    } else if (activeTab === "questions" && currentQuestionIndex === 0) {
      setActiveTab("topics")
      setShowAlert(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Partner-Bewertung</CardTitle>
        <CardDescription>Gib die Antworten deines Partners ein, um eure Kompatibilität zu berechnen</CardDescription>
      </CardHeader>
      <CardContent>
        {showAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {activeTab === "topics" ? "Nicht alle Themen bewertet" : "Keine Antwort ausgewählt"}
            </AlertTitle>
            <AlertDescription>
              {activeTab === "topics"
                ? "Bitte bewerte alle ausgewählten Themen, bevor du fortfährst."
                : "Bitte wähle eine Antwort aus, bevor du fortfährst."}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="topics">Themenbewertung</TabsTrigger>
            <TabsTrigger value="questions">Multiple-Choice</TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-8">
            {selectedTopics.map((topicId) => (
              <div key={topicId} className="space-y-2">
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
            ))}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>
                Frage {currentQuestionIndex + 1} von {questions.length}
              </span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% abgeschlossen</span>
            </div>

            <h3 className="text-lg font-medium mt-4">{currentQuestion.question}</h3>

            <RadioGroup
              value={multipleChoiceAnswers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3 mt-4"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={`partner-${option.value}`} className="mt-1" />
                  <Label htmlFor={`partner-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={activeTab === "topics"}>
          Zurück
        </Button>
        <Button onClick={handleNext}>
          {activeTab === "topics" || currentQuestionIndex < questions.length - 1 ? "Weiter" : "Ergebnisse anzeigen"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
