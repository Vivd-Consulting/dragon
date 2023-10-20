import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';

import _ from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import cx from 'clsx';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { useInterval } from 'ahooks';

import { Row } from 'components/Group';
import { S3Image } from 'components/Image';
import { useAuth } from 'hooks/useAuth';

import TaskDescriptionModal from '../TaskDescriptionModal';

import startTimerMutation from './queries/startTimer.gql';
import startTimerWithInvoiceMutation from './queries/startTimerWithInvoice.gql';
import stopTimerMutation from './queries/stopTimer.gql';
import stopAllTimersMutation from './queries/stopAllTimers.gql';

import styles from './styles.module.sass';

dayjs.extend(utc);

// TODO: This is causing a lot of re-renders, refactor this component
export default function TimerButton({ project, isListViewChecked }) {
  const { dragonUser } = useAuth();
  const { id: userId } = dragonUser;

  const [timerId, setTimerId] = useState<number | null>(null);
  const [timeSinceStart, setTimeSinceStart] = useState(
    project.isActive ? diffSeconds(project.startTime) : 0
  );

  const formattedTime = dayjs.utc(timeSinceStart * 1000).format('HH:mm:ss');
  const projectTimesForInvoiceDetails = _.get(project, 'project_times[0].invoice');

  const [startTimer] = useMutation(startTimerMutation, {
    refetchQueries: ['projectTimes']
  });

  const [startTimerWithInvoice] = useMutation(startTimerWithInvoiceMutation, {
    refetchQueries: ['projectTimes']
  });

  const [stopTimer] = useMutation(stopTimerMutation, {
    refetchQueries: ['projectTimes']
  });
  const [stopAllTimers] = useMutation(stopAllTimersMutation, {
    refetchQueries: ['projectTimes']
  });

  useInterval(() => {
    if (project.isActive) {
      setTimeSinceStart(diffSeconds(project.startTime));
    }
  }, 1000);

  const toast = useRef<any>(null);

  if (isListViewChecked) {
    return (
      <>
        <Toast ref={toast} />

        <Row gap="5" align="center">
          <div style={{ width: '80px' }}>{project.isActive ? formattedTime : '0'}</div>
          <ActionButtons
            onProjectTimerStart={projectTimerStart}
            onProjectTimerStop={projectTimerStop}
            project={project}
          />
        </Row>
        <TaskDescriptionModal timerId={timerId} resetTimerId={() => setTimerId(null)} />
      </>
    );
  } else {
    return (
      <>
        <div
          key={project.id}
          className={cx(styles.bigButton, project.isActive && styles.isActive)}
          onClick={() =>
            project.isActive ? projectTimerStop(project) : projectTimerStart(project)
          }
        >
          <div className="flex flex-column align-items-center">
            <S3Image s3Key={project?.logo?.key} className="logo-img" />
            <span className="text-sm">{project.client.name}</span>
            {project.isActive && <p>{project.name}</p>}
            {project.isActive ? formattedTime : project.name}
          </div>
        </div>
        <TaskDescriptionModal timerId={timerId} resetTimerId={() => setTimerId(null)} />
      </>
    );
  }

  async function projectTimerStart(_project) {
    if (_project.isActive) {
      const newTimer = await stopTimer({
        variables: {
          timerId: _project.timerId,
          endTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });

      const _timerId = _.get(newTimer, 'data.update_project_time.returning[0].id') as number;

      setTimerId(_timerId);

      setTimeSinceStart(0);
    } else {
      const { data: stoppedTimers } = await stopAllTimers({
        variables: {
          userId,
          endTime: new Date()
        }
      });

      if (projectTimesForInvoiceDetails) {
        await startTimerWithInvoice({
          variables: {
            userId,
            invoiceId: projectTimesForInvoiceDetails.id,
            projectId: _project.id,
            startTime: new Date()
          },
          refetchQueries: ['userProjects', 'timers']
        });
      } else {
        await startTimer({
          variables: {
            userId,
            projectId: _project.id,
            startTime: new Date()
          },
          refetchQueries: ['userProjects', 'timers']
        });
      }

      setTimeSinceStart(0);

      const _stoppedTimers = stoppedTimers.update_project_time.returning;

      if (_stoppedTimers.length > 0) {
        setTimerId(_stoppedTimers[0].id);
      }
    }
  }

  async function projectTimerStop(_project) {
    if (_project.isActive) {
      const newTimer = await stopTimer({
        variables: {
          timerId: _project.timerId,
          endTime: new Date()
        },
        refetchQueries: ['userProjects', 'timers']
      });

      const _timerId = _.get(newTimer, 'data.update_project_time.returning[0].id') as number;

      setTimerId(_timerId);

      setTimeSinceStart(0);
    }
  }

  function ActionButtons({ onProjectTimerStart, onProjectTimerStop, project }) {
    return (
      <Row>
        {project.isActive ? (
          <Button
            size="small"
            tooltip="Stop"
            severity="danger"
            tooltipOptions={{ position: 'top' }}
            icon="pi pi-stop-circle"
            onClick={() => onProjectTimerStop(project)}
          />
        ) : (
          <Button
            size="small"
            icon="pi pi-play"
            tooltip="Start"
            tooltipOptions={{ position: 'top' }}
            onClick={() => onProjectTimerStart(project)}
          />
        )}
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
