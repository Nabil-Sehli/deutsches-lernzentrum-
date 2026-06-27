import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Loader2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const qualityLabels = [
  "Complete blackout",
  "Incorrect, but remembered after seeing answer",
  "Incorrect, but answer seemed easy",
  "Correct with serious difficulty",
  "Correct after hesitation",
  "Perfect response",
];

const qualityColors = [
  "text-red-600 bg-red-50 border-red-200",
  "text-red-500 bg-red-50 border-red-200",
  "text-orange-500 bg-orange-50 border-orange-200",
  "text-yellow-600 bg-yellow-50 border-yellow-200",
  "text-green-500 bg-green-50 border-green-200",
  "text-[#00695c] bg-[#00695c]/10 border-[#00695c]/20",
];

type SessionWord = {
  id: number;
  word: string;
  translation: string;
  example: string | null;
  partOfSpeech: string | null;
  level: string;
  quality?: number;
};

export default function VocabularyTrainer() {
  const { data: words, isLoading, refetch } = trpc.vocabulary.listDue.useQuery();
  const recordReview = trpc.vocabulary.recordReview.useMutation();
  const { data: stats } = trpc.vocabulary.stats.useQuery();

  const [sessionWords, setSessionWords] = useState<SessionWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (words && words.length > 0 && sessionWords.length === 0) {
      setSessionWords(words.map((w) => ({
        id: w.id,
        word: w.word,
        translation: w.translation,
        example: w.example,
        partOfSpeech: w.partOfSpeech,
        level: w.level,
      })));
      setIndex(0);
      setFlipped(false);
      setFinished(false);
    }
  }, [words]);

  const handleStartNew = () => {
    setSessionWords([]);
    setFinished(false);
    setIndex(0);
    setFlipped(false);
    refetch();
  };

  const handleRate = (quality: number) => {
    const current = sessionWords[index];
    if (!current) return;

    recordReview.mutate({ wordId: current.id, quality });

    const updated = [...sessionWords];
    updated[index] = { ...updated[index], quality };
    setSessionWords(updated);

    if (index < sessionWords.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setFinished(true);
    }
  };

  if (isLoading && sessionWords.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
      </div>
    );
  }

  if (sessionWords.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-[#78909c] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">All caught up!</h3>
        <p className="text-[#78909c]">No words due for review. Check back later or learn new words from your lessons.</p>
        {stats && (
          <div className="mt-4 text-sm text-[#78909c]">
            {stats.total} words studied · {stats.mastered} mastered
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    return (
      <div>
        <div className="text-center py-6">
          <Sparkles className="w-10 h-10 text-[#00695c] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#2c3e2d]">Session complete!</h3>
          <p className="text-[#78909c] text-sm">You reviewed {sessionWords.length} word{sessionWords.length > 1 ? "s" : ""}.</p>
        </div>
        <div className="space-y-2 mb-6">
          {sessionWords.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-[#00695c]/10 p-4 flex items-start gap-3">
              {w.quality != null && w.quality >= 4 ? (
                <CheckCircle2 className="w-5 h-5 text-[#00695c] shrink-0 mt-0.5" />
              ) : w.quality != null && w.quality >= 3 ? (
                <AlertCircle className="w-5 h-5 text-[#f9a825] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2c3e2d]">{w.word}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#00695c]/10 text-[#00695c]">{w.level.toUpperCase()}</span>
                  {w.partOfSpeech && <span className="text-xs text-[#78909c] italic">{w.partOfSpeech}</span>}
                </div>
                <p className="text-sm text-[#78909c]">{w.translation}</p>
                {w.quality != null && (
                  <span className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full border ${qualityColors[w.quality]}`}>
                    {w.quality} — {qualityLabels[w.quality]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={handleStartNew} className="rounded-full bg-[#00695c] hover:bg-[#004d40]">
            <RotateCcw className="w-4 h-4 mr-2" /> New session
          </Button>
          <Button variant="outline" onClick={() => setFinished(false)} className="rounded-full">
            Review again
          </Button>
        </div>
      </div>
    );
  }

  const current = sessionWords[index];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[#78909c]">
          {index + 1} / {sessionWords.length}
          {stats && <span className="ml-2">· {stats.total} total</span>}
        </div>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="bg-white rounded-3xl shadow-lg border border-[#00695c]/10 p-10 text-center cursor-pointer select-none min-h-[200px] flex flex-col items-center justify-center transition-all hover:shadow-xl"
      >
        {flipped ? (
          <div>
            <p className="text-sm text-[#78909c] mb-2">{current?.partOfSpeech}</p>
            <p className="text-2xl font-bold text-[#00695c] mb-3">{current?.translation}</p>
            {current?.example && (
              <p className="text-sm text-[#78909c] italic max-w-md">{current.example}</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#78909c] mb-2">{current?.level?.toUpperCase()} · {current?.partOfSpeech}</p>
            <p className="text-3xl font-bold text-[#2c3e2d]">{current?.word}</p>
            <p className="text-sm text-[#78909c] mt-4">Tap to reveal translation</p>
          </div>
        )}
      </div>

      {flipped && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-[#78909c] text-center mb-3">How well did you remember?</p>
          <div className="grid grid-cols-1 gap-2">
            {qualityLabels.map((label, q) => (
              <button
                key={q}
                onClick={() => handleRate(q)}
                disabled={recordReview.isPending}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  q >= 4
                    ? "bg-[#00695c]/10 text-[#00695c] border-[#00695c]/20 hover:bg-[#00695c]/20"
                    : q >= 3
                    ? "bg-[#f9a825]/10 text-[#8d6e00] border-[#f9a825]/20 hover:bg-[#f9a825]/20"
                    : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                }`}
              >
                {q} — {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
