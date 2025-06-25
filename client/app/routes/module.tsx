import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useModuleStore } from '~/stores/moduleStore';
import { useAuthStore } from '~/stores/authStore';
import { Heading } from '~/ui-kit/catalyst/heading';
import { Button } from '~/ui-kit/catalyst/button';
import StepNotes from '~/components/StepNotes'; 

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuthStore();
  const { modules, progress, loading, error, fetchUserProgress, fetchUserNotes, updateStepStatus } = useModuleStore();
  const [visibleNotes, setVisibleNotes] = useState<Record<string, boolean>>({});

  const module = modules.find(m => m.module_id === moduleId);

  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id);
      fetchUserNotes(user.id);
    }
  }, [user, fetchUserProgress, fetchUserNotes]);

  const handleCompleteStep = (stepId: string) => {
    if (user) {
      updateStepStatus(user.id, stepId, 'Completed');
    }
  };

  const toggleNotesVisibility = (stepId: string) => {
    setVisibleNotes(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  if (loading && modules.length === 0) {
    return <p className="p-8">Loading module details...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">Error: {error}</p>;
  }

  if (!module) {
    return (
      <div className="p-8">
        <p>Module not found.</p>
        <Link to="/home" className="text-blue-500 hover:underline">Return to Roadmap</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link to="/home" className="text-sm text-blue-600 hover:underline mb-4 inline-block">{'<'} Back to Roadmap</Link>
      <Heading level={1}>{module.module_name}</Heading>
      <p className="mt-2 text-lg text-gray-600">{module.description}</p>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-2xl font-semibold">Steps in this Module</h2>
        <ul className="mt-4 space-y-4">
          {module.steps.map(step => {
            const stepProgress = progress[step.step_id];
            const isCompleted = stepProgress?.status === 'Completed';

            return (
              <li key={step.step_id} className={`p-4 rounded-lg shadow-sm transition-colors ${isCompleted ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{step.step_name}</h3>
                    <p className="text-sm text-gray-500">Type: {step.step_type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button plain onClick={() => toggleNotesVisibility(step.step_id)}>
                      {visibleNotes[step.step_id] ? 'Hide Notes' : 'Show Notes'}
                    </Button>
                    <Button 
                      onClick={() => handleCompleteStep(step.step_id)}
                      disabled={isCompleted}
                      className={isCompleted ? 'bg-green-600 text-white' : ''}
                    >
                      {isCompleted ? 'Completed' : 'Mark as Complete'}
                    </Button>
                  </div>
                </div>
                {visibleNotes[step.step_id] && <StepNotes stepId={step.step_id} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
