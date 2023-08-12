import {
  LazyQueryHookOptions,
  LazyQueryResult,
  OperationVariables,
  TypedDocumentNode,
  useLazyQuery
} from '@apollo/client';
import { DocumentNode } from 'graphql';
import { useRouter } from 'next/router';
import { DataTablePageEvent } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import _ from 'lodash';

const LANGUAGE_CODES = ['en', 'fr', 'es'];

type PaginationOptions = {
  pageSize?: number;
  page?: number;
};

type SortingOptions = {
  sortField?: string;
  sortOrder?: number;
};

export type PaginatedQueryVariables = PaginationOptions & SortingOptions;

type Query<TData, TVariables> = DocumentNode | TypedDocumentNode<TData, TVariables>;

type Options<
  TData,
  TVariables extends OperationVariables = OperationVariables
> = LazyQueryHookOptions<TData, TVariables> & PaginatedQueryVariables;

type UsePaginatedQueryResult<TData, TVariables extends OperationVariables> = {
  query: LazyQueryResult<TData, TVariables>;
  onPage: (e: DataTablePageEvent) => void;
  paginationValues: DataTablePageEvent;
};

export function usePaginatedQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(
  query: Query<TData, TVariables>,
  options?: Options<TData, TVariables>
): UsePaginatedQueryResult<TData, TVariables> {
  // get pagination options from default values. If provided from url search params then override default values
  const router = useRouter();
  let { pageSize = 10, page = 0, sortField = '', sortOrder, variables, ...rest } = options || {};
  const { query: routerQuery } = router;

  const {
    page: pageFromUrl,
    pageSize: pageSizeFromUrl,
    sortField: sortFieldFromUrl,
    sortOrder: sortOrderFromUrl
  } = routerQuery;

  // check if pageFromUrl and pageSizeFromUrl are numbers
  if (pageFromUrl && !isNaN(Number(pageFromUrl))) {
    page = Number(pageFromUrl) - 1;
  }

  if (pageSizeFromUrl && !isNaN(Number(pageSizeFromUrl))) {
    pageSize = Number(pageSizeFromUrl);
  }

  if (sortFieldFromUrl) {
    sortField = sortFieldFromUrl as string;
  }

  if (sortOrderFromUrl) {
    sortOrder = Number(sortOrderFromUrl);
  }

  const initialOffset = page === 0 ? 0 : page * pageSize;

  const initialPaginationValues = {
    first: initialOffset,
    page,
    rows: pageSize,
    filters: {},
    sortField,
    sortOrder,
    multiSortMeta: [],
    pageCount: 0
  };

  const [paginationValues, setPaginationValues] =
    useState<DataTablePageEvent>(initialPaginationValues);

  const [fetchData, currentQuery] = useLazyQuery(query);

  useEffect(() => {
    const offset =
      !paginationValues.page || paginationValues.page === 0 ? 0 : paginationValues.page * pageSize;
    const limit = paginationValues.rows;

    const currentVariables = {
      ...variables,
      // ...{ where: { user_id: { _eq: 123 } } },
      offset,
      limit,
      order_by: parseSortField(paginationValues.sortField, paginationValues.sortOrder)
    };

    const queryOptions = { ...rest, variables: currentVariables as unknown as TVariables };

    fetchData(queryOptions);
  }, [paginationValues, JSON.stringify(variables)]);

  return {
    query: currentQuery,
    onPage,
    paginationValues
  };

  function onPage(e: DataTablePageEvent) {
    const { page, rows, sortField, sortOrder } = e;

    router.push({
      query: {
        ...routerQuery,
        // DataTable starts page from 0 but we want to show 1 in url
        page: page || page === 0 ? page + 1 : undefined,
        pageSize: rows,
        sortField,
        sortOrder
      }
    });
    setPaginationValues(e);
  }
}

const parseSortOrder = (sortOrder: number) => {
  switch (sortOrder) {
    case 1:
      return 'asc';
    case -1:
      return 'desc';
    default:
      return undefined;
  }
};

const parseSortField = (sortField: string, sortOrder: number) => {
  if (!sortField) {
    return undefined;
  }

  const sortFieldArray = sortField.split('.');
  const sortFieldArrayLength = sortFieldArray.length;

  if (sortFieldArrayLength === 1) {
    return { [sortField]: parseSortOrder(sortOrder) };
  }

  const lastSortField = sortFieldArray[sortFieldArrayLength - 1];
  const sortFieldBeforeLast = sortFieldArray[sortFieldArrayLength - 2];

  const sortFieldObject = {};

  if (!LANGUAGE_CODES.includes(lastSortField)) {
    _.set(sortFieldObject, sortField, parseSortOrder(sortOrder));
    return sortFieldObject;
  }

  const mergedSortField = sortFieldBeforeLast + '_' + lastSortField;
  const sortFieldsWithoutLastTwo = sortFieldArray.slice(0, sortFieldArrayLength - 2);
  const parsedToString =
    sortFieldsWithoutLastTwo.length === 0
      ? mergedSortField
      : `${sortFieldsWithoutLastTwo.join('.')}.${mergedSortField}`;

  _.set(sortFieldObject, parsedToString, parseSortOrder(sortOrder));
  return sortFieldObject;
};
