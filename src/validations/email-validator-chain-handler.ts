import { AbstractChainHandler } from '../domain/entities/abstract-chain-handler'
import { InvalidParamError, MissingParamError } from '../utils/errors'

export class EmailValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { email?: string }) {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (!request.email) throw new MissingParamError('email')
		if (!emailRegex.test(request.email)) throw new InvalidParamError('email must be a valid email')
		super.handle(request)
	}
}
