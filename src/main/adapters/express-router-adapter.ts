import { Request, Response } from 'express'
import { Router } from '../../presentation/contracts/router'

export class ExpressRouterAdapter {
	public static adapt (router: Router) {
		return async (req: Request, res: Response) => {
			const request = {
				...(req.body || {}),
				...(req.params || {})
			}
			const httpResponse = await router.route(request)
			return res.status(httpResponse.status).json(httpResponse)
		}
	}
}
