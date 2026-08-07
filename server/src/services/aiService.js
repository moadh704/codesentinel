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
    console.error('Failed to parse AI response:', cleaned?.slice?.(0, 500));
    throw new Error('AI returned invalid JSON format');
  }
}

function mockFindings(code, language) {
  const lower = (code || '').toLowerCase();
  const findings = [];

  if (
    lower.includes('password') ||
    lower.includes('secret') ||
    lower.includes('api_key') ||
    lower.includes('apikey')
  ) {
    findings.push({
      title: 'Possible hardcoded secret',
      severity: 'high',
      type: 'Hardcoded Secret',
      line_number: 1,
      description:
        'Demo finding (no AI API key configured). The code appears to reference secrets or passwords in source.',
      vulnerable_code: code.slice(0, 200),
      fix_suggestion:
        'Move secrets to environment variables or a secrets manager. Never commit credentials.',
    });
  }

  if (
    lower.includes('select ') &&
    (lower.includes('${') || lower.includes('+') || lower.includes('query('))
  ) {
    findings.push({
      title: 'Possible SQL injection',
      severity: 'critical',
      type: 'SQL Injection',
      line_number: 1,
      description:
        'Demo finding (no AI API key configured). String-built SQL can allow injection.',
      vulnerable_code: code.slice(0, 200),
      fix_suggestion: 'Use parameterized queries / prepared statements only.',
    });
  }

  if (lower.includes('innerhtml') || lower.includes('document.write')) {
    findings.push({
      title: 'Possible XSS sink',
      severity: 'high',
      type: 'XSS',
      line_number: 1,
      description:
        'Demo finding (no AI API key configured). Writing untrusted HTML into the DOM is risky.',
      vulnerable_code: code.slice(0, 200),
      fix_suggestion: 'Prefer textContent or a sanitizer library for untrusted input.',
    });
  }

  if (findings.length === 0) {
    findings.push({
      title: 'Demo analysis (no AI key)',
      severity: 'info',
      type: 'Info',
      line_number: null,
      description: `Local demo mode for ${language}. No API key for this provider (Settings or server/.env), so this is a placeholder finding so you can test the UI.`,
      vulnerable_code: code.slice(0, 120) || null,
      fix_suggestion:
        'Add a key in Settings → AI Provider API Keys, or set the matching key in server/.env, then run the scan again.',
    });
  }

  return findings;
}

const ENV_KEY_BY_PROVIDER = {
  deepseek: 'DEEPSEEK_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
  gpt4: 'OPENAI_API_KEY',
  gemini: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
};

/**
 * Prefer request key from Settings UI; fall back to server env for that provider.
 * @param {string} provider
 * @param {string} [requestApiKey]
 * @returns {string}
 */
function resolveApiKey(provider, requestApiKey) {
  const fromRequest = typeof requestApiKey === 'string' ? requestApiKey.trim() : '';
  if (fromRequest) return fromRequest;

  const envName = ENV_KEY_BY_PROVIDER[provider];
  if (!envName) return '';
  return (process.env[envName] || '').trim();
}

/**
 * Analyze code using the selected AI provider
 * @param {string} code - Source code to analyze
 * @param {string} language - Programming language
 * @param {'claude' | 'gpt4' | 'groq' | 'gemini' | 'deepseek'} provider
 * @param {string} [requestApiKey] - Optional key from client Settings
 * @returns {Promise<Array>} Array of vulnerability objects
 */
export async function analyzeCode(code, language, provider, requestApiKey) {
  const prompt = `Language: ${language}\n\nCode to analyze:\n\n${code}`;
  const apiKey = resolveApiKey(provider, requestApiKey);

  // Mock only when neither UI key nor server env key is available for this provider
  if (!apiKey) {
    console.log(`[ai] Mock findings (no key for provider=${provider})`);
    return mockFindings(code, language);
  }

  let rawResponse = '';

  try {
    if (provider === 'deepseek') {
      const deepseek = new OpenAI({
        apiKey,
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      });

      const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      const completion = await deepseek.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      rawResponse = completion.choices[0]?.message?.content || '';
    } else if (provider === 'claude') {
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
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
      const openai = new OpenAI({ apiKey });

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
      const groq = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      rawResponse = completion.choices[0]?.message?.content || '';
    } else if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
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
    // Never log the raw API key
    console.error(`AI analysis failed for provider ${provider}:`, error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
