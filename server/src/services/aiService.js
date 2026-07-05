import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `You are a security code reviewer. Analyze the provided code for security vulnerabilities. 
For each vulnerability found, return a JSON array with this exact structure:
[
  {
    title: string,
    severity: critical|high|medium|low|info,
    type: string (e.g. SQL Injection, XSS, Hardcoded Secret),
    line_number: number or null,
    description: string (plain English explanation),
    vulnerable_code: string (the problematic code snippet),
    fix_suggestion: string (secure code example)
  }
]
Return ONLY the JSON array, nothing else. Do not wrap it in markdown code blocks.`;

/**
 * Clean and parse AI response that might contain markdown or extra text
 */
function parseAIResponse(text) {
  if (!text) throw new Error('Empty response from AI');

  // Remove markdown code blocks if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // Try to extract JSON array
  const jsonMatch = cleaned.match(/[\s\S]*/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not a JSON array');
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse AI response:', cleaned);
    throw new Error('AI returned invalid JSON format');
  }
}

/**
 * Analyze code using the selected AI provider
 * @param {string} code - Source code to analyze
 * @param {string} language - Programming language
 * @param {'claude' | 'gpt4' | 'groq' | 'gemini'} provider
 * @returns {Promise<Array>} Array of vulnerability objects
 */
export async function analyzeCode(code, language, provider) {
  const prompt = `Language: ${language}\n\nCode to analyze:\n\n${code}`;

  let rawResponse = '';

  try {
    if (provider === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', // Using user-specified model
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      rawResponse = message.content[0]?.text || '';

    } else if (provider === 'gpt4') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      rawResponse = completion.choices[0]?.message?.content || '';

    } else if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
      }

      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Fast and high quality
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      rawResponse = completion.choices[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not configured');
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      rawResponse = result.response.text() || '';

    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Parse and validate the response
    const vulnerabilities = parseAIResponse(rawResponse);

    // Basic validation of structure
    vulnerabilities.forEach((v, index) => {
      if (!v.title || !v.severity || !v.description) {
        throw new Error(`Invalid vulnerability object at index ${index}`);
      }
    });

    return vulnerabilities;

  } catch (error) {
    console.error(`AI analysis failed for provider ${provider}:`, error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}