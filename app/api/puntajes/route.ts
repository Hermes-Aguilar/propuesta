import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, puntos, tema, correctas, totalPregs } = await req.json()

    if (
      usuarioId === undefined ||
      puntos === undefined ||
      !tema ||
      correctas === undefined
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: usuarioId, puntos, tema, correctas" },
        { status: 400 }
      )
    }

    const puntaje = await prisma.puntaje.create({
      data: {
        usuarioId: Number(usuarioId),
        puntos: Number(puntos),
        tema: String(tema),
        correctas: Number(correctas),
        totalPregs: Number(totalPregs ?? 5),
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

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere el parámetro usuarioId" },
        { status: 400 }
      )
    }

    const puntajes = await prisma.puntaje.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { creadoEn: "desc" },
      take: 20, // Últimos 20 resultados
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