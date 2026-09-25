// Types partagés — Chat IA

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO date
  flagged?: boolean; // message signalé par la sécurité
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  language: "fr" | "mg";
  surveyContext?: string; // résumé du questionnaire injecté en contexte
  createdAt: string;
  updatedAt: string;
  retainHistory: boolean; // choix de l'utilisateur
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  language: "fr" | "mg";
}

export interface ChatResponse {
  message: ChatMessage;
  safetyAlert?: SafetyAlert;
}

export interface SafetyAlert {
  level: "info" | "warning" | "critical";
  message: string;
  resources: EmergencyResource[];
}

export interface EmergencyResource {
  name: string;
  phone?: string;
  description: string;
  available24h: boolean;
}
