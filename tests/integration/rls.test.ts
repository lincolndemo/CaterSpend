import { describe, it, expect, beforeAll } from 'vitest';
import { anonClient, newUser } from './helpers';

describe('row level security', () => {
  let userA: Awaited<ReturnType<typeof newUser>>;
  let userB: Awaited<ReturnType<typeof newUser>>;
  let categoryId: string;
  let jobId: string;

  beforeAll(async () => {
    userA = await newUser();
    userB = await newUser();

    const { data: categories } = await userA.client.from('categories').select('*').order('sort_order');
    categoryId = categories![0].id;

    const { data: job } = await userA.client
      .from('jobs')
      .insert({ user_id: userA.userId, name: 'Adeyemi Wedding', quoted_amount: 650000 })
      .select()
      .single();
    jobId = job!.id;
  });

  it('seeds a profile and nine built-in categories on signup', async () => {
    const { data: profile } = await userA.client.from('profiles').select('*').eq('id', userA.userId).single();
    expect(profile).toBeTruthy();

    const { count } = await userA.client.from('categories').select('id', { count: 'exact', head: true });
    expect(count).toBe(9);
  });

  it('rejects writes from a signed-out client', async () => {
    const { error } = await anonClient()
      .from('expenses')
      .insert({ user_id: userA.userId, date: '2026-09-01', amount: 100, description: 'x', category_id: categoryId, payment_method: 'Cash' });
    expect(error).toBeTruthy();
  });

  it('hides one user rows from another', async () => {
    await userA.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-01', amount: 5000, description: 'A private expense',
      category_id: categoryId, payment_method: 'Cash',
    });

    const { data: seenByB } = await userB.client.from('expenses').select('*');
    expect(seenByB).toEqual([]);

    const { data: seenByA } = await userA.client.from('expenses').select('*');
    expect(seenByA!.length).toBeGreaterThan(0);
  });

  it('refuses an insert that claims another user id', async () => {
    const { error } = await userB.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-01', amount: 100, description: 'sneaky',
      category_id: categoryId, payment_method: 'Cash',
    });
    expect(error).toBeTruthy();
  });

  it('refuses to reach another user category through a composite foreign key', async () => {
    // The FK is (category_id, user_id) -> categories(id, user_id), so userB naming userA's category
    // fails the reference rather than merely the RLS check. This is what stops a caller stitching
    // their own rows onto someone else's taxonomy.
    const { error } = await userB.client.from('expenses').insert({
      user_id: userB.userId, date: '2026-09-01', amount: 100, description: 'borrowed category',
      category_id: categoryId, payment_method: 'Cash',
    });
    expect(error?.code).toBe('23503');
  });

  it('nulls job_id on expenses and income when a job is deleted', async () => {
    await userA.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-02', amount: 120000, description: 'Bulk market run',
      category_id: categoryId, payment_method: 'Cash', job_id: jobId,
    });
    await userA.client.from('income').insert({
      user_id: userA.userId, date: '2026-09-03', amount: 400000, description: 'Deposit', job_id: jobId,
    });

    await userA.client.from('jobs').delete().eq('id', jobId);

    const { data: expenses } = await userA.client.from('expenses').select('*').eq('description', 'Bulk market run');
    const { data: income } = await userA.client.from('income').select('*').eq('description', 'Deposit');
    expect(expenses![0].job_id).toBeNull();
    expect(income![0].job_id).toBeNull();
  });

  it('rejects a duplicate category name for the same user', async () => {
    // Lowercase on purpose: the unique index is on lower(btrim(name)), so this proves the collapse
    // rather than a plain equality match.
    const { error } = await userA.client.from('categories').insert({
      user_id: userA.userId, name: 'ingredients', color_light: '#9C7E4C', color_dark: '#D3AD70',
    });
    expect(error?.code).toBe('23505');
  });

  it('refuses to delete a category that an expense still uses', async () => {
    // A custom category, not the built-in one: categories_delete carries `and not is_builtin`, so
    // deleting a built-in matches no row under RLS and returns success with a zero count. That would
    // pass a naive "did it fail?" assertion while proving nothing about the foreign key.
    const { data: custom } = await userA.client
      .from('categories')
      .insert({ user_id: userA.userId, name: 'Decorations', color_light: '#9C7E4C', color_dark: '#D3AD70' })
      .select()
      .single();

    await userA.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-04', amount: 30000, description: 'Table centrepieces',
      category_id: custom!.id, payment_method: 'Cash',
    });

    const { error } = await userA.client.from('categories').delete().eq('id', custom!.id);
    expect(error?.code).toBe('23503');
  });

  it('refuses to edit or delete a built-in category', async () => {
    const { count: renamed } = await userA.client
      .from('categories')
      .update({ name: 'Renamed' }, { count: 'exact' })
      .eq('id', categoryId);
    const { count: deleted } = await userA.client
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', categoryId);

    // RLS filters these out rather than erroring, so the count is the only evidence. Zero rows
    // touched is the whole assertion: built-ins are read-only.
    expect(renamed).toBe(0);
    expect(deleted).toBe(0);
  });

  it('rejects a non-positive amount', async () => {
    const { error } = await userA.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-01', amount: 0, description: 'free',
      category_id: categoryId, payment_method: 'Cash',
    });
    expect(error).toBeTruthy();
  });

  it('rejects an unknown payment method', async () => {
    const { error } = await userA.client.from('expenses').insert({
      user_id: userA.userId, date: '2026-09-01', amount: 100, description: 'x',
      category_id: categoryId, payment_method: 'Crypto',
    });
    expect(error).toBeTruthy();
  });
});
