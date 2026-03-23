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
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step.number < current
                  ? 'bg-primary-600 text-white'
                  : step.number === current
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.number < current ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-1 text-xs font-medium hidden sm:block ${
                step.number <= current ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-px mx-1 sm:mx-2 mb-3 sm:mb-4 transition-colors ${
                step.number < current ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
