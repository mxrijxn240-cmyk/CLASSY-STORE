import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Field } from '@/components/FormField';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) setError('Sign in failed. Check your email and password.');
  };

  return (
    <main className="page admin-page">
      <div className="page-intro compact">
        <p className="kicker">CLASSY workspace</p>
        <h1>Sign <em>in.</em></h1>
      </div>
      <form className="edit-form" onSubmit={submit}>
        {error && <p className="form-error">{error}</p>}
        <div className="form-fields">
          <Field label="Email address" type="email" value={email} onChange={setEmail} wide required />
          <Field label="Password" type="password" value={password} onChange={setPassword} wide required />
        </div>
        <button className="button button-gold full" disabled={loading}>
          {loading ? 'Please wait…' : 'Sign in'} <ArrowRight size={15} />
        </button>
      </form>
    </main>
  );
}
