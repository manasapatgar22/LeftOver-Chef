import React, { useEffect, useState } from "react";
import { Sparkles, Utensils, Flame, Leaf } from "lucide-react";

interface GeminiLoadingProps {
  statusText?: string;
}

export const GeminiLoading: React.FC<GeminiLoadingProps> = ({ statusText }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { title: "👨🍳 Chef AI is thinking…", detail: "Connecting to Gemini intelligence model" },
    { title: "Analyzing your leftovers…", detail: "Calculating optimal food combinations & waste reduction" },
    { title: "Creating recipes…", detail: "Formulating cooking steps, nutritional profile & allergy guards" }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 1600);
    const timer2 = setTimeout(() => setStepIndex(2), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const activeStep = steps[stepIndex];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-8 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-emerald-100 dark:border-zinc-800 shadow-xl backdrop-blur-sm">
      <div className="relative mb-6">
        {/* Animated outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {stepIndex === 0 && <Sparkles className="w-6 h-6 animate-pulse" />}
            {stepIndex === 1 && <Utensils className="w-6 h-6 animate-bounce" />}
            {stepIndex === 2 && <Flame className="w-6 h-6 animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight transition-all duration-300">
          {statusText || activeStep.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {activeStep.detail}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              idx <= stepIndex
                ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <Leaf className="w-3.5 h-3.5" />
        <span>Prioritizing maximum leftover rescue & minimum waste</span>
      </div>
    </div>
  );
};
