import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export function useTaskPriorities(selectedProject) {
  const { data, loading, error } = useQuery(PRIORITIES, {
    variables: {
      projectId: selectedProject
    },
    skip: !selectedProject
  });

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { task } = data || {};

  const hasAlreadyUrgentPriorityTask = task?.filter(task => task.priority === 3).length >= 1;

  const hasAlready2HighPriorityTask = task?.filter(task => task.priority === 2).length >= 2;

  const TASK_PRIORITY = [
    { name: 'Low', id: 0, severity: 'success' },
    { name: 'Medium', id: 1, severity: 'info' },
    { name: 'High', id: 2, severity: 'warning', disabled: hasAlready2HighPriorityTask },
    { name: 'Urgent', id: 3, severity: 'danger', disabled: hasAlreadyUrgentPriorityTask }
  ];

  return TASK_PRIORITY;
}

const PRIORITIES = gql`
  query priorities($projectId: Int!) {
    task(where: { project_id: { _eq: $projectId } }) {
      priority
    }
  }
`;
