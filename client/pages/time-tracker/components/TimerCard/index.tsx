import { useState } from 'react';
import { useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import cx from 'clsx';
import utc from 'dayjs/plugin/utc';
import { useInterval } from 'ahooks';

import { useAuth } from 'hooks/useAuth';

import startTimerMutation from './queries/startTimer.gql';
import stopTimerMutation from './queries/stopTimer.gql';
import stopAllTimersMutation from './queries/stopAllTimers.gql';

import styles from './styles.module.sass';

dayjs.extend(utc);

export function TimerCard({ project }) {
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

  return (
    <div
      key={project.id}
      className={cx(styles.bigButton, project.isActive && styles.isActive)}
      onClick={() => projectClick(project)}
    >
      <div className="flex flex-column align-items-center">
        <span className="text-sm">{project.client.name}</span>
        {project.isActive && <p>{project.name}</p>}
        {project.isActive ? formattedTime : project.name}
      </div>
    </div>
  );

  async function projectClick(project) {
    if (project.isActive) {
      setTimeSinceStart(0);

      return stopTimer({
        variables: {
          timerId: project.timerId,
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
          projectId: project.id,
          startTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });
    }
  }
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
