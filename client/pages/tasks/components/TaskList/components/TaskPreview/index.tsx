import { useState } from 'react';
import { useMutation } from '@apollo/client';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';

import { useAuth } from 'hooks/useAuth';

import { dateFormat } from 'utils';

import { TASK_PRIORITY } from 'consts';

import { Column, Row } from 'components/Group';

import taskViewedByUserMutation from './queries/taskViewedByUser.gql';

import styles from './styles.module.sass';

export default function TaskPreview({ data, toastRef }) {
  const { dragonUser } = useAuth();

  const [visible, setVisible] = useState(false);

  const [taskViewedByUser] = useMutation(taskViewedByUserMutation, {
    refetchQueries: ['tasks']
  });

  const taskPriority = TASK_PRIORITY.find(x => x.id === data?.priority);

  return (
    <>
      <Button
        size="small"
        icon="pi pi-eye"
        tooltip="View"
        tooltipOptions={{ position: 'top' }}
        onClick={() => _taskViewedByUser(data)}
      />
      <Sidebar
        style={{ minWidth: '500px' }}
        visible={visible}
        position="right"
        onHide={() => setVisible(false)}
      >
        <Row className="w-full" justify="between" align="center">
          <h2>{data?.title}</h2>
          {/* Leaving them here just in case if we need action buttons */}
          <Row>
            <button className="p-sidebar-icon p-link mr-2">
              <span className="pi pi-print" />
            </button>
            <button className="p-sidebar-icon p-link mr-2">
              <span className="pi pi-search" />
            </button>
          </Row>
        </Row>
        <Column gap="3">
          <Row align="center" gap="5">
            <span className={styles.header}>Assignee</span>
            <Row>
              {data?.task_assignees?.map(({ contractor }) => (
                <Badge severity="warning" key={contractor?.name} value={contractor?.name} />
              ))}
            </Row>
          </Row>

          <Row align="center" gap="5">
            <span className={styles.header}>Due date</span>
            <Row>{dateFormat(data?.due_date)}</Row>
          </Row>

          {data?.started_at && (
            <Row align="center" gap="5">
              <span className={styles.header}>Started</span>
              <Row>{dateFormat(data?.started_at)}</Row>
            </Row>
          )}

          {data?.completed_at && (
            <Row align="center" gap="5">
              <span className={styles.header}>Completed</span>
              <Row>{dateFormat(data?.completed_at)}</Row>
            </Row>
          )}

          <Row align="center" gap="5">
            <span className={styles.header}>Project</span>
            <Row>{data?.project?.name}</Row>
          </Row>

          <Row align="center" gap="5">
            <span className={styles.header}>Priority</span>
            <Badge value={taskPriority?.name} severity={taskPriority?.severity} />
          </Row>

          <Row align="center" gap="5">
            <span className={styles.header}>Status</span>
            <Badge value={data?.status} />
          </Row>

          <Row align="center" gap="5">
            <span className={styles.header}>Approved</span>
            {data?.is_approved ? (
              <i className="pi pi-check text-green-500" />
            ) : (
              <i className="pi pi-times text-red-500" />
            )}
          </Row>

          <Column gap="0">
            <span className={styles.header}>Description</span>
            <p>{data?.description}</p>
          </Column>
        </Column>
      </Sidebar>
    </>
  );

  async function _taskViewedByUser(data) {
    setVisible(true);

    try {
      await taskViewedByUser({
        variables: {
          taskId: data?.id,
          userId: dragonUser?.id
        }
      });
    } catch {
      // Show error toast
      toastRef?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to view task!',
        life: 3000
      });
    }
  }
}
