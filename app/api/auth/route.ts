import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ─── REGISTRO ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { action, email, password, username } = await req.json()

    // ── LOGIN ──────────────────────────────────────────────────────────────
    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email y contraseña son requeridos." },
          { status: 400 }
        )
      }

      const usuario = await prisma.usuario.findUnique({
        where: { email },
      })

      if (!usuario) {
        return NextResponse.json(
          { error: "No existe una cuenta con ese email." },
          { status: 401 }
        )
      }

      const passwordValida = await bcrypt.compare(password, usuario.password)
      if (!passwordValida) {
        return NextResponse.json(
          { error: "Contraseña incorrecta." },
          { status: 401 }
        )
      }

      return NextResponse.json({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          username: usuario.username,
        },
      })
    }

    // ── REGISTRO ───────────────────────────────────────────────────────────
    if (action === "register") {
      if (!email || !password || !username) {
        return NextResponse.json(
          { error: "Username, email y contraseña son requeridos." },
          { status: 400 }
        )
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        )
      }

      // Verificar si ya existe
      const existe = await prisma.usuario.findFirst({
        where: { OR: [{ email }, { username }] },
      })

      if (existe) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese email o username." },
          { status: 409 }
        )
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const nuevoUsuario = await prisma.usuario.create({
        data: {
          email,
          username,
          password: passwordHash,
        },
      })

      return NextResponse.json(
        {
          usuario: {
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            username: nuevoUsuario.username,
          },
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: "Acción no válida. Usa 'login' o 'register'." },
      { status: 400 }
    )
  } catch (err) {
    console.error("Error en /api/auth:", err)
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}