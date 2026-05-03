import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { NorveoLogo } from '../TitleBar/NarveoLogo';
import styles from './Login.module.css';

function getStoredTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('norveo-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function Login() {
  const [email, setEmail] = useState('demo@norveo.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getStoredTheme());
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter any email and password to continue the demo.');
      return;
    }
    try {
      localStorage.setItem('norveo-auth', '1');
    } catch {
      /* ignore */
    }
    window.location.hash = '#/app';
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.brand}>
          <NorveoLogo size={22} />
          <span className={styles.demoBadge}>UAT demo</span>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Pool configurator</p>
          <h1 id="login-title" className={styles.title}>Sign in to Norveo</h1>
          <p className={styles.subtitle}>
            Continue to the project setup, configurator, procurement, and purchase order demo.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <div className={styles.inputWrap}>
              <Mail size={14} aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                placeholder="demo@norveo.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.inputWrap}>
              <Lock size={14} aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                placeholder="Any password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit}>
            Sign in
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.linkButton}>
            Forgot password?
          </button>
          <span>Mock credentials accepted for UAT.</span>
        </div>
      </section>
    </main>
  );
}
