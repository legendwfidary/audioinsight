"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  Lightbulb,
  BookOpen,
  Download,
  Headphones,
  Sparkles,
} from "lucide-react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { ResultCard } from "@/components/result-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type ProcessingStatus = "idle" | "processing" | "complete"

interface AnalysisResult {
  executiveSummary: string
  keyTakeaways: string[]
  flashcards: { question: string; answer: string }[]
}

const mockResult: AnalysisResult = {
  executiveSummary:
    "This audio recording covers a comprehensive discussion on modern web development practices, focusing on React frameworks, server-side rendering, and performance optimization strategies. The speakers emphasize the importance of user experience and accessibility in building scalable applications.",
  keyTakeaways: [
    "Server components reduce client-side JavaScript bundle size significantly",
    "Incremental static regeneration provides the best of both static and dynamic content",
    "Proper caching strategies can improve load times by up to 60%",
    "Accessibility should be considered from the start, not as an afterthought",
    "Testing is crucial for maintaining code quality in large codebases",
  ],
  flashcards: [
    {
      question: "What is the main benefit of server components?",
      answer:
        "They reduce client-side JavaScript bundle size by rendering on the server",
    },
    {
      question: "What is ISR in Next.js?",
      answer:
        "Incremental Static Regeneration - allows static pages to be updated after build",
    },
    {
      question: "Why is accessibility important?",
      answer:
        "It ensures all users, including those with disabilities, can access your content",
    },
  ],
}

export function AudioDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeFlashcard, setActiveFlashcard] = useState<number | null>(null)

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setStatus("idle")
    setProgress(0)
    setResult(null)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setStatus("idle")
    setProgress(0)
    setResult(null)
  }, [])

  const handleProcess = useCallback(() => {
    if (!selectedFile) return
    setStatus("processing")
    setProgress(0)
  }, [selectedFile])

  // Simulate processing progress
  useEffect(() => {
    if (status !== "processing") return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("complete")
          setResult(mockResult)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 300)

    return () => clearInterval(interval)
  }, [status])

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF download would be triggered here")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                AudioInsight
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Audio Analysis
              </p>
            </div>
          </div>
          {status === "complete" && (
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Upload Section */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Upload Audio File
            </h2>
            <p className="mt-1 text-muted-foreground">
              Upload an MP3 or WAV file to generate insights, summaries, and
              flashcards
            </p>
          </div>

          <FileUploadZone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
          />

          {selectedFile && status === "idle" && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleProcess}
                size="lg"
                className="gap-2 px-8"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Audio
              </Button>
            </div>
          )}
        </section>

        {/* Progress Section */}
        {status === "processing" && (
          <section className="mb-10">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                  <span className="font-medium text-foreground">
                    Analyzing your audio...
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.min(Math.round(progress), 100)}%
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <p className="mt-4 text-sm text-muted-foreground">
                Our AI is transcribing and analyzing your audio content. This
                may take a moment.
              </p>
            </div>
          </section>
        )}

        {/* Results Section */}
        {status === "complete" && result && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Analysis Results
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Here&apos;s what we found in your audio
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Executive Summary */}
              <ResultCard
                title="Executive Summary"
                icon={FileText}
                className="md:col-span-2 lg:col-span-1"
              >
                <p className="leading-relaxed text-muted-foreground">
                  {result.executiveSummary}
                </p>
              </ResultCard>

              {/* Key Takeaways */}
              <ResultCard title="Key Takeaways" icon={Lightbulb}>
                <ul className="space-y-3">
                  {result.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {takeaway}
                      </span>
                    </li>
                  ))}
                </ul>
              </ResultCard>

              {/* Flashcards */}
              <ResultCard title="Flashcards" icon={BookOpen}>
                <div className="space-y-3">
                  {result.flashcards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setActiveFlashcard(
                          activeFlashcard === index ? null : index
                        )
                      }
                      className="w-full rounded-lg border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {card.question}
                      </p>
                      {activeFlashcard === index && (
                        <p className="mt-2 text-sm text-primary">
                          {card.answer}
                        </p>
                      )}
                      {activeFlashcard !== index && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Click to reveal answer
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </ResultCard>
            </div>

            {/* Download Button (Mobile) */}
            <div className="mt-8 flex justify-center md:hidden">
              <Button
                onClick={handleDownloadPDF}
                size="lg"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
