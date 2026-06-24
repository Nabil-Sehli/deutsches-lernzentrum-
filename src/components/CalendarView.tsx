import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, Clock, Video, ClipboardList } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";

type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  type: "lesson" | "meeting" | "assignment_due" | "custom";
  level: string | null;
  color: string | null;
};

const typeIcons: Record<string, typeof Calendar> = {
  meeting: Video,
  assignment_due: ClipboardList,
  lesson: Calendar,
  custom: Calendar,
};

const typeColors: Record<string, string> = {
  meeting: "bg-[#00695c]",
  assignment_due: "bg-[#e53935]",
  lesson: "bg-[#1565c0]",
  custom: "bg-[#78909c]",
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const { data: calendarData } = trpc.calendar.list.useQuery({
    startDate: calStart.toISOString(),
    endDate: calEnd.toISOString(),
  });

  useEffect(() => {
    if (calendarData) {
      setEvents(calendarData as CalendarEvent[]);
    }
  }, [calendarData]);

  const dayEvents = events.filter((e) =>
    isSameDay(parseISO(e.startTime), selectedDate)
  );

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getDayEvents = (d: Date) =>
    events.filter((e) => isSameDay(parseISO(e.startTime), d));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="clay-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2c3e2d]">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#445E5D]/6 text-[#445E5D]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#445E5D]/6 text-[#445E5D]">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-[#78909c] font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((d) => {
                const dayEvts = getDayEvents(d);
                const isSelected = isSameDay(d, selectedDate);
                const isCurrentMonth = isSameMonth(d, currentDate);

                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelectedDate(d)}
                    className={`relative p-1.5 text-sm rounded-lg transition-colors min-h-[60px] ${
                      isSelected
                        ? "bg-[#00695c] text-white"
                        : isCurrentMonth
                        ? "text-[#2c3e2d] hover:bg-[#445E5D]/6"
                        : "text-[#78909c]/40"
                    }`}
                  >
                    <span className="text-xs">{format(d, "d")}</span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayEvts.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`w-full h-1 rounded-full ${typeColors[ev.type] ?? "bg-[#78909c]"}`}
                        />
                      ))}
                      {dayEvts.length > 2 && (
                        <span className="text-[10px] opacity-70">+{dayEvts.length - 2}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="clay-card border-0">
          <CardContent className="p-5">
            <h3 className="font-semibold text-[#2c3e2d] mb-3">
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-[#78909c]">No events on this day</p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((ev) => {
                  const Icon = typeIcons[ev.type] ?? Calendar;
                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-[#445E5D]/5 border border-[#445E5D]/10"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${typeColors[ev.type] ?? "bg-[#78909c]"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#2c3e2d]">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#78909c]">
                            <Clock className="w-3 h-3" />
                            <span>{format(parseISO(ev.startTime), "h:mm a")}</span>
                            {ev.level && (
                              <span className="bg-[#00695c]/10 text-[#00695c] px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                {ev.level.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-xs text-[#78909c] mt-1">{ev.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
