import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Loader2,
  BookOpen,
} from "lucide-react";

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const partsOfSpeech = ["Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Pronoun", "Article", "Other"];

export default function VocabularyManager() {
  const utils = trpc.useUtils();
  const { data: allLessons } = trpc.lesson.myLessons.useQuery();

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const { data: words } = trpc.vocabulary.listByLesson.useQuery(
    { lessonId: selectedLessonId! },
    { enabled: !!selectedLessonId },
  );

  const createWord = trpc.vocabulary.create.useMutation({
    onSuccess: () => utils.vocabulary.listByLesson.invalidate(),
  });
  const deleteWord = trpc.vocabulary.delete.useMutation({
    onSuccess: () => utils.vocabulary.listByLesson.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [pos, setPos] = useState("");
  const [level, setLevel] = useState<string>("a1");

  const handleAdd = () => {
    if (!word.trim() || !translation.trim()) return;
    createWord.mutate({
      word: word.trim(),
      translation: translation.trim(),
      example: example.trim() || undefined,
      partOfSpeech: pos || undefined,
      level: level as typeof levels[number],
      lessonId: selectedLessonId ?? undefined,
    });
    setWord("");
    setTranslation("");
    setExample("");
    setPos("");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={selectedLessonId ?? ""}
          onChange={(e) => setSelectedLessonId(e.target.value ? Number(e.target.value) : null)}
          className="flex h-11 rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm text-[#2c3e2d]"
        >
          <option value="">Select a lesson</option>
          {(allLessons ?? []).map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={!selectedLessonId}
          className="rounded-full bg-[#00695c] hover:bg-[#004d40]"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Word
        </Button>
      </div>

      {showForm && selectedLessonId && (
        <Card className="clay-card border-0">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="German word"
                className="flex h-10 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
              />
              <input
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation"
                className="flex h-10 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
              />
            </div>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Example sentence (optional)"
              className="flex min-h-[60px] w-full rounded-xl border border-[#00695c]/15 bg-white px-4 py-2 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm text-[#2c3e2d]"
              >
                <option value="">Part of speech</option>
                {partsOfSpeech.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm text-[#2c3e2d]"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={createWord.isPending || !word.trim() || !translation.trim()} className="rounded-full bg-[#00695c]" size="sm">
                {createWord.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} size="sm" className="rounded-full">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedLessonId && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-[#78909c] mx-auto mb-4 opacity-50" />
          <p className="text-[#78909c]">Select a lesson to manage its vocabulary.</p>
        </div>
      )}

      {selectedLessonId && words && words.length === 0 && !showForm && (
        <div className="text-center py-8">
          <p className="text-[#78909c]">No words for this lesson yet.</p>
        </div>
      )}

      {selectedLessonId && words && words.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {words.map((w) => (
            <Card key={w.id} className="clay-card border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2c3e2d]">{w.word}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#00695c]/10 text-[#00695c]">{w.level.toUpperCase()}</span>
                      {w.partOfSpeech && <span className="text-xs text-[#78909c] italic">{w.partOfSpeech}</span>}
                    </div>
                    <p className="text-sm text-[#78909c] mt-0.5">{w.translation}</p>
                    {w.example && <p className="text-xs text-[#78909c]/60 mt-1 italic">{w.example}</p>}
                  </div>
                  <button
                    onClick={() => deleteWord.mutate({ id: w.id })}
                    className="text-red-400 hover:text-red-600 p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
