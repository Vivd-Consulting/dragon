export default function handler(req, res) {
  const uri = process.env.NEXTAUTH_URL || '';

  res.redirect(
    `${process.env.AUTH0_URI}/v2/logout?federated&returnTo=${encodeURIComponent(uri)}&client_id=${
      process.env.AUTH0_CLIENT
    }`
  );
}
