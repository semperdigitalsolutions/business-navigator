// supabase/functions/hello-world/index.ts

Deno.serve(async (_req) => {
  return new Response(
    JSON.stringify({ message: 'Hello, World!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
