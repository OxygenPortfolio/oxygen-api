import { AbstractChainHandler } from '../domain/entities/abstract-chain-handler'
import { InvalidParamError, MissingParamError } from '../utils/errors'

export class PasswordValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { password?: string }) {
		if (!request.password) throw new MissingParamError('password')
		if (request.password.length < 8) throw new InvalidParamError('password')
		return super.handle(request)
	}
}
