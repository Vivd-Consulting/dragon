import React from 'react';
import { useQuery } from '@apollo/client';

import { MultipleContainers } from './components/MultipleContainers';

import tasksQuery from './queries/tasks.gql';

export default function TaskCardView() {
  const { data, loading } = useQuery(tasksQuery);
  const tasks = data?.task || [];

  if (loading) {
    return null;
  }

  let groups = {
    todo: [],
    grooming: [],
    in_progress: [],
    in_review: [],
    done: []
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    const { status } = task;

    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task.title);
    return acc;
  }, {});

  groups = {
    ...groups,
    ...groupedTasks
  };

  return <MultipleContainers items={groups} />;
}
