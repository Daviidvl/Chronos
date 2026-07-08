import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topicTitle, subjectName } = await req.json()

    if (!topicTitle) {
      return new Response(JSON.stringify({ error: 'topicTitle is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role:    'user',
        content: `Você é um tutor especialista. Crie exatamente 5 flashcards de estudo sobre o tópico "${topicTitle}"${subjectName ? ` da matéria "${subjectName}"` : ''}.

Regras:
- Perguntas diretas e objetivas
- Respostas concisas (1 a 3 frases no máximo)
- Foque nos conceitos mais importantes
- Use linguagem simples em português

Responda SOMENTE com JSON válido, sem texto adicional:
{
  "flashcards": [
    { "question": "Pergunta aqui?", "answer": "Resposta concisa aqui." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}`,
      }],
    })

    const raw  = (message.content[0] as { text: string }).text.trim()
    const data = JSON.parse(raw)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
