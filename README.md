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
- The first part describes the role that the LLM will be taking. In this case, it's an expert healthcare AI assistant.
- The next part highlights the LLM's responsibilities, keeping the LLM on track to be a helpful healthcare assistant.
- The next part sets up some guidelines for the LLM response in order to give the response some structure. We also provide examples so there's basically some guardrails for the LLM.
- The next part involves the last 10 messages sent so there is some provided context to draw from.
- After that we provide the patient information from the API but filtered down to which patient we need. This may be tricky as the user may ask for a different patient after the initial ask but every chat message hits the api/discharges endpoint to get patient data.
- Then comes the user message itself.
- Lastly is the JSON response structure we want back from the LLM.


### Challenges and Trade-offs
// todo
- First challenge is finding a way to fit patient information into the prompt
There can be N number of patients in a real world setting and fitting that into one prompt would be insane. An imprefect solution that was implemented here is to filter out patient data based on the query/user message. Another idea that can be done is to send a prompt that interprets the query/user message and returns back a json response that can be used to filter/sort/query our patient data and then sends back the real prompt to be used to the LLM. Something possibly similar to reasoning in more powerful LLMs.
Another solution is for the user to select a subset of patients that they want to analyze from before talking to the LLM. That way we can narrow down the amount of patient data is being put into the prompt.

- Second challenge is when to show an insight card
There can be N number of patient data sent in and the query/user messages can be trying to analyze a group of patients that fit the criteria of what the user needs from their chat messages. The solution to this that was implemented is to group the insights by patient. It can be further improved by grouping by recommendation action in the instance that there are multiple high priority followups needed. 

- Third challenge is expanding the context to include recent messages
To make the AI assistant feel more natural and have an actual conversation, it would be a good idea to add the most recent messages back into the prompt so the LLM has context about the converstation. This runs into the same problem as the patient information as there is limited space in a prompt. What can be done here as patient data is larger, the recent messages can shrink. Right now, the last 10 messages are included in the prompt. That can be brought down to the last 3 messages in order to save tokens.

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

