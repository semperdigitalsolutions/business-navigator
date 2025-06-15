import { useAuth } from '~/root'; // Assuming AuthContext is exported from root.tsx
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { Navigate } from 'react-router';
// import { Link } from 'react-router-dom'; // For Link components

export async function loader() {
  return null;
}

function Welcome() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="App Logo Light" // Updated alt text
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="App Logo Dark" // Updated alt text
              className="hidden w-full dark:block"
            />
          </div>
          <h1 style={{fontSize: '2em'}}>Welcome to Our Application!</h1> {/* Example Heading */}
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
              Please <a href="/login" style={{color: 'blue'}}>Login</a> or <a href="/signup" style={{color: 'blue'}}>Sign Up</a> to continue. {/* Use <a> or <Link> */}
            </p>
            {/* Removed resources links as they are not relevant for this app's welcome page */}
          </nav>
        </div>
      </div>
    </main>
  );
}
// Removed the 'resources' array as it's no longer used.
export default Welcome;
