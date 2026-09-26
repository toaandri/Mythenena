import { NextRequest, NextResponse } from "next/server";

const AZURE_KEY      = process.env.AZURE_TRANSLATOR_KEY ?? "";
const AZURE_REGION   = process.env.AZURE_TRANSLATOR_REGION ?? "eastus";
const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";

export async function POST(req: NextRequest) {
  if (!AZURE_KEY) {
    return NextResponse.json({ error: "Clé Azure non configurée." }, { status: 500 });
  }

  const { text, source, target } = await req.json();

  if (!text?.trim() || !target) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const url = `${AZURE_ENDPOINT}&to=${target}${source && source !== "auto" ? `&from=${source}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key":    AZURE_KEY,
      "Ocp-Apim-Subscription-Region": AZURE_REGION,
      "Content-Type":                 "application/json",
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = await response.json();
  const translated   = data[0]?.translations?.[0]?.text ?? "";
  const detectedLang = data[0]?.detectedLanguage?.language ?? source ?? "";

  return NextResponse.json({ translated, detectedLang });
}
