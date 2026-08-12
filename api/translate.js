const MAX_TEXT_LENGTH = 2_000;

const languageNames = {
  'ko-mn': {source: 'Korean', target: 'Cyrillic Mongolian'},
  'mn-ko': {source: 'Cyrillic Mongolian', target: 'Korean'},
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({error: 'Method not allowed'});
  }

  const {text, direction} = request.body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT_LENGTH || !languageNames[direction]) {
    return response.status(400).json({error: 'Provide up to 2,000 characters and a valid translation direction.'});
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({error: 'Translation service is not configured.'});
  }

  const {source, target} = languageNames[direction];
  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        store: false,
        reasoning: {effort: 'none'},
        input: [
          {
            role: 'developer',
            content: `Translate only from ${source} to ${target}. Preserve names, numbers, dosages, dates, and medical terminology exactly when appropriate. Do not add explanations, diagnoses, advice, warnings, or quotation marks. If the text is ambiguous, translate it as faithfully as possible.`,
          },
          {role: 'user', content: text.trim()},
        ],
      }),
    });

    if (!apiResponse.ok) {
      console.error('OpenAI translation request failed:', apiResponse.status);
      return response.status(502).json({error: 'Translation service could not complete the request.'});
    }

    const result = await apiResponse.json();
    const translation = result.output_text?.trim();
    if (!translation) {
      return response.status(502).json({error: 'Translation service returned an empty response.'});
    }

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({translation});
  } catch (error) {
    console.error('Translation request error:', error);
    return response.status(502).json({error: 'Translation service is temporarily unavailable.'});
  }
}
