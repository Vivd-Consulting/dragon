import React from 'react';

export interface NoChildrenGenericProps {
  className?: string;
  'data-cy'?: string;
  [rest: string]: any;
}

export interface GenericProps extends NoChildrenGenericProps {
  children: React.ReactNode;
}
