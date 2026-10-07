"use client";

import { useState, useTransition } from "react";
import { createTask, updateTask, updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Calendar, Flag, User as UserIcon, X, CheckCircle2, Circle, Clock } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  assignedToId: string | null;
  assignedTo: {
    id: string;
    name: string;
    image: string | null;
    profile: { profileImage: string | null } | null;
  } | null;
  createdById: string;
};

type TeamMember = {
  userId: string;
  user: {
    name: string;
  };
};

interface TeamTasksProps {
  teamId: string;
  tasks: Task[];
  members: TeamMember[];
  isOwner: boolean;
  currentUserId: string;
}

const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-card w-full max-w-md rounded-3xl border shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h2 className="text-xl font-black">{title}</h2>
        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

export function TeamTasks({ teamId, tasks, members, isOwner, currentUserId }: TeamTasksProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter(t => t.status === "TODO").length;
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assignedToId = formData.get("assignedToId") as string;
    const priority = formData.get("priority") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await createTask(teamId, {
          title,
          description: description || undefined,
          assignedToId: assignedToId || undefined,
          priority,
          dueDate
        });
        setIsCreateOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to create task");
      }
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assignedToId = formData.get("assignedToId") as string;
    const priority = formData.get("priority") as string;
    const status = formData.get("status") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await updateTask(editingTask.id, {
          title,
          description: description || null,
          assignedToId: assignedToId || null,
          priority,
          status,
          dueDate
        });
        setEditingTask(null);
      } catch (err: any) {
        setError(err.message || "Failed to update task");
      }
    });
  };

  const handleDelete = (taskId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteTask(taskId);
        setDeletingId(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete task");
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    setError(null);
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, newStatus);
      } catch (err: any) {
        setError(err.message || "Failed to update status");
      } finally {
        setUpdatingTaskId(null);
      }
    });
  };

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return "text-red-600 bg-red-100 border-red-200";
    if (p === "MEDIUM") return "text-amber-600 bg-amber-100 border-amber-200";
    return "text-emerald-600 bg-emerald-100 border-emerald-200";
  };

  const getStatusColor = (s: string) => {
    if (s === "COMPLETED") return "text-emerald-700 bg-emerald-100 border-emerald-200";
    if (s === "IN_PROGRESS") return "text-primary bg-primary/10 border-primary/20";
    return "text-muted-foreground bg-muted border-border/50";
  };

  return (
    <div className="space-y-6 pt-4" id="tasks">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-foreground">
          Team Tasks
        </h2>
        {isOwner && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className={cn(buttonVariants({ size: "sm" }), "rounded-full font-bold shadow-sm")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Task
          </button>
        )}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">Team Progress</p>
              <p className="text-2xl font-black text-foreground">{progressPercent}% complete</p>
              <p className="text-sm font-medium text-muted-foreground">{completed} of {total} tasks completed</p>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[140px]">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-muted-foreground">To Do</span>
                <span>{todo}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-primary">In Progress</span>
                <span>{inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-emerald-600">Completed</span>
                <span>{completed}</span>
              </div>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Task List */}
      {total === 0 ? (
        <div className="bg-card border border-border/50 rounded-3xl p-8 text-center shadow-sm">
          <h3 className="text-xl font-black mb-2">No tasks yet</h3>
          {isOwner ? (
            <>
              <p className="text-muted-foreground font-medium mb-6">Create the first task and start organizing your team&apos;s work.</p>
              <button onClick={() => setIsCreateOpen(true)} className={cn(buttonVariants({ size: "default" }), "rounded-full font-bold shadow-sm")}>
                Create Task
              </button>
            </>
          ) : (
            <p className="text-muted-foreground font-medium">Tasks assigned by the team owner will appear here.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl font-bold">{error}</div>}
          
          {tasks.map(task => {
            const isMyTask = task.assignedToId === currentUserId;
            const canUpdateStatus = isOwner || isMyTask;
            const isUpdating = isPending && updatingTaskId === task.id;

            return (
              <div key={task.id} className={cn(
                "p-5 rounded-3xl border bg-card shadow-sm transition-shadow relative group",
                isMyTask ? "border-primary/40 bg-primary/[0.02]" : "border-border/50 hover:shadow-md"
              )}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-lg text-foreground truncate">{task.title}</h4>
                        {isMyTask && <span className="text-[10px] uppercase font-black tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">My Task</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md border", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground mt-4">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full overflow-hidden bg-muted">
                            {task.assignedTo.profile?.profileImage || task.assignedTo.image ? (
                              <SafeImage src={task.assignedTo.profile?.profileImage || task.assignedTo.image!} alt={task.assignedTo.name} width={20} height={20} className="object-cover h-full w-full"/>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] bg-primary/10 text-primary">
                                {task.assignedTo.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-foreground">{isMyTask ? "You" : task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 opacity-60">
                          <UserIcon className="h-4 w-4" /> Unassigned
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status & Actions Column */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/50 w-full md:w-auto">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Status:</span>
                      {canUpdateStatus ? (
                        <div className="relative">
                          {isUpdating && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}
                          <select
                            value={task.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={cn(
                              "text-xs font-bold px-2 py-1.5 rounded-lg border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
                              getStatusColor(task.status),
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                          {/* Custom simple arrow for select */}
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                            <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", getStatusColor(task.status))}>
                          {task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                        </div>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingTask(task)} className="text-xs font-bold px-3 py-1.5 rounded-full hover:bg-muted text-foreground transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeletingId(task.id)} className="text-xs font-bold px-3 py-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <Modal title="Create Task" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl font-bold">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Title *</label>
              <input name="title" required className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. Build authentication" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Description</label>
              <textarea name="description" rows={3} className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" placeholder="Task details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Priority</label>
                <select name="priority" defaultValue="MEDIUM" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Due Date</label>
                <input type="date" name="dueDate" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold">Assign to</label>
              <select name="assignedToId" defaultValue="" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name}</option>
                ))}
              </select>
            </div>

            <button disabled={isPending} type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full font-bold mt-4")}>
              {isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Create Task"}
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl font-bold">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Title *</label>
              <input name="title" defaultValue={editingTask.title} required className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Description</label>
              <textarea name="description" defaultValue={editingTask.description || ""} rows={3} className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Status</label>
                <select name="status" defaultValue={editingTask.status} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Priority</label>
                <select name="priority" defaultValue={editingTask.priority} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Assign to</label>
                <select name="assignedToId" defaultValue={editingTask.assignedToId || ""} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold">Due Date</label>
                <input type="date" name="dueDate" defaultValue={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ""} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
            </div>

            <button disabled={isPending} type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full font-bold mt-4")}>
              {isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      {deletingId && (
        <Modal title="Delete Task?" onClose={() => setDeletingId(null)}>
          <div className="space-y-6">
            <p className="text-muted-foreground font-medium">This action cannot be undone. Are you sure you want to delete this task?</p>
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl font-bold">{error}</div>}
            <div className="flex gap-3">
              <button disabled={isPending} onClick={() => setDeletingId(null)} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 rounded-full font-bold")}>
                Cancel
              </button>
              <button disabled={isPending} onClick={() => handleDelete(deletingId)} className={cn(buttonVariants({ variant: "destructive", size: "lg" }), "flex-1 rounded-full font-bold")}>
                {isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Delete Task"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
