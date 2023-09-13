import { useState } from 'react';
import { useMutation } from '@apollo/client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import cx from 'clsx';

import { Button } from 'primereact/button';

import { Row } from 'components/Group';

import { useInterval } from 'ahooks';

import { useAuth } from 'hooks/useAuth';

import startTimerMutation from './queries/startTimer.gql';
import stopTimerMutation from './queries/stopTimer.gql';
import stopAllTimersMutation from './queries/stopAllTimers.gql';

import styles from './styles.module.sass';

dayjs.extend(utc);

export default function Duration({ project, isListViewChecked }) {
  const { dragonUser } = useAuth();
  const { id: userId } = dragonUser;
  const [timeSinceStart, setTimeSinceStart] = useState(
    project.isActive ? diffSeconds(project.startTime) : 0
  );

  const formattedTime = dayjs.utc(timeSinceStart * 1000).format('HH:mm:ss');

  const [startTimer] = useMutation(startTimerMutation);
  const [stopTimer] = useMutation(stopTimerMutation);
  const [stopAllTimers] = useMutation(stopAllTimersMutation);

  useInterval(() => {
    if (project.isActive) {
      setTimeSinceStart(diffSeconds(project.startTime));
    }
  }, 1000);

  if (isListViewChecked) {
    return (
      <Row gap="5" align="center">
        <div style={{ width: '80px' }}>{project.isActive ? formattedTime : '0'}</div>
        <ActionButtons
          onProjectTimerStart={projectTimerStart}
          onProjectTimerStop={projectTimerStop}
          project={project}
        />
      </Row>
    );
  } else {
    return (
      <div
        key={project.id}
        className={cx(styles.bigButton, project.isActive && styles.isActive)}
        onClick={() => projectTimerStart(project)}
      >
        <div className="flex flex-column align-items-center">
          <span className="text-sm">{project.client.name}</span>
          {project.isActive && <p>{project.name}</p>}
          {project.isActive ? formattedTime : project.name}
        </div>
      </div>
    );
  }

  async function projectTimerStart(_project) {
    if (_project.isActive) {
      setTimeSinceStart(0);

      return stopTimer({
        variables: {
          timerId: _project.timerId,
          endTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });
    } else {
      setTimeSinceStart(0);

      await stopAllTimers({
        variables: {
          userId,
          endTime: new Date()
        }
      });

      await startTimer({
        variables: {
          userId,
          projectId: _project.id,
          startTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });
    }
  }

  async function projectTimerStop(_project) {
    if (_project.isActive) {
      setTimeSinceStart(0);

      return stopTimer({
        variables: {
          timerId: _project.timerId,
          endTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });
    }
  }

  function ActionButtons({ onProjectTimerStart, onProjectTimerStop, project }) {
    return (
      <Row>
        <Button
          size="small"
          icon="pi pi-play"
          tooltip="Start"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onProjectTimerStart(project)}
        />
        <Button
          size="small"
          tooltip="Stop"
          severity="danger"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-stop-circle"
          onClick={() => onProjectTimerStop(project)}
        />
      </Row>
    );
  }

  function nowUTC() {
    return dayjs.utc();
  }

  function dateUTC(date) {
    return dayjs.utc(date);
  }

  function diffSeconds(then) {
    return nowUTC().diff(dateUTC(then), 'seconds');
  }
}
