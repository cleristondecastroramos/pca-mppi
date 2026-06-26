import { useState, useEffect } from "react";

export function useExercise() {
  const [exercise, setExerciseState] = useState<number>(() => {
    const saved = localStorage.getItem("pca_exercicio");
    return saved ? parseInt(saved, 10) : 2026;
  });

  const setExercise = (year: number) => {
    localStorage.setItem("pca_exercicio", year.toString());
    setExerciseState(year);
    // Dispatch custom event to notify other components of context switch
    window.dispatchEvent(new CustomEvent("pca-exercise-change", { detail: year }));
  };

  useEffect(() => {
    const handleExerciseChange = (e: Event) => {
      const year = (e as CustomEvent).detail;
      if (year !== exercise) {
        setExerciseState(year);
      }
    };
    window.addEventListener("pca-exercise-change", handleExerciseChange);
    return () => window.removeEventListener("pca-exercise-change", handleExerciseChange);
  }, [exercise]);

  return { exercise, setExercise };
}
