import { test, expect } from "@playwright/test"

const PASSWORD = "Test1234"

// Helper: siempre registra un usuario nuevo único
async function loginOrRegister(page: import("@playwright/test").Page) {
  const uniqueEmail = `quiz_${Date.now()}_${Math.random().toString(36).slice(2)}@quizai.com`
  const uniqueUser = `user_${Date.now()}`
  await page.goto("/")
  await page.locator("button", { hasText: /no tienes cuenta/i }).click()
  await page.getByPlaceholder("tu_usuario").fill(uniqueUser)
  await page.getByPlaceholder("tu@email.com").fill(uniqueEmail)
  await page.getByPlaceholder("••••••••").fill(PASSWORD)
  await page.getByRole("button", { name: /crear cuenta/i }).click()
  await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible({ timeout: 10000 })
}

test.describe("Dashboard", () => {

  test("9. Muestra el dashboard después de iniciar sesión", async ({ page }) => {
    await loginOrRegister(page)
    await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible()
    await expect(page.getByText("QuizAI")).toBeVisible()
  })

  test("10. El botón generar está deshabilitado si el input está vacío", async ({ page }) => {
    await loginOrRegister(page)
    const btn = page.locator("button.qb")
    await expect(btn).toBeDisabled()
  })

  test("11. Se habilita el botón al escribir un tema", async ({ page }) => {
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Biología celular")
    const btn = page.locator("button.qb")
    await expect(btn).toBeEnabled()
  })

  test("12. Muestra el historial al pulsar el botón Historial", async ({ page }) => {
    await loginOrRegister(page)
    await page.locator("button.ghost-btn", { hasText: /historial/i }).first().click()
    await expect(page.getByText("Tu historial")).toBeVisible()
  })

  test("13. El botón regresa al generador desde el historial", async ({ page }) => {
    await loginOrRegister(page)
    const histBtn = page.locator("button.ghost-btn", { hasText: /historial/i }).first()
    await histBtn.click()
    await expect(page.getByText("Tu historial")).toBeVisible()
    // El botón ahora dice "Generador"
    await page.locator("button.ghost-btn", { hasText: /generador/i }).first().click()
    await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible()
  })

})

test.describe("Flujo completo del Quiz", () => {

  test("14. Genera y completa un quiz de 5 preguntas", async ({ page }) => {
    test.setTimeout(120000)
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Historia de México")
    await page.locator("button.qb").click()
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 30000 })

    for (let i = 0; i < 5; i++) {
      await page.locator(".opt-btn").first().waitFor({ timeout: 10000 })
      await page.locator(".opt-btn").first().click()
      if (i < 4) await page.locator("button.qb").click()
      else await page.locator("button.qb").click()
    }

    await expect(page.getByText(/de 100 puntos/i)).toBeVisible({ timeout: 15000 })
  })

  test("15. La barra de progreso avanza al responder preguntas", async ({ page }) => {
    test.setTimeout(120000)
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Matemáticas básicas")
    await page.locator("button.qb").click()
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 30000 })

    // Verificar que hay una barra de progreso visible
    await expect(page.locator("div").filter({ hasText: /pregunta/i }).first()).toBeVisible()

    // Responder primera pregunta
    await page.locator(".opt-btn").first().click()
    await page.locator("button.qb").click()

    // Ahora debe mostrar la siguiente pregunta
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 5000 })
  })

  test("16. Muestra los resultados con puntaje al finalizar", async ({ page }) => {
    test.setTimeout(120000)
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Geografía de México")
    await page.locator("button.qb").click()
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 30000 })

    for (let i = 0; i < 5; i++) {
      await page.locator(".opt-btn").first().waitFor()
      await page.locator(".opt-btn").first().click()
      await page.locator("button.qb").click()
    }

    await expect(page.getByText(/de 100 puntos/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/crear nuevo examen/i)).toBeVisible()
    await expect(page.getByText(/ver respuestas/i)).toBeVisible()
  })

  test("17. El puntaje se guarda en el historial tras completar un quiz", async ({ page }) => {
    test.setTimeout(120000)
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Física básica")
    await page.locator("button.qb").click()
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 30000 })

    for (let i = 0; i < 5; i++) {
      await page.locator(".opt-btn").first().waitFor()
      await page.locator(".opt-btn").first().click()
      await page.locator("button.qb").click()
    }

    await expect(page.getByText(/guardado en tu historial/i)).toBeVisible({ timeout: 10000 })
    await page.locator("button.qb", { hasText: /nuevo examen/i }).click()
    await page.locator("button.ghost-btn", { hasText: /historial/i }).first().click()
    await expect(page.getByText("Física básica")).toBeVisible({ timeout: 5000 })
  })

  test("18. Se pueden ver las respuestas al finalizar el quiz", async ({ page }) => {
    test.setTimeout(120000)
    await loginOrRegister(page)
    await page.getByPlaceholder(/historia de méxico/i).fill("Química")
    await page.locator("button.qb").click()
    await expect(page.locator(".opt-btn").first()).toBeVisible({ timeout: 30000 })

    for (let i = 0; i < 5; i++) {
      await page.locator(".opt-btn").first().waitFor()
      await page.locator(".opt-btn").first().click()
      await page.locator("button.qb").click()
    }

    await page.locator("button.qbo", { hasText: /ver respuestas/i }).click()
    await expect(page.locator(".review-card").first()).toBeVisible({ timeout: 5000 })
  })

})