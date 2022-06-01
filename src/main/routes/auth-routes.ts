import { Router } from 'express'
import { Routes } from '../../utils/enums/routes'
import { ExpressRouterAdapter } from '../adapters/express-router-adapter'
import { LoginRouterFactory } from '../factories/routers/login-router-factory'

export class AuthRoutes {
	public static setup (router: Router) {
		router.post(Routes.LOGIN, ExpressRouterAdapter.adapt(LoginRouterFactory.make()))
	}
}
