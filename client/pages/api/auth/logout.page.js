export default function handler(req, res) {
  const returnTo = encodeURI([process.env.NEXTAUTH_URL]);

  res.redirect(
    `${process.env.AUTH0_URI}/v2/logout?federated&returnTo=${encodeURIComponent(
      returnTo
    )}&client_id=${process.env.AUTH0_CLIENT}`
  );
}
