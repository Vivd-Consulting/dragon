import { MultiSelect } from 'primereact/multiselect';

import { useContractors, useTaskContractors } from 'hooks/useTaskContractors';

export function AssignContractorTaskDropdown({ taskId }) {
  const [assignees] = useContractors();
  const [taskAssignees, createTaskAssignee, deleteTaskAssignee] = useTaskContractors(taskId);

  const selectedAssignees = taskAssignees.map(({ assignee_id }) => assignee_id);

  return (
    <MultiSelect
      filter
      display="chip"
      value={selectedAssignees}
      onChange={({ selectedOption }) => {
        // Check if selectedOption is a contractor object or an id, when deleting a tag it's an id
        const { id: assignee } =
          typeof selectedOption === 'object' ? selectedOption : { id: selectedOption };

        if (selectedAssignees.includes(assignee)) {
          deleteTaskAssignee(assignee);
        } else {
          createTaskAssignee(assignee);
        }
      }}
      placeholder="Assign contractor"
      options={assignees}
      optionLabel="name"
      optionValue="id"
    />
  );
}
