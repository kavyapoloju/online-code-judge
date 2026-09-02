/**
 * Optional AI-powered hint generator using the Anthropic API.
 * Only activates if ANTHROPIC_API_KEY is set in .env — otherwise
 * returns a graceful fallback message so the feature never crashes
 * a submission flow.
 */
const getAIHint = async ({ problemTitle, problemDescription, code, status, stderr }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return 'AI hints are disabled. Set ANTHROPIC_API_KEY in backend/.env to enable this feature.';
  }

  try {
    const prompt = `A student is solving this coding problem:
Title: ${problemTitle}
Description: ${problemDescription}

Their submission got status: ${status}
${stderr ? `Error output: ${stderr}` : ''}

Their code:
${code}

Give a short, encouraging hint (2-4 sentences) that points them toward the bug or the right approach WITHOUT revealing the full solution or writing corrected code for them.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.find((c) => c.type === 'text')?.text;
    return text || 'Could not generate a hint right now — try again in a moment.';
  } catch (err) {
    console.error('AI hint error:', err.message);
    return 'Could not generate a hint right now — try again in a moment.';
  }
};

module.exports = { getAIHint };
