import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    const client = supabase;

    const resolve = async (next: Session | null) => {
      setSession(next);
      if (!next) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      const { data, error } = await client.from('admins').select('user_id').eq('user_id', next.user.id).maybeSingle();
      setIsAdmin(!error && data !== null);
      setChecking(false);
    };

    void client.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: listener } = client.auth.onAuthStateChange((_event, next) => {
      window.setTimeout(() => void resolve(next), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) return <main className="empty-page"><p className="kicker">Store unavailable</p><h1>Please try <em>again later.</em></h1></main>;
  if (checking) return <main className="empty-page"><p className="kicker">CLASSY workspace</p><h1>Loading<em>…</em></h1></main>;
  if (!session) return <AdminLogin />;
  if (!isAdmin) {
    return (
      <main className="empty-page">
        <p className="kicker">CLASSY workspace</p>
        <h1>No store <em>access.</em></h1>
        <p className="confirmation-copy">This account is not set up as a store administrator.</p>
        <button className="button button-gold" onClick={() => void supabase?.auth.signOut()}>Sign out</button>
      </main>
    );
  }
  return <AdminDashboard onSignOut={() => void supabase?.auth.signOut()} />;
}
