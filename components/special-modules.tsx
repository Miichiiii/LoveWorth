"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, Calendar, Thermometer, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Chart from "chart.js/auto"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

import AnimatedCounter from "@/components/animated-counter"
import AnimatedTransition from "@/components/animated-transition"

export default function SpecialModules() {
  const { toast } = useToast()
  const [activeModule, setActiveModule] = useState<string | null>(null)

  // Finance module state
  const [financeAnswers, setFinanceAnswers] = useState<Record<string, string>>({})
  const [financeResults, setFinanceResults] = useState<{
    score: number
    title: string
    description: string
    recommendations: string[]
  } | null>(null)
  const financeChartRef = useRef<HTMLCanvasElement>(null)
  const financeChartInstance = useRef<Chart | null>(null)

  // Biorhythm module state
  const [biorhythmData, setBiorhythmData] = useState({
    yourBirthdate: "",
    partnerBirthdate: "",
    yourWakeupTime: "07:00",
    partnerWakeupTime: "07:00",
    yourSleepTime: "23:00",
    partnerSleepTime: "23:00",
  })
  const [biorhythmResults, setBiorhythmResults] = useState<{
    score: number
    title: string
    description: string
    recommendations: string[]
  } | null>(null)
  const biorhythmChartRef = useRef<HTMLCanvasElement>(null)
  const biorhythmChartInstance = useRef<Chart | null>(null)

  // Temperature module state
  const [temperatureData, setTemperatureData] = useState({
    yourRoomTemp: 21,
    partnerRoomTemp: 21,
    yourBedroomTemp: 18,
    partnerBedroomTemp: 18,
  })
  const [temperatureResults, setTemperatureResults] = useState<{
    score: number
    title: string
    description: string
    recommendations: string[]
  } | null>(null)
  const temperatureChartRef = useRef<HTMLCanvasElement>(null)
  const temperatureChartInstance = useRef<Chart | null>(null)

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (financeChartInstance.current) {
        financeChartInstance.current.destroy()
      }
      if (biorhythmChartInstance.current) {
        biorhythmChartInstance.current.destroy()
      }
      if (temperatureChartInstance.current) {
        temperatureChartInstance.current.destroy()
      }
    }
  }, [])

  const handleFinanceOptionSelect = (scenario: string, person: string, option: string) => {
    setFinanceAnswers({
      ...financeAnswers,
      [`${scenario}_${person}`]: option,
    })
  }

  const calculateFinanceCompatibility = () => {
    // Check if all questions are answered
    const requiredAnswers = ["1_you", "1_partner", "2_you", "2_partner", "3_you", "3_partner"]

    const allAnswered = requiredAnswers.every((key) => financeAnswers[key])

    if (!allAnswered) {
      toast({
        title: "Unvollständige Antworten",
        description: "Bitte beantworte alle Fragen, bevor du die Kompatibilität berechnest.",
        variant: "destructive",
      })
      return
    }

    // Calculate compatibility score
    let score = 0
    let matchCount = 0

    // Exact matches are worth more points
    if (financeAnswers["1_you"] === financeAnswers["1_partner"]) {
      score += 100
      matchCount++
    } else {
      // Partial matches based on how close the options are
      const options = ["a", "b", "c", "d"]
      const youIndex = options.indexOf(financeAnswers["1_you"])
      const partnerIndex = options.indexOf(financeAnswers["1_partner"])
      const difference = Math.abs(youIndex - partnerIndex)

      // The closer the options, the higher the score
      score += Math.max(0, 100 - difference * 25)
    }

    // Repeat for other scenarios
    if (financeAnswers["2_you"] === financeAnswers["2_partner"]) {
      score += 100
      matchCount++
    } else {
      const options = ["a", "b", "c", "d"]
      const youIndex = options.indexOf(financeAnswers["2_you"])
      const partnerIndex = options.indexOf(financeAnswers["2_partner"])
      const difference = Math.abs(youIndex - partnerIndex)
      score += Math.max(0, 100 - difference * 25)
    }

    if (financeAnswers["3_you"] === financeAnswers["3_partner"]) {
      score += 100
      matchCount++
    } else {
      const options = ["a", "b", "c", "d"]
      const youIndex = options.indexOf(financeAnswers["3_you"])
      const partnerIndex = options.indexOf(financeAnswers["3_partner"])
      const difference = Math.abs(youIndex - partnerIndex)
      score += Math.max(0, 100 - difference * 25)
    }

    // Calculate final score
    const finalScore = Math.round(score / 3)

    // Generate results
    let title, description, recommendations

    if (finalScore >= 85) {
      title = "Ausgezeichnete finanzielle Übereinstimmung 💰"
      description =
        "Ihr habt eine sehr ähnliche Einstellung zu finanziellen Fragen. Das ist eine ausgezeichnete Basis für gemeinsame finanzielle Entscheidungen und reduziert potenzielle Konflikte in diesem Bereich."
      recommendations = [
        "Nutzt eure ähnlichen finanziellen Einstellungen, um gemeinsame langfristige Ziele zu setzen. 🎯",
        "Besprecht regelmäßig eure finanzielle Situation, um auf dem gleichen Stand zu bleiben. 📊",
        "Überlegt, ob ihr ein gemeinsames Konto für Haushaltausgaben einrichten wollt. 💳",
      ]
    } else if (finalScore >= 70) {
      title = "Gute finanzielle Übereinstimmung 👍"
      description =
        "Ihr habt in vielen finanziellen Fragen ähnliche Ansichten, mit einigen Unterschieden. Diese Basis ermöglicht euch, gemeinsame finanzielle Entscheidungen zu treffen, erfordert aber manchmal Kompromisse."
      recommendations = [
        "Sprecht offen über eure unterschiedlichen finanziellen Prioritäten und findet Kompromisse. 🗣️",
        "Erstellt ein gemeinsames Budget, das die Bedürfnisse beider Partner berücksichtigt. 📝",
        "Legt fest, ab welchem Betrag ihr größere Ausgaben gemeinsam besprechen wollt. 💸",
      ]
    } else if (finalScore >= 50) {
      title = "Moderate finanzielle Übereinstimmung 🤔"
      description =
        "Ihr habt einige unterschiedliche Ansichten zu finanziellen Fragen. Diese Unterschiede können zu Spannungen führen, sind aber durch offene Kommunikation und gegenseitiges Verständnis überwindbar."
      recommendations = [
        "Nehmt euch Zeit, die finanziellen Werte und Prioritäten des anderen zu verstehen. 🧠",
        "Erwägt, einen Teil eures Geldes getrennt zu verwalten, um Konflikte zu reduzieren. 💼",
        "Vereinbart klare Regeln für gemeinsame Ausgaben und Sparziele. 📋",
      ]
    } else {
      title = "Herausfordernde finanzielle Übereinstimmung 🔍"
      description =
        "Ihr habt deutlich unterschiedliche Ansichten zu finanziellen Fragen. Diese Unterschiede können eine Herausforderung darstellen, aber mit bewusster Arbeit und Kompromissbereitschaft könnt ihr sie überwinden."
      recommendations = [
        "Sucht professionelle Hilfe bei der Finanzplanung, um einen neutralen Rahmen für Gespräche zu schaffen. 👨‍💼",
        "Entwickelt ein System, das beiden Partnern finanzielle Autonomie in bestimmten Bereichen gibt. 🔄",
        "Setzt euch regelmäßig zusammen, um finanzielle Entscheidungen zu besprechen und Missverständnisse zu vermeiden. 🗓️",
      ]
    }

    setFinanceResults({
      score: finalScore,
      title,
      description,
      recommendations,
    })

    // Create chart
    setTimeout(() => {
      if (financeChartRef.current) {
        const ctx = financeChartRef.current.getContext("2d")
        if (ctx) {
          if (financeChartInstance.current) {
            financeChartInstance.current.destroy()
          }

          const scenarioLabels = [
            "Unerwarteter Geldsegen",
            "Langfristige Finanzplanung",
            "Finanzielle Risikobereitschaft",
          ]

          const scenarioScores = [
            financeAnswers["1_you"] === financeAnswers["1_partner"]
              ? 100
              : Math.max(
                  0,
                  100 -
                    Math.abs(
                      ["a", "b", "c", "d"].indexOf(financeAnswers["1_you"]) -
                        ["a", "b", "c", "d"].indexOf(financeAnswers["1_partner"]),
                    ) *
                      25,
                ),
            financeAnswers["2_you"] === financeAnswers["2_partner"]
              ? 100
              : Math.max(
                  0,
                  100 -
                    Math.abs(
                      ["a", "b", "c", "d"].indexOf(financeAnswers["2_you"]) -
                        ["a", "b", "c", "d"].indexOf(financeAnswers["2_partner"]),
                    ) *
                      25,
                ),
            financeAnswers["3_you"] === financeAnswers["3_partner"]
              ? 100
              : Math.max(
                  0,
                  100 -
                    Math.abs(
                      ["a", "b", "c", "d"].indexOf(financeAnswers["3_you"]) -
                        ["a", "b", "c", "d"].indexOf(financeAnswers["3_partner"]),
                    ) *
                      25,
                ),
          ]

          financeChartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
              labels: scenarioLabels,
              datasets: [
                {
                  label: "Übereinstimmung",
                  data: scenarioScores,
                  backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(54, 162, 235, 0.7)", "rgba(255, 206, 86, 0.7)"],
                  borderColor: ["rgba(75, 192, 192, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "Übereinstimmung (%)",
                  },
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Finanzielle Übereinstimmung nach Szenario",
                },
              },
            },
          })
        }
      }
    }, 100)
  }

  const calculateBiorhythmCompatibility = () => {
    // Check if all required fields are filled
    if (!biorhythmData.yourBirthdate || !biorhythmData.partnerBirthdate) {
      toast({
        title: "Unvollständige Daten",
        description: "Bitte gib beide Geburtsdaten ein, bevor du die Kompatibilität berechnest.",
        variant: "destructive",
      })
      return
    }

    // Calculate sleep schedule compatibility
    const yourWakeupMinutes = convertTimeToMinutes(biorhythmData.yourWakeupTime)
    const partnerWakeupMinutes = convertTimeToMinutes(biorhythmData.partnerWakeupTime)
    const yourSleepMinutes = convertTimeToMinutes(biorhythmData.yourSleepTime)
    const partnerSleepMinutes = convertTimeToMinutes(biorhythmData.partnerSleepTime)

    // Calculate differences in wake-up and sleep times
    const wakeupDifference = Math.abs(yourWakeupMinutes - partnerWakeupMinutes)
    const sleepDifference = Math.abs(yourSleepMinutes - partnerSleepMinutes)

    // Calculate sleep duration for both
    const yourSleepDuration = (24 * 60 + yourSleepMinutes - yourWakeupMinutes) % (24 * 60)
    const partnerSleepDuration = (24 * 60 + partnerSleepMinutes - partnerWakeupMinutes) % (24 * 60)
    const sleepDurationDifference = Math.abs(yourSleepDuration - partnerSleepDuration)

    // Calculate scores (lower difference = higher score)
    const wakeupScore = Math.max(0, 100 - wakeupDifference / 3)
    const sleepScore = Math.max(0, 100 - sleepDifference / 3)
    const durationScore = Math.max(0, 100 - sleepDurationDifference / 6)

    // Calculate final score
    const finalScore = Math.round((wakeupScore + sleepScore + durationScore) / 3)

    // Generate results
    let title, description, recommendations

    if (finalScore >= 85) {
      title = "Ausgezeichnete chronobiologische Übereinstimmung 😴"
      description =
        "Eure Schlaf-Wach-Rhythmen sind hervorragend aufeinander abgestimmt. Das bedeutet, dass ihr ähnliche Energielevel zu ähnlichen Tageszeiten habt, was die gemeinsame Zeit harmonischer gestaltet."
      recommendations = [
        "Nutzt eure kompatiblen Rhythmen für gemeinsame Morgen- oder Abendroutinen. 🌅",
        "Plant wichtige Gespräche oder Entscheidungen zu Zeiten, in denen ihr beide wach und aufmerksam seid. 🧠",
        "Achtet darauf, dass externe Faktoren (wie Arbeitsstress) eure natürlichen Rhythmen nicht zu stark beeinflussen. ⚖️",
      ]
    } else if (finalScore >= 70) {
      title = "Gute chronobiologische Übereinstimmung 👍"
      description =
        "Eure Schlaf-Wach-Rhythmen sind gut aufeinander abgestimmt, mit einigen Unterschieden. Diese Basis ermöglicht euch, den Alltag gut zu koordinieren, erfordert aber manchmal Anpassungen."
      recommendations = [
        "Findet Kompromisse bei gemeinsamen Aktivitäten, die eure unterschiedlichen Energiephasen berücksichtigen. 🔄",
        "Respektiert die Zeiten, in denen der Partner mehr Ruhe oder Schlaf benötigt. 💤",
        "Kommuniziert offen über eure Bedürfnisse bezüglich Schlaf und Aktivität. 🗣️",
      ]
    } else if (finalScore >= 50) {
      title = "Moderate chronobiologische Übereinstimmung 🤔"
      description =
        "Eure Schlaf-Wach-Rhythmen weisen einige Unterschiede auf. Diese können zu Herausforderungen im Alltag führen, sind aber durch gegenseitige Rücksichtnahme gut zu bewältigen."
      recommendations = [
        "Schafft Räume und Zeiten, in denen jeder seinem natürlichen Rhythmus folgen kann. 🏠",
        "Plant bewusst gemeinsame Qualitätszeit zu Zeiten, die für beide angenehm sind. ⏰",
        "Entwickelt Strategien für Situationen, in denen eure unterschiedlichen Rhythmen zu Konflikten führen könnten. 🛠️",
      ]
    } else {
      title = "Herausfordernde chronobiologische Übereinstimmung 🔍"
      description =
        "Eure Schlaf-Wach-Rhythmen unterscheiden sich deutlich. Dies kann im Alltag zu Herausforderungen führen, aber mit bewusster Planung und gegenseitigem Verständnis könnt ihr damit umgehen."
      recommendations = [
        "Akzeptiert eure unterschiedlichen Rhythmen als Teil eurer Individualität. 🧩",
        "Schafft separate Schlafbereiche oder -routinen, wenn die Unterschiede den Schlaf beeinträchtigen. 🛏️",
        "Findet kreative Lösungen, um trotz unterschiedlicher aktiver Phasen Qualitätszeit miteinander zu verbringen. 💡",
      ]
    }

    setBiorhythmResults({
      score: finalScore,
      title,
      description,
      recommendations,
    })

    // Create chart
    setTimeout(() => {
      if (biorhythmChartRef.current) {
        const ctx = biorhythmChartRef.current.getContext("2d")
        if (ctx) {
          if (biorhythmChartInstance.current) {
            biorhythmChartInstance.current.destroy()
          }

          // Convert times to hours for visualization
          const yourWakeupHour = yourWakeupMinutes / 60
          const partnerWakeupHour = partnerWakeupMinutes / 60
          const yourSleepHour = yourSleepMinutes / 60
          const partnerSleepHour = partnerSleepMinutes / 60

          biorhythmChartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
              datasets: [
                {
                  label: "Dein Aktivitätslevel",
                  data: Array.from({ length: 24 }, (_, hour) => {
                    // Create a simple activity curve based on wake/sleep times
                    const hourFromWakeup = (hour - yourWakeupHour + 24) % 24
                    const hourToSleep = (yourSleepHour - hour + 24) % 24

                    if (hourFromWakeup < 0 || hourToSleep < 0) return 0

                    // Peak activity a few hours after waking up
                    if (hourFromWakeup < 3) return 50 + hourFromWakeup * 15
                    if (hourToSleep < 2) return 50 - (2 - hourToSleep) * 25

                    return 90 - Math.min(hourFromWakeup - 3, 8) * 5
                  }),
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: "Partner Aktivitätslevel",
                  data: Array.from({ length: 24 }, (_, hour) => {
                    // Create a simple activity curve based on wake/sleep times
                    const hourFromWakeup = (hour - partnerWakeupHour + 24) % 24
                    const hourToSleep = (partnerSleepHour - hour + 24) % 24

                    if (hourFromWakeup < 0 || hourToSleep < 0) return 0

                    // Peak activity a few hours after waking up
                    if (hourFromWakeup < 3) return 50 + hourFromWakeup * 15
                    if (hourToSleep < 2) return 50 - (2 - hourToSleep) * 25

                    return 90 - Math.min(hourFromWakeup - 3, 8) * 5
                  }),
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "Aktivitätslevel (%)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Tageszeit",
                  },
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Tägliche Aktivitätskurven",
                },
              },
            },
          })
        }
      }
    }, 100)
  }

  const calculateTemperatureCompatibility = () => {
    // Calculate differences in temperature preferences
    const roomTempDifference = Math.abs(temperatureData.yourRoomTemp - temperatureData.partnerRoomTemp)
    const bedroomTempDifference = Math.abs(temperatureData.yourBedroomTemp - temperatureData.partnerBedroomTemp)

    // Calculate scores (lower difference = higher score)
    const roomTempScore = Math.max(0, 100 - roomTempDifference * 10)
    const bedroomTempScore = Math.max(0, 100 - bedroomTempDifference * 10)

    // Calculate final score
    const finalScore = Math.round((roomTempScore + bedroomTempScore) / 2)

    // Generate results
    let title, description, recommendations

    if (finalScore >= 85) {
      title = "Ausgezeichnete Temperatur-Übereinstimmung 🌡️"
      description =
        "Eure bevorzugten Temperaturbereiche überlappen sich stark. Das bedeutet, dass ihr euch beide in ähnlichen Umgebungstemperaturen wohlfühlt, was Konflikte über Heizung oder Klimaanlage minimiert."
      recommendations = [
        "Nutzt eure ähnlichen Temperaturpräferenzen für ein harmonisches Zusammenleben. 🏡",
        "Achtet gemeinsam auf energieeffiziente Heiz- und Kühlmethoden. 🌱",
        "Sprecht über saisonale Anpassungen eurer Wohlfühltemperaturen. 🍂",
      ]
    } else if (finalScore >= 70) {
      title = "Gute Temperatur-Übereinstimmung 👍"
      description =
        "Eure Temperaturpräferenzen sind ähnlich, mit kleinen Unterschieden. Diese Basis ermöglicht euch, die Raumtemperatur so einzustellen, dass beide zufrieden sind, mit gelegentlichen Kompromissen."
      recommendations = [
        "Findet Kompromisstemperaturen, die für beide angenehm sind. 🤝",
        "Berücksichtigt, dass Temperaturempfinden je nach Tageszeit und Aktivität variieren kann. ⏱️",
        "Kommuniziert offen, wenn euch zu warm oder zu kalt ist. 🗣️",
      ]
    } else if (finalScore >= 50) {
      title = "Moderate Temperatur-Übereinstimmung 🤔"
      description =
        "Eure Temperaturpräferenzen weisen einige Unterschiede auf. Diese können zu gelegentlichen Diskussionen führen, sind aber durch Kompromisse und kreative Lösungen gut zu bewältigen."
      recommendations = [
        "Erwägt zonierte Heiz- oder Kühlsysteme für verschiedene Bereiche der Wohnung. 🏠",
        "Nutzt persönliche Lösungen wie Decken, Ventilatoren oder wärmere Kleidung. 🧣",
        "Wechselt euch ab, wer die Temperatur bestimmen darf, oder findet einen Mittelwert. 🔄",
      ]
    } else {
      title = "Herausfordernde Temperatur-Übereinstimmung 🔍"
      description =
        "Eure Temperaturpräferenzen unterscheiden sich deutlich. Dies kann zu Konflikten führen, aber mit kreativen Lösungen und gegenseitigem Verständnis könnt ihr damit umgehen."
      recommendations = [
        "Investiert in Technologien wie Heizdecken, persönliche Ventilatoren oder zonierte Klimasysteme. 💡",
        "Erwägt separate Schlafbereiche mit unterschiedlichen Temperaturen, wenn die Unterschiede den Schlaf beeinträchtigen. 🛏️",
        "Respektiert die physiologischen Unterschiede im Temperaturempfinden und sucht nach Kompromissen. 🧠",
      ]
    }

    setTemperatureResults({
      score: finalScore,
      title,
      description,
      recommendations,
    })

    // Create chart
    setTimeout(() => {
      if (temperatureChartRef.current) {
        const ctx = temperatureChartRef.current.getContext("2d")
        if (ctx) {
          if (temperatureChartInstance.current) {
            temperatureChartInstance.current.destroy()
          }

          temperatureChartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
              labels: ["Wohnraum", "Schlafzimmer"],
              datasets: [
                {
                  label: "Deine Präferenz",
                  data: [temperatureData.yourRoomTemp, temperatureData.yourBedroomTemp],
                  backgroundColor: "rgba(255, 99, 132, 0.7)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
                {
                  label: "Partner Präferenz",
                  data: [temperatureData.partnerRoomTemp, temperatureData.partnerBedroomTemp],
                  backgroundColor: "rgba(54, 162, 235, 0.7)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: false,
                  min: Math.min(14, temperatureData.yourBedroomTemp, temperatureData.partnerBedroomTemp) - 2,
                  max: Math.max(28, temperatureData.yourRoomTemp, temperatureData.partnerRoomTemp) + 2,
                  title: {
                    display: true,
                    text: "Temperatur (°C)",
                  },
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Temperaturpräferenzen im Vergleich",
                },
              },
            },
          })
        }
      }
    }, 100)
  }

  // Helper function to convert time string to minutes
  const convertTimeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  const handleExportExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Create worksheets based on active module
      if (activeModule === "finance" && financeResults) {
        const financeData = [
          ["Love-Worth Finanz-Abstimmungs-Simulator - Ergebnisse"],
          ["Erstellt am", new Date().toLocaleString()],
          [""],
          ["Finanzkompatibilität", `${financeResults.score}%`],
          ["Bewertung", financeResults.title.replace(/\s*[^\w\s]\s*$/, "")], // Remove emoji
          [""],
          ["Beschreibung", financeResults.description],
          [""],
          ["Empfehlungen"],
        ]

        financeResults.recommendations.forEach((recommendation) => {
          financeData.push([recommendation.replace(/\s*[^\w\s]\s*$/, "")]) // Remove emoji
        })

        const ws = XLSX.utils.aoa_to_sheet(financeData)
        XLSX.utils.book_append_sheet(wb, ws, "Finanz-Simulator")
      } else if (activeModule === "biorhythm" && biorhythmResults) {
        const biorhythmDataExport = [
          ["Love-Worth Biorhythmus-Abgleich - Ergebnisse"],
          ["Erstellt am", new Date().toLocaleString()],
          [""],
          ["Biorhythmus-Kompatibilität", `${biorhythmResults.score}%`],
          ["Bewertung", biorhythmResults.title.replace(/\s*[^\w\s]\s*$/, "")], // Remove emoji
          [""],
          ["Beschreibung", biorhythmResults.description],
          [""],
          ["Deine Daten"],
          ["Geburtsdatum", biorhythmData.yourBirthdate],
          ["Aufwachzeit", biorhythmData.yourWakeupTime],
          ["Schlafenszeit", biorhythmData.yourSleepTime],
          [""],
          ["Partner Daten"],
          ["Geburtsdatum", biorhythmData.partnerBirthdate],
          ["Aufwachzeit", biorhythmData.partnerWakeupTime],
          ["Schlafenszeit", biorhythmData.partnerSleepTime],
          [""],
          ["Empfehlungen"],
        ]

        biorhythmResults.recommendations.forEach((recommendation) => {
          biorhythmDataExport.push([recommendation.replace(/\s*[^\w\s]\s*$/, "")]) // Remove emoji
        })

        const ws = XLSX.utils.aoa_to_sheet(biorhythmDataExport)
        XLSX.utils.book_append_sheet(wb, ws, "Biorhythmus-Abgleich")
      } else if (activeModule === "temperature" && temperatureResults) {
        const temperatureDataExport = [
          ["Love-Worth Temperatur-Harmonie - Ergebnisse"],
          ["Erstellt am", new Date().toLocaleString()],
          [""],
          ["Temperatur-Kompatibilität", `${temperatureResults.score}%`],
          ["Bewertung", temperatureResults.title.replace(/\s*[^\w\s]\s*$/, "")], // Remove emoji
          [""],
          ["Beschreibung", temperatureResults.description],
          [""],
          ["Deine Präferenzen"],
          ["Wohnraum", `${temperatureData.yourRoomTemp}°C`],
          ["Schlafzimmer", `${temperatureData.yourBedroomTemp}°C`],
          [""],
          ["Partner Präferenzen"],
          ["Wohnraum", `${temperatureData.partnerRoomTemp}°C`],
          ["Schlafzimmer", `${temperatureData.partnerBedroomTemp}°C`],
          [""],
          ["Empfehlungen"],
        ]

        temperatureResults.recommendations.forEach((recommendation) => {
          temperatureDataExport.push([recommendation.replace(/\s*[^\w\s]\s*$/, "")]) // Remove emoji
        })

        const ws = XLSX.utils.aoa_to_sheet(temperatureDataExport)
        XLSX.utils.book_append_sheet(wb, ws, "Temperatur-Harmonie")
      } else {
        // Default empty sheet if no module is active
        const defaultData = [
          ["Love-Worth Spezialmodule"],
          ["Erstellt am", new Date().toLocaleString()],
          [""],
          ["Bitte wähle ein Spezialmodul aus und führe die Analyse durch, um detaillierte Ergebnisse zu erhalten."],
        ]

        const ws = XLSX.utils.aoa_to_sheet(defaultData)
        XLSX.utils.book_append_sheet(wb, ws, "Spezialmodule")
      }

      // Export to Excel file
      XLSX.writeFile(wb, "Love-Worth-Spezialmodule.xlsx")

      toast({
        title: "Excel-Export erfolgreich",
        description: "Deine Ergebnisse wurden als Excel-Datei heruntergeladen.",
      })
    } catch (error) {
      toast({
        title: "Excel-Export fehlgeschlagen",
        description: "Beim Exportieren der Ergebnisse ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF()
      let yPos = 20

      // Title
      doc.setFontSize(20)
      doc.setTextColor(220, 47, 112) // Primary color

      if (activeModule === "finance" && financeResults) {
        doc.text("Love-Worth Finanz-Abstimmungs-Simulator", 105, yPos, { align: "center" })
        yPos += 10

        // Date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Erstellt am: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" })
        yPos += 15

        // Score
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Finanzkompatibilität", 20, yPos)
        yPos += 10

        doc.setFontSize(30)
        doc.setTextColor(220, 47, 112)
        doc.text(`${financeResults.score}%`, 20, yPos)

        doc.setFontSize(14)
        const titleWithoutEmoji = financeResults.title.replace(/\s*[^\w\s]\s*$/, "")
        doc.text(titleWithoutEmoji, 60, yPos)
        yPos += 15

        // Description
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        const splitDescription = doc.splitTextToSize(financeResults.description, 170)
        doc.text(splitDescription, 20, yPos)
        yPos += splitDescription.length * 7 + 10

        // Recommendations
        doc.setFontSize(14)
        doc.text("Empfehlungen für eure finanzielle Harmonie", 20, yPos)
        yPos += 8

        doc.setFontSize(10)
        financeResults.recommendations.forEach((recommendation) => {
          const cleanRecommendation = recommendation.replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
          const splitRecommendation = doc.splitTextToSize(`• ${cleanRecommendation}`, 170)
          doc.text(splitRecommendation, 20, yPos)
          yPos += splitRecommendation.length * 5 + 3

          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      } else if (activeModule === "biorhythm" && biorhythmResults) {
        doc.text("Love-Worth Biorhythmus-Abgleich", 105, yPos, { align: "center" })
        yPos += 10

        // Date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Erstellt am: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" })
        yPos += 15

        // Score
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Biorhythmus-Kompatibilität", 20, yPos)
        yPos += 10

        doc.setFontSize(30)
        doc.setTextColor(220, 47, 112)
        doc.text(`${biorhythmResults.score}%`, 20, yPos)

        doc.setFontSize(14)
        const titleWithoutEmoji = biorhythmResults.title.replace(/\s*[^\w\s]\s*$/, "")
        doc.text(titleWithoutEmoji, 60, yPos)
        yPos += 15

        // Description
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        const splitDescription = doc.splitTextToSize(biorhythmResults.description, 170)
        doc.text(splitDescription, 20, yPos)
        yPos += splitDescription.length * 7 + 10

        // Data
        doc.setFontSize(14)
        doc.text("Eure Schlaf-Wach-Daten", 20, yPos)
        yPos += 8

        doc.setFontSize(10)
        doc.text(`Dein Aufwachzeit: ${biorhythmData.yourWakeupTime}`, 20, yPos)
        yPos += 5
        doc.text(`Dein Schlafenszeit: ${biorhythmData.yourSleepTime}`, 20, yPos)
        yPos += 5
        doc.text(`Partner Aufwachzeit: ${biorhythmData.partnerWakeupTime}`, 20, yPos)
        yPos += 5
        doc.text(`Partner Schlafenszeit: ${biorhythmData.partnerSleepTime}`, 20, yPos)
        yPos += 10

        // Recommendations
        doc.setFontSize(14)
        doc.text("Empfehlungen für eure chronobiologische Harmonie", 20, yPos)
        yPos += 8

        doc.setFontSize(10)
        biorhythmResults.recommendations.forEach((recommendation) => {
          const cleanRecommendation = recommendation.replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
          const splitRecommendation = doc.splitTextToSize(`• ${cleanRecommendation}`, 170)
          doc.text(splitRecommendation, 20, yPos)
          yPos += splitRecommendation.length * 5 + 3

          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      } else if (activeModule === "temperature" && temperatureResults) {
        doc.text("Love-Worth Temperatur-Harmonie", 105, yPos, { align: "center" })
        yPos += 10

        // Date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Erstellt am: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" })
        yPos += 15

        // Score
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Temperatur-Kompatibilität", 20, yPos)
        yPos += 10

        doc.setFontSize(30)
        doc.setTextColor(220, 47, 112)
        doc.text(`${temperatureResults.score}%`, 20, yPos)

        doc.setFontSize(14)
        const titleWithoutEmoji = temperatureResults.title.replace(/\s*[^\w\s]\s*$/, "")
        doc.text(titleWithoutEmoji, 60, yPos)
        yPos += 15

        // Description
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        const splitDescription = doc.splitTextToSize(temperatureResults.description, 170)
        doc.text(splitDescription, 20, yPos)
        yPos += splitDescription.length * 7 + 10

        // Data
        doc.setFontSize(14)
        doc.text("Eure Temperaturpräferenzen", 20, yPos)
        yPos += 8

        doc.setFontSize(10)
        doc.text(`Deine Wohnraumtemperatur: ${temperatureData.yourRoomTemp}°C`, 20, yPos)
        yPos += 5
        doc.text(`Deine Schlafzimmertemperatur: ${temperatureData.yourBedroomTemp}°C`, 20, yPos)
        yPos += 5
        doc.text(`Partner Wohnraumtemperatur: ${temperatureData.partnerRoomTemp}°C`, 20, yPos)
        yPos += 5
        doc.text(`Partner Schlafzimmertemperatur: ${temperatureData.partnerBedroomTemp}°C`, 20, yPos)
        yPos += 10

        // Recommendations
        doc.setFontSize(14)
        doc.text("Empfehlungen für eure Temperatur-Harmonie", 20, yPos)
        yPos += 8

        doc.setFontSize(10)
        temperatureResults.recommendations.forEach((recommendation) => {
          const cleanRecommendation = recommendation.replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
          const splitRecommendation = doc.splitTextToSize(`• ${cleanRecommendation}`, 170)
          doc.text(splitRecommendation, 20, yPos)
          yPos += splitRecommendation.length * 5 + 3

          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      } else {
        doc.text("Love-Worth Spezialmodule", 105, yPos, { align: "center" })
        yPos += 10

        // Date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Erstellt am: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" })
        yPos += 15

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(
          "Bitte wähle ein Spezialmodul aus und führe die Analyse durch, um detaillierte Ergebnisse zu erhalten.",
          20,
          yPos,
        )
      }

      // Save PDF
      doc.save("Love-Worth-Spezialmodule.pdf")

      toast({
        title: "PDF-Export erfolgreich",
        description: "Deine Ergebnisse wurden als PDF-Datei heruntergeladen.",
      })
    } catch (error) {
      toast({
        title: "PDF-Export fehlgeschlagen",
        description: "Beim Exportieren der Ergebnisse ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      {!activeModule && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Spezialmodule 🧩</CardTitle>
              <CardDescription>
                Entdecke weitere Aspekte eurer Beziehungskompatibilität mit unseren Spezialmodulen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "finance",
                    icon: <Calculator className="h-6 w-6 text-primary" />,
                    title: "Finanz-Abstimmungs-Simulator 💰",
                    description:
                      "Simuliert gemeinsame Finanzentscheidungen und analysiert eure Kompatibilität bei Investitionen, Sparen und Ausgaben.",
                  },
                  {
                    id: "biorhythm",
                    icon: <Calendar className="h-6 w-6 text-primary" />,
                    title: "Biorhythmus-Abgleich 😴",
                    description:
                      "Analysiert eure chronobiologischen Zyklen (Schlaf-Wach-, Leistungszyklen) und deren Kompatibilität.",
                  },
                  {
                    id: "temperature",
                    icon: <Thermometer className="h-6 w-6 text-primary" />,
                    title: "Temperatur-Harmonie 🌡️",
                    description:
                      "Misst, ob beide Partner*innen ähnliche Wohlfühl-Temperaturspannen haben (Schlaf, Raumklima).",
                  },
                ].map((module, index) => (
                  <AnimatedTransition key={module.id} show={true} animation="scale" duration={400 + index * 100}>
                    <Card
                      className="border-2 hover:border-primary transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => setActiveModule(module.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 animate-pulse-gentle">
                          {module.icon}
                        </div>
                        <CardTitle>{module.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{module.description}</p>
                      </CardContent>
                    </Card>
                  </AnimatedTransition>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ergebnisse exportieren 📊</CardTitle>
              <CardDescription>
                Lade deine Beziehungskompatibilitäts-Ergebnisse herunter, um sie zu speichern oder zu teilen.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center gap-2 w-full" onClick={handleExportExcel}>
                <Download className="h-4 w-4" />
                Als Excel-Datei herunterladen
              </Button>
              <Button variant="outline" className="flex items-center gap-2 w-full" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />
                Als PDF-Datei herunterladen
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {activeModule === "finance" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Finanz-Abstimmungs-Simulator 💰</CardTitle>
                <CardDescription>
                  Simuliere gemeinsame Finanzentscheidungen und entdecke eure Kompatibilität in finanziellen Fragen
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setActiveModule(null)}>
                Zurück
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!financeResults ? (
              <div className="space-y-8">
                {/* Scenario 1 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Szenario 1: Unerwarteter Geldsegen 💸</h3>
                  <p>Ihr erhaltet unerwartet 10.000€. Wie würdet ihr das Geld verwenden?</p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Deine Entscheidung:</h4>
                    <RadioGroup
                      value={financeAnswers["1_you"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("1", "you", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s1-you-a" className="mt-1" />
                        <Label htmlFor="s1-you-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Vollständig sparen/investieren 💼</div>
                          <p className="text-muted-foreground text-sm">
                            Das Geld für die Zukunft zurücklegen oder in sichere Anlagen investieren.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s1-you-b" className="mt-1" />
                        <Label htmlFor="s1-you-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Teilweise sparen, teilweise ausgeben ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            Einen Teil (z.B. 7.000€) sparen und den Rest für aktuelle Wünsche ausgeben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s1-you-c" className="mt-1" />
                        <Label htmlFor="s1-you-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Größtenteils ausgeben 🛍️</div>
                          <p className="text-muted-foreground text-sm">
                            Den Großteil für aktuelle Wünsche ausgeben, nur einen kleinen Teil sparen.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s1-you-d" className="mt-1" />
                        <Label htmlFor="s1-you-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Vollständig ausgeben 🏖️</div>
                          <p className="text-muted-foreground text-sm">
                            Das Geld für eine große Anschaffung oder Reise verwenden.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Die Entscheidung deines Partners:</h4>
                    <RadioGroup
                      value={financeAnswers["1_partner"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("1", "partner", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s1-partner-a" className="mt-1" />
                        <Label htmlFor="s1-partner-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Vollständig sparen/investieren 💼</div>
                          <p className="text-muted-foreground text-sm">
                            Das Geld für die Zukunft zurücklegen oder in sichere Anlagen investieren.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s1-partner-b" className="mt-1" />
                        <Label htmlFor="s1-partner-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Teilweise sparen, teilweise ausgeben ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            Einen Teil (z.B. 7.000€) sparen und den Rest für aktuelle Wünsche ausgeben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s1-partner-c" className="mt-1" />
                        <Label htmlFor="s1-partner-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Größtenteils ausgeben 🛍️</div>
                          <p className="text-muted-foreground text-sm">
                            Den Großteil für aktuelle Wünsche ausgeben, nur einen kleinen Teil sparen.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s1-partner-d" className="mt-1" />
                        <Label htmlFor="s1-partner-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Vollständig ausgeben 🏖️</div>
                          <p className="text-muted-foreground text-sm">
                            Das Geld für eine große Anschaffung oder Reise verwenden.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Szenario 2: Langfristige Finanzplanung 📈</h3>
                  <p>Wie würdest du euer monatliches Einkommen aufteilen?</p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Deine Entscheidung:</h4>
                    <RadioGroup
                      value={financeAnswers["2_you"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("2", "you", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s2-you-a" className="mt-1" />
                        <Label htmlFor="s2-you-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Maximale Sparrate 🏦</div>
                          <p className="text-muted-foreground text-sm">
                            Mehr als 30% des Einkommens sparen, sehr sparsam leben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s2-you-b" className="mt-1" />
                        <Label htmlFor="s2-you-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Ausgewogene Aufteilung ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            15-25% sparen, Rest für Lebenshaltung und moderate Freizeitausgaben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s2-you-c" className="mt-1" />
                        <Label htmlFor="s2-you-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Komfort-orientiert 🛋️</div>
                          <p className="text-muted-foreground text-sm">
                            5-15% sparen, mehr für Lebensqualität und Komfort ausgeben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s2-you-d" className="mt-1" />
                        <Label htmlFor="s2-you-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Leben im Jetzt 🎉</div>
                          <p className="text-muted-foreground text-sm">
                            Weniger als 5% sparen, Fokus auf aktuelle Lebensqualität und Erlebnisse.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Die Entscheidung deines Partners:</h4>
                    <RadioGroup
                      value={financeAnswers["2_partner"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("2", "partner", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s2-partner-a" className="mt-1" />
                        <Label htmlFor="s2-partner-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Maximale Sparrate 🏦</div>
                          <p className="text-muted-foreground text-sm">
                            Mehr als 30% des Einkommens sparen, sehr sparsam leben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s2-partner-b" className="mt-1" />
                        <Label htmlFor="s2-partner-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Ausgewogene Aufteilung ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            15-25% sparen, Rest für Lebenshaltung und moderate Freizeitausgaben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s2-partner-c" className="mt-1" />
                        <Label htmlFor="s2-partner-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Komfort-orientiert 🛋️</div>
                          <p className="text-muted-foreground text-sm">
                            5-15% sparen, mehr für Lebensqualität und Komfort ausgeben.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s2-partner-d" className="mt-1" />
                        <Label htmlFor="s2-partner-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Leben im Jetzt 🎉</div>
                          <p className="text-muted-foreground text-sm">
                            Weniger als 5% sparen, Fokus auf aktuelle Lebensqualität und Erlebnisse.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Scenario 3 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Szenario 3: Finanzielle Risikobereitschaft 🎲</h3>
                  <p>Wie würdest du 20.000€ Ersparnisse anlegen?</p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Deine Entscheidung:</h4>
                    <RadioGroup
                      value={financeAnswers["3_you"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("3", "you", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s3-you-a" className="mt-1" />
                        <Label htmlFor="s3-you-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Sehr konservativ 🛡️</div>
                          <p className="text-muted-foreground text-sm">
                            Festgeld, Sparbuch oder andere sehr sichere Anlagen mit geringer Rendite.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s3-you-b" className="mt-1" />
                        <Label htmlFor="s3-you-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Ausgewogen ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            Mischung aus sicheren Anlagen und Aktien/ETFs mit moderatem Risiko.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s3-you-c" className="mt-1" />
                        <Label htmlFor="s3-you-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Wachstumsorientiert 📈</div>
                          <p className="text-muted-foreground text-sm">
                            Überwiegend Aktien/ETFs mit höherem Risiko und Renditepotenzial.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s3-you-d" className="mt-1" />
                        <Label htmlFor="s3-you-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Hochspekulativ 🚀</div>
                          <p className="text-muted-foreground text-sm">
                            Kryptowährungen, Einzelaktien oder andere spekulative Anlagen mit hohem Risiko.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Die Entscheidung deines Partners:</h4>
                    <RadioGroup
                      value={financeAnswers["3_partner"] || ""}
                      onValueChange={(value) => handleFinanceOptionSelect("3", "partner", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="a" id="s3-partner-a" className="mt-1" />
                        <Label htmlFor="s3-partner-a" className="font-normal cursor-pointer">
                          <div className="font-medium">Sehr konservativ 🛡️</div>
                          <p className="text-muted-foreground text-sm">
                            Festgeld, Sparbuch oder andere sehr sichere Anlagen mit geringer Rendite.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="b" id="s3-partner-b" className="mt-1" />
                        <Label htmlFor="s3-partner-b" className="font-normal cursor-pointer">
                          <div className="font-medium">Ausgewogen ⚖️</div>
                          <p className="text-muted-foreground text-sm">
                            Mischung aus sicheren Anlagen und Aktien/ETFs mit moderatem Risiko.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="c" id="s3-partner-c" className="mt-1" />
                        <Label htmlFor="s3-partner-c" className="font-normal cursor-pointer">
                          <div className="font-medium">Wachstumsorientiert 📈</div>
                          <p className="text-muted-foreground text-sm">
                            Überwiegend Aktien/ETFs mit höherem Risiko und Renditepotenzial.
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="d" id="s3-partner-d" className="mt-1" />
                        <Label htmlFor="s3-partner-d" className="font-normal cursor-pointer">
                          <div className="font-medium">Hochspekulativ 🚀</div>
                          <p className="text-muted-foreground text-sm">
                            Kryptowährungen, Einzelaktien oder andere spekulative Anlagen mit hohem Risiko.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={calculateFinanceCompatibility} className="w-full">
                    Finanzkompatibilität berechnen <Calculator className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-muted">
                      <div
                        className={`absolute inset-2 rounded-full ${
                          financeResults.score >= 80
                            ? "bg-green-500"
                            : financeResults.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        } animate-pulse-gentle`}
                        style={{ opacity: financeResults.score / 100 }}
                      ></div>
                      <span className="text-4xl font-bold relative z-10">
                        <AnimatedCounter value={financeResults.score} suffix="%" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-center">{financeResults.title}</h3>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-lg">{financeResults.description}</p>

                    <div className="w-full h-[250px]">
                      <canvas ref={financeChartRef}></canvas>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Empfehlungen für eure finanzielle Harmonie</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {financeResults.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button onClick={() => setFinanceResults(null)} variant="outline">
                        Zurück zum Simulator
                      </Button>
                      <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als Excel-Datei herunterladen
                      </Button>
                      <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als PDF-Datei herunterladen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeModule === "biorhythm" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Biorhythmus-Abgleich 😴</CardTitle>
                <CardDescription>Analysiere eure chronobiologischen Zyklen und deren Kompatibilität</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setActiveModule(null)}>
                Zurück
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!biorhythmResults ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Deine Daten 📋</h3>

                    <div className="space-y-2">
                      <Label htmlFor="your-birthdate">Dein Geburtsdatum 🎂</Label>
                      <Input
                        type="date"
                        id="your-birthdate"
                        value={biorhythmData.yourBirthdate}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, yourBirthdate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="your-wakeup-time">Deine typische Aufwachzeit ⏰</Label>
                      <Input
                        type="time"
                        id="your-wakeup-time"
                        value={biorhythmData.yourWakeupTime}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, yourWakeupTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="your-sleep-time">Deine typische Schlafenszeit 🌙</Label>
                      <Input
                        type="time"
                        id="your-sleep-time"
                        value={biorhythmData.yourSleepTime}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, yourSleepTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Daten deines Partners 📋</h3>

                    <div className="space-y-2">
                      <Label htmlFor="partner-birthdate">Partner*in Geburtsdatum 🎂</Label>
                      <Input
                        type="date"
                        id="partner-birthdate"
                        value={biorhythmData.partnerBirthdate}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, partnerBirthdate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partner-wakeup-time">Partner*in typische Aufwachzeit ⏰</Label>
                      <Input
                        type="time"
                        id="partner-wakeup-time"
                        value={biorhythmData.partnerWakeupTime}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, partnerWakeupTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partner-sleep-time">Partner*in typische Schlafenszeit 🌙</Label>
                      <Input
                        type="time"
                        id="partner-sleep-time"
                        value={biorhythmData.partnerSleepTime}
                        onChange={(e) => setBiorhythmData({ ...biorhythmData, partnerSleepTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={calculateBiorhythmCompatibility} className="w-full">
                    Biorhythmus analysieren <Calendar className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-muted">
                      <div
                        className={`absolute inset-2 rounded-full ${
                          biorhythmResults.score >= 80
                            ? "bg-green-500"
                            : biorhythmResults.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        } animate-pulse-gentle`}
                        style={{ opacity: biorhythmResults.score / 100 }}
                      ></div>
                      <span className="text-4xl font-bold relative z-10">
                        <AnimatedCounter value={biorhythmResults.score} suffix="%" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-center">{biorhythmResults.title}</h3>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-lg">{biorhythmResults.description}</p>

                    <div className="w-full h-[250px]">
                      <canvas ref={biorhythmChartRef}></canvas>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Empfehlungen für eure chronobiologische Harmonie</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {biorhythmResults.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button onClick={() => setBiorhythmResults(null)} variant="outline">
                        Zurück zum Biorhythmus-Abgleich
                      </Button>
                      <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als Excel-Datei herunterladen
                      </Button>
                      <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als PDF-Datei herunterladen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeModule === "temperature" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Temperatur-Harmonie 🌡️</CardTitle>
                <CardDescription>Analysiere eure Wohlfühl-Temperaturspannen und deren Kompatibilität</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setActiveModule(null)}>
                Zurück
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!temperatureResults ? (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Deine bevorzugte Raumtemperatur 🏠</h3>
                      <span className="font-medium">{temperatureData.yourRoomTemp}°C</span>
                    </div>
                    <Slider
                      value={[temperatureData.yourRoomTemp]}
                      min={16}
                      max={28}
                      step={1}
                      onValueChange={(value) => setTemperatureData({ ...temperatureData, yourRoomTemp: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kühl (16°C)</span>
                      <span>Moderat (22°C)</span>
                      <span>Warm (28°C)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Partner*in bevorzugte Raumtemperatur 🏠</h3>
                      <span className="font-medium">{temperatureData.partnerRoomTemp}°C</span>
                    </div>
                    <Slider
                      value={[temperatureData.partnerRoomTemp]}
                      min={16}
                      max={28}
                      step={1}
                      onValueChange={(value) => setTemperatureData({ ...temperatureData, partnerRoomTemp: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kühl (16°C)</span>
                      <span>Moderat (22°C)</span>
                      <span>Warm (28°C)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Deine bevorzugte Schlafzimmertemperatur 🛏️</h3>
                      <span className="font-medium">{temperatureData.yourBedroomTemp}°C</span>
                    </div>
                    <Slider
                      value={[temperatureData.yourBedroomTemp]}
                      min={14}
                      max={24}
                      step={1}
                      onValueChange={(value) => setTemperatureData({ ...temperatureData, yourBedroomTemp: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kühl (14°C)</span>
                      <span>Moderat (19°C)</span>
                      <span>Warm (24°C)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Partner*in bevorzugte Schlafzimmertemperatur 🛏️</h3>
                      <span className="font-medium">{temperatureData.partnerBedroomTemp}°C</span>
                    </div>
                    <Slider
                      value={[temperatureData.partnerBedroomTemp]}
                      min={14}
                      max={24}
                      step={1}
                      onValueChange={(value) =>
                        setTemperatureData({ ...temperatureData, partnerBedroomTemp: value[0] })
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kühl (14°C)</span>
                      <span>Moderat (19°C)</span>
                      <span>Warm (24°C)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={calculateTemperatureCompatibility} className="w-full">
                    Temperatur-Harmonie analysieren <Thermometer className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-muted">
                      <div
                        className={`absolute inset-2 rounded-full ${
                          temperatureResults.score >= 80
                            ? "bg-green-500"
                            : temperatureResults.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        } animate-pulse-gentle`}
                        style={{ opacity: temperatureResults.score / 100 }}
                      ></div>
                      <span className="text-4xl font-bold relative z-10">
                        <AnimatedCounter value={temperatureResults.score} suffix="%" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-center">{temperatureResults.title}</h3>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-lg">{temperatureResults.description}</p>

                    <div className="w-full h-[250px]">
                      <canvas ref={temperatureChartRef}></canvas>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Empfehlungen für eure Temperatur-Harmonie</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {temperatureResults.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button onClick={() => setTemperatureResults(null)} variant="outline">
                        Zurück zur Temperatur-Analyse
                      </Button>
                      <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als Excel-Datei herunterladen
                      </Button>
                      <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Als PDF-Datei herunterladen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
