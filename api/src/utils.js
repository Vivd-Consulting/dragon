export function hasAdminOverride(headers) {
  if (!process.env.HASURA_GRAPHQL_ADMIN_SECRET || !process.env.ACTION_SECRET) {
    console.error("Missing admin secret or action secret");

    return false;
  }

  return (
    headers['x-hasura-admin-secret'] ===
      process.env.HASURA_GRAPHQL_ADMIN_SECRET ||
    headers['action-secret'] === process.env.ACTION_SECRET
  );
}

export function getAuthToken(headers) {
  const hasBearer = headers.authorization.startsWith('Bearer ');
  const authorization = hasBearer
    ? headers.authorization.split('Bearer ')[1]
    : headers.authorization;

  return authorization;
}

export function generatePassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const passwordLength = 12;

  let password = '';

  for (let i = 0; i <= passwordLength; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }

  return password;
}
