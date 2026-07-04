import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import {
  CommunityDirectory,
  type Researcher,
  type ConnectionState,
} from "@/components/CommunityDirectory";
import type { Profile, University, ProjectMember, Project, Connection } from "@/types/database";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: profiles } = await supabase.from("profiles").select("*").order("full_name");
  const profileList = (profiles ?? []) as Profile[];

  const { data: unis } = await supabase.from("universities").select("*");
  const uniMap = new Map(((unis ?? []) as University[]).map((u) => [u.id, u.name]));

  const { data: memberships } = await supabase
    .from("project_members")
    .select("user_id, project:projects(status)");
  const mem = (memberships ?? []) as unknown as (Pick<ProjectMember, "user_id"> & {
    project: Pick<Project, "status"> | null;
  })[];

  const counts = new Map<string, { total: number; done: number }>();
  for (const m of mem) {
    const c = counts.get(m.user_id) ?? { total: 0, done: 0 };
    c.total += 1;
    if (m.project?.status === "completed") c.done += 1;
    counts.set(m.user_id, c);
  }

  const researchers: Researcher[] = profileList
    .filter((p) => p.full_name)
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      university: p.university_id ? uniMap.get(p.university_id) ?? null : null,
      study_program: p.study_program,
      semester: p.semester,
      interests: p.interests ?? [],
      skills: p.skills ?? [],
      projectCount: counts.get(p.id)?.total ?? 0,
      completedCount: counts.get(p.id)?.done ?? 0,
    }));

  const universities = Array.from(uniMap.values()).sort();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const connectionMap: Record<string, ConnectionState> = {};
  if (currentUserId) {
    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);
    for (const c of (conns ?? []) as Connection[]) {
      const otherId = c.requester_id === currentUserId ? c.addressee_id : c.requester_id;
      connectionMap[otherId] = {
        id: c.id,
        status: c.status,
        outgoing: c.requester_id === currentUserId,
      };
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Komunitas peneliti</h1>
        <p className="text-sm text-slate-500">Temukan partner berdasarkan skill, tool, dan universitas.</p>
      </div>
      <CommunityDirectory
        researchers={researchers}
        universities={universities}
        initialQuery={q ?? ""}
        currentUserId={currentUserId}
        connections={connectionMap}
      />
    </AppShell>
  );
}
