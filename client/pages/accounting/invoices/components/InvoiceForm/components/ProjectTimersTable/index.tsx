import _ from 'lodash';
import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';

import { dateFormat } from 'utils';

import calculateTotalTimeAndCost from 'utils/calculateTotalTimeAndCost';

import projectTimeQuery from './queries/projectTime.gql';

export default function ProjectTimersTable({ selectedClient, invoiceId, onSelectProjectTimeIds }) {
  const { data: projectTimesData, loading } = useQuery(projectTimeQuery, {
    variables: {
      invoiceId,
      clientId: selectedClient
    },
    skip: !selectedClient,
    fetchPolicy: 'network-only'
  });

  if (loading || !projectTimesData) {
    return <div>Loading...</div>;
  }

  return (
    <ProjectTreeTable
      projectTimesData={projectTimesData}
      onSelectProjectTimeIds={onSelectProjectTimeIds}
    />
  );
}

function ProjectTreeTable({ projectTimesData, onSelectProjectTimeIds }) {
  const projectTimes = _.get(projectTimesData, 'project', []).map((project, idx) => {
    const timers = project.project_times;
    const earliestEntry = _.first(timers)?.start_time;
    const latestEntry = _.last(timers)?.start_time;

    const { totalTime } = calculateTotalTimeAndCost(timers);

    const anyTimesWithoutInvoiceId = timers.some(timer => !timer.invoice_id);

    return {
      key: idx,
      checked: !anyTimesWithoutInvoiceId,
      partialChecked: anyTimesWithoutInvoiceId,
      data: {
        name: project.name,
        hours: totalTime,
        date_range: `${dateFormat(earliestEntry)} - ${dateFormat(latestEntry)}`
      },
      children: timers.map(timer => ({
        key: `${idx}-${timer.id}`,
        checked: !!timer.invoice_id,
        partialChecked: false,
        data: {
          id: timer.id,
          invoice_id: timer.invoice_id,
          end_time: dateFormat(timer.end_time),
          start_time: dateFormat(timer.start_time),
          description: _.truncate(timer.description, { length: 200 })
        }
      }))
    };
  });

  const _selectedNodeKeys = projectTimes.reduce(
    (accumulator, { key, checked, partialChecked, children }) => {
      accumulator[key] = {
        checked,
        partialChecked
      };

      children.forEach(child => {
        accumulator[child.key] = {
          checked: child.checked,
          partialChecked: child.partialChecked
        };
      });

      return accumulator;
    },
    {}
  );

  const [selectedNodeKeys, setSelectedNodeKeys] = useState(_selectedNodeKeys);

  return (
    <TreeTable
      scrollable
      value={projectTimes}
      scrollHeight="300px"
      style={{ marginBottom: '1rem' }}
      selectionMode="checkbox"
      selectionKeys={selectedNodeKeys}
      onSelectionChange={e => {
        setSelectedNodeKeys(e.value);
        const ids = grabProjectTimeIds(e.value);

        onSelectProjectTimeIds(ids);
      }}
    >
      <Column field="name" header="Time" expander style={{ width: '300px' }} />
      <Column field="invoice_id" header="Invoice ID" style={{ width: '250px' }} />
      <Column field="date_range" header="Date range" style={{ width: '250px' }} />
      <Column field="start_time" header="Start time" style={{ width: '250px' }} />
      <Column field="end_time" header="End time" style={{ width: '250px' }} />
      <Column field="hours" header="Hours" style={{ width: '250px' }} />
      <Column field="description" header="Description" style={{ width: '250px' }} />
    </TreeTable>
  );

  function grabProjectTimeIds(node) {
    const selectedProjectTimeKeys = Object.keys(node);

    const ids = projectTimes.flatMap(({ children }) => {
      const _ids = children
        .map(child => {
          if (selectedProjectTimeKeys.includes(child.key)) {
            return child.data.id;
          }
        })
        .filter(item => item !== undefined);

      return _ids;
    });

    return ids;
  }
}
