import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, puntos, tema, correctas, totalPregs, preguntas } = await req.json()

    if (usuarioId === undefined || puntos === undefined || !tema || correctas === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos." },
        { status: 400 }
      )
    }

    // Guardar preguntas + opciones si vienen en el body
    let preguntaId: number | undefined = undefined

    if (preguntas && Array.isArray(preguntas) && preguntas.length > 0) {
      // Crear la primera pregunta como "cabecera" del quiz y vincularla al puntaje
      // Guardamos todas las preguntas del quiz
      const primeraCreada = await prisma.pregunta.create({
        data: {
          enunciado: preguntas[0].question,
          area: tema,
          dificultad: "media",
          opciones: {
            create: preguntas[0].options.map((texto: string, i: number) => ({
              texto,
              esCorrecta: i === preguntas[0].correctAnswer,
            })),
          },
        },
      })
      preguntaId = primeraCreada.id

      // Guardar el resto de preguntas
      for (let i = 1; i < preguntas.length; i++) {
        await prisma.pregunta.create({
          data: {
            enunciado: preguntas[i].question,
            area: tema,
            dificultad: "media",
            opciones: {
              create: preguntas[i].options.map((texto: string, j: number) => ({
                texto,
                esCorrecta: j === preguntas[i].correctAnswer,
              })),
            },
          },
        })
      }
    }

    const puntaje = await prisma.puntaje.create({
      data: {
        usuarioId: Number(usuarioId),
        puntos: Number(puntos),
        tema: String(tema),
        correctas: Number(correctas),
        totalPregs: Number(totalPregs ?? 5),
        preguntaId: preguntaId ?? null,
      },
    })

    return NextResponse.json({ puntaje }, { status: 201 })
  } catch (err) {
    console.error("Error guardando puntaje:", err)
    return NextResponse.json(
      { error: "Error interno al guardar el puntaje." },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const usuarioId = searchParams.get("usuarioId")
    const puntajeId = searchParams.get("puntajeId")

    // Obtener preguntas de un puntaje específico
    if (puntajeId) {
      const puntaje = await prisma.puntaje.findUnique({
        where: { id: Number(puntajeId) },
      })

      if (!puntaje?.preguntaId) {
        return NextResponse.json({ preguntas: [] })
      }

      // Buscar todas las preguntas del mismo tema creadas cerca del mismo momento
      const preguntas = await prisma.pregunta.findMany({
        where: { area: puntaje.tema },
        include: { opciones: true },
        orderBy: { creadoEn: "asc" },
        take: puntaje.totalPregs,
      })

      return NextResponse.json({ preguntas })
    }

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere el parámetro usuarioId" },
        { status: 400 }
      )
    }

    const puntajes = await prisma.puntaje.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { creadoEn: "desc" },
      take: 20,
    })

    return NextResponse.json({ puntajes })
  } catch (err) {
    console.error("Error obteniendo puntajes:", err)
    return NextResponse.json(
      { error: "Error interno al obtener los puntajes." },
      { status: 500 }
    )
  }
}