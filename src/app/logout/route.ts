import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Rota de logout: encerra a sessão do Supabase e redireciona para a landing.
 * Usada via <form action="/logout" method="POST">.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
