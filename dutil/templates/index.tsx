import { Button } from 'primereact/button';

import Page from 'components/Page';
import { Row } from 'components/Group';
import { H2 } from 'components/Text';
import { InputTextDebounced } from 'components/Form';

import { Role } from 'types/roles';

import { useSearch } from 'hooks/useLocationSearch';

import {{FUPPER}}List from './components/{{FUPPER}}List';

import { Create{{FUPPER}}Modal } from './components/{{FUPPER}}Form';

const {{FUPPER}}s = () => {
  const [search, pushSearch] = useSearch();

  return (
    <>
      <H2>{{FUPPER}}s</H2>
      <Page>
        <Row justify="between" align="center" className="mb-3">
          <InputTextDebounced
            icon="pi-search"
            value={search}
            onChange={pushSearch}
            placeholder="Search..."
            className="w-20rem"
          />

          <Create{{FUPPER}}Modal
            trigger={<Button label="Add {{FUPPER}}" type="button" icon="pi pi-plus" />}
          />
        </Row>

        <{{FUPPER}}List />
      </Page>
    </>
  );
};

{{FUPPER}}s.roles = [Role.Admin];

export default {{FUPPER}}s;
