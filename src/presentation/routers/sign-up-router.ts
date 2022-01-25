import { ChainHandler } from '../../domain/contracts/chain-handler'
import { SignUpUseCase } from '../../domain/contracts/sign-up-use-case'
import { SignUpDto } from '../../domain/dtos/sign-up-dto'
import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { Router } from '../contracts/router'
import { HttpResponse } from '../helpers/http-response'
import { HttpBaseResponse } from '../types/http-base-response'

export class SignUpRouter implements Router {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly signUpUseCase: SignUpUseCase
	) {}

	public async route ({ username, password, email }: SignUpDto): Promise<HttpBaseResponse> {
		try {
			this.validatorChain.handle({ username, password, email })
			const accessToken = await this.signUpUseCase.signUp({ username, password, email })
			return HttpResponse.created({ accessToken })
		} catch (err) {
			if (err instanceof MissingParamError) return HttpResponse.badRequest(err)
			if (err instanceof InvalidParamError) return HttpResponse.badRequest(err)
			return HttpResponse.serverError()
		}
	}
}
