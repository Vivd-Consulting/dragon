import { Knock } from "@knocklabs/node";

const knock = new Knock(process.env.KNOCK_API_KEY);

export async function triggerWorkflow(data) {
  const workflow = await knock.workflows.trigger('new-transaction-alert', {
    recipients: ['vivd-admin'],
    data,
    cancellationKey: 'cancel_transaction_alert',
    tenant: 'vivd-admin'
  });

  return workflow;
}
