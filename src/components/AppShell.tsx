import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  CheckSquare,
  CalendarDays,
  Sparkles,
  Search,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, useMarkNotificationsRead, useProfile } from "@/lib/workspace";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/research", label: "AI Research", icon: Search },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/productivity", label: "Productivity", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-6">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">TaskFlow AI</p>
        <p className="text-xs text-muted-foreground">One connected workspace</p>
      </div>
    </div>
  );
}

function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const go = (to: string, search?: Record<string, string>) => {
    setOpen(false);
    navigate({ to, search: search as never });
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-64 rounded-xl border border-border bg-popover p-2 shadow-lift">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">AI quick actions</p>
          {[
            { label: "Plan My Day", run: () => go("/planner", { scope: "day" }) },
            { label: "Create Weekly Schedule", run: () => go("/planner", { scope: "week" }) },
            { label: "Prioritize My Tasks", run: () => go("/tasks") },
            { label: "Research a Topic", run: () => go("/research") },
            { label: "Summarize Text", run: () => go("/research") },
            { label: "Ask AI", run: () => go("/assistant") },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.run}
              className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      <Button
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="AI quick actions"
        className="fixed bottom-6 right-5 z-50 size-14 rounded-full shadow-lift"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </Button>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: profile } = useProfile();
  const markRead = useMarkNotificationsRead();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <Brand />
        <NavList />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <Brand />
          <NavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <form
            className="relative flex-1 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/tasks", search: { q: query } as never });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-9"
            />
          </form>
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu onOpenChange={(o) => o && unread && markRead.mutate()}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <div key={n.id} className="px-2 py-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/assistant" aria-label="AI Assistant">
                <MessageSquare className="size-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(profile?.display_name ?? "U").charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.display_name ?? "Your account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/auth" });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 md:px-6 lg:pb-10">{children}</main>
      </div>

      <QuickActions />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
