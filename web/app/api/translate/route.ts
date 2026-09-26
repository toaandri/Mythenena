import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({ error: "Réponse de traduction invalide." }));
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Le serveur de traduction est inaccessible." }, { status: 503 });
  }

}
