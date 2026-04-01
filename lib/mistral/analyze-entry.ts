import { Mistral } from '@mistralai/mistralai'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export interface EmotionalAnalysis {
  sentiment_score: number        // -1.0 to 1.0
  emotion_intensity: number      // 0.0 to 1.0
  emotion_labels: string[]       // ['stress', 'anxiety', ...]
  triggers: string[]             // ['work', 'relationships', ...]
  extracted_entities: {
    people: string[]
    places: string[]
    events: string[]
  }
}

const SYSTEM_PROMPT = `You are an emotional pattern analysis system. 
Analyze journal entries and return ONLY valid JSON. No explanation, no markdown.

Return this exact structure:
{
  "sentiment_score": <float -1.0 to 1.0>,
  "emotion_intensity": <float 0.0 to 1.0>,
  "emotion_labels": ["<label>", ...],
  "triggers": ["<trigger>", ...],
  "extracted_entities": {
    "people": ["<name>", ...],
    "places": ["<place>", ...],
    "events": ["<event>", ...]
  }
}

Rules:
- sentiment_score: -1 = very negative, 0 = neutral, 1 = very positive
- emotion_intensity: 0 = low intensity, 1 = very high intensity
- emotion_labels: pick from: [joy, calm, stress, anxiety, anger, sadness, overwhelmed, 
  frustrated, excited, content, lonely, tired, motivated]
- triggers: what caused the emotion? e.g. work, meetings, deadlines, family, finances, 
  health, social, food, sleep, traffic, weather
- extracted_entities: actual proper nouns mentioned
`

export async function analyzeJournalEntry(text: string): Promise<EmotionalAnalysis> {
  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',  // free tier friendly
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this journal entry:\n\n"${text}"` }
    ],
    temperature: 0.1,
    maxTokens: 500,
  })

  const raw = response.choices?.[0]?.message?.content as string
  
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as EmotionalAnalysis
  } catch {
    // Safe fallback if parsing fails
    return {
      sentiment_score: 0,
      emotion_intensity: 0.5,
      emotion_labels: ['unknown'],
      triggers: [],
      extracted_entities: { people: [], places: [], events: [] }
    }
  }
}

// Add this function to lib/mistral/analyze-entry.ts

export function buildProfileContext(profile: any): string {
  if (!profile) return ''
  const parts = []
  if (profile.name) parts.push(`Name: ${profile.name}`)
  if (profile.age) parts.push(`Age: ${profile.age}`)
  if (profile.gender) parts.push(`Gender: ${profile.gender}`)
  if (profile.bio) parts.push(`About them: ${profile.bio}`)
  return parts.length > 0 ? `\n\nUser profile context:\n${parts.join('\n')}` : ''
}