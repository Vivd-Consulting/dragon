import { useState } from 'react';
import { useMutation } from '@apollo/client';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';

import { useAuth } from 'hooks/useAuth';

import { dateFormat } from 'utils';

import { Column, Row } from 'components/Group';

import { TASK_PRIORITY } from '../..';

import taskViewedByUserMutation from './queries/taskViewedByUser.gql';

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
        <Row style={{ width: '100%' }} justify="between" align="center">
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
        <Column>
          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Assignee</h4>
            <Row>
              {data?.task_assignees?.map(({ contractor }) => (
                <Badge severity="warning" key={contractor?.name} value={contractor?.name} />
              ))}
            </Row>
          </Row>

          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Due date</h4>
            <Row>{dateFormat(data?.due_date)}</Row>
          </Row>

          {data?.started_at && (
            <Row align="center" gap="5">
              <h4 style={{ minWidth: '100px' }}>Started</h4>
              <Row>{dateFormat(data?.started_at)}</Row>
            </Row>
          )}

          {data?.completed_at && (
            <Row align="center" gap="5">
              <h4 style={{ minWidth: '100px' }}>Completed</h4>
              <Row>{dateFormat(data?.completed_at)}</Row>
            </Row>
          )}

          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Project</h4>
            <Row>{data?.project?.name}</Row>
          </Row>

          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Priority</h4>
            <Badge value={taskPriority?.name} severity={taskPriority?.severity} />
          </Row>

          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Status</h4>
            <Badge value={data?.status} />
          </Row>

          <Row align="center" gap="5">
            <h4 style={{ minWidth: '100px' }}>Approved</h4>
            {data?.is_approved ? (
              <i className="pi pi-check text-green-500" />
            ) : (
              <i className="pi pi-times text-red-500" />
            )}
          </Row>

          <Column gap="0">
            <h4>Description</h4>
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
