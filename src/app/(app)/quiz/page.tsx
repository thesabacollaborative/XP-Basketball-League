import { db } from "@/lib/db";
import { QuizClient } from "@/components/quiz/QuizClient";

export default async function QuizPage() {
  const [archetypes, questions] = await Promise.all([
    db.archetype.findMany({ select: { id: true } }),
    db.quizQuestion.findMany({
      orderBy: { order: "asc" },
      include: { options: { select: { text: true, tags: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-4 text-sm text-chalk-dim">
        Up to 6 scenario questions, adapting as you answer. Answer honestly —
        there&apos;s no wrong build.
      </p>
      <QuizClient
        questions={questions.map((q) => ({
          id: q.id,
          scenario: q.scenario,
          options: q.options.map((o) => ({
            text: o.text,
            tags: o.tags as Record<string, number>,
          })),
        }))}
        archetypeIds={archetypes.map((a) => a.id)}
      />
    </div>
  );
}
