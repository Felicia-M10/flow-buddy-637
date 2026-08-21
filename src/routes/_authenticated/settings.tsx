import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useCategories, useCreateCategory, useProfile, useUpsertProfile } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TaskFlow AI" },
      { name: "description", content: "Set your name, working hours, categories, theme and notifications." },
      { property: "og:title", content: "Settings — TaskFlow AI" },
      { property: "og:description", content: "Tune how TaskFlow AI plans and notifies you." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const upsert = useUpsertProfile();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [notifications, setNotifications] = useState(true);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? "");
    setStart(profile.work_start);
    setEnd(profile.work_end);
    setNotifications(profile.notifications_enabled);
  }, [profile]);

  const save = async () => {
    await upsert.mutateAsync({
      display_name: name,
      work_start: start,
      work_end: end,
      notifications_enabled: notifications,
      theme,
    });
    toast.success("Settings saved");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences shared across every part of your workspace." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface grid gap-4 p-6">
          <h2 className="text-base font-semibold">Profile</h2>
          <div className="grid gap-2">
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Work starts</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Work ends</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <Button onClick={save} disabled={upsert.isPending} className="w-fit">
            Save changes
          </Button>
        </div>

        <div className="card-surface grid gap-4 p-6">
          <h2 className="text-base font-semibold">Appearance & alerts</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-xs text-muted-foreground">Calming purple, day or night.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Task reminders and milestone alerts.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </div>

        <div className="card-surface grid gap-4 p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="rounded-full bg-muted px-3 py-1 text-sm">
                {c.name}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="max-w-xs"
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!newCategory.trim()) return;
                await createCategory.mutateAsync(newCategory.trim());
                setNewCategory("");
                toast.success("Category added");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
