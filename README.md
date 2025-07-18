# Song Jam

## Overview
Song Jam is a real-time, collaborative music creation platform that allows users to transform spontaneous creative inputs into cohesive songs through AI-powered assistance and group collaboration. The platform is designed to democratize music creation, enabling anyone to contribute to songwriting regardless of their musical experience.

## Features
- **Real-time Collaboration**: Users can join jam sessions and collaborate in real-time using voice or text inputs.
- **AI-Powered Song Generation**: The platform utilizes advanced language models to process inputs and generate song components.
- **Collaborative Canvas**: A shared workspace where participants can see and modify the evolving song structure.
- **Session Recording & Export**: Automatic recording of sessions with options to export the final song in various formats.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL (for production setup)
- OpenAI API key (for LLM integration)
- Sono API key (for song generation)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd song-jam
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.template` to `.env` and fill in the required values.

### Running the Application
- For development:
  ```
  npm run dev
  ```

- For production:
  ```
  npm start
  ```

## Directory Structure
```
song-jam/
├── src/
│   ├── domain/
│   ├── application/
│   ├── strategy/
│   ├── infrastructure/
│   ├── ports/
│   ├── preset/
│   ├── entrypoint/
│   └── client/
├── package.json
├── tsconfig.json
├── .env.template
└── README.md
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.