# Care Transition Assistant

An LLM-powered healthcare application that provides AI-driven insights for care transitions, helping healthcare providers make informed decisions about patient discharge planning and follow-up care.

## 🩺 Overview

This application analyzes patient discharge summaries and generates actionable insights using OpenAI's GPT models. It features a chat-based interface where healthcare providers can ask questions about patient data and receive structured recommendations for care coordination, risk assessment, and follow-up planning.

### Key Features

- **AI-Powered Analysis**: Uses OpenAI GPT-4 to analyze patient discharge summaries
- **Interactive Chat Interface**: Natural language queries about patient care
- **Dynamic Insight Cards**: Structured recommendations with priority levels and timeframes
- **Patient Selection**: Filter and select specific patients for analysis
- **Risk Assessment**: Automatic categorization of patients by risk level
- **Real-time Insights**: Immediate feedback on care transition needs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

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

## 📋 Usage

### Basic Workflow

1. **Patient Selection**: Use the sidebar to select patients for analysis
2. **Ask Questions**: Type natural language questions about patient care
3. **Review Insights**: Examine AI-generated insight cards with recommendations
4. **Take Action**: Use the provided recommendations for care planning

### Example Queries

- "Analyze all patients for readmission risk"
- "Which patients need immediate follow-up?"
- "Review medication compliance risks"
- "Identify care coordination opportunities"
- "Show patients with complex discharge needs"

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

## 🤖 Prompt Engineering

### System Prompt Design

The application uses carefully crafted prompts to ensure high-quality, clinically relevant insights:

#### Core Responsibilities

- **Risk Assessment**: Identify high-risk patients requiring immediate attention
- **Follow-up Planning**: Suggest appropriate care coordination and timing
- **Medication Review**: Flag potential drug interactions and compliance issues
- **Care Coordination**: Recommend multidisciplinary team involvement

#### Role-Based Prompts

The system supports different healthcare roles with specialized focus areas:

- **Physician**: Clinical decision-making, medication management, specialist referrals
- **Nurse**: Patient education, symptom monitoring, discharge planning
- **Case Manager**: Care coordination, resource allocation, social services

#### Output Structure

All AI responses follow a structured JSON format:

```json
{
  "insights": [
    {
      "type": "risk_alert | follow_up | medication | care_coordination | general",
      "title": "Brief descriptive title",
      "patient": "Patient name or 'Multiple patients'",
      "priority": "high | medium | low",
      "recommendation": "Specific actionable recommendation",
      "reasoning": "Clinical reasoning behind the recommendation",
      "confidence": "high | medium | low",
      "timeframe": "immediate | within_24h | within_week | routine"
    }
  ],
  "summary": "Brief overall summary of key findings"
}
```

### Prompt Optimization Strategies

1. **Context Awareness**: Include relevant patient data and medical history
2. **Specificity**: Request actionable, time-bound recommendations
3. **Clinical Reasoning**: Require explanations for all suggestions
4. **Risk Stratification**: Prioritize insights by urgency and impact
5. **Validation**: Ensure responses follow structured format

## 📊 Data Model

### Patient Discharge Summary

```typescript
interface DischargeSummary {
  id: number;
  patient: string;
  age: number;
  mrn: string;
  admission_date: string;
  discharge_date: string;
  diagnosis: string;
  secondary_diagnoses: string[];
  medications: string[];
  follow_up: string;
  lab_results: Record<string, string>;
  notes: string;
  risk_factors: string[];
  discharge_disposition: string;
}
```

### Insight Card Structure

```typescript
interface InsightCard {
  type:
    | "risk_alert"
    | "follow_up"
    | "medication"
    | "care_coordination"
    | "general";
  title: string;
  patient: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  timeframe: "immediate" | "within_24h" | "within_week" | "routine";
}
```

## 🔧 API Endpoints

### GET /api/discharges

Retrieve patient discharge summaries with optional filtering.

**Query Parameters:**

- `patientId`: Filter by specific patient ID
- `diagnosis`: Filter by diagnosis keyword
- `riskLevel`: Filter by risk level (high/medium/low)

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of discharge summaries */
  ],
  "total": 6,
  "timestamp": "2024-06-26T10:00:00.000Z"
}
```

### POST /api/chat

Send a message to the AI assistant for analysis.

**Request Body:**

```json
{
  "message": "Analyze all patients for readmission risk",
  "patientIds": [1, 2, 3],
  "context": "Optional additional context"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "insights": [
      /* array of insight cards */
    ],
    "summary": "Overall analysis summary"
  },
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 800,
    "total_tokens": 2300
  },
  "timestamp": "2024-06-26T10:00:00.000Z"
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing Checklist

1. **Patient Data Loading**

   - [ ] Verify all 6 patients load correctly
   - [ ] Check risk level calculations
   - [ ] Test patient selection functionality

2. **Chat Interface**

   - [ ] Send basic queries and verify responses
   - [ ] Test suggested questions
   - [ ] Verify loading states and error handling

3. **AI Integration**

   - [ ] Test with valid OpenAI API key
   - [ ] Verify insight card generation
   - [ ] Check response formatting and validation

4. **Error Handling**
   - [ ] Test with invalid API key
   - [ ] Test network failures
   - [ ] Verify user-friendly error messages

### Sample Test Queries

```javascript
// Test queries for manual verification
const testQueries = [
  "Analyze all patients for readmission risk",
  "Which patients need immediate follow-up?",
  "Review John Doe's medication list for potential issues",
  "Identify patients suitable for home health services",
  "Show me the highest risk patients",
];
```

## 🚀 Deployment

### Environment Variables

Ensure these environment variables are set in production:

```bash
OPENAI_API_KEY=your_production_openai_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Vercel Deployment

1. **Connect Repository**

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**

   - Add `OPENAI_API_KEY` in Vercel dashboard
   - Configure any additional production settings

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
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

## 🛠️ Development

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

### Adding New Features

1. **New Insight Types**: Add to `InsightCard` type definition
2. **Additional Prompts**: Extend `promptEngineering.ts`
3. **New Components**: Follow existing component patterns
4. **API Extensions**: Add new endpoints in `app/api/`

### Performance Optimization

- Implement response caching for repeated queries
- Add request debouncing for chat input
- Optimize bundle size with dynamic imports
- Consider implementing streaming responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Follow existing code style and patterns

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Next.js team for the excellent framework
- Healthcare professionals who provided domain expertise
- Open source community for inspiration and tools

## 📞 Support

For questions, issues, or contributions:

- Create an issue on GitHub
- Review existing documentation
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**OpenAI API Errors**

- Verify API key is correctly set in `.env.local`
- Check API key permissions and quota
- Ensure network connectivity

**Build Errors**

- Clear node_modules and reinstall dependencies
- Check TypeScript errors with `npm run type-check`
- Verify all imports are correct

**Runtime Errors**

- Check browser console for detailed error messages
- Verify environment variables are loaded
- Test API endpoints independently

### Performance Issues

- Monitor OpenAI API response times
- Check network requests in browser dev tools
- Consider implementing request caching
- Optimize component re-renders

---

Built with ❤️ for better healthcare transitions
