import { experiences } from 'app/experience/data';

export function ExperienceFlow() {
  return (
    <div className="flex flex-col space-y-6">
      {experiences.map((exp, index) => (
        <div
          key={index}
          className="border-l-2 border-neutral-700 pl-4 relative"
        >
          {/* Dot */}
          <div className="absolute -left-[9px] top-2 w-4 h-4 bg-neutral-700 rounded-full" />

          <p className="text-sm text-neutral-500">{exp.period}</p>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {exp.role}
          </h3>
          <p className={`font-bold ${exp.color}`}>{exp.company}</p>
          <p className="text-neutral-300 text-sm mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
  );
}
