/**
 *  An example function for a GET request.
 *  This route is accessible at /server-function/hello/hello-world
 */
export default async function helloWorld(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Process the data and return a response
  return new Response(
    JSON.stringify({
      message: "Hello, world!",
    }),
    { status: 200 }
  );
}
