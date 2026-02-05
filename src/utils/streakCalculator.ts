import { parseISO, differenceInCalendarDays, isSameDay } from 'date-fns';

export const calculateStreaks = (dateKeys: string[]) => {
  if (!dateKeys || dateKeys.length === 0) {
    return { current: 0, best: 0 };
  }

  // Sort descending (newest first) and remove duplicates
  const sortedDates = [...new Set(dateKeys)].sort((a, b) => b.localeCompare(a));
  
  const today = new Date();
  
  let currentStreak = 0;
  let bestStreak = 0;
  
  // Current Streak Calculation
  // Strict MVP: If no check-in TODAY, current streak is 0.
  const lastDate = parseISO(sortedDates[0]);
  
  if (isSameDay(lastDate, today)) {
    currentStreak = 1;
    let previousDate = lastDate;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = parseISO(sortedDates[i]);
      const diff = differenceInCalendarDays(previousDate, currentDate);
      
      if (diff === 1) {
        currentStreak++;
        previousDate = currentDate;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Best Streak Calculation
  let tempStreak = 1;
  bestStreak = 1;
  
  if (sortedDates.length > 0) {
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = parseISO(sortedDates[i]);
      const d2 = parseISO(sortedDates[i+1]);
      const diff = differenceInCalendarDays(d1, d2);
      
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }
  }

  return { current: currentStreak, best: bestStreak };
};
