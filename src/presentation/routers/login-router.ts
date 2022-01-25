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

	public async route ({ username, password }: LoginDto): Promise<HttpBaseResponse> {
		try {
			this.validatorChain.handle({ username, password })
			const accessToken = await this.authUseCase.auth({ username, password })
			return HttpResponse.ok({ accessToken })
		} catch (err) {
			if (err instanceof MissingParamError) return HttpResponse.badRequest(err)
			if (err instanceof InvalidParamError) return HttpResponse.badRequest(err)
			return HttpResponse.serverError()
		}
	}
}
