import { MultiSelect } from 'primereact/multiselect';

import { useContractors, useTaskContractors } from 'hooks/useTaskContractors';

export function AssignContractorTaskDropdown({ taskId }) {
  const [asignees] = useContractors();
  const [taskAsignees, createTaskAsignee, deleteTaskAsignee] = useTaskContractors(taskId);

  const selectedAsignees = taskAsignees.map(({ asignee_id }) => asignee_id);

  return (
    <MultiSelect
      filter
      display="chip"
      value={selectedAsignees}
      onChange={({ selectedOption }) => {
        // Check if selectedOption is a contractor object or an id, when deleting a tag it's an id
        const { id: asignee } =
          typeof selectedOption === 'object' ? selectedOption : { id: selectedOption };

        if (selectedAsignees.includes(asignee)) {
          deleteTaskAsignee(asignee);
        } else {
          createTaskAsignee(asignee);
        }
      }}
      placeholder="Assign contractor"
      options={asignees}
      optionLabel="name"
      optionValue="id"
    />
  );
}
