import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export function useProjectsQuery() {
  const { data, loading, error } = useQuery(PROJECTS);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { project } = data || {};

  return [project, loading];
}

const PROJECTS = gql`
  query projects {
    project(where: { archived_at: { _is_null: true } }) {
      id
      name
    }
  }
`;
