"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import AnimatedTransition from "@/components/animated-transition"

interface MultipleChoiceQuestionsProps {
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string>) => void
  onContinue: () => void
}

export default function MultipleChoiceQuestions({ answers, setAnswers, onContinue }: MultipleChoiceQuestionsProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const questions = [
    {
      id: "conflict_style",
      question: "Wie gehst du typischerweise mit Konflikten in der Beziehung um?",
      options: [
        { value: "discuss", label: "Ich spreche Probleme direkt an und suche nach einer Lösung" },
        { value: "compromise", label: "Ich suche nach Kompromissen, auch wenn ich nachgeben muss" },
        { value: "avoid", label: "Ich vermeide Konflikte und warte, bis sich die Situation beruhigt" },
        { value: "emotional", label: "Ich drücke meine Gefühle aus, auch wenn es emotional wird" },
      ],
    },
    {
      id: "activities",
      question: "Welche gemeinsamen Aktivitäten bevorzugst du in einer Beziehung?",
      options: [
        { value: "active", label: "Aktive Unternehmungen wie Sport oder Wandern" },
        { value: "cultural", label: "Kulturelle Aktivitäten wie Museen oder Konzerte" },
        { value: "social", label: "Soziale Treffen mit Freunden oder Familie" },
        { value: "quiet", label: "Ruhige Aktivitäten zu Hause wie Filme schauen oder Lesen" },
      ],
    },
    {
      id: "affection",
      question: "Wie drückst du Zuneigung am liebsten aus?",
      options: [
        { value: "words", label: "Durch Worte und verbale Bestätigung" },
        { value: "touch", label: "Durch körperliche Nähe und Berührungen" },
        { value: "gifts", label: "Durch Geschenke und Aufmerksamkeiten" },
        { value: "acts", label: "Durch Hilfsbereitschaft und unterstützende Handlungen" },
      ],
    },
    {
      id: "freedom",
      question: "Wie viel persönliche Freiheit brauchst du in einer Beziehung?",
      options: [
        { value: "high", label: "Viel Freiraum für eigene Aktivitäten und Freundschaften" },
        { value: "moderate", label: "Ein ausgewogenes Verhältnis zwischen Gemeinsamen und Eigenem" },
        { value: "low", label: "Ich verbringe am liebsten viel Zeit mit meinem Partner" },
        { value: "flexible", label: "Unterschiedlich, je nach Situation und Lebensphase" },
      ],
    },
    {
      id: "finances",
      question: "Wie gehst du mit finanziellen Entscheidungen um?",
      options: [
        { value: "conservative", label: "Ich bin vorsichtig und spare lieber für die Zukunft" },
        { value: "balanced", label: "Ich versuche, Sparen und Ausgeben in Balance zu halten" },
        { value: "spontaneous", label: "Ich entscheide oft spontan und genieße den Moment" },
        { value: "planning", label: "Ich plane genau und halte mich an ein Budget" },
      ],
    },
  ]

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    })
  }

  const handleNext = () => {
    if (!answers[questions[currentQuestionIndex].id]) {
      setShowAlert(true)
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowAlert(false)
    } else {
      onContinue()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowAlert(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Multiple-Choice-Fragen</CardTitle>
        <CardDescription>Beantworte die folgenden Fragen zu deinen Präferenzen in der Beziehung</CardDescription>
      </CardHeader>
      <CardContent>
        {showAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Keine Antwort ausgewählt</AlertTitle>
            <AlertDescription>Bitte wähle eine Antwort aus, bevor du fortfährst.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>
              Frage {currentQuestionIndex + 1} von {questions.length}
            </span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% abgeschlossen</span>
          </div>

          <AnimatedTransition show={true} animation="slide-right" key={currentQuestionIndex}>
            <h3 className="text-lg font-medium mt-4">{currentQuestion.question}</h3>

            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3 mt-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors animate-slide-in-right"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AnimatedTransition>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={currentQuestionIndex > 0 ? "animate-slide-in-left" : ""}
          >
            Zurück
          </Button>
          <Button onClick={handleNext} className="animate-pulse-gentle">
            {currentQuestionIndex < questions.length - 1 ? "Nächste Frage" : "Weiter"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
