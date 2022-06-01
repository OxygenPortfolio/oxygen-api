import express, { Express } from 'express'
import { RoutesConfig } from './routes'

export class AppConfig {
	private static app: Express

	public static setup () {
		AppConfig.app = express()
		RoutesConfig.setup(AppConfig.app)
	}
}
