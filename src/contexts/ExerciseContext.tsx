import React, { createContext, useContext, useState, useEffect } from 'react';

type ExerciseContextType = {
  activeExercise: number | null;
  setActiveExercise: (exercise: number | null) => void;
};

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeExercise, setActiveExerciseState] = useState<number | null>(() => {
    const saved = localStorage.getItem('activeExercise');
    return saved ? parseInt(saved, 10) : null;
  });

  const setActiveExercise = (exercise: number | null) => {
    setActiveExerciseState(exercise);
    if (exercise !== null) {
      localStorage.setItem('activeExercise', exercise.toString());
    } else {
      localStorage.removeItem('activeExercise');
    }
  };

  return (
    <ExerciseContext.Provider value={{ activeExercise, setActiveExercise }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
};
