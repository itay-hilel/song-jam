import { LLMStrategy, LLMGenerationOptions } from './llmStrategy';
import { Context } from '../../types';

export class MockLLMStrategy implements LLMStrategy {
  private mockResponses = [
    "In the moonlight we dance tonight",
    "Dreams are calling from far away", 
    "Together we can find our way",
    "Music flows through every heart",
    "Stars are shining just for us",
    "Love will guide us through the dark",
    "When the morning comes alive",
    "We'll remember this moment",
    "Hearts beating in perfect time",
    "Nothing else matters now",
    "Whispers in the gentle breeze",
    "Time stands still when you're here",
    "Colors paint the evening sky",
    "Every step feels like a dream"
  ];

  private themeResponses = {
    love: ["Your love lights up my world", "Together we're unstoppable", "In your eyes I see forever"],
    sadness: ["Tears fall like morning rain", "Empty rooms echo memories", "Silence speaks louder than words"],
    hope: ["Tomorrow brings new light", "Rising from the ashes strong", "Every ending starts again"],
    adventure: ["Roads lead to unknown places", "Chasing dreams across the horizon", "Adventure calls our names"]
  };

  async generateSongLine(context: Context, prompt: string, options?: LLMGenerationOptions): Promise<string> {
    // Simulate API delay
    await this.simulateDelay(300, 800);
    
    let response = this.selectResponse(prompt, options?.theme);
    
    // Apply style modifications if provided
    if (options?.style) {
      response = this.applyStyleModifications(response, options.style);
    }
    
    // Add variation based on prompt keywords
    response = this.applyPromptVariations(response, prompt);
    
    return response;
  }

  async enhanceLine(context: Context, line: string, options?: LLMGenerationOptions): Promise<string> {
    await this.simulateDelay(200, 500);
    
    if (options?.style) {
      return this.enhanceWithStyle(line, options.style);
    }
    
    return this.enhanceGeneric(line);
  }

  async generateVerse(context: Context, theme: string, existingLines: string[], options?: LLMGenerationOptions): Promise<string[]> {
    await this.simulateDelay(800, 1500);
    
    const verseLength = 4;
    const verse: string[] = [];
    
    for (let i = 0; i < verseLength; i++) {
      const line = await this.generateSongLine(context, `Continue the verse about ${theme}`, { ...options, theme });
      verse.push(line);
    }
    
    return verse;
  }

  private selectResponse(prompt: string, theme?: string): string {
    // Try to use theme-specific responses first
    if (theme && this.themeResponses[theme.toLowerCase() as keyof typeof this.themeResponses]) {
      const themeResponses = this.themeResponses[theme.toLowerCase() as keyof typeof this.themeResponses];
      return themeResponses[Math.floor(Math.random() * themeResponses.length)];
    }
    
    // Fall back to general responses
    return this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
  }

  private applyStyleModifications(response: string, style: string): string {
    switch (style.toLowerCase()) {
      case 'rock':
        return response.replace(/gentle/g, 'powerful').replace(/whisper/g, 'shout');
      case 'jazz':
        return `${response} (with smooth rhythm)`;
      case 'folk':
        return response.replace(/world/g, 'simple life');
      case 'pop':
        return `${response} (catchy and bright)`;
      default:
        return `${response} (in ${style} style)`;
    }
  }

  private applyPromptVariations(response: string, prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('love') || lowerPrompt.includes('heart')) {
      return response.replace(/we/g, 'lovers').replace(/us/g, 'our hearts');
    } else if (lowerPrompt.includes('sad') || lowerPrompt.includes('cry')) {
      return response.replace(/dance/g, 'cry').replace(/shining/g, 'fading').replace(/bright/g, 'dim');
    } else if (lowerPrompt.includes('hope') || lowerPrompt.includes('future')) {
      return response.replace(/tonight/g, 'tomorrow').replace(/now/g, 'soon');
    }
    
    return response;
  }

  private enhanceWithStyle(line: string, style: string): string {
    return `${line} (enhanced with ${style} vibes)`;
  }

  private enhanceGeneric(line: string): string {
    const enhancements = [
      "with deeper emotion",
      "with richer melody",
      "with stronger rhythm",
      "with better flow",
      "with more passion"
    ];
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return `${line} (${enhancement})`;
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
