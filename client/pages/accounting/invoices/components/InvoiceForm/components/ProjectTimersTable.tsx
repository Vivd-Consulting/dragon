import _ from 'lodash';

import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';

import { dateFormat } from 'utils';

import calculateTotalTimeAndCost from 'utils/calculateTotalTimeAndCost';

import projectTimesQuery from './queries/projectTimes.gql';

export default function ProjectTimersTable({ selectedClient, onSelectProjectTimeIds }) {
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);

  const { data: projectTimesData } = useQuery(projectTimesQuery, {
    variables: {
      clientId: selectedClient
    },
    skip: !selectedClient,
    fetchPolicy: 'network-only'
  });

  const projectTimes = _.get(projectTimesData, 'project', []).map((project, idx) => {
    const timers = project.project_times;
    const earliestEntry = timers[0].start_time;
    const latestEntry = timers[timers.length - 1].start_time;

    const { totalTime } = calculateTotalTimeAndCost(timers);

    const treeNode = {
      key: idx,
      data: {
        name: project.name,
        hours: totalTime,
        date_range: `${dateFormat(earliestEntry)} - ${dateFormat(latestEntry)}`
      },
      children: timers.map(timer => ({
        key: `0-0-${timer.id}`,
        data: {
          id: timer.id,
          end_time: dateFormat(timer.end_time),
          start_time: dateFormat(timer.start_time),
          description: _.truncate(timer.description, { length: 200 })
        }
      }))
    };

    return treeNode;
  });

  return (
    <TreeTable
      scrollable
      value={projectTimes}
      scrollHeight="300px"
      style={{ marginBottom: '1rem' }}
      selectionMode="checkbox"
      selectionKeys={selectedNodeKeys}
      onSelectionChange={e => {
        //@ts-ignore
        setSelectedNodeKeys(e.value);
        const ids = grabProjectTimeIds(e.value);

        onSelectProjectTimeIds(ids);
      }}
    >
      <Column field="name" header="Untracked Time" expander style={{ width: '300px' }} />
      <Column field="date_range" header="Date range" style={{ width: '250px' }} />
      <Column field="start_time" header="Start time" style={{ width: '250px' }} />
      <Column field="end_time" header="End time" style={{ width: '250px' }} />
      <Column field="hours" header="Hours" style={{ width: '250px' }} />
      <Column field="description" header="Description" style={{ width: '250px' }} />
    </TreeTable>
  );

  function grabProjectTimeIds(node) {
    const selectedProjectTimeKeys = Object.keys(node);

    const ids = projectTimes
      .map(({ children }) => {
        const _ids = children
          .map(child => {
            if (selectedProjectTimeKeys.includes(child.key)) {
              return child.data.id;
            }
          })
          .filter(item => item !== undefined);

        return _ids;
      })
      .flat();

    return ids;
  }
}
