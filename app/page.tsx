"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, FileText } from "lucide-react"
import IntroSection from "@/components/intro-section"
import TopicSelection from "@/components/topic-selection"
import SelfAssessment from "@/components/self-assessment"
import MultipleChoiceQuestions from "@/components/multiple-choice-questions"
import PartnerAssessment from "@/components/partner-assessment"
import ResultsComparison from "@/components/results-comparison"
import SpecialModules from "@/components/special-modules"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnimatedProgress from "@/components/animated-progress"
import AnimatedTransition from "@/components/animated-transition"

export default function Home() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selfAssessment, setSelfAssessment] = useState<Record<string, number>>({})
  const [partnerAssessment, setPartnerAssessment] = useState<Record<string, number>>({})
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Record<string, string>>({})
  const [partnerMultipleChoiceAnswers, setPartnerMultipleChoiceAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const steps = [
    { name: "Einführung", component: <IntroSection onContinue={() => setCurrentStep(1)} /> },
    {
      name: "Themenauswahl",
      component: (
        <TopicSelection
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          onContinue={() => setCurrentStep(2)}
        />
      ),
    },
    {
      name: "Eigene Bewertung",
      component: (
        <SelfAssessment
          selectedTopics={selectedTopics}
          assessment={selfAssessment}
          setAssessment={setSelfAssessment}
          onContinue={() => setCurrentStep(3)}
        />
      ),
    },
    {
      name: "Multiple-Choice",
      component: (
        <MultipleChoiceQuestions
          answers={multipleChoiceAnswers}
          setAnswers={setMultipleChoiceAnswers}
          onContinue={() => setCurrentStep(4)}
        />
      ),
    },
    {
      name: "Partner Bewertung",
      component: (
        <PartnerAssessment
          selectedTopics={selectedTopics}
          assessment={partnerAssessment}
          setAssessment={setPartnerAssessment}
          multipleChoiceAnswers={partnerMultipleChoiceAnswers}
          setMultipleChoiceAnswers={setPartnerMultipleChoiceAnswers}
          onContinue={() => {
            setCurrentStep(5)
            setShowResults(true)
          }}
        />
      ),
    },
    {
      name: "Ergebnisse",
      component: (
        <ResultsComparison
          selectedTopics={selectedTopics}
          selfAssessment={selfAssessment}
          partnerAssessment={partnerAssessment}
          multipleChoiceAnswers={multipleChoiceAnswers}
          partnerMultipleChoiceAnswers={partnerMultipleChoiceAnswers}
        />
      ),
    },
  ]

  const handleExportExcel = () => {
    toast({
      title: "Excel-Export gestartet",
      description: "Deine Ergebnisse werden als Excel-Datei heruntergeladen.",
    })
    // Excel export logic would be implemented here
  }

  const handleExportPDF = () => {
    toast({
      title: "PDF-Export gestartet",
      description: "Deine Ergebnisse werden als PDF-Datei heruntergeladen.",
    })
    // PDF export logic would be implemented here
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Love-Worth Beziehungstest</h1>
        <p className="text-muted-foreground text-lg">Entdecke die Kompatibilität in eurer Beziehung</p>
        <div className="w-24 h-1 bg-primary mx-auto my-4 rounded-full"></div>
      </div>

      {!showResults && (
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>
              Schritt {currentStep + 1} von {steps.length}
            </span>
            <span>{steps[currentStep].name}</span>
          </div>
          <AnimatedProgress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>
      )}

      <AnimatedTransition
        show={true}
        animation={currentStep % 2 === 0 ? "slide-right" : "slide-left"}
        key={currentStep}
      >
        {steps[currentStep].component}
      </AnimatedTransition>

      {showResults && (
        <AnimatedTransition show={true} animation="slide-up">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ergebnisse exportieren</CardTitle>
              <CardDescription>
                Lade deine Beziehungskompatibilitäts-Ergebnisse herunter, um sie zu speichern oder zu teilen.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center gap-2 w-full" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4" />
                Als Excel-Datei herunterladen
              </Button>
              <Button variant="outline" className="flex items-center gap-2 w-full" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
                Als PDF-Datei herunterladen
              </Button>
            </CardContent>
          </Card>
        </AnimatedTransition>
      )}

      {showResults && (
        <AnimatedTransition show={true} animation="slide-up" className="mt-8">
          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Ergebnisse</TabsTrigger>
              <TabsTrigger value="modules">Spezialmodule</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <ResultsComparison
                selectedTopics={selectedTopics}
                selfAssessment={selfAssessment}
                partnerAssessment={partnerAssessment}
                multipleChoiceAnswers={multipleChoiceAnswers}
                partnerMultipleChoiceAnswers={partnerMultipleChoiceAnswers}
              />
            </TabsContent>
            <TabsContent value="modules">
              <SpecialModules />
            </TabsContent>
          </Tabs>
        </AnimatedTransition>
      )}
    </main>
  )
}
