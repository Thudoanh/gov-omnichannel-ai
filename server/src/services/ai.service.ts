export interface AIService {
  testAnswer(question: string, officialAnswer: string): Promise<{ answer: string; confidenceScore: number }>;
}

export class MockAIService implements AIService {
  async testAnswer(_question: string, officialAnswer: string) {
    return { answer: officialAnswer, confidenceScore: 98 };
  }
}

export const aiService: AIService = new MockAIService();
