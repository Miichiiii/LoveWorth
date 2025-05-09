"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import AnimatedTransition from "@/components/animated-transition"

interface IntroSectionProps {
  onContinue: () => void
}

export default function IntroSection({ onContinue }: IntroSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <AnimatedTransition show={true} animation="slide-up" duration={400}>
          <CardTitle className="text-2xl">Willkommen zum Love-Worth Beziehungstest</CardTitle>
        </AnimatedTransition>
        <AnimatedTransition show={true} animation="slide-up" duration={600}>
          <CardDescription>Entdecke die Kompatibilität in eurer Beziehung mit unserem umfassenden Test</CardDescription>
        </AnimatedTransition>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatedTransition show={true} animation="fade" duration={800}>
            <p>
              Dieser Test hilft euch, eure Beziehungskompatibilität besser zu verstehen. Beantwortet die folgenden
              Fragen ehrlich, um ein genaues Ergebnis zu erhalten.
            </p>
          </AnimatedTransition>
          <AnimatedTransition show={true} animation="fade" duration={1000}>
            <p>Der Test führt euch durch einen 5-stufigen Prozess:</p>
          </AnimatedTransition>
          <AnimatedTransition show={true} animation="slide-right" duration={1200}>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li className="animate-slide-in-right" style={{ animationDelay: "0ms" }}>
                Themenauswahl - Wählt die für euch relevanten Themen aus
              </li>
              <li className="animate-slide-in-right" style={{ animationDelay: "100ms" }}>
                Eigene Bewertung - Bewertet eure Einstellung zu den Themen
              </li>
              <li className="animate-slide-in-right" style={{ animationDelay: "200ms" }}>
                Multiple-Choice-Fragen - Beantwortet Fragen zu eurer Beziehung
              </li>
              <li className="animate-slide-in-right" style={{ animationDelay: "300ms" }}>
                Partner-Bewertung - Gebt die Antworten eures Partners ein
              </li>
              <li className="animate-slide-in-right" style={{ animationDelay: "400ms" }}>
                Ergebnisse - Seht eure Kompatibilität mit detaillierter Analyse
              </li>
            </ol>
          </AnimatedTransition>
          <AnimatedTransition show={true} animation="fade" duration={1400}>
            <p>
              Nach Abschluss des Tests erhaltet ihr eine detaillierte Auswertung eurer Kompatibilität sowie
              personalisierte Tipps für eure Beziehung.
            </p>
          </AnimatedTransition>
        </div>
      </CardContent>
      <CardFooter>
        <AnimatedTransition show={true} animation="slide-up" duration={1600}>
          <Button onClick={onContinue} className="w-full sm:w-auto ml-auto animate-pulse-gentle">
            Test starten <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </AnimatedTransition>
      </CardFooter>
    </Card>
  )
}
