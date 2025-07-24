'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const subjects = [
  { id: 'math', name: 'Math Monsters', icon: '🧮' },
  { id: 'reading', name: 'Word Wizards', icon: '📚' },
  { id: 'science', name: 'Science Sparks', icon: '🔬' }
]

const sampleQuestions: Record<string, { question: string; options: string[]; correct: number; explanation?: string }[]> = {
  math: [
    { 
      question: 'What is 8 × 7?', 
      options: ['54', '56', '58', '60'], 
      correct: 1,
      explanation: '8 × 7 = 56! Think of it as 8 groups of 7, or 7 groups of 8.' 
    },
    { 
      question: 'What is 144 ÷ 12?', 
      options: ['10', '11', '12', '13'], 
      correct: 2,
      explanation: '144 ÷ 12 = 12! You can check: 12 × 12 = 144.' 
    },
    { 
      question: 'What is 15 + 28?', 
      options: ['41', '42', '43', '44'], 
      correct: 2,
      explanation: '15 + 28 = 43! Try breaking it down: 15 + 20 + 8 = 35 + 8 = 43.' 
    },
    { 
      question: 'What is 9 × 6?', 
      options: ['52', '54', '56', '58'], 
      correct: 1,
      explanation: '9 × 6 = 54! Remember: 9 × 6 is the same as (10 × 6) - 6 = 60 - 6 = 54.' 
    },
    { 
      question: 'What fraction is equivalent to 0.5?', 
      options: ['1/3', '1/2', '2/3', '3/4'], 
      correct: 1,
      explanation: '0.5 = 1/2! Half of something is 0.5 or 50%.' 
    }
  ],
  reading: [
    { 
      question: 'What type of word is "quickly"?', 
      options: ['Noun', 'Verb', 'Adjective', 'Adverb'], 
      correct: 3,
      explanation: '"Quickly" is an adverb because it describes HOW something is done. Most adverbs end in -ly!' 
    },
    { 
      question: 'Which word is a synonym for "happy"?', 
      options: ['Sad', 'Joyful', 'Angry', 'Tired'], 
      correct: 1,
      explanation: '"Joyful" means the same as happy! Synonyms are words with similar meanings.' 
    },
    { 
      question: 'What is the plural of "child"?', 
      options: ['Childs', 'Children', 'Childes', 'Child'], 
      correct: 1,
      explanation: 'The plural of "child" is "children"! This is an irregular plural form.' 
    },
    { 
      question: 'Which sentence uses correct punctuation?', 
      options: ['Hello, how are you', 'Hello how are you?', 'Hello, how are you?', 'Hello? how are you'], 
      correct: 2,
      explanation: 'Questions need a question mark at the end, and we use commas to separate parts of a sentence!' 
    },
    { 
      question: 'What is an antonym for "big"?', 
      options: ['Large', 'Huge', 'Small', 'Giant'], 
      correct: 2,
      explanation: '"Small" is the opposite of "big"! Antonyms are words with opposite meanings.' 
    }
  ],
  science: [
    { 
      question: 'What planet is known as the Red Planet?', 
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'], 
      correct: 1,
      explanation: 'Mars is called the Red Planet because of its reddish color from iron oxide (rust) on its surface!' 
    },
    { 
      question: 'How many legs does a spider have?', 
      options: ['6', '8', '10', '12'], 
      correct: 1,
      explanation: 'Spiders have 8 legs! This makes them arachnids, not insects (which have 6 legs).' 
    },
    { 
      question: 'What do plants need to make their own food?', 
      options: ['Only water', 'Only sunlight', 'Sunlight, water, and air', 'Only soil'], 
      correct: 2,
      explanation: 'Plants use sunlight, water, and carbon dioxide from air to make food through photosynthesis!' 
    },
    { 
      question: 'Which of these is NOT a mammal?', 
      options: ['Dolphin', 'Bat', 'Penguin', 'Whale'], 
      correct: 2,
      explanation: 'Penguin is a bird, not a mammal! Mammals have fur/hair and feed milk to their babies.' 
    },
    { 
      question: 'What causes thunder?', 
      options: ['Clouds bumping into each other', 'Lightning heating the air', 'Wind moving fast', 'Rain falling'], 
      correct: 1,
      explanation: 'Thunder is caused by lightning heating the air so quickly that it expands and creates a sound wave!' 
    }
  ]
}

export function LearningArcade() {
  const [subject, setSubject] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [starsAwarded, setStarsAwarded] = useState<number | null>(null)

  const questions = subject ? sampleQuestions[subject] || [] : []
  const question = questions[current]

  function handleSelectSubject(id: string) {
    setSubject(id)
    setCurrent(0)
    setScore(0)
    setQuizComplete(false)
    setSelected(null)
    setShowResult(false)
  }

  function handleSelectAnswer(index: number) {
    if (showResult) return
    setSelected(index)
  }

  function handleSubmitAnswer() {
    if (selected === null) return
    setShowResult(true)
    if (selected === question.correct) {
      setScore(score + 1)
    }
  }

  async function handleQuizComplete() {
    if (!subject) return
    try {
      const res = await fetch('/api/child/arcade/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, score, total: questions.length })
      })
      const data = await res.json()
      setStarsAwarded(data.starsAwarded)
    } catch {
      setStarsAwarded(null)
    }
  }

  function handleNextQuestion() {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
      handleQuizComplete()
    }
  }

  function handlePlayAgain() {
    setSubject(null)
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setShowResult(false)
    setQuizComplete(false)
    setStarsAwarded(null)
  }

  if (!subject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-2">Choose Your Adventure!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-center">
            {subjects.map((s) => (
              <Button key={s.id} onClick={() => handleSelectSubject(s.id)} variant="mint" className="flex flex-col items-center gap-2">
                <span className="text-3xl">{s.icon}</span>
                {s.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (quizComplete) {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-3xl font-bold text-success mb-4">{score} / {questions.length}</p>
          {starsAwarded !== null && (
            <p className="text-lg text-mint-green mb-4">+{starsAwarded} stars earned!</p>
          )}
          <Button onClick={handlePlayAgain} variant="outline">Play Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {current + 1} of {questions.length}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-medium">{question?.question}</h3>
        <div className="space-y-3">
          {question?.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              variant={selected === index ? (showResult ? (index === question.correct ? 'mint' : 'secondary') : 'primary') : 'outline'}
              disabled={showResult}
              className="w-full text-left"
            >
              {option}
              {showResult && index === question.correct && (
                <span className="ml-2">✅</span>
              )}
              {showResult && selected === index && index !== question.correct && (
                <span className="ml-2">❌</span>
              )}
            </Button>
          ))}
        </div>
        
        {showResult && question.explanation && (
          <div className="bg-sky-blue/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-black">💡 {question.explanation}</p>
          </div>
        )}
        <div className="flex justify-end">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={selected === null}>Submit Answer</Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {current < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 