import { GetParameterCommand, PutParameterCommand, DeleteParameterCommand } from "@aws-sdk/client-ssm";

import { ssmClient } from "../aws.js";

export function getSecret({ path }) {
  const params = {
    Name: path,
    WithDecryption: true
  };

  const command = new GetParameterCommand(params);
  return ssmClient.send(command);
}

export function createSecret({ path, value }) {
  const params = {
    Name: path,
    Value: value,
    Type: "SecureString"
  };

  const command = new PutParameterCommand(params);
  return ssmClient.send(command);
}

export function deleteSecret({ path }) {
  const params = {
    Name: path
  };

  const command = new DeleteParameterCommand(params);
  return ssmClient.send(command);
}

export async function updateSecret({ path, value }) {
  await deleteSecret({ path });
  await createSecret({ path, value });
}
