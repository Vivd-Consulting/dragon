import { MultiSelect } from 'primereact/multiselect';

import { useContractors, useProjectContractors } from 'hooks/useContractors';

export function AssignContractorProjectDropdown({ projectId }) {
  const [contractors] = useContractors();
  const [projectContractors, createProjectContractor, deleteProjectContractor] =
    useProjectContractors(projectId);

  const selectedContractors = projectContractors.map(({ contractor_id }) => contractor_id);

  return (
    <MultiSelect
      filter
      display="chip"
      value={selectedContractors}
      onChange={({ selectedOption }) => {
        // Check if selectedOption is a contractor object or an id, when deleting a tag it's an id
        const { id: contractor } =
          typeof selectedOption === 'object' ? selectedOption : { id: selectedOption };

        if (selectedContractors.includes(contractor)) {
          deleteProjectContractor(contractor);
        } else {
          createProjectContractor(contractor);
        }
      }}
      placeholder="Assign contractor"
      options={contractors}
      optionLabel="name"
      optionValue="id"
    />
  );
}
