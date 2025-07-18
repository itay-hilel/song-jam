import { LLMStrategy, LLMGenerationOptions, LLMPromptTemplate } from './llmStrategy';
import { Context } from '../../types';
import { OpenAIClient } from '../../infrastructure/external/openaiClient';

interface OpenAIStrategyConfig {
  defaultMaxTokens?: number;
  defaultTemperature?: number;
  promptTemplates?: {
    songLine: LLMPromptTemplate;
    enhancement: LLMPromptTemplate;
    verse: LLMPromptTemplate;
  };
}

export class OpenAIStrategy implements LLMStrategy {
  private openaiClient: OpenAIClient;
  private config: Required<OpenAIStrategyConfig>;

  constructor(openaiClient: OpenAIClient, config: OpenAIStrategyConfig = {}) {
    this.openaiClient = openaiClient;
    this.config = {
      defaultMaxTokens: config.defaultMaxTokens || 60,
      defaultTemperature: config.defaultTemperature || 0.7,
      promptTemplates: config.promptTemplates || this.getDefaultPromptTemplates(),
    };
  }

  async generateSongLine(context: Context, prompt: string, options?: LLMGenerationOptions): Promise<string> {
    try {
      const fullPrompt = this.formatSongLinePrompt(prompt, options);
      const response = await this.openaiClient.callAPI({
        prompt: fullPrompt,
        maxTokens: options?.maxTokens || this.config.defaultMaxTokens,
        temperature: options?.temperature || this.config.defaultTemperature,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response generated from OpenAI');
      }

      return this.cleanResponse(response.choices[0].text);
    } catch (error) {
      console.error('OpenAI song line generation failed:', error);
      throw new Error(`Failed to generate song line: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enhanceLine(context: Context, line: string, options?: LLMGenerationOptions): Promise<string> {
    try {
      const fullPrompt = this.formatEnhancementPrompt(line, options);
      const response = await this.openaiClient.callAPI({
        prompt: fullPrompt,
        maxTokens: options?.maxTokens || this.config.defaultMaxTokens,
        temperature: options?.temperature || this.config.defaultTemperature,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response generated from OpenAI');
      }

      return this.cleanResponse(response.choices[0].text);
    } catch (error) {
      console.error('OpenAI line enhancement failed:', error);
      throw new Error(`Failed to enhance line: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateVerse(context: Context, theme: string, existingLines: string[], options?: LLMGenerationOptions): Promise<string[]> {
    try {
      const fullPrompt = this.formatVersePrompt(theme, existingLines, options);
      const response = await this.openaiClient.callAPI({
        prompt: fullPrompt,
        maxTokens: (options?.maxTokens || this.config.defaultMaxTokens) * 4, // More tokens for multiple lines
        temperature: options?.temperature || this.config.defaultTemperature,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response generated from OpenAI');
      }

      const verseText = this.cleanResponse(response.choices[0].text);
      return this.parseVerseLines(verseText);
    } catch (error) {
      console.error('OpenAI verse generation failed:', error);
      throw new Error(`Failed to generate verse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatSongLinePrompt(prompt: string, options?: LLMGenerationOptions): string {
    const template = this.config.promptTemplates.songLine;
    let userPrompt = template.user.replace('{prompt}', prompt);
    
    if (options?.theme) {
      userPrompt = userPrompt.replace('{theme}', options.theme);
    } else {
      userPrompt = userPrompt.replace('with theme: {theme}', '');
    }

    if (options?.style) {
      userPrompt = userPrompt.replace('{style}', options.style);
    } else {
      userPrompt = userPrompt.replace('in {style} style', '');
    }

    return `${template.system}\n\n${userPrompt}`;
  }

  private formatEnhancementPrompt(line: string, options?: LLMGenerationOptions): string {
    const template = this.config.promptTemplates.enhancement;
    let userPrompt = template.user.replace('{line}', line);
    
    if (options?.style) {
      userPrompt = userPrompt.replace('{style}', options.style);
    } else {
      userPrompt = userPrompt.replace('in {style} style', '');
    }

    return `${template.system}\n\n${userPrompt}`;
  }

  private formatVersePrompt(theme: string, existingLines: string[], options?: LLMGenerationOptions): string {
    const template = this.config.promptTemplates.verse;
    let userPrompt = template.user
      .replace('{theme}', theme)
      .replace('{existingLines}', existingLines.join('\n'));
    
    if (options?.style) {
      userPrompt = userPrompt.replace('{style}', options.style);
    } else {
      userPrompt = userPrompt.replace('in {style} style', '');
    }

    return `${template.system}\n\n${userPrompt}`;
  }

  private cleanResponse(text: string): string {
    return text.trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  }

  private parseVerseLines(verseText: string): string[] {
    return verseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*/)) // Remove numbered lines
      .slice(0, 4); // Limit to 4 lines
  }

  private getDefaultPromptTemplates(): Required<OpenAIStrategyConfig>['promptTemplates'] {
    return {
      songLine: {
        system: "You are a creative songwriter. Generate a single, meaningful song line that flows well and captures emotion. Keep it concise and poetic.",
        user: "Create a song line based on: {prompt} with theme: {theme} in {style} style"
      },
      enhancement: {
        system: "You are a song editor. Improve the given line while maintaining its core meaning. Make it more poetic, emotional, or rhythmic.",
        user: "Enhance this song line: '{line}' in {style} style"
      },
      verse: {
        system: "You are a songwriter creating verses. Generate 4 lines that work together as a cohesive verse, with good rhythm and emotional flow.",
        user: "Create a 4-line verse about: {theme} in {style} style. Consider these existing lines for context:\n{existingLines}"
      }
    };
  }
}