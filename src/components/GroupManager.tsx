import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, UserPlus, UserMinus } from "lucide-react";

const levels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;

export default function GroupManager() {
  const utils = trpc.useUtils();
  const { data: groups } = trpc.groups.list.useQuery();
  const { data: students } = trpc.center.myStudents.useQuery();
  const createGroup = trpc.groups.create.useMutation({ onSuccess: () => utils.groups.invalidate() });
  const deleteGroup = trpc.groups.delete.useMutation({ onSuccess: () => utils.groups.invalidate() });
  const addStudent = trpc.groups.addStudent.useMutation({ onSuccess: () => utils.groups.invalidate() });
  const removeStudent = trpc.groups.removeStudent.useMutation({ onSuccess: () => utils.groups.invalidate() });

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupLevel, setNewGroupLevel] = useState<string>("");

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate({
      name: newGroupName.trim(),
      level: newGroupLevel ? (newGroupLevel as typeof levels[number]) : undefined,
    });
    setNewGroupName("");
    setNewGroupLevel("");
  };

  return (
    <div className="space-y-6">
      <Card className="clay-card border-0">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#2c3e2d] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00695c]" />
            Create Group
          </h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#78909c] mb-1 block">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. A1 Spring 2026"
                className="rounded-xl"
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-[#78909c] mb-1 block">Level (optional)</label>
              <Select value={newGroupLevel} onValueChange={setNewGroupLevel}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="rounded-full bg-[#00695c] hover:bg-[#004d40]">
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {(!groups || groups.length === 0) && (
        <div className="text-center py-12 text-[#78909c]">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No groups yet</p>
          <p className="text-sm">Create a group to organize your students</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups?.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            students={students ?? []}
            onDelete={() => deleteGroup.mutate({ id: group.id })}
            onAddStudent={(studentId) => addStudent.mutate({ groupId: group.id, studentId })}
            onRemoveStudent={(studentId) => removeStudent.mutate({ groupId: group.id, studentId })}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  students,
  onDelete,
  onAddStudent,
  onRemoveStudent,
}: {
  group: { id: number; name: string; level: string | null };
  students: { id: number; name: string | null; email: string; level: string | null }[];
  onDelete: () => void;
  onAddStudent: (studentId: number) => void;
  onRemoveStudent: (studentId: number) => void;
}) {
  const { data: members } = trpc.groups.members.useQuery({ groupId: group.id });
  const [adding, setAdding] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");

  const unassignedStudents = students.filter(
    (s) => !members?.some((m) => m.studentId === s.id)
  );

  const handleAdd = () => {
    if (!selectedStudent) return;
    onAddStudent(Number(selectedStudent));
    setSelectedStudent("");
    setAdding(false);
  };

  return (
    <Card className="clay-card border-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#2c3e2d]">{group.name}</h3>
            {group.level && (
              <span className="text-xs bg-[#00695c]/10 text-[#00695c] px-2 py-0.5 rounded-full font-medium">
                {group.level.toUpperCase()}
              </span>
            )}
            <span className="text-xs text-[#78909c] ml-2">{members?.length ?? 0} students</span>
          </div>
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
          {(!members || members.length === 0) && (
            <p className="text-sm text-[#78909c] italic">No students assigned</p>
          )}
          {members?.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-1.5 px-3 bg-[#445E5D]/5 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-3.5 h-3.5 text-[#00695c] shrink-0" />
                <span className="text-sm text-[#2c3e2d] truncate">{m.studentName ?? "Unknown"}</span>
                {m.studentLevel && (
                  <span className="text-[10px] bg-[#00695c]/10 text-[#00695c] px-1.5 py-0.5 rounded-full font-medium">
                    {m.studentLevel.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemoveStudent(m.studentId)}
                className="text-red-400 hover:text-red-600 shrink-0 ml-2"
              >
                <UserMinus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="flex-1 rounded-xl border border-[#00695c]/15 h-9 text-sm px-3"
            >
              <option value="">Select student...</option>
              {unassignedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? "Anonymous"} ({s.level?.toUpperCase() ?? "No level"})
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAdd} className="rounded-full bg-[#00695c] hover:bg-[#004d40] h-9">
              <UserPlus className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-9">
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="rounded-full w-full text-[#00695c] border-[#00695c]/30"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Student
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
