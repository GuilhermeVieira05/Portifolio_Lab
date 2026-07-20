import { useEffect, useMemo, useRef, useState } from "react";

type Options = {
  typingSpeed?: number;    
  deletingSpeed?: number;  
  pauseTime?: number;      
  startDelay?: number;     
  loop?: boolean;          
};

export function useTypewriter(
  words: string[],
  {
    typingSpeed = 90,
    deletingSpeed = 50,
    pauseTime = 1000,
    startDelay = 300,
    loop = true,
  }: Options = {}
) {
  const safeWords = useMemo(
    () => (words && words.length ? words : [""]),
    [words]
  );

  const [index, setIndex] = useState(0);      
  const [subIndex, setSubIndex] = useState(0); 
  const [deleting, setDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(id);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    // Concluiu a digitação da palavra inteira → pausa e começa apagar
    if (!deleting && subIndex === safeWords[index].length) {
      timeoutRef.current = window.setTimeout(() => setDeleting(true), pauseTime);
      return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      };
    }

    // Concluiu a exclusão → avança para a próxima palavra
    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= safeWords.length) {
          return loop ? 0 : prev; 
        }
        return next;
      });
      return;
    }

    // Animação de digitar/apagar
    const speed = deleting ? deletingSpeed : typingSpeed;
    timeoutRef.current = window.setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, speed);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [started, deleting, subIndex, index, safeWords, typingSpeed, deletingSpeed, pauseTime, loop]);

  const text = safeWords[index]?.slice(0, subIndex) ?? "";

  return { text, deleting, index, started };
}