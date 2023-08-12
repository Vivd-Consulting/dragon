import NodeCache from "node-cache";

import knex from "../db.js";
import { generatePassword } from "../utils.js";
import { sendEmail } from "../aws.js";
import { userInviteEmail, userResetEmail } from "../email.js";

const roleIdMap = {
  admin: process.env.ADMIN_ROLE_ID,
  contractor: process.env.CONTRACTOR_ROLE_ID,
  client: process.env.CLIENT_ROLE_ID
};

const cache = new NodeCache({
  stdTTL: 8600,
  checkperiod: 600,
});

export function isAdmin(context) {
  return context.role === "admin";
}

export async function getProfileInfo(user_id) {
  const token = await getManagementToken();

  const request = await fetch(
    `${process.env.AUTH0_URI}/api/v2/users/${user_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await request.json();
}

export async function getRole(user_id) {
  const token = await getManagementToken();

  const request = await fetch(
    `${process.env.AUTH0_URI}/api/v2/users/${user_id}/roles`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const roles = await request.json();

  return roles[0].name;
}

export async function getUsers() {
  const token = await getManagementToken();

  const request = await fetch(`${process.env.AUTH0_URI}/api/v2/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await request.json();
}

export async function createUser({ email, name, password, role, user_metadata }) {
  const token = await getManagementToken();

  const userRequest = await fetch(`${process.env.AUTH0_URI}/api/v2/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      user_metadata,
      connection: "Username-Password-Authentication",
      password,
      email_verified: false,
    }),
  });

  if (userRequest.status > 299) {
    const error = await userRequest.json();

    throw new Error(error.message);
  }

  const user = await userRequest.json();

  const roleRequest = await fetch(
    `${process.env.AUTH0_URI}/api/v2/users/${user.user_id}/roles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roles: [roleIdMap[role]],
      }),
    }
  );

  if (roleRequest.status > 299) {
    const error = await roleRequest.json();

    throw new Error(error.message);
  }

  const dbUser = await knex("dragon_user")
    .insert({
      id: user.user_id,
      name: user.name,
      email: user.email
    })
    .returning("id");

  return { id: dbUser[0].id, ...user };
}

export async function inviteUser({ email, name, role }) {
  const password = generatePassword();

  const { user_id } = await createUser({ email, name, role, password });

  const resetTicket = await getPasswordResetTicket(user_id);

  await sendEmail({
    to: email,
    subject: "Welcome to the Dragon Dash",
    html: userInviteEmail(resetTicket)
  });

  return user_id;
}

export async function resetUserPassword(user_id) {
  const { email } = await getProfileInfo(user_id);
  const resetTicket = await getPasswordResetTicket(user_id);

  await sendEmail({
    to: email,
    subject: "Please Reset your Dragon Dash Password",
    html: userResetEmail(resetTicket)
  });

  return true;
}

export async function deleteUser(user_id) {
  const token = await getManagementToken();

  const request = await fetch(
    `${process.env.AUTH0_URI}/api/v2/users/${user_id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (request.status > 299) {
    throw new Error("Failed to delete user");
  }

  const user = await knex("dragon_user")
    .select('email')
    .where("id", user_id)
    .first();

  await knex("dragon_user")
    .update({
      email: `${user.email}_deleted`,
      deleted_at: new Date(),
    })
    .where("id", user_id);

  return true;
}

async function getPasswordResetTicket(user_id) {
  const token = await getManagementToken();

  const requestBody = {
    user_id: user_id,
    mark_email_as_verified: true,
    includeEmailInRedirect: true,
    client_id: process.env.AUTH0_CLIENT
  }

  const request = await fetch(
    `${process.env.AUTH0_URI}/api/v2/tickets/password-change`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (request.status > 299) {
    const error = await request.json();

    throw new Error(error.message);
  }

  const { ticket } = await request.json();

  return ticket;
}

async function getManagementToken() {
  const token = cache.get("managementToken");

  if (!token) {
    const t = await getFreshManagementToken();
    cache.set("managementToken", t.access_token, t.expires_in);
    return t.access_token;
  }

  return token;
}

async function getFreshManagementToken() {
  const response = await fetch(`${process.env.AUTH0_URI}/oauth/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `${process.env.AUTH0_URI}/api/v2/`,
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  const data = await response.json();

  return data;
}
