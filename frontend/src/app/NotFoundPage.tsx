import { Link } from 'react-router';

// Temporary until the i18n plumbing lands in Phase 2.
export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="text-gray-600">The page you were looking for does not exist.</p>
      <Link to="/" className="rounded-lg bg-blue-900 px-5 py-3 text-white hover:bg-blue-800">
        Go to the home page
      </Link>
    </main>
  );
}

export function RouteError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-gray-600">Reload the page to try again.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-blue-900 px-5 py-3 text-white hover:bg-blue-800"
      >
        Reload
      </button>
    </main>
  );
}
