import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestContext } from "./helpers/testApp";
import * as aiService from "../services/aiService";

vi.mock("../services/aiService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/aiService")>();
  return { ...actual, translateText: vi.fn() };
});

describe("POST /api/translate", () => {
  beforeEach(() => vi.mocked(aiService.translateText).mockReset());

  it("traduit sans exposer de clé au client", async () => {
    vi.mocked(aiService.translateText).mockResolvedValue("Manao ahoana ianao?");
    const ctx = createTestContext({ geminiApiKey: "test-gemini-key" });
    const response = await ctx.app.request("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Comment ça va ?", source: "fr", target: "mg" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ translated: "Manao ahoana ianao?", detectedLang: "fr" });
    expect(aiService.translateText).toHaveBeenCalledWith("Comment ça va ?", "fr", "mg");
  });

  it("refuse un texte vide", async () => {
    const ctx = createTestContext({ geminiApiKey: "test-gemini-key" });
    const response = await ctx.app.request("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: " ", target: "mg" }),
    });

    expect(response.status).toBe(400);
  });

  it("signale une configuration Gemini manquante", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello", source: "en", target: "fr" }),
    });

    expect(response.status).toBe(503);
  });
});