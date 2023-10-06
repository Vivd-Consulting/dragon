import _ from 'lodash';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import duration from 'dayjs/plugin/duration';

import { useQuery } from '@apollo/client';

import gql from 'graphql-tag';

import { getCurrentMonthRange } from 'utils';

import { useCurrentContractor } from './useContractors';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);

export function useContractorsMetric() {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();

  const { data, loading, error } = useQuery(CONTRACTORS_METRIC, {
    variables: {
      startOfMonth,
      endOfMonth
    }
  });

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { contractor } = data || {};

  const { billings, expenses } = calculateBillingsAndExpenses(contractor, startOfMonth, endOfMonth);

  return [billings, expenses];
}

const CONTRACTORS_METRIC = gql`
  query contractorsMetric($startOfMonth: timestamp!, $endOfMonth: timestamp!) {
    contractor(
      where: {
        projects: {
          project: {
            project_times: {
              _and: { start_time: { _gte: $startOfMonth }, end_time: { _lte: $endOfMonth } }
            }
          }
        }
      }
    ) {
      contractor_rate {
        rate
      }
      markup
      projects {
        project {
          project_times {
            start_time
            end_time
          }
        }
      }
    }
  }
`;

export function useContractorTimeSpent() {
  const [contractorId] = useCurrentContractor();

  const { data, loading, error } = useQuery(CONTRACTOR, {
    variables: {
      contractorId
    }
  });

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { contractor_by_pk } = data || {};

  const totalTimeSpent = calculateTotalTimeSpentForContractor(contractor_by_pk);

  return [totalTimeSpent];
}
const CONTRACTOR = gql`
  query contractor($contractorId: Int!) {
    contractor_by_pk(id: $contractorId) {
      projects {
        project {
          name
          project_times {
            start_time
            end_time
          }
        }
      }
    }
  }
`;

export function useTotalTimeConsumption() {
  const { data, loading, error } = useQuery(PROJECT_TIMES);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { project_time } = data || {};

  const { mostTimeConsumingClient, mostTimeConsumingProject } = findMostTimeConsuming(project_time);

  return [mostTimeConsumingClient, mostTimeConsumingProject];
}

const PROJECT_TIMES = gql`
  query projectTimes {
    project_time {
      start_time
      end_time
      new_time
      project {
        name
        client {
          name
        }
      }
    }
  }
`;

function calculateBillingsAndExpenses(data, startOfMonth, endOfMonth) {
  const { _billings, _expenses } = _.reduce(
    data,
    (result, item) => {
      _.forEach(item.projects, project => {
        _.forEach(project.project.project_times, projectTime => {
          const time = dayjs(projectTime.start_time);

          if (time.isSameOrAfter(startOfMonth) && time.isSameOrBefore(endOfMonth)) {
            const contractorRate = item.contractor_rate.rate;
            const markup = item.markup;
            const hoursWorked = dayjs(projectTime.end_time).diff(projectTime.start_time, 'hour');

            result._billings += hoursWorked * (contractorRate + markup);
            result._expenses += hoursWorked * contractorRate;
          }
        });
      });
      return result;
    },
    { _billings: 0, _expenses: 0 }
  );

  const billings = _billings.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const expenses = _expenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return { billings, expenses };
}

function calculateTotalTimeSpentForContractor(data) {
  const projectTimes = _.flatMap(data.projects, project =>
    _.map(project.project.project_times, projectTime => ({
      startTime: new Date(projectTime.start_time),
      endTime: new Date(projectTime.end_time)
    }))
  );

  const totalDuration = _.sumBy(
    projectTimes,
    projectTime => projectTime.endTime - projectTime.startTime
  );

  const totalSeconds = Math.floor(totalDuration / 1000);

  const formattedTotalTime = formatDuration(totalSeconds);

  return formattedTotalTime;
}

const calculateTotalDurations = (data, key) => {
  return _(data)
    .groupBy(key)
    .mapValues(projects =>
      _.sumBy(projects, project =>
        dayjs(project.end_time).diff(dayjs(project.start_time), 'second')
      )
    )
    .value();
};

const findMostTimeConsuming = data => {
  const clientDurations = calculateTotalDurations(data, 'project.client.name');
  const projectDurations = calculateTotalDurations(data, 'project.name');

  const mostTimeConsumingClient = _.maxBy(
    _.keys(clientDurations),
    client => clientDurations[client]
  );

  const mostTimeConsumingProject = _.maxBy(
    _.keys(projectDurations),
    project => projectDurations[project]
  );

  return {
    mostTimeConsumingClient: {
      clientName: mostTimeConsumingClient,
      duration: formatDuration(clientDurations[mostTimeConsumingClient])
    },
    mostTimeConsumingProject: {
      projectName: mostTimeConsumingProject,
      duration: formatDuration(projectDurations[mostTimeConsumingProject])
    }
  };
};

const formatDuration = seconds => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formatNumber = num => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`;
  } else if (minutes > 0) {
    return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`;
  } else {
    return `${formatNumber(remainingSeconds)}`;
  }
};
