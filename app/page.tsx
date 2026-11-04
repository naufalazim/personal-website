import Link from 'next/link';
import { BlogPosts } from 'app/components/posts';
import Image from 'next/image';
import { ExperienceFlow } from './components/ExperienceFlow';
import { Skills } from './components/Skills';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-start">
        <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-800">
          <Image
            src="/profile.jpg"
            alt="Profile Picture"
            fill
            sizes="160px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">About Me</h1>
      <p className="mb-4">
        Hi, I’m Naufal! 👋 I’m a{' '}
        <span className="font-bold text-yellow-500">Software Engineer</span>{' '}
        dedicated to building high-performance, scalable systems that power the
        banking and insurance sectors. Currently at
        <span className="font-bold text-orange-500"> PwC</span> , I specialize
        in Guidewire development (Java), modernizing core insurance platforms.
      </p>

      <p className="mb-4">
        My background includes architecting full-stack solutions for the
        <span className="font-bold text-yellow-500"> banking industry</span>,
        where I focused on optimizing performance and solving complex real-world
        problems. I’m a firm believer in clean code and continuous learning,
        currently honing my expertise in enterprise architecture to transition
        into a Senior Engineer role.
      </p>
      <div className="my-8">
        <ExperienceFlow />
      </div>
      <div className="my-8">
        <Skills />
      </div>
      <div className="my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tighter">
            Recent posts
          </h2>
          <Link
            href="/blog"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            View all →
          </Link>
        </div>
        <BlogPosts />
      </div>
    </section>
  );
}
