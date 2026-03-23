import { test, expect } from "@playwright/test"

const EMAIL_TEST = `test_${Date.now()}@quizai.com`
const PASSWORD_TEST = "Test1234"
const USERNAME_TEST = `usuario_${Date.now()}`

test.describe("Autenticación — Login y Registro", () => {

  test("1. Muestra la pantalla de login al entrar", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible()
    await expect(page.getByPlaceholder("tu@email.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••")).toBeVisible()
  })

  test("2. El botón de iniciar sesión está deshabilitado si los campos están vacíos", async ({ page }) => {
    await page.goto("/")
    const btn = page.getByRole("button", { name: /iniciar sesión/i })
    await expect(btn).toBeDisabled()
  })

  test("3. Muestra error si se intenta login con email inexistente", async ({ page }) => {
    await page.goto("/")
    await page.getByPlaceholder("tu@email.com").fill("noexiste@test.com")
    await page.getByPlaceholder("••••••••").fill("password123")
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page.getByText(/no existe/i)).toBeVisible({ timeout: 10000 })
  })

  test("4. Navega a la pantalla de registro al pulsar el enlace", async ({ page }) => {
    await page.goto("/")
    await page.locator("button", { hasText: /no tienes cuenta/i }).click()
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible()
    await expect(page.getByPlaceholder("tu_usuario")).toBeVisible()
  })

  test("5. Registra un usuario nuevo exitosamente", async ({ page }) => {
    await page.goto("/")
    await page.getByText(/no tienes cuenta/i).click()
    await page.getByPlaceholder("tu_usuario").fill(USERNAME_TEST)
    await page.getByPlaceholder("tu@email.com").fill(EMAIL_TEST)
    await page.getByPlaceholder("••••••••").fill(PASSWORD_TEST)
    await page.getByRole("button", { name: /crear cuenta/i }).click()
    // Debe redirigir al dashboard
    await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible({ timeout: 10000 })
  })

  test("6. Muestra error al registrar con un email ya existente", async ({ page }) => {
    await page.goto("/")
    await page.getByText(/no tienes cuenta/i).click()
    await page.getByPlaceholder("tu_usuario").fill("otro_usuario")
    await page.getByPlaceholder("tu@email.com").fill(EMAIL_TEST) // mismo email
    await page.getByPlaceholder("••••••••").fill(PASSWORD_TEST)
    await page.getByRole("button", { name: /crear cuenta/i }).click()
    await expect(page.getByText(/ya existe/i)).toBeVisible({ timeout: 10000 })
  })

  test("7. Login exitoso con el usuario recién creado", async ({ page }) => {
    await page.goto("/")
    await page.getByPlaceholder("tu@email.com").fill(EMAIL_TEST)
    await page.getByPlaceholder("••••••••").fill(PASSWORD_TEST)
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(USERNAME_TEST.split("_")[0])).toBeVisible()
  })

  test("8. Cierra sesión correctamente", async ({ page }) => {
    await page.goto("/")
    await page.getByPlaceholder("tu@email.com").fill(EMAIL_TEST)
    await page.getByPlaceholder("••••••••").fill(PASSWORD_TEST)
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page.getByText("¿Qué quieres aprender hoy?")).toBeVisible({ timeout: 10000 })
    await page.getByRole("button", { name: /salir/i }).click()
    await expect(page.getByText("Bienvenido de vuelta")).toBeVisible()
  })

})