-- Fix for confidence score trigger
-- The original trigger failed because OLD is not available in INSERT context
-- This creates separate triggers for INSERT and UPDATE

-- Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS update_confidence_on_task_change ON public.user_tasks;

-- Trigger for INSERT (new tasks)
CREATE TRIGGER update_confidence_on_task_insert
    AFTER INSERT ON public.user_tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_business_plan_confidence();

-- Trigger for UPDATE (status changes)
CREATE TRIGGER update_confidence_on_task_update
    AFTER UPDATE OF status ON public.user_tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed' OR OLD.status = 'completed')
    EXECUTE FUNCTION update_business_plan_confidence();
