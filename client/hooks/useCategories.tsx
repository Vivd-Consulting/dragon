import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export function useCategories() {
  const { data, loading, error } = useQuery(CATEGORIES);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { accounting_category } = data || [];

  return [accounting_category, getBy];

  function getBy(query) {
    return accounting_category.find(item => {
      // Check if all key-value pairs in the query object match the current item
      return Object.keys(query).every(key => {
        return item[key] === query[key];
      });
    });
  }
}

const CATEGORIES = gql`
  query categories {
    accounting_category {
      id
      gic
      name
      transaction_type
    }
  }
`;
