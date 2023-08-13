import cx from 'clsx';

import { GenericProps } from '../index';

import styles from './style.module.sass';

interface GroupProps extends GenericProps {
  direction?: 'row' | 'column';
  gap?: '0' | '1' | '2' | '3' | '4' | '5';
  fullWidth?: boolean;
  align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline' | 'flex-start' | 'flex-end';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
}

function Group({
  children,
  className,
  direction = 'row',
  gap = '2',
  fullWidth,
  fullHeight,
  align,
  justify = 'start',
  wrap,
  'data-cy': dataCy,
  ...rest
}: GroupProps) {
  const klass = cx(
    'flex',
    direction === 'column' ? 'flex-column' : 'flex-row',
    `gap-${gap}`,
    justify && `justify-content-${justify}`,
    align && `align-items-${align}`,
    fullWidth && styles['full-width'],
    fullHeight && styles['full-height'],
    wrap && 'flex-wrap',
    className
  );

  return (
    <div data-cy={dataCy} {...rest} className={klass}>
      {children}
    </div>
  );
}

export function Row({
  children,
  className,
  gap,
  align,
  wrap,
  'data-cy': dataCy,
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  ...rest
}: GroupProps) {
  const klass = cx(
    className,
    p && `p-${p}`,
    px && `px-${px}`,
    py && `py-${py}`,
    pt && `pt-${pt}`,
    pb && `pb-${pb}`,
    pl && `pl-${pl}`,
    pr && `pr-${pr}`,
    m && `m-${m}`,
    mx && `mx-${mx}`,
    my && `my-${my}`,
    mt && `mt-${mt}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mr && `mr-${mr}`
  );

  return (
    <Group
      direction="row"
      gap={gap}
      align={align}
      wrap={wrap}
      data-cy={dataCy}
      className={klass}
      {...rest}
    >
      {children}
    </Group>
  );
}

export function Column({
  children,
  className,
  gap,
  align,
  'data-cy': dataCy,
  ...rest
}: GroupProps) {
  return (
    <Group
      className={className}
      direction="column"
      gap={gap}
      align={align}
      data-cy={dataCy}
      {...rest}
    >
      {children}
    </Group>
  );
}

type verticalPadProps = {
  pad: number | undefined;
  className?: string;
  'data-cy'?: string;
};

export function VerticalPad({ pad = 1, className, 'data-cy': dataCy }: verticalPadProps) {
  return <div className={cx(styles[`vertical-pad-${pad}`], className)} data-cy={dataCy} />;
}
