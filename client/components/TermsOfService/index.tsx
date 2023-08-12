import { ScrollTop } from 'primereact/scrolltop';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Button } from 'primereact/button';

import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';

import { useAuth } from 'hooks/useAuth';

import styles from './styles.module.sass';

export default function TermsOfService() {
  const { dragonUser } = useAuth();

  const [acceptTos] = useMutation(gql`
    mutation acceptTos($userId: String!) {
      update_dragon_user(_set: { accepted_tos: true }, where: { id: { _eq: $userId } }) {
        returning {
          accepted_tos
        }
      }
    }
  `);

  return (
    <div className={styles['panel']}>
      <ScrollPanel className={styles['scroll-panel']}>
        <h3>Vivd Inc. Platform Privacy Policy</h3>

        <p>Effective Date: May 24, 2022</p>

        <ScrollTop
          target="parent"
          threshold={100}
          className="custom-scrolltop"
          icon="pi pi-arrow-up"
        />
      </ScrollPanel>

      <Button
        label="Accept & Continue"
        onClick={async () => {
          await acceptTos({
            variables: {
              userId: dragonUser.id
            }
          });

          location.reload();
        }}
      />
    </div>
  );
}
