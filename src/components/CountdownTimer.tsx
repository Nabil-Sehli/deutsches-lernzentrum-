import { useState, useEffect } from "react";

function getTimeRemaining(due: Date) {
  const diff = due.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ dueDate }: { dueDate: string | Date }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(new Date(dueDate)));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTimeRemaining(new Date(dueDate)));
    }, 1000);
    return () => clearInterval(timer);
  }, [dueDate]);

  if (!remaining) {
    return <span className="text-xs text-red-500 font-medium">Expired</span>;
  }

  const parts: string[] = [];
  if (remaining.days > 0) parts.push(`${remaining.days}d`);
  if (remaining.hours > 0 || remaining.days > 0) parts.push(`${remaining.hours}h`);
  parts.push(`${remaining.minutes}m`);
  parts.push(`${remaining.seconds}s`);

  return (
    <span className="text-xs font-mono font-medium text-[#00695c]">
      {parts.join(" ")}
    </span>
  );
}
