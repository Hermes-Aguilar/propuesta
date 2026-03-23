import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["html"], ["list"]],

  use: {
    baseURL: "http://localhost:3000",

    video: "on",
    screenshot: "only-on-failure",
    trace: "on",
    locale: "es-MX",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Levanta el servidor automáticamente antes de las pruebas
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30000,
  },
})