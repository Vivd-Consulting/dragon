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

export function useProjectContractors(projectId) {
  const { data, loading, error } = useQuery(PROJECT_CONTRACTORS, {
    variables: {
      projectId
    },
    skip: !projectId
  });

  const [createProjectContractor] = useMutation(PROJECT_CONTRACTORS_CREATE, {
    refetchQueries: ['projectContractors']
  });

  const [deleteProjectContractor] = useMutation(PROJECT_CONTRACTORS_DELETE, {
    refetchQueries: ['projectContractors']
  });

  if (loading) {
    return [[], _createProjectContractor, _deleteProjectContractor];
  }

  if (error) {
    console.error(error);
    return [[], _createProjectContractor, _deleteProjectContractor];
  }

  const { project_contractor } = data || [];

  return [project_contractor, _createProjectContractor, _deleteProjectContractor];

  function _createProjectContractor(contractorId) {
    createProjectContractor({
      variables: {
        projectId,
        contractorId
      }
    });
  }

  function _deleteProjectContractor(contractorId) {
    deleteProjectContractor({
      variables: {
        projectId,
        contractorId
      }
    });
  }
}

const PROJECT_CONTRACTORS = gql`
  query projectContractors($projectId: Int!) {
    project_contractor(where: { project_id: { _eq: $projectId } }) {
      project_id
      contractor_id
    }
  }
`;

const PROJECT_CONTRACTORS_CREATE = gql`
  mutation insertProjectContractor($projectId: Int!, $contractorId: Int!) {
    insert_project_contractor_one(
      object: { project_id: $projectId, contractor_id: $contractorId }
    ) {
      project_id
      contractor_id
    }
  }
`;

const PROJECT_CONTRACTORS_DELETE = gql`
  mutation deleteProjectContractor($projectId: Int!, $contractorId: Int!) {
    delete_project_contractor(
      where: { project_id: { _eq: $projectId }, contractor_id: { _eq: $contractorId } }
    ) {
      returning {
        project_id
        contractor_id
      }
    }
  }
`;
