"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, PieChart, LineChart, Grid3X3, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Chart from "chart.js/auto"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

import AnimatedCounter from "@/components/animated-counter"
import AnimatedProgress from "@/components/animated-progress"
import AnimatedTransition from "@/components/animated-transition"

interface ResultsComparisonProps {
  selectedTopics: string[]
  selfAssessment: Record<string, number>
  partnerAssessment: Record<string, number>
  multipleChoiceAnswers: Record<string, string>
  partnerMultipleChoiceAnswers: Record<string, string>
}

export default function ResultsComparison({
  selectedTopics,
  selfAssessment,
  partnerAssessment,
  multipleChoiceAnswers,
  partnerMultipleChoiceAnswers,
}: ResultsComparisonProps) {
  const { toast } = useToast()
  const [overallCompatibility, setOverallCompatibility] = useState(0)
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({})
  const [topicScores, setTopicScores] = useState<Record<string, number>>({})
  const [activeChart, setActiveChart] = useState<string>("radar")

  // Chart refs
  const radarChartRef = useRef<HTMLCanvasElement>(null)
  const radarChartInstance = useRef<Chart | null>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const barChartInstance = useRef<Chart | null>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)
  const heatmapInstance = useRef<Chart | null>(null)
  const weightingChartRef = useRef<HTMLCanvasElement>(null)
  const weightingChartInstance = useRef<Chart | null>(null)
  const matrixChartRef = useRef<HTMLCanvasElement>(null)
  const matrixChartInstance = useRef<Chart | null>(null)
  const answerComparisonRef = useRef<HTMLCanvasElement>(null)
  const answerComparisonInstance = useRef<Chart | null>(null)
  const correlationChartRef = useRef<HTMLCanvasElement>(null)
  const correlationChartInstance = useRef<Chart | null>(null)

  const topicLabels: Record<string, string> = {
    finance: "Finanzen 💰",
    biorhythm: "Biorhythmus & Schlaf 😴",
    temperature: "Temperatur-Präferenzen 🌡️",
    animals: "Tiere & Tierpflege 🐾",
    business: "Eigenes Geschäft & Karriere 💼",
    walking: "Spazieren & Outdoor 🚶",
    travel: "Reisen & Urlaub ✈️",
    cooking: "Kochen & Ernährung 🍳",
    social: "Sozialleben & Freundschaften 👥",
    technology: "Technologie & Digitales 💻",
    spirituality: "Spiritualität & Glaube 🧘",
    health: "Gesundheit & Fitness 🏋️",
    education: "Bildung & Lernen 📚",
    creativity: "Kreativität & Hobbys 🎨",
    environment: "Umweltbewusstsein 🌱",
    politics: "Politik & Engagement 🗳️",
    humor: "Humor & Unterhaltung 😂",
    space: "Persönlicher Raum 🚪",
    conflict: "Konfliktlösung 🤝",
    future: "Zukunftsplanung 🔮",
    leisure: "Freizeitgestaltung 🎮",
    traditions: "Traditionen & Feiertage 🎄",
  }

  const topicCategories: Record<string, string> = {
    finance: "Praktisches",
    biorhythm: "Lebensstil",
    temperature: "Lebensstil",
    animals: "Interessen",
    business: "Karriere",
    walking: "Aktivitäten",
    travel: "Aktivitäten",
    cooking: "Lebensstil",
    social: "Soziales",
    technology: "Interessen",
    spirituality: "Werte",
    health: "Lebensstil",
    education: "Interessen",
    creativity: "Interessen",
    environment: "Werte",
    politics: "Werte",
    humor: "Persönlichkeit",
    space: "Persönlichkeit",
    conflict: "Kommunikation",
    future: "Ziele",
    leisure: "Aktivitäten",
    traditions: "Werte",
  }

  const categoryLabels: Record<string, string> = {
    Praktisches: "Praktische Aspekte 🛠️",
    Lebensstil: "Lebensstil & Alltag 🏡",
    Interessen: "Interessen & Hobbys 🎯",
    Karriere: "Karriere & Beruf 💼",
    Aktivitäten: "Gemeinsame Aktivitäten 🏃",
    Soziales: "Soziales Leben 👥",
    Werte: "Werte & Überzeugungen ⚖️",
    Persönlichkeit: "Persönlichkeit & Charakter 🧠",
    Kommunikation: "Kommunikation 💬",
    Ziele: "Ziele & Zukunft 🎯",
  }

  const multipleChoiceLabels: Record<string, string> = {
    conflict_style: "Konfliktlösungsstil 🤝",
    activities: "Bevorzugte Aktivitäten 🏃",
    affection: "Ausdrucksformen von Zuneigung ❤️",
    freedom: "Bedürfnis nach persönlicher Freiheit 🕊️",
    finances: "Umgang mit finanziellen Entscheidungen 💰",
  }

  const multipleChoiceOptions: Record<string, Record<string, string>> = {
    conflict_style: {
      discuss: "Direkte Ansprache",
      compromise: "Kompromissbereit",
      avoid: "Vermeidend",
      emotional: "Emotional ausdrückend",
    },
    activities: {
      active: "Aktive Unternehmungen",
      cultural: "Kulturelle Aktivitäten",
      social: "Soziale Treffen",
      quiet: "Ruhige Aktivitäten",
    },
    affection: {
      words: "Durch Worte",
      touch: "Durch Berührungen",
      gifts: "Durch Geschenke",
      acts: "Durch Hilfsbereitschaft",
    },
    freedom: {
      high: "Viel Freiraum",
      moderate: "Ausgewogen",
      low: "Wenig Freiraum",
      flexible: "Situationsabhängig",
    },
    finances: {
      conservative: "Vorsichtig/Sparend",
      balanced: "Ausgewogen",
      spontaneous: "Spontan",
      planning: "Planend/Budgetierend",
    },
  }

  useEffect(() => {
    // Calculate topic compatibility scores
    const calculatedTopicScores: Record<string, number> = {}

    selectedTopics.forEach((topic) => {
      const selfValue = selfAssessment[topic] || 0
      const partnerValue = partnerAssessment[topic] || 0

      // Calculate compatibility based on importance and similarity
      const importanceFactor = (selfValue + partnerValue) / 2 / 100
      const similarityFactor = 100 - Math.abs(selfValue - partnerValue)

      // Weighted score: higher importance means the similarity matters more
      calculatedTopicScores[topic] = Math.round(similarityFactor * (0.5 + importanceFactor * 0.5))
    })

    setTopicScores(calculatedTopicScores)

    // Calculate category scores
    const categories = Array.from(new Set(selectedTopics.map((topic) => topicCategories[topic])))
    const calculatedCategoryScores: Record<string, number> = {}

    categories.forEach((category) => {
      const topicsInCategory = selectedTopics.filter((topic) => topicCategories[topic] === category)
      const categoryScore =
        topicsInCategory.reduce((sum, topic) => sum + calculatedTopicScores[topic], 0) / topicsInCategory.length
      calculatedCategoryScores[category] = Math.round(categoryScore)
    })

    setCategoryScores(calculatedCategoryScores)

    // Calculate multiple choice compatibility
    const multipleChoiceScore =
      Object.keys(multipleChoiceAnswers).reduce((score, questionId) => {
        const selfAnswer = multipleChoiceAnswers[questionId]
        const partnerAnswer = partnerMultipleChoiceAnswers[questionId]

        // If answers match exactly, add 100 points
        if (selfAnswer === partnerAnswer) {
          return score + 100
        }

        // For some questions, certain combinations might still be compatible
        // This is a simplified example - in a real app, you'd have more nuanced scoring
        return score + 50
      }, 0) / Object.keys(multipleChoiceAnswers).length

    // Overall compatibility is the average of topic scores and multiple choice score
    const topicAverage =
      Object.values(calculatedTopicScores).reduce((sum, score) => sum + score, 0) /
      Object.values(calculatedTopicScores).length
    const overallScore = Math.round(topicAverage * 0.7 + multipleChoiceScore * 0.3)

    setOverallCompatibility(overallScore)

    // Initialize charts after data is calculated
    initializeCharts(calculatedCategoryScores, calculatedTopicScores)

    return () => {
      // Cleanup charts on unmount
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy()
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }
      if (heatmapInstance.current) {
        heatmapInstance.current.destroy()
      }
      if (weightingChartInstance.current) {
        weightingChartInstance.current.destroy()
      }
      if (matrixChartInstance.current) {
        matrixChartInstance.current.destroy()
      }
      if (answerComparisonInstance.current) {
        answerComparisonInstance.current.destroy()
      }
      if (correlationChartInstance.current) {
        correlationChartInstance.current.destroy()
      }
    }
  }, [selectedTopics, selfAssessment, partnerAssessment, multipleChoiceAnswers, partnerMultipleChoiceAnswers])

  const initializeCharts = (categoryScores: Record<string, number>, topicScores: Record<string, number>) => {
    // Radar Chart (Category Scores)
    if (radarChartRef.current) {
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy()
      }

      const ctx = radarChartRef.current.getContext("2d")
      if (ctx) {
        radarChartInstance.current = new Chart(ctx, {
          type: "radar",
          data: {
            labels: Object.keys(categoryScores).map((category) => categoryLabels[category]),
            datasets: [
              {
                label: "Kompatibilität",
                data: Object.values(categoryScores),
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgb(255, 99, 132)",
                pointBackgroundColor: "rgb(255, 99, 132)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(255, 99, 132)",
              },
            ],
          },
          options: {
            scales: {
              r: {
                angleLines: {
                  display: true,
                },
                suggestedMin: 0,
                suggestedMax: 100,
              },
            },
          },
        })
      }
    }

    // Bar Chart (Priority Comparison)
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }

      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        const sortedTopics = selectedTopics
          .sort((a, b) => (selfAssessment[b] || 0) - (selfAssessment[a] || 0))
          .slice(0, 10) // Top 10 topics by your priority

        barChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: sortedTopics.map((topic) => topicLabels[topic]),
            datasets: [
              {
                label: "Deine Priorität",
                data: sortedTopics.map((topic) => selfAssessment[topic] || 0),
                backgroundColor: "rgba(255, 99, 132, 0.7)",
              },
              {
                label: "Partner Priorität",
                data: sortedTopics.map((topic) => partnerAssessment[topic] || 0),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
              },
            ],
          },
          options: {
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "Wichtigkeit (%)",
                },
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Prioritäten-Vergleich",
              },
            },
          },
        })
      }
    }

    // Heatmap (Topic Compatibility)
    if (heatmapRef.current) {
      if (heatmapInstance.current) {
        heatmapInstance.current.destroy()
      }

      const ctx = heatmapRef.current.getContext("2d")
      if (ctx) {
        // Create a dataset for the heatmap
        const heatmapData = selectedTopics.map((topic) => ({
          topic,
          label: topicLabels[topic],
          score: topicScores[topic],
          category: topicCategories[topic],
        }))

        // Sort by category and then by score
        heatmapData.sort((a, b) => {
          if (a.category === b.category) {
            return b.score - a.score
          }
          return a.category.localeCompare(b.category)
        })

        // Create color gradient based on scores
        const getColor = (score: number) => {
          if (score >= 80) return "rgba(75, 192, 192, 0.8)" // Green
          if (score >= 60) return "rgba(255, 205, 86, 0.8)" // Yellow
          return "rgba(255, 99, 132, 0.8)" // Red
        }

        heatmapInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: heatmapData.map((item) => item.label),
            datasets: [
              {
                label: "Kompatibilität",
                data: heatmapData.map((item) => item.score),
                backgroundColor: heatmapData.map((item) => getColor(item.score)),
                borderColor: heatmapData.map((item) => getColor(item.score).replace("0.8", "1")),
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "Kompatibilität (%)",
                },
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Themen-Heatmap",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const score = context.raw as number
                    return `Kompatibilität: ${score}%`
                  },
                },
              },
            },
          },
        })
      }
    }

    // Topic Weighting Chart
    if (weightingChartRef.current) {
      if (weightingChartInstance.current) {
        weightingChartInstance.current.destroy()
      }

      const ctx = weightingChartRef.current.getContext("2d")
      if (ctx) {
        // Calculate average importance for each topic
        const topicImportance = selectedTopics.map((topic) => ({
          topic,
          label: topicLabels[topic],
          importance: Math.round((selfAssessment[topic] || 0) + (partnerAssessment[topic] || 0)) / 2,
          compatibility: topicScores[topic],
        }))

        // Sort by importance
        topicImportance.sort((a, b) => b.importance - a.importance)
        const topTopics = topicImportance.slice(0, 10) // Top 10 by importance

        weightingChartInstance.current = new Chart(ctx, {
          type: "bubble",
          data: {
            datasets: [
              {
                label: "Themen-Gewichtung",
                data: topTopics.map((item) => ({
                  x: item.importance,
                  y: item.compatibility,
                  r: item.importance / 5, // Bubble size based on importance
                })),
                backgroundColor: topTopics.map((item) => {
                  const score = item.compatibility
                  if (score >= 80) return "rgba(75, 192, 192, 0.7)" // Green
                  if (score >= 60) return "rgba(255, 205, 86, 0.7)" // Yellow
                  return "rgba(255, 99, 132, 0.7)" // Red
                }),
              },
            ],
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Durchschnittliche Wichtigkeit (%)",
                },
                min: 0,
                max: 100,
              },
              y: {
                title: {
                  display: true,
                  text: "Kompatibilität (%)",
                },
                min: 0,
                max: 100,
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Themen-Gewichtung",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const index = context.dataIndex
                    const topic = topTopics[index]
                    return [
                      `${topic.label}`,
                      `Wichtigkeit: ${topic.importance.toFixed(1)}%`,
                      `Kompatibilität: ${topic.compatibility}%`,
                    ]
                  },
                },
              },
            },
          },
        })
      }
    }

    // Compatibility Matrix
    if (matrixChartRef.current) {
      if (matrixChartInstance.current) {
        matrixChartInstance.current.destroy()
      }

      const ctx = matrixChartRef.current.getContext("2d")
      if (ctx) {
        // Create matrix data
        const categories = Object.keys(categoryScores)
        const matrixData = categories.map((category) => ({
          category,
          label: categoryLabels[category],
          score: categoryScores[category],
        }))

        // Sort by score
        matrixData.sort((a, b) => b.score - a.score)

        matrixChartInstance.current = new Chart(ctx, {
          type: "polarArea",
          data: {
            labels: matrixData.map((item) => item.label),
            datasets: [
              {
                data: matrixData.map((item) => item.score),
                backgroundColor: matrixData.map((item) => {
                  const score = item.score
                  if (score >= 80) return "rgba(75, 192, 192, 0.7)" // Green
                  if (score >= 60) return "rgba(255, 205, 86, 0.7)" // Yellow
                  return "rgba(255, 99, 132, 0.7)" // Red
                }),
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: "Übereinstimmungs-Matrix",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const score = context.raw as number
                    return `Kompatibilität: ${score}%`
                  },
                },
              },
            },
            scales: {
              r: {
                max: 100,
                min: 0,
              },
            },
          },
        })
      }
    }

    // Answer Comparison Chart
    if (answerComparisonRef.current) {
      if (answerComparisonInstance.current) {
        answerComparisonInstance.current.destroy()
      }

      const ctx = answerComparisonRef.current.getContext("2d")
      if (ctx) {
        const questionIds = Object.keys(multipleChoiceAnswers)
        const matchStatus = questionIds.map((id) => {
          const selfAnswer = multipleChoiceAnswers[id]
          const partnerAnswer = partnerMultipleChoiceAnswers[id]
          return {
            question: multipleChoiceLabels[id],
            selfAnswer: multipleChoiceOptions[id][selfAnswer],
            partnerAnswer: multipleChoiceOptions[id][partnerAnswer],
            match: selfAnswer === partnerAnswer ? 100 : 50,
          }
        })

        answerComparisonInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: matchStatus.map((item) => item.question),
            datasets: [
              {
                label: "Übereinstimmung",
                data: matchStatus.map((item) => item.match),
                backgroundColor: matchStatus.map((item) =>
                  item.match === 100 ? "rgba(75, 192, 192, 0.7)" : "rgba(255, 205, 86, 0.7)",
                ),
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
                text: "Antworten-Vergleich",
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    const index = context.dataIndex
                    const item = matchStatus[index]
                    return [`Du: ${item.selfAnswer}`, `Partner: ${item.partnerAnswer}`]
                  },
                },
              },
            },
          },
        })
      }
    }

    // Correlation Analysis Chart
    if (correlationChartRef.current) {
      if (correlationChartInstance.current) {
        correlationChartInstance.current.destroy()
      }

      const ctx = correlationChartRef.current.getContext("2d")
      if (ctx) {
        // Create correlation data between your priorities and compatibility
        const correlationData = selectedTopics.map((topic) => ({
          topic,
          label: topicLabels[topic],
          selfPriority: selfAssessment[topic] || 0,
          partnerPriority: partnerAssessment[topic] || 0,
          compatibility: topicScores[topic],
        }))

        correlationChartInstance.current = new Chart(ctx, {
          type: "scatter",
          data: {
            datasets: [
              {
                label: "Deine Prioritäten vs. Kompatibilität",
                data: correlationData.map((item) => ({
                  x: item.selfPriority,
                  y: item.compatibility,
                })),
                backgroundColor: "rgba(255, 99, 132, 0.7)",
                pointRadius: 8,
                pointHoverRadius: 10,
              },
              {
                label: "Partner Prioritäten vs. Kompatibilität",
                data: correlationData.map((item) => ({
                  x: item.partnerPriority,
                  y: item.compatibility,
                })),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                pointRadius: 8,
                pointHoverRadius: 10,
              },
            ],
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Priorität (%)",
                },
                min: 0,
                max: 100,
              },
              y: {
                title: {
                  display: true,
                  text: "Kompatibilität (%)",
                },
                min: 0,
                max: 100,
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Korrelations-Analyse",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const index = context.dataIndex
                    const datasetIndex = context.datasetIndex
                    const topic = correlationData[index]
                    const isPriority = datasetIndex === 0 ? "Deine" : "Partner"
                    const priorityValue = datasetIndex === 0 ? topic.selfPriority : topic.partnerPriority

                    return [
                      `${topic.label}`,
                      `${isPriority} Priorität: ${priorityValue}%`,
                      `Kompatibilität: ${topic.compatibility}%`,
                    ]
                  },
                },
              },
            },
          },
        })
      }
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 90) return "Hervorragende Kompatibilität ✨"
    if (score >= 80) return "Sehr gute Kompatibilität 🌟"
    if (score >= 70) return "Gute Kompatibilität 👍"
    if (score >= 60) return "Moderate Kompatibilität 👌"
    if (score >= 50) return "Ausreichende Kompatibilität 🤔"
    return "Verbesserungswürdige Kompatibilität 🔍"
  }

  const getCompatibilityDescription = (score: number) => {
    if (score >= 80) {
      return "Ihr habt eine außergewöhnlich hohe Übereinstimmung in euren Werten, Interessen und Kommunikationsstilen. Diese starke Basis bietet euch hervorragende Voraussetzungen für eine harmonische und erfüllende Beziehung."
    }
    if (score >= 60) {
      return "Ihr habt eine gute Übereinstimmung in vielen wichtigen Bereichen. Es gibt einige Unterschiede, die aber durch offene Kommunikation und gegenseitiges Verständnis gut überbrückt werden können."
    }
    return "Eure Beziehung zeigt einige Herausforderungen in der Kompatibilität. Mit bewusster Arbeit an eurer Kommunikation und dem Verständnis für die Unterschiede könnt ihr eure Beziehung stärken."
  }

  const getRecommendations = (score: number, categoryScores: Record<string, number>) => {
    const recommendations = []

    // General recommendations based on overall score
    if (score >= 80) {
      recommendations.push("Pflegt eure Stärken und nutzt sie als Basis für weiteres Wachstum in eurer Beziehung. 🌱")
      recommendations.push("Feiert eure Gemeinsamkeiten und die Art, wie ihr Unterschiede konstruktiv überbrückt. 🎉")
    } else if (score >= 60) {
      recommendations.push(
        "Arbeitet an eurer Kommunikation, um Missverständnisse zu vermeiden und Kompromisse zu finden. 💬",
      )
      recommendations.push(
        "Versucht, die Perspektive des anderen zu verstehen, besonders in Bereichen mit Unterschieden. 👁️",
      )
    } else {
      recommendations.push("Investiert in regelmäßige, offene Gespräche über eure Bedürfnisse und Erwartungen. 🗣️")
      recommendations.push(
        "Erwägt professionelle Unterstützung, um Kommunikationsmuster zu verbessern und Konflikte zu lösen. 🧩",
      )
    }

    // Specific recommendations based on category scores
    const lowestCategories = Object.entries(categoryScores)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 2)

    lowestCategories.forEach(([category, score]) => {
      if (score < 60) {
        switch (category) {
          case "Kommunikation":
            recommendations.push("Arbeitet an eurer Kommunikation durch aktives Zuhören und regelmäßige Check-ins. 👂")
            break
          case "Praktisches":
            recommendations.push(
              "Entwickelt gemeinsame Strategien für praktische Alltagsentscheidungen und Finanzen. 📊",
            )
            break
          case "Werte":
            recommendations.push(
              "Führt tiefere Gespräche über eure Werte und Überzeugungen, um Verständnis zu fördern. ⚖️",
            )
            break
          case "Lebensstil":
            recommendations.push(
              "Findet Kompromisse bei unterschiedlichen Lebensstilpräferenzen und respektiert individuelle Bedürfnisse. 🏡",
            )
            break
          default:
            recommendations.push(
              `Widmet dem Bereich "${categoryLabels[category]}" mehr Aufmerksamkeit, um eure Kompatibilität zu verbessern. 🔍`,
            )
        }
      }
    })

    return recommendations
  }

  const handleExportExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Create overall results worksheet
      const overallData = [
        ["Love-Worth Beziehungskompatibilitätstest - Ergebnisse"],
        ["Erstellt am", new Date().toLocaleString()],
        [""],
        ["Gesamtkompatibilität", `${overallCompatibility}%`],
        ["Bewertung", getCompatibilityText(overallCompatibility)],
        [""],
        ["Kategorie", "Kompatibilität (%)"],
      ]

      // Add category scores
      Object.entries(categoryScores).forEach(([category, score]) => {
        overallData.push([categoryLabels[category], score])
      })

      // Add recommendations
      overallData.push([""])
      overallData.push(["Empfehlungen"])
      getRecommendations(overallCompatibility, categoryScores).forEach((recommendation) => {
        overallData.push([recommendation])
      })

      const overallWs = XLSX.utils.aoa_to_sheet(overallData)
      XLSX.utils.book_append_sheet(wb, overallWs, "Übersicht")

      // Create detailed topics worksheet
      const topicsData = [
        ["Themendetails"],
        ["Thema", "Deine Priorität (%)", "Partner Priorität (%)", "Kompatibilität (%)"],
      ]

      selectedTopics.forEach((topic) => {
        topicsData.push([
          topicLabels[topic],
          selfAssessment[topic] || 0,
          partnerAssessment[topic] || 0,
          topicScores[topic],
        ])
      })

      const topicsWs = XLSX.utils.aoa_to_sheet(topicsData)
      XLSX.utils.book_append_sheet(wb, topicsWs, "Themen")

      // Create multiple choice worksheet
      const mcData = [["Multiple-Choice Antworten"], ["Frage", "Deine Antwort", "Partner Antwort", "Übereinstimmung"]]

      Object.keys(multipleChoiceAnswers).forEach((questionId) => {
        const selfAnswer = multipleChoiceAnswers[questionId]
        const partnerAnswer = partnerMultipleChoiceAnswers[questionId]
        mcData.push([
          multipleChoiceLabels[questionId],
          multipleChoiceOptions[questionId][selfAnswer],
          multipleChoiceOptions[questionId][partnerAnswer],
          selfAnswer === partnerAnswer ? "Vollständig" : "Teilweise",
        ])
      })

      const mcWs = XLSX.utils.aoa_to_sheet(mcData)
      XLSX.utils.book_append_sheet(wb, mcWs, "Multiple-Choice")

      // Export to Excel file
      XLSX.writeFile(wb, "Love-Worth-Beziehungstest.xlsx")

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
      doc.text("Love-Worth Beziehungskompatibilitätstest", 105, yPos, { align: "center" })
      yPos += 10

      // Date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Erstellt am: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" })
      yPos += 15

      // Overall compatibility
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("Gesamtkompatibilität", 20, yPos)
      yPos += 10

      doc.setFontSize(30)
      doc.setTextColor(220, 47, 112)
      doc.text(`${overallCompatibility}%`, 20, yPos)

      doc.setFontSize(14)
      doc.text(getCompatibilityText(overallCompatibility), 60, yPos)
      yPos += 15

      // Description
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      const description = getCompatibilityDescription(overallCompatibility)
      const splitDescription = doc.splitTextToSize(description, 170)
      doc.text(splitDescription, 20, yPos)
      yPos += splitDescription.length * 7 + 10

      // Category scores
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text("Kategorie-Kompatibilität", 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      Object.entries(categoryScores).forEach(([category, score]) => {
        const categoryName = categoryLabels[category].replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
        doc.text(categoryName, 20, yPos)

        // Draw progress bar
        doc.setDrawColor(220, 220, 220)
        doc.setFillColor(220, 220, 220)
        doc.rect(80, yPos - 3, 80, 4, "F")

        // Fill progress
        if (score >= 80) {
          doc.setFillColor(75, 192, 192) // Green
        } else if (score >= 60) {
          doc.setFillColor(255, 205, 86) // Yellow
        } else {
          doc.setFillColor(255, 99, 132) // Red
        }
        doc.rect(80, yPos - 3, (score / 100) * 80, 4, "F")

        // Score text
        doc.text(`${score}%`, 165, yPos)

        yPos += 8
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      })

      yPos += 5

      // Recommendations
      doc.setFontSize(14)
      doc.text("Empfehlungen für eure Beziehung", 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      getRecommendations(overallCompatibility, categoryScores).forEach((recommendation) => {
        const cleanRecommendation = recommendation.replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
        const splitRecommendation = doc.splitTextToSize(`• ${cleanRecommendation}`, 170)
        doc.text(splitRecommendation, 20, yPos)
        yPos += splitRecommendation.length * 5 + 3

        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      })

      // Add new page for topic details
      doc.addPage()
      yPos = 20

      doc.setFontSize(16)
      doc.setTextColor(220, 47, 112)
      doc.text("Themendetails", 105, yPos, { align: "center" })
      yPos += 15

      // Topic table headers
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text("Thema", 20, yPos)
      doc.text("Deine Priorität", 90, yPos)
      doc.text("Partner Priorität", 130, yPos)
      doc.text("Kompatibilität", 170, yPos)
      yPos += 5

      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos, 190, yPos)
      yPos += 8

      // Topic details
      selectedTopics.forEach((topic) => {
        const topicName = topicLabels[topic].replace(/\s*[^\w\s]\s*$/, "") // Remove emoji
        doc.text(topicName, 20, yPos)
        doc.text(`${selfAssessment[topic] || 0}%`, 90, yPos)
        doc.text(`${partnerAssessment[topic] || 0}%`, 130, yPos)
        doc.text(`${topicScores[topic]}%`, 170, yPos)

        yPos += 8
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      })

      // Save PDF
      doc.save("Love-Worth-Beziehungstest.pdf")

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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Eure Beziehungskompatibilität ❤️</CardTitle>
          <CardDescription>
            Basierend auf euren Antworten haben wir eure Beziehungskompatibilität analysiert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-muted">
                <div
                  className={`absolute inset-2 rounded-full ${getCompatibilityColor(overallCompatibility)} animate-pulse-gentle`}
                  style={{ opacity: overallCompatibility / 100 }}
                ></div>
                <span className="text-4xl font-bold relative z-10">
                  <AnimatedCounter value={overallCompatibility} suffix="%" />
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-center">{getCompatibilityText(overallCompatibility)}</h3>
            </div>

            <div className="flex-1 space-y-6">
              <p className="text-lg">{getCompatibilityDescription(overallCompatibility)}</p>

              <div>
                <h3 className="text-lg font-semibold mb-3">Empfehlungen für eure Beziehung 💕</h3>
                <ul className="space-y-2 list-disc pl-5">
                  {getRecommendations(overallCompatibility, categoryScores).map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Visuelle Darstellungen 📊</CardTitle>
          <CardDescription>Verschiedene Visualisierungen eurer Beziehungskompatibilität</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeChart === "radar" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("radar")}
              className="flex items-center gap-1"
            >
              <Activity className="h-4 w-4" />
              Radar-Chart
            </Button>
            <Button
              variant={activeChart === "priority" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("priority")}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Prioritäten-Vergleich
            </Button>
            <Button
              variant={activeChart === "heatmap" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("heatmap")}
              className="flex items-center gap-1"
            >
              <Grid3X3 className="h-4 w-4" />
              Themen-Heatmap
            </Button>
            <Button
              variant={activeChart === "weighting" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("weighting")}
              className="flex items-center gap-1"
            >
              <PieChart className="h-4 w-4" />
              Themen-Gewichtung
            </Button>
            <Button
              variant={activeChart === "matrix" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("matrix")}
              className="flex items-center gap-1"
            >
              <Grid3X3 className="h-4 w-4" />
              Übereinstimmungs-Matrix
            </Button>
            <Button
              variant={activeChart === "answers" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("answers")}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Antworten-Vergleich
            </Button>
            <Button
              variant={activeChart === "correlation" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("correlation")}
              className="flex items-center gap-1"
            >
              <LineChart className="h-4 w-4" />
              Korrelations-Analyse
            </Button>
          </div>

          <AnimatedTransition show={true} animation="scale" className="w-full h-[400px] relative">
            <div className={`w-full h-full ${activeChart === "radar" ? "block" : "hidden"}`}>
              <canvas ref={radarChartRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "priority" ? "block" : "hidden"}`}>
              <canvas ref={barChartRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "heatmap" ? "block" : "hidden"}`}>
              <canvas ref={heatmapRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "weighting" ? "block" : "hidden"}`}>
              <canvas ref={weightingChartRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "matrix" ? "block" : "hidden"}`}>
              <canvas ref={matrixChartRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "answers" ? "block" : "hidden"}`}>
              <canvas ref={answerComparisonRef}></canvas>
            </div>
            <div className={`w-full h-full ${activeChart === "correlation" ? "block" : "hidden"}`}>
              <canvas ref={correlationChartRef}></canvas>
            </div>
          </AnimatedTransition>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Kategorien 📊</TabsTrigger>
          <TabsTrigger value="topics">Einzelne Themen 📋</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold">Kompatibilität nach Kategorien</h3>

          <div className="grid gap-4">
            {Object.entries(categoryScores).map(([category, score], index) => (
              <AnimatedTransition
                key={category}
                show={true}
                animation="slide-right"
                className="space-y-2"
                duration={300 + index * 100}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{categoryLabels[category]}</h4>
                  <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>{score}%</Badge>
                </div>
                <AnimatedProgress
                  value={score}
                  className="h-2"
                  color={score >= 80 ? "success" : score >= 60 ? "warning" : "danger"}
                />
              </AnimatedTransition>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold">Kompatibilität nach Themen</h3>

          <div className="grid gap-4">
            {selectedTopics.map((topic, index) => {
              const selfValue = selfAssessment[topic] || 0
              const partnerValue = partnerAssessment[topic] || 0
              const score = topicScores[topic]

              return (
                <AnimatedTransition
                  key={topic}
                  show={true}
                  animation="slide-right"
                  className="space-y-2"
                  duration={300 + index * 50}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{topicLabels[topic]}</h4>
                    <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                      {score}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-20">Du: {selfValue}%</div>
                    <AnimatedProgress value={selfValue} className="h-2 flex-1" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-20">Partner: {partnerValue}%</div>
                    <AnimatedProgress value={partnerValue} className="h-2 flex-1" />
                  </div>
                </AnimatedTransition>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
