import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



const DEBUG = process.env['DEBUG'] === '1'
const STRICT_MODE = process.env['STRICT_MODE'] === '1'

console.log(`\nDEBUG: ${DEBUG}\n`);


// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		__DEBUG__: DEBUG,
		__STRICT_MODE__: STRICT_MODE,
	},
})
