// Tipe database, selaras dengan supabase/migrations.
// Regenerasi produksi: supabase gen types typescript --project-id <id> > src/types/database.ts

export type ProjectStatus = "open" | "in_progress" | "completed" | "archived";
export type MemberRole = "owner" | "co_lead" | "member" | "viewer";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type StageStatus = "not_started" | "in_progress" | "done" | "blocked";
export type ToolLicense = "free" | "academic" | "paid";
export type ManuscriptStatus = "draft" | "submitted" | "revision" | "accepted" | "rejected";
export type NotificationType =
  | "application"
  | "application_result"
  | "task_assigned"
  | "mention"
  | "deadline"
  | "invite"
  | "connection"
  | "system";

export type ConnectionStatus = "pending" | "accepted";

export type ColumnType = "text" | "number" | "url" | "select";
export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  options?: string[];
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface AuthorEntry {
  name: string;
  affiliation?: string;
  contribution?: string;
  order: number;
  corresponding?: boolean;
}

export interface University {
  id: string;
  name: string;
  city: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  university_id: string | null;
  study_program: string | null;
  semester: number | null;
  bio: string | null;
  interests: string[];
  skills: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  field: string | null;
  required_roles: string[];
  max_members: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  position: string | null;
  joined_at: string;
}

export interface Application {
  id: string;
  project_id: string;
  applicant_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface ResearchStage {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  position: number;
  is_done: boolean;
  status: StageStatus;
  method_key: string | null;
  suggested_tools: string[];
  param_checklist: ChecklistItem[];
  created_at: string;
}

export interface DataTable {
  id: string;
  stage_id: string;
  name: string;
  columns: ColumnDef[];
  created_at: string;
}

export interface DataRow {
  id: string;
  table_id: string;
  values: Record<string, string>;
  source_label: string | null;
  source_url: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  stage_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface MethodTemplate {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string | null;
  default_stages: {
    name: string;
    description: string;
    suggested_tools: string[];
    param_checklist: string[];
  }[];
  suggested_tools: string[];
  created_at: string;
}

export interface ToolEntry {
  id: string;
  name: string;
  category: string;
  description: string | null;
  stages: string[];
  url: string | null;
  license: ToolLicense;
  tips: string | null;
  created_at: string;
}

export interface ProjectMethod {
  id: string;
  project_id: string;
  method_key: string;
  method_name: string;
  created_at: string;
}

export interface StageReproducibility {
  id: string;
  stage_id: string;
  tool_name: string | null;
  tool_version: string | null;
  os_hardware: string | null;
  parameters: string | null;
  input_link: string | null;
  output_link: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reference {
  id: string;
  project_id: string;
  title: string;
  authors: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  stage_id: string;
  project_id: string;
  label: string;
  url: string;
  kind: "link" | "file";
  created_by: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  stage_id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Manuscript {
  id: string;
  project_id: string;
  target_journal: string | null;
  status: ManuscriptStatus;
  authors: AuthorEntry[];
  checklist: ChecklistItem[];
  methods_draft: string | null;
  results_draft: string | null;
  abstract_draft: string | null;
  updated_at: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  actor_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

type AsRecord<T> = { [K in keyof T]: T[K] };
type TableDef<Row> = {
  Row: AsRecord<Row>;
  Insert: Partial<AsRecord<Row>>;
  Update: Partial<AsRecord<Row>>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      universities: TableDef<University>;
      profiles: TableDef<Profile>;
      projects: TableDef<Project>;
      project_members: TableDef<ProjectMember>;
      applications: TableDef<Application>;
      research_stages: TableDef<ResearchStage>;
      data_tables: TableDef<DataTable>;
      data_rows: TableDef<DataRow>;
      tasks: TableDef<Task>;
      chat_messages: TableDef<ChatMessage>;
      method_templates: TableDef<MethodTemplate>;
      tools: TableDef<ToolEntry>;
      project_methods: TableDef<ProjectMethod>;
      stage_reproducibility: TableDef<StageReproducibility>;
      references: TableDef<Reference>;
      attachments: TableDef<Attachment>;
      comments: TableDef<Comment>;
      notifications: TableDef<Notification>;
      connections: TableDef<Connection>;
      manuscript: TableDef<Manuscript>;
      activity_log: TableDef<ActivityLog>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      project_status: ProjectStatus;
      member_role: MemberRole;
      application_status: ApplicationStatus;
      task_status: TaskStatus;
      stage_status: StageStatus;
      manuscript_status: ManuscriptStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
