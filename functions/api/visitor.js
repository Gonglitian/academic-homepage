// Current-visit location from Cloudflare's edge geolocation.
// No KV, D1, or third-party account: request.cf is present on every Pages request.
export function onRequestGet(context) {
  const cf = context.request.cf || {};
  const lat = Number(cf.latitude);
  const lon = Number(cf.longitude);
  const ok = Number.isFinite(lat) && Number.isFinite(lon);
  const body = {
    ok,
    city: typeof cf.city === "string" ? cf.city : "",
    region: typeof cf.region === "string" ? cf.region : "",
    country: typeof cf.country === "string" ? cf.country : "",
    lat: ok ? lat : null,
    lon: ok ? lon : null,
  };
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
