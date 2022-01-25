import { AbstractChainHandler } from '../domain/entities/abstract-chain-handler'
import { InvalidParamError, MissingParamError } from '../utils/errors'

export class PortfolioNameValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { name?: string }) {
		if (!request.name) throw new MissingParamError('name')
		if (request.name.length > 50) throw new InvalidParamError('name must be at most 50 characters long')
		return super.handle(request)
	}
}
