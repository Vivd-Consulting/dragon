import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

import { TASK_PRIORITY } from 'consts';

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

  const updatedPriority = TASK_PRIORITY.map(priority => {
    if (priority.name === 'High') {
      return { ...priority, disabled: hasAlready2HighPriorityTask };
    } else if (priority.name === 'Urgent') {
      return { ...priority, disabled: hasAlreadyUrgentPriorityTask };
    }

    return priority;
  });

  return updatedPriority;
}

const PRIORITIES = gql`
  query priorities($projectId: Int!) {
    task(where: { project_id: { _eq: $projectId } }) {
      priority
    }
  }
`;
