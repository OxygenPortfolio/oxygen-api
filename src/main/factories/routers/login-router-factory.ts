import { LoginRouter } from '../../../presentation/routers/login-router'
import { AuthUseCaseFactory } from '../usecases/auth-use-case-factory'
import { LoginValidationFactory } from '../validations/login-validation-factory'

export class LoginRouterFactory {
	public static make () {
		const router = new LoginRouter(AuthUseCaseFactory.make(), LoginValidationFactory.make())
		return router
	}
}
