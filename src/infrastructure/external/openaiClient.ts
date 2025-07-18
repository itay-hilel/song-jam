import { OpenAIAPIRequest, OpenAIAPIResponse } from '../../types';

export class OpenAIClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1';
    }

    async generateSongLine(prompt: string, model: string = 'text-davinci-003'): Promise<string> {
        const response = await fetch(`${this.baseUrl}/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                max_tokens: 60,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].text.trim();
    }

    async callAPI(request: OpenAIAPIRequest): Promise<OpenAIAPIResponse> {
        const response = await fetch(`${this.baseUrl}/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: request.prompt,
                max_tokens: request.maxTokens,
                temperature: request.temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        return await response.json();
    }
}