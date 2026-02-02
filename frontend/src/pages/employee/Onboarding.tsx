import { useEffect, useState } from 'react';
import {
  getMyOnboarding,
  submitOnboarding,
  type OnboardingApplication,
} from '../../lib/onboarding';

export default function EmployeeOnboarding() {
  const [app, setApp] = useState<OnboardingApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getMyOnboarding();
      if (r.ok && r.application) {
        setApp(r.application);
      }
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
    };

    const r = await submitOnboarding(formData);
    if (r.ok) {
      const r2 = await getMyOnboarding();
      if (r2.ok && r2.application) {
        setApp(r2.application);
      }
    } else {
      alert('Submit failed');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!app) return <p>No application</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Employee Onboarding</h2>

      <p>Status: <strong>{app.status}</strong></p>

      {app.status === 'never-submitted' && (
        <button onClick={handleSubmit}>
          Submit onboarding (demo)
        </button>
      )}

      {app.status === 'pending' && (
        <p>Your application is pending HR review.</p>
      )}

      {app.status === 'rejected' && (
        <>
          <p>Your application was rejected.</p>
          <button onClick={handleSubmit}>
            Resubmit (demo)
          </button>
        </>
      )}

      {app.status === 'approved' && (
        <p>Onboarding approved</p>
      )}
    </div>
  );
}
