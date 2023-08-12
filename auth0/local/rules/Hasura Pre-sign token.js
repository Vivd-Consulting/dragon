function (user, context, callback) {
  const namespace = "https://hasura.io/jwt/claims";
  const [assignedRole] = (context.authorization || {}).roles;
  
  const metadata = user.user_metadata || {};
  
  context.idToken[namespace] = 
    { 
    	'x-hasura-role': assignedRole,
      'x-hasura-default-role': assignedRole,
      'x-hasura-allowed-roles': ['admin', 'client', 'contractor'],
      'x-hasura-user-id': user.user_id,
    	'x-hasura-client-id': metadata.client_id,
    	'x-hasura-contractor-id': metadata.contractor_id
    };
  
  callback(null, user, context);
}