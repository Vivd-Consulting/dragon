import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';

export function useContractors() {
  const { data, loading, error } = useQuery(CONTRACTORS);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { contractor } = data || {};

  return [contractor];
}

const CONTRACTORS = gql`
  query contractors {
    contractor(where: { archived_at: { _is_null: true } }) {
      id
      name
    }
  }
`;

export function useTaskContractors(taskId) {
  const { data, loading, error } = useQuery(TASK_ASSIGNEES, {
    variables: {
      taskId
    },
    skip: !taskId
  });

  const [createTaskAssignee] = useMutation(TASK_ASSIGNEES_CREATE, {
    refetchQueries: ['taskAssignees', 'tasks']
  });

  const [deleteTaskAssignee] = useMutation(TASK_ASSIGNEES_DELETE, {
    refetchQueries: ['taskAssignees', 'tasks']
  });

  if (loading) {
    return [[], _createTaskAssignee, _deleteTaskAssignee];
  }

  if (error) {
    console.error(error);
    return [[], _createTaskAssignee, _deleteTaskAssignee];
  }

  const { task_assignee } = data || [];

  return [task_assignee, _createTaskAssignee, _deleteTaskAssignee];

  function _createTaskAssignee(assigneeId) {
    createTaskAssignee({
      variables: {
        taskId,
        assigneeId
      }
    });
  }

  function _deleteTaskAssignee(assigneeId) {
    deleteTaskAssignee({
      variables: {
        taskId,
        assigneeId
      }
    });
  }
}

const TASK_ASSIGNEES = gql`
  query taskAssignees($taskId: Int!) {
    task_assignee(where: { task_id: { _eq: $taskId } }) {
      task_id
      assignee_id
    }
  }
`;

const TASK_ASSIGNEES_CREATE = gql`
  mutation insertTaskAssignee($taskId: Int!, $assigneeId: Int!) {
    insert_task_assignee_one(object: { task_id: $taskId, assignee_id: $assigneeId }) {
      task_id
      assignee_id
    }
  }
`;

const TASK_ASSIGNEES_DELETE = gql`
  mutation deleteTaskAssignee($taskId: Int!, $assigneeId: Int!) {
    delete_task_assignee(where: { task_id: { _eq: $taskId }, assignee_id: { _eq: $assigneeId } }) {
      returning {
        task_id
        assignee_id
      }
    }
  }
`;
