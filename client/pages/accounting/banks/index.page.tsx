import PlaidLink from 'components/PlaidLink';

import BankList from './components/BankList';

export default function Banks() {
  // const { open, exit, ready } = usePlaidLink(config);

  return (
    <>
      <PlaidLink onSuccessCallback={onLink} />

      <BankList />
    </>
  );

  function onLink(data) {
    // eslint-disable-next-line no-console
    console.log(data);
  }
}
