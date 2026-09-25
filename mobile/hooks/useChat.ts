// Hook — gestion du chat avec l'IA
// TODO: envoyer message, recevoir réponse, gérer SafetyAlert

export function useChat(sessionId: string | null) {
  // TODO:
  // - messages: ChatMessage[]
  // - sendMessage(text: string): appel POST /api/chat/message
  // - isLoading: boolean
  // - safetyAlert: SafetyAlert | null
  return { messages: [], sendMessage: async (_: string) => {}, isLoading: false, safetyAlert: null };
}
