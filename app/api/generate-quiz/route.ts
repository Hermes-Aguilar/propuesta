import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "El campo 'topic' es requerido." },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key de Groq no configurada en el servidor." },
        { status: 500 }
      )
    }

    const prompt = `Genera exactamente 5 preguntas de opción múltiple sobre el tema: "${topic.trim()}".

Devuelve ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown, sin backticks:
{
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswer": 0
    }
  ]
}

Reglas:
- Exactamente 5 preguntas
- Exactamente 4 opciones por pregunta
- "correctAnswer" es el índice (0, 1, 2 o 3) de la opción correcta
- Las preguntas deben ser claras, educativas y variadas
- Todo en español`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Eres un generador de exámenes educativos. Respondes ÚNICAMENTE con JSON válido, sin texto adicional ni markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.text()
      console.error("Groq API error:", errBody)
      return NextResponse.json(
        { error: "Error al llamar a la API de Groq." },
        { status: 502 }
      )
    }

    const groqData = await groqRes.json()
    const rawText: string = groqData?.choices?.[0]?.message?.content ?? ""

    // Limpiar por si manda backticks
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    let parsed: { questions: { question: string; options: string[]; correctAnswer: number }[] }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error("No se pudo parsear la respuesta de Groq:", cleaned)
      return NextResponse.json(
        { error: "La IA devolvió una respuesta inesperada. Intenta de nuevo." },
        { status: 500 }
      )
    }

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return NextResponse.json(
        { error: "La IA no generó preguntas válidas. Intenta con otro tema." },
        { status: 500 }
      )
    }

    return NextResponse.json({ questions: parsed.questions })
  } catch (err) {
    console.error("Error inesperado en /api/generate-quiz:", err)
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}