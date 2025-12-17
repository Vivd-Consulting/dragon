'use client';

import { useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';

import { dateFormat } from '@/utils';
import calculateTotalTimeAndCost from '@/utils/calculateTotalTimeAndCost';
import { getProjects } from '@/app/actions/projects';
import { getProjectTimes } from '@/app/actions/time-tracker';

export default function ProjectTimersTable({ formHook, selectedClient }: any) {
  const [projectTimesData, setProjectTimesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClient) {
      setProjectTimesData(null);
      return;
    }

    async function loadProjectTimes() {
      setLoading(true);
      try {
        const projectsResult = await getProjects({
          client_id: selectedClient,
          archived_at: { _is_null: true },
        });

        if ('error' in projectsResult || !projectsResult.data) {
          return;
        }

        const projects = projectsResult.data;
        const projectsWithTimes = await Promise.all(
          projects.map(async (project: any) => {
            const timesResult = await getProjectTimes({
              project_id: project.id,
              invoice_id: { _is_null: true },
            });

            return {
              ...project,
              project_times: 'data' in timesResult ? timesResult.data || [] : [],
            };
          })
        );

        setProjectTimesData({ project: projectsWithTimes });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProjectTimes();
  }, [selectedClient]);

  if (loading || !projectTimesData) {
    return null;
  }

  return <ProjectTreeTable formHook={formHook} projectTimesData={projectTimesData} />;
}

function ProjectTreeTable({ formHook, projectTimesData }: any) {
  const invoiceId = formHook.getValues('id');

  const projectTimes = projectTimesData.project.map((project: any, idx: number) => {
    const timers = project.project_times || [];

    const { totalTime } = calculateTotalTimeAndCost(timers);

    const allTimesWithInvoiceId = timers.every((timer: any) => !!timer.invoice_id);
    const anyTimesWithInvoiceId = timers.some((timer: any) => !!timer.invoice_id);

    return {
      key: idx,
      checked: allTimesWithInvoiceId,
      partialChecked: anyTimesWithInvoiceId,
      data: {
        name: project.name,
        hours: totalTime,
      },
      children: timers.map((timer: any) => ({
        key: `${idx}-${timer.id}`,
        checked: !!timer.invoice_id,
        partialChecked: false,
        data: {
          id: timer.id,
          end_time: dateFormat(timer.end_time),
          start_time: dateFormat(timer.start_time),
          description: timer.description ? timer.description.substring(0, 200) : '',
        },
      })),
    };
  });

  const _selectedNodeKeys = projectTimes.reduce(
    (accumulator: any, { key, checked, partialChecked, children }: any) => {
      accumulator[key] = {
        checked,
        partialChecked,
      };

      children.forEach((child: any) => {
        accumulator[child.key] = {
          checked: child.checked,
          partialChecked: child.partialChecked,
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
      onSelectionChange={(e) => {
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

  function grabProjectTimeIds(node: any) {
    const selectedProjectTimeKeys = Object.keys(node);

    const ids = projectTimes.flatMap(({ children }: any) => {
      const _ids = children
        .map((child: any) => {
          if (selectedProjectTimeKeys.includes(child.key)) {
            return child.data.id;
          }
        })
        .filter((item: any) => item !== undefined);

      return _ids;
    });

    return ids;
  }

  function onSelectProjectTimeIds(ids: number[]) {
    formHook.setValue(
      'project_times',
      ids.map((id) => ({ id, invoice_id: invoiceId }))
    );
  }
}

