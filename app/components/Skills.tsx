import { Badge } from '@/components/ui/badge';

export const Skills = () => {
  const skillCategories = [
    {
      title: 'Backend & Core',
      skills: ['Java', 'Spring', 'Guidewire', 'Node.js', 'REST APIs'],
    },
    {
      title: 'Frontend',
      skills: ['Angular', 'React', 'Next.js'],
    },
    {
      title: 'Industry & Tools',
      skills: ['Banking', 'Git', 'Agile', 'Gitlab CI/CD', 'Azure DevOps'],
    },
  ];

  return (
    <section className="my-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tighter text-neutral-900 dark:text-neutral-100">
        Technical Skills
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {skillCategories.map((category) => (
          <div key={category.title}>
            <h3 className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
