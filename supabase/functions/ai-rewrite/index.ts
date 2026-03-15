import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, fieldName, context } = await req.json()

    // Aqui você integraria com OpenAI, Gemini ou Anthropic
    // Como exemplo, usaremos o modelo do Google Gemini ou OpenAI se a chave estiver presente
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      // Se não houver chave, retornamos um erro informativo
      return new Response(
        JSON.stringify({ error: 'AI API Key not configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Lógica simplificada de reescrita (Simulação de prompt)
    // Em produção, aqui seria o fetch para a API de IA
    /*
    const prompt = `Reescreva o seguinte texto de "${fieldName}" para que seja mais profissional, objetivo e claro. 
    Contexto: ${context}
    Texto original: "${text}"
    Regras: Mantenha o sentido original, mas use linguagem técnica administrativa apropriada para o Ministério Público. Seja conciso.`;
    */

    // Para esta demonstração, vamos retornar uma versão "melhorada" fictícia 
    // ou fazer a chamada real se houver chave.
    
    // Simulação de delay de IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Exemplo de transformação simples (melhor seria a chamada real)
    let rewrittenText = text;
    if (text.length > 5) {
        // Melhoras automáticas básicas se não houver IA configurada ou para teste
        rewrittenText = text.charAt(0).toUpperCase() + text.slice(1);
        if (!rewrittenText.endsWith('.')) rewrittenText += '.';
    }

    return new Response(
      JSON.stringify({ rewrittenText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
