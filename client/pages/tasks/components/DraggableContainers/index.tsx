import React from 'react';
import type { CancelDrop, UniqueIdentifier } from '@dnd-kit/core';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { useQuery } from '@apollo/client';

import { MultipleContainers, TRASH_ID } from './MultipleContainers';

import tasksQuery from './queries/tasks.gql';

export const BasicSetup = () => {
  const { data, loading } = useQuery(tasksQuery);
  const tasks = data?.task || [];

  console.log(tasks);

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
};

export const DragHandle = () => <MultipleContainers handle />;

export const ManyItems = () => (
  <MultipleContainers
    containerStyle={{
      maxHeight: '80vh'
    }}
    itemCount={15}
    scrollable
  />
);

export const Vertical = () => <MultipleContainers itemCount={5} vertical />;

export const TrashableItems = ({ confirmDrop }: { confirmDrop: boolean }) => {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const resolveRef = React.useRef<(value: boolean) => void>();

  const cancelDrop: CancelDrop = async ({ active, over }) => {
    if (over?.id !== TRASH_ID) {
      return true;
    }

    setActiveId(active.id);

    const confirmed = await new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
    });

    setActiveId(null);

    return confirmed === false;
  };

  return <MultipleContainers cancelDrop={confirmDrop ? cancelDrop : undefined} trashable />;

  /*
  return (
    <>
      <MultipleContainers
        cancelDrop={confirmDrop ? cancelDrop : undefined}
        trashable
      />
      {activeId && (
        <ConfirmModal
          onConfirm={() => resolveRef.current?.(true)}
          onDeny={() => resolveRef.current?.(false)}
        >
          Are you sure you want to delete "{activeId}"?
        </ConfirmModal>
      )}
    </>
  );
  */
};

TrashableItems.argTypes = {
  confirmDrop: {
    name: 'Request user confirmation before deletion',
    defaultValue: false,
    control: { type: 'boolean' }
  }
};

export const Grid = () => (
  <MultipleContainers
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150
    })}
  />
);

export const VerticalGrid = () => (
  <MultipleContainers
    columns={2}
    itemCount={5}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150
    })}
    vertical
  />
);
