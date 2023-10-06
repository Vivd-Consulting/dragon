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

export function useMostTimeConsumingClient() {
  const { data, loading, error } = useQuery(TC_CLIENTS);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { client } = data || {};

  const mostTimeConsumedClient = _.maxBy(client, client => calculateTotalTime(client));

  const formattedTotalTime = dayjs
    .duration(mostTimeConsumedClient ? calculateTotalTime(mostTimeConsumedClient) : 0)
    .format('HH:mm:ss');

  return [formattedTotalTime, mostTimeConsumedClient.name];
}

const TC_CLIENTS = gql`
  query timeConsumingClients {
    client(where: { archived_at: { _is_null: true } }) {
      name
      projects {
        project_times {
          new_time
          start_time
          end_time
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

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
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

  const formattedTotalTime = formatDuration(totalDuration);

  return formattedTotalTime;
}

function calculateTotalTime(client) {
  const totalTime = _.sumBy(client.projects, project =>
    _.sumBy(project.project_times, projectTime => {
      if (projectTime.new_time !== null) {
        return projectTime.new_time;
      } else {
        const startTime = dayjs(projectTime.start_time);
        const endTime = dayjs(projectTime.end_time);

        return endTime.diff(startTime);
      }
    })
  );

  return totalTime;
}
