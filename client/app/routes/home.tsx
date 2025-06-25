import { useEffect } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '~/stores/authStore';
import { useModuleStore, type Module, } from '~/stores/moduleStore';
import { Heading } from '~/ui-kit/catalyst/heading';

export default function HomePage() {
  const { user } = useAuthStore();
  const { modules, loading, error, fetchModulesAndSteps } = useModuleStore();

  useEffect(() => {
    // Fetch modules when the component mounts
    fetchModulesAndSteps();
  }, [fetchModulesAndSteps]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading level={1}>Welcome, {user?.email || 'Entrepreneur'}!</Heading>
      <p className="mt-2 text-lg text-gray-600">Here is your roadmap to success. Choose a module to get started.</p>

      {loading && <p className="mt-8">Loading your roadmap...</p>}
      {error && <p className="mt-8 text-red-600">Error loading modules: {error}</p>}

      {!loading && !error && (
        <div className="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {modules.map((module: Module) => (
            <Link 
              to={`/module/${module.module_id}`}
              key={module.module_id} 
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900">{module.module_order}. {module.module_name}</h3>
              <p className="mt-2 text-gray-600">{module.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
