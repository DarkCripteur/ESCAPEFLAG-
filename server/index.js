import 'dotenv/config'
import { createApp } from './app.js'
import { configured } from './services/supabaseClient.js'
import { seedAdminUser } from './services/seedAdminUser.js'

const port = Number(process.env.PORT || 3001)
const app = createApp()

app.listen(port, () => {
  console.log(`Escape Flag API ready on http://localhost:${port} (${configured ? 'Supabase connected' : 'configuration required'})`)
  seedAdminUser()
})
