import axios from 'axios';

export class SonoClient {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    public async generateSong(data: any): Promise<any> {
        try {
            const response = await axios.post(`${this.apiUrl}/generate`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Sono API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}