import { differenceInCalendarDays, startOfDay } from 'date-fns';

export const useJourneyProgress = (startDateString: string, durationDays: number) => {
  const startDate = startOfDay(new Date(startDateString));
  const today = startOfDay(new Date());
  
  // Day index starts at 1
  let dayIndex = differenceInCalendarDays(today, startDate) + 1;
  
  // Clamp dayIndex
  if (dayIndex < 1) dayIndex = 1; // Should not happen if start date is not in future
  
  const isCompleted = dayIndex > durationDays;
  const currentDay = isCompleted ? durationDays : dayIndex; // Show last day if completed? Or show "Completed" state.
  
  return {
    dayIndex: currentDay,
    isCompleted,
    totalDays: durationDays,
    isFuture: (day: number) => day > currentDay,
    isPast: (day: number) => day < currentDay,
    isCurrent: (day: number) => day === currentDay,
  };
};
