import { AbstractChainHandler } from '../domain/entities/abstract-chain-handler'
import { InvalidParamError, MissingParamError } from '../utils/errors'

export class UsernameValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { username?: string }) {
		if (!request.username) throw new MissingParamError('username')
		if (request.username.length < 8) throw new InvalidParamError('username')
		return super.handle(request)
	}
}
