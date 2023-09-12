import _ from 'lodash';
import { useQuery } from '@apollo/client';
import { Card } from 'primereact/card';

import { Column, Row } from 'components/Group';

import { useAuth } from 'hooks/useAuth';

import TimeTrackerList from './components/TimeTrackerList';
import { TimerCard } from './components/TimerCard';

import userProjectsQuery from './queries/userProjects.gql';

export default function TimeTrackerPage() {
  // Get all projects associated to this user
  const { dragonUser } = useAuth();
  const { id: userId } = dragonUser;

  const { data } = useQuery(userProjectsQuery, {
    variables: {
      userId
    },
    fetchPolicy: 'network-only'
  });

  const projects = _.get(data, 'dragon_user[0].contractor.projects', []).map(({ project }) => {
    const timers = project.project_times;

    if (timers?.length > 0) {
      const activeTimer = timers.find(timer => !timer.end_time);

      if (activeTimer) {
        return {
          ...project,
          isActive: true,
          timerId: activeTimer.id,
          startTime: activeTimer.start_time
        };
      }
    }

    return {
      ...project,
      isActive: false
    };
  });

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Time Tracker</h2>
            {/* <Button
              onClick={() => ...}
              label="Switch View"
              type="button"
              icon="pi pi-plus"
              raised
            /> */}
          </Row>
        }
      >
        <Row wrap>
          {projects.map(project => (
            <TimerCard key={project.id} project={project} />
          ))}
        </Row>
      </Card>

      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">History</h2>
          </Row>
        }
      >
        <TimeTrackerList />
      </Card>
    </Column>
  );
}
