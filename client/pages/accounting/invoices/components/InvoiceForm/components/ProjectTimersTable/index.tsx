import _ from 'lodash';
import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';

import { dateFormat } from 'utils';

import calculateTotalTimeAndCost from 'utils/calculateTotalTimeAndCost';

import projectTimeQuery from './queries/projectTime.gql';

export default function ProjectTimersTable({ formHook, selectedClient }) {
  const { data: projectTimesData, loading } = useQuery(projectTimeQuery, {
    variables: {
      clientId: selectedClient
    },
    skip: !selectedClient,
    fetchPolicy: 'network-only'
  });

  if (loading || !projectTimesData) {
    return null;
  }

  return <ProjectTreeTable formHook={formHook} projectTimesData={projectTimesData} />;
}

function ProjectTreeTable({ formHook, projectTimesData }) {
  const invoiceId = formHook.getValues('id');

  const projectTimes = _.get(projectTimesData, 'project', []).map((project, idx) => {
    const timers = project.project_times;

    const { totalTime } = calculateTotalTimeAndCost(timers);

    const allTimesWithInvoiceId = timers.every(timer => !!timer.invoice_id);
    const anyTimesWithInvoiceId = timers.some(timer => !!timer.invoice_id);

    return {
      key: idx,
      checked: allTimesWithInvoiceId,
      partialChecked: anyTimesWithInvoiceId,
      data: {
        name: project.name,
        hours: totalTime
      },
      children: timers.map(timer => ({
        key: `${idx}-${timer.id}`,
        checked: !!timer.invoice_id,
        partialChecked: false,
        data: {
          id: timer.id,
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

  function onSelectProjectTimeIds(ids) {
    formHook.setValue(
      'project_times',
      ids.map(id => ({ id: id, invoice_id: invoiceId }))
    );
  }
}
