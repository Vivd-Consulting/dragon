// A collection of buildable HTML templates

export function userInviteEmail(ticket) {
  return base(`
    <p>You've been invited to join the Dragon Dash!</p>
    <span>Click here to accept your invite: <a href="${ticket}">${ticket}</a></span>
  `);
}

export function userResetEmail(ticket) {
  return base(`
    <p>You've been asked to reset your password for the Dragon Dash!</p>
    <span>Click here to reset it: <a href="${ticket}">${ticket}</a></span>
  `);
}
