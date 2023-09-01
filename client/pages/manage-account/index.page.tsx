import _ from 'lodash';
import { useQuery } from '@apollo/client';
import { Card } from 'primereact/card';

import { useAuth } from 'hooks/useAuth';

import dragonUserQuery from './queries/dragonUser.gql';

export default function ManageAccount() {
  const { dragonUser } = useAuth();

  const { data } = useQuery(dragonUserQuery, {
    variables: {
      id: dragonUser?.id
    },
    skip: !dragonUser
  });

  const userData = _.get(data, 'dragon_user[0]');

  if (!userData) {
    return null;
  }

  return (
    <Card title="Manage Account" subTitle="Manage your account subscription">
      <p>Looking to cancel your subscription?</p>
      <p>
        Contact us at <a href="mailto:lkuich@vivd.ca">lkuich@vivd.ca</a>
      </p>
    </Card>
  );
}
