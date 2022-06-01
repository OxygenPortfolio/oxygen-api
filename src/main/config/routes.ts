import { Express, Router } from 'express'
import { readdirSync } from 'fs'
import { join } from 'path'

export class RoutesConfig {
	public static setup (app: Express) {
		const router = Router()
		app.use('/api', router)
		readdirSync(join(__dirname, '../routes')).forEach(async file => {
			if (file.endsWith('.map')) return
			(await import(`../routes/${file}`)).setup(router)
		})
	}
}
