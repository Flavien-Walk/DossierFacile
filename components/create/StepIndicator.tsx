const STEPS = [
  { number: 1, label: 'Informations' },
  { number: 2, label: 'Documents' },
  { number: 3, label: 'Style' },
  { number: 4, label: 'Aperçu' },
];

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  const progress = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-start justify-between">
        {STEPS.map((step, index) => {
          const isDone = step.number < current;
          const isActive = step.number === current;
          const isPending = step.number > current;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-primary-600 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                    isActive ? 'text-primary-600' : isDone ? 'text-slate-400' : 'text-slate-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                    step.number < current ? 'bg-primary-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
