import { AuthUseCase } from '../../domain/contracts/auth-use-case'
import { LoginDto } from '../../domain/dtos/login-dto'
import { MissingParamError, InvalidParamError } from '../../utils/errors'
import { ChainHandler } from '../../domain/contracts/chain-handler'
import { Router } from '../contracts/router'
import { HttpResponse } from '../helpers/http-response'
import { HttpBaseResponse } from '../types/http-base-response'

export class LoginRouter implements Router {
	constructor (
		private readonly authUseCase: AuthUseCase,
		private readonly validatorChain: ChainHandler
	) { }

	public async route (request: LoginDto): Promise<HttpBaseResponse> {
		try {
			const { username, password } = request
			this.validatorChain.handle(request)
			const accessToken = await this.authUseCase.auth({ username, password })
			return { status: 200, data: { accessToken } }
		} catch (err) {
			if (err instanceof MissingParamError) {
				return HttpResponse.badRequest(err)
			}
			if (err instanceof InvalidParamError) {
				return HttpResponse.badRequest(err)
			}
			return HttpResponse.serverError()
		}
	}
}
