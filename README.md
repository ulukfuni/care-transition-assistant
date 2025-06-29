# Care Transition Assistant

An LLM-powered healthcare application that provides AI-driven insights for care transitions, helping healthcare providers make informed decisions about patient discharge planning and follow-up care.

## 🩺 Overview

This application analyzes patient discharge summaries and generates actionable insights using OpenAI's GPT models. It features a chat-based interface where healthcare providers can ask questions about patient data and receive structured recommendations for care coordination, risk assessment, and follow-up planning.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- or Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd care-transition-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.



### Prompt Design explanation
// todo
### Challenges and Trade-offs
// todo

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Integration**: OpenAI GPT-4 API
- **Data**: Static JSON (mock patient data)

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # LLM integration endpoint
│   │   └── discharges/    # Patient data endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main application page
├── components/
│   ├── ChatInterface.tsx  # Main chat component
│   ├── ChatMessage.tsx    # Individual message display
│   ├── InsightCard.tsx    # AI insight display
│   ├── LoadingSpinner.tsx # Loading states
│   └── PatientSelector.tsx # Patient selection UI
├── data/
│   └── discharge-summaries.json # Mock patient data
├── hooks/
│   ├── useChat.ts         # Chat functionality
│   └── usePatients.ts     # Patient data management
├── types/
│   └── index.ts           # TypeScript definitions
└── utils/
    └── promptEngineering.ts # AI prompt templates
```



## 🔒 Security Considerations

### API Key Management

- Store OpenAI API keys securely using environment variables
- Never commit API keys to version control
- Use different keys for development and production

### Data Privacy

- Patient data is currently mock/synthetic
- Implement proper data encryption for real patient data
- Follow HIPAA compliance guidelines for healthcare applications
- Consider data anonymization for AI processing

### Rate Limiting

- Implement rate limiting for API endpoints
- Monitor OpenAI API usage and costs
- Set up alerts for unusual usage patterns


### Performance Optimization

- Implement response caching for repeated queries
- Add request debouncing for chat input
- Optimize bundle size with dynamic imports
- Consider implementing streaming responses

