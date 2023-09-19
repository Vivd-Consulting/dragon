import _ from 'lodash';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { dateFormat } from 'utils';
import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';
import { useAuth } from 'hooks/useAuth';

import userProjectsQuery from './queries/userProjects.gql';

import Duration from './components/Duration';

export default function Timer({ isListViewChecked }) {
  const query = 'Agents';

  const { dragonUser } = useAuth();
  const { id: userId } = dragonUser;

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(userProjectsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      userId,
      where: {
        _or: [
          { project: { name: { _ilike: `%${query}%` } } },
          { project: { github_repo_name: { _ilike: `%${query}%` } } },
          { project: { client: { name: { _ilike: `%${query}%` } } } }
        ]
      }
    }
  });

  const totalRecords = loading
    ? _.get(previousData, 'dragon_user[0].contractor.projects_aggregate.aggregate.count', 0)
    : _.get(data, 'dragon_user[0].contractor.projects_aggregate.aggregate.count', 0);

  const _data = loading ? previousData : data;
  const projects = _.get(_data, 'dragon_user[0].contractor.projects', []).map(({ project }) => {
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

  if (isListViewChecked) {
    return (
      <DataTable
        value={projects}
        paginator
        lazy
        onPage={onPage}
        first={paginationValues.first}
        rows={paginationValues.rows}
        onSort={onPage}
        sortField={paginationValues.sortField}
        sortOrder={paginationValues.sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No projects found."
        data-cy="projects-table"
      >
        <Column
          field="id"
          header="ID"
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          field="client.name"
          header="Client Name"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          field="name"
          header="Name"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ start_date }) => <span>{dateFormat(start_date)}</span>}
          sortable
          field="start_date"
          header="Start Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ end_date }) => <span>{dateFormat(end_date)}</span>}
          sortable
          field="end_date"
          header="End Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={project => <Duration isListViewChecked={isListViewChecked} project={project} />}
          header="Duration"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
      </DataTable>
    );
  } else {
    return (
      <Row wrap>
        {projects.map(project => (
          <Duration key={project.id} project={project} isListViewChecked={isListViewChecked} />
        ))}
      </Row>
    );
  }
}
