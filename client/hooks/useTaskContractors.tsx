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
  const { data, loading, error } = useQuery(TASK_ASIGNEES, {
    variables: {
      taskId
    },
    skip: !taskId
  });

  const [createTaskAsignee] = useMutation(TASK_ASIGNEES_CREATE, {
    refetchQueries: ['taskAsignees', 'tasks']
  });

  const [deleteTaskAsignee] = useMutation(TASK_ASIGNEES_DELETE, {
    refetchQueries: ['taskAsignees', 'tasks']
  });

  if (loading) {
    return [[], _createTaskAsignee, _deleteTaskAsignee];
  }

  if (error) {
    console.error(error);
    return [[], _createTaskAsignee, _deleteTaskAsignee];
  }

  const { task_asignee } = data || [];

  return [task_asignee, _createTaskAsignee, _deleteTaskAsignee];

  function _createTaskAsignee(asigneeId) {
    createTaskAsignee({
      variables: {
        taskId,
        asigneeId
      }
    });
  }

  function _deleteTaskAsignee(asigneeId) {
    deleteTaskAsignee({
      variables: {
        taskId,
        asigneeId
      }
    });
  }
}

const TASK_ASIGNEES = gql`
  query taskAsignees($taskId: Int!) {
    task_asignee(where: { task_id: { _eq: $taskId } }) {
      task_id
      asignee_id
    }
  }
`;

const TASK_ASIGNEES_CREATE = gql`
  mutation insertTaskAsignee($taskId: Int!, $asigneeId: Int!) {
    insert_task_asignee_one(object: { task_id: $taskId, asignee_id: $asigneeId }) {
      task_id
      asignee_id
    }
  }
`;

const TASK_ASIGNEES_DELETE = gql`
  mutation deleteTaskAsignee($taskId: Int!, $asigneeId: Int!) {
    delete_project_contractor(
      where: { task_id: { _eq: $taskId }, asignee_id: { _eq: $asigneeId } }
    ) {
      returning {
        task_id
        asignee_id
      }
    }
  }
`;
