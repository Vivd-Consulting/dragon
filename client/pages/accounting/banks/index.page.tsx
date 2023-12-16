import { Card } from 'primereact/card';

import { Row, Column } from 'components/Group';
import { PlaidLink } from 'components/PlaidLink';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import BankList from './components/BankList';

import banksQuery from './queries/banks.gql';

export default function Banks() {
  const bankQuery = usePaginatedQuery(banksQuery, {
    fetchPolicy: 'no-cache'
  });
  const {
    query: { refetch }
  } = bankQuery;

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Imported Banks</h2>

            <div>
              <PlaidLink onSuccess={onSuccessLink} onFail={onFailLink} />
            </div>
          </Row>
        }
      >
        <BankList paginatedQuery={bankQuery} />
      </Card>
    </Column>
  );

  function onSuccessLink() {
    refetch();

    // toast.current.show({
    //   severity: 'success',
    //   summary: 'Success',
    //   detail: 'Bank is successfully linked!',
    //   life: 3000
    // });
  }

  function onFailLink() {
    // toast.current.show({
    //   severity: 'error',
    //   summary: 'Error',
    //   detail: 'Bank failed to link!',
    //   life: 3000
    // });
  }
}
