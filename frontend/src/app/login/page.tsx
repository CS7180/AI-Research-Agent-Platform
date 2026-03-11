import LoginCard from './LoginCard';

export const metadata = {
  title: 'Sign In — DocMind',
  description: 'Sign in with your Google account to access your DocMind knowledge base.',
};

/**
 * Login page (Server Component shell).
 *
 * Renders a centered card with the Google OAuth sign-in button.
 * The middleware redirects authenticated users away from this page.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginCard />
    </main>
  );
}
