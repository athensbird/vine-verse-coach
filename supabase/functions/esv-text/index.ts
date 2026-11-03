// Supabase Edge Function: esv-text
// Returns ESV text for a passage so Vine's Galatians tab can show each verse.
// Deploy:  supabase functions deploy esv-text
// Uses the same ESV_API_KEY secret as esv-audio.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) return Response.json({ error: "missing ?ref=" }, { status: 400, headers: cors });
  const key = Deno.env.get("ESV_API_KEY");
  if (!key) return Response.json({ error: "ESV_API_KEY secret is not set" }, { status: 500, headers: cors });

  const url = new URL("https://api.esv.org/v3/passage/text/");
  url.search = new URLSearchParams({
    q: ref,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-first-verse-numbers": "true",
    "include-footnotes": "false",
    "include-headings": "false",
    "include-short-copyright": "true",
    "include-passage-horizontal-lines": "false",
    "include-heading-horizontal-lines": "false",
    "indent-paragraphs": "0",
    "indent-poetry": "false",
  }).toString();

  const r = await fetch(url, { headers: { Authorization: `Token ${key}` } });
  const j = await r.json();
  return Response.json({ canonical: j.canonical, passages: j.passages }, { status: r.status, headers: cors });
});
