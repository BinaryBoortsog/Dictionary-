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
            content: `Translate from ${source} to ${target}. Preserve names, numbers, dosages, dates, and medical terminology exactly when appropriate. Then return ONLY valid JSON: {"translation":"translated text","terms":[{"surface":"source word as written","lemma":"base dictionary form in source language"}]}. Include terms in source order. For Korean, remove grammar endings and use the base dictionary form: "복용한" becomes "복용하다" and "있습니까" becomes "있다". Do not add diagnoses, advice, warnings, or markdown.`,
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
    // `output_text` is an SDK convenience property. The REST response returns
    // the generated text inside message content items, so support both shapes.
    const generatedText = [
      result.output_text,
      ...(result.output || []).flatMap((item) =>
        (item.content || [])
          .filter((content) => content.type === 'output_text' || content.type === 'text')
          .map((content) => content.text),
      ),
    ]
      .filter((value) => typeof value === 'string')
      .join('')
      .trim();
    if (!generatedText) {
      return response.status(502).json({error: 'Translation service returned an empty response.'});
    }
    let parsed;
    try {
      parsed = JSON.parse(generatedText.replace(/^```json\s*|\s*```$/g, ''));
    } catch {
      return response.status(502).json({error: 'Translation service returned an invalid response.'});
    }
    const translation = typeof parsed.translation === 'string' ? parsed.translation.trim() : '';
    const terms = Array.isArray(parsed.terms)
      ? parsed.terms.filter((term) => typeof term?.surface === 'string' && typeof term?.lemma === 'string').slice(0, 30)
      : [];
    if (!translation) return response.status(502).json({error: 'Translation service returned an invalid response.'});

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({translation, terms});
  } catch (error) {
    console.error('Translation request error:', error);
    return response.status(502).json({error: 'Translation service is temporarily unavailable.'});
  }
}
