export default async function handler(request, response) {
  const body = request.body;

  console.log(body);

  response.json({ body });
}
