// Client API web — appels vers le backend Mythenena
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// TODO: intercepteur pour injecter le token de session dans Authorization header
