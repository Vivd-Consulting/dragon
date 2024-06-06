export function parseJwt(token: string) {
  if (!token) {
    return;
  }

  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');

  return JSON.parse(atob(base64));
}

export function hasAdminToken(token: string) {
  console.log({
    token,
    ACTION_SECRET: process.env.ACTION_SECRET
  });

  return token === process.env.ACTION_SECRET;
}
