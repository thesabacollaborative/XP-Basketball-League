"use client";

import { useState, useTransition } from "react";
import { pickNextQuestion } from "@/lib/quiz";
import { submitQuiz } from "@/app/(app)/quiz/actions";

interface QuizOptionProp {
  text: string;
  tags: Record<string, number>;
}

interface QuizQuestionProp {
  id: string;
  scenario: string;
  options: QuizOptionProp[];
}

const MAX_QUESTIONS = 6;

export function QuizClient({
  questions,
  archetypeIds,
}: {
  questions: QuizQuestionProp[];
  archetypeIds: string[];
}) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(archetypeIds.map((id) => [id, 0])),
  );
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  function handleAnswer(optionIndex: number) {
    if (!currentQuestion || isPending) return;

    const opt = currentQuestion.options[optionIndex];
    const newScores = { ...scores };
    for (const [archetypeId, weight] of Object.entries(opt.tags)) {
      newScores[archetypeId] = (newScores[archetypeId] ?? 0) + weight;
    }
    const newAsked = [...askedIds, currentQuestion.id];

    setScores(newScores);
    setAskedIds(newAsked);

    const next = pickNextQuestion(questions, newAsked, newScores);
    if (next) {
      setCurrentQuestionId(next);
    } else {
      startTransition(() => {
        submitQuiz(newScores);
      });
    }
  }

  if (!currentQuestion || isPending) {
    return (
      <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-chalk-dim">
        Finding your build…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
          <i
            key={i}
            className={`h-1 flex-1 rounded-full ${i < askedIds.length ? "bg-xp" : "bg-surface-raised"}`}
          />
        ))}
      </div>

      <h2 className="mb-5 font-heading text-xl leading-snug tracking-wide">
        {currentQuestion.scenario}
      </h2>

      <div className="flex flex-col gap-2.5">
        {currentQuestion.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleAnswer(i)}
            className="w-full rounded-md border border-line bg-surface-alt px-4 py-3.5 text-left text-sm text-chalk transition hover:border-xp hover:bg-surface-raised"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
