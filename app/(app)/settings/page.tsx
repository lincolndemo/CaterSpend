import { BudgetForm } from '@/components/settings/BudgetForm';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { loadWorkspace } from '@/lib/data';

export default async function SettingsPage() {
  const { profile, categories } = await loadWorkspace();

  return (
    <div className="grid gap-5">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">Settings</h1>
      <BudgetForm profile={profile} />
      <CategoryManager categories={categories} />
    </div>
  );
}
