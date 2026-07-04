import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { PROJECT_STATUS_META } from "@/lib/constants";
import type { Project } from "@/types/database";

export function ProjectCard({
  project,
  methods = [],
}: {
  project: Project;
  methods?: string[];
}) {
  const meta = PROJECT_STATUS_META[project.status] ?? { label: project.status, tone: "slate" as const };
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          {project.field && <span className="text-xs text-slate-500">{project.field}</span>}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
        {methods.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {methods.slice(0, 3).map((m) => (
              <Badge key={m} tone="violet">{m}</Badge>
            ))}
          </div>
        )}
        {project.required_roles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.required_roles.slice(0, 4).map((r) => (
              <Badge key={r} tone="slate">{r}</Badge>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
