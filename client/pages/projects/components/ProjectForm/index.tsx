import { useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import {
  Form,
  FormFooterButtons,
  InputText,
  InputTextArea,
  InputDropdown,
  UploadImageInput,
  UploadFileInput
} from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import clientsQuery from '../queries/clients.gql';

import updateProjectMutation from './queries/updateProject.gql';
import createProjectMutation from './queries/createProject.gql';

interface ProjectFormPageProps {
  defaultValues?: any;
}

export default function ProjectForm({ defaultValues }: ProjectFormPageProps) {
  const isEditing = !!defaultValues;

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

  const toast = useRef<any>(null);
  const router = useRouter();

  if (isClientsLoading) {
    return null;
  }

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="project-form">
        <UploadImageInput label="Logo" name="logo_id" />
        <InputDropdown
          placeholder="Select client"
          label="Client"
          name="client_id"
          optionLabel="name"
          optionValue="id"
          options={data?.client}
          disabled={isEditing}
          isRequired
        />
        <InputText label="Name" name="name" isRequired autoFocus />
        <InputText label="Github Repo Organization" name="github_repo_org" />
        <InputText label="Github Repo Name" name="github_repo_name" />
        <InputTextArea label="Description" name="description" />
        <InputTextArea label="GPT Persona" name="gpt_persona" />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </Form>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        const variables = {
          ...data,
          logo_id: data.logo_id || undefined,
          userId: dragonUser?.id
        };

        if (isEditing) {
          await updateProject({ variables });
        } else {
          await createProject({ variables });
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
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create project!',
          life: 3000
        });
      }

      resolve(true);
    });
  }
}
