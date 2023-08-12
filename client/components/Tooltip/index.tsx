import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primereact/tooltip';

import styles from './styles.module.sass';

type TooltipIconProps = {
  tutorialKey?: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default function TooltipIcon({ tutorialKey, onClick, children }: TooltipIconProps) {
  if (onClick) {
    return (
      <FontAwesomeIcon
        icon={faQuestionCircle}
        className={styles.tutorialQuestion}
        onClick={onClick}
      />
    );
  }

  return (
    <>
      <Tooltip target={`#${tutorialKey}-tutorial`} position="top">
        {children}
      </Tooltip>
      <FontAwesomeIcon
        icon={faQuestionCircle}
        id={`${tutorialKey}-tutorial`}
        className={styles.tutorialQuestion}
      />
    </>
  );
}
