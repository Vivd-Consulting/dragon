import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import clientsQuery from '../queries/clients.gql';

import updateProjectMutation from './queries/updateProject.gql';
import createProjectMutation from './queries/createProject.gql';

// TODO: Add client Type
interface ProjectFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function ProjectForm({ initialData, isInitialDataLoading }: ProjectFormPageProps) {
  const { dragonUser } = useAuth();
  const { data, loading: isClientsLoading } = useQuery(clientsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true }
      }
    }
  });

  const [createProject] = useMutation(createProjectMutation, {
    refetchQueries: ['projects']
  });

  const [updateProject] = useMutation(updateProjectMutation, {
    refetchQueries: ['projects', 'project']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading || isClientsLoading) {
    return null;
  }

  const defaultValues = initialData
    ? initialData.project[0]
    : {
        name: '',
        github_repo_org: '',
        github_repo_name: '',
        client_id: '',
        description: '',
        gpt_persona: ''
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="project-form">
        {({ InputText, InputTextArea, InputDropdown }) => (
          <>
            <InputDropdown
              placeholder="Select client"
              label="Client"
              name="client_id"
              optionLabel="name"
              optionValue="id"
              options={data?.client}
              disabled={initialData}
              isRequired
            />
            <InputText label="Name" name="name" isRequired autoFocus />
            <InputText label="Github Repo Organization" name="github_repo_org" autoFocus />
            <InputText label="Github Repo Name" name="github_repo_name" autoFocus />
            <InputTextArea label="Description" name="description" />
            <InputTextArea label="GPT Persona" name="gpt_persona" />

            <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
          </>
        )}
      </Form>
    </>
  );

  async function onSubmit(data) {
    setLoading(true);

    try {
      if (initialData) {
        await updateProject({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      } else {
        await createProject({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      }

      // Show success toast
      toast?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Project Created!',
        life: 3000
      });

      router.push('/projects');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create project!',
        life: 3000
      });
    }

    setLoading(false);
  }
}
