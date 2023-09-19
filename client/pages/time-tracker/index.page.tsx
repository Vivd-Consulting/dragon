import _ from 'lodash';
import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { Card } from 'primereact/card';
import { ToggleButton } from 'primereact/togglebutton';

import { Column, Row } from 'components/Group';

import { useAuth } from 'hooks/useAuth';

import TimeTrackerList from './components/TimeTrackerList';
import Timer from './components/Timer';

import userProjectsQuery from './queries/userProjects.gql';

export default function TimeTrackerPage() {
  const [isListViewChecked, setIsListViewChecked] = useState(false);
  // Get all projects associated to this user
  const { dragonUser } = useAuth();
  const { id: userId } = dragonUser;


  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Time Tracker</h2>
            <ToggleButton
              checked={isListViewChecked}
              onChange={e => setIsListViewChecked(e.value)}
              onLabel="Card View"
              offLabel="List View"
              onIcon="pi pi-th-large"
              offIcon="pi pi-list"
            />
          </Row>
        }
      >
        <Timer isListViewChecked={isListViewChecked} />
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
