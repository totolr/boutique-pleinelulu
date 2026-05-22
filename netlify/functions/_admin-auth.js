/*
 * _admin-auth : authentification partagée des endpoints admin. Un appel est
 * autorisé si le JWT Supabase (magic link) est valide (supabase.auth.getUser)
 * ET si l'email est présent dans la whitelist ADMIN_EMAILS (variable serveur).
 *
 * Usage :
 *   const auth = await authenticate(event, supabaseAdmin);
 *   if (auth.error) return json(auth.error.status, { error: auth.error.message });
 *   const user = auth.user;
 */

export function parseAllowedEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function authenticate(event, supabaseAdmin) {
  const allowed = parseAllowedEmails();
  if (allowed.length === 0) {
    return { error: { status: 500, message: "ADMIN_EMAILS non configuré côté serveur" } };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return { error: { status: 401, message: "Token manquant" } };
  }

  // Supabase valide la signature du JWT et l'expiration
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return { error: { status: 401, message: "Session invalide ou expirée" } };
  }

  const email = (data.user.email || "").toLowerCase();
  if (!allowed.includes(email)) {
    console.warn("[admin] tentative refusée pour:", email);
    return { error: { status: 403, message: "Cet email n'est pas autorisé" } };
  }

  return { user: data.user };
}
