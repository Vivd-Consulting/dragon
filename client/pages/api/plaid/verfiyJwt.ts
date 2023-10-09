import jwt from 'jsonwebtoken';
import jwks from 'jwks-rsa';

export async function verifyJwt(request) {
  const token = request.headers.authorization.replace('Bearer ', '');

  const jwksClient = jwks({
    jwksUri: `${process.env.AUTH0_URI}/.well-known/jwks.json`
  });

  function getKey(header, callback) {
    jwksClient.getSigningKey(header.kid, function (err, key) {
      const signingKey = key?.getPublicKey();

      callback(null, signingKey);
    });
  }

  const decoded: any = await new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        issuer: `${process.env.AUTH0_URI}/`,
        audience: process.env.AUTH0_AUD
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });

  return decoded;
}
