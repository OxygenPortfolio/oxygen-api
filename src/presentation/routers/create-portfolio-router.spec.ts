import { ChainHandler } from '../../domain/contracts/chain-handler'
import { CreatePortfolioDto } from '../../domain/dtos/create-portfolio-dto'
import { MissingParamError } from '../../utils/errors'
import { PortfolioNameValidatorChainHandler } from '../../validations'
import { Router } from '../contracts/router'
import { HttpResponse } from '../helpers/http-response'
import { HttpBaseResponse } from '../types/http-base-response'

class CreatePortfolioRouter implements Router {
	constructor (
		private readonly validatorChain: ChainHandler
	) {}

	public async route ({ name }: CreatePortfolioDto): Promise<HttpBaseResponse> {
		try {
			this.validatorChain.handle({ name })
			return HttpResponse.created({})
		} catch (err) {
			if (err instanceof MissingParamError) return HttpResponse.badRequest(err)
			return HttpResponse.serverError()
		}
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const sut = new CreatePortfolioRouter(validatorChain)
	return { sut }
}

function makePortfolio (): CreatePortfolioDto {
	return {
		name: 'valid_name'
	}
}

function makeValidatorChain () {
	const portfolioNameValidator = new PortfolioNameValidatorChainHandler()
	return portfolioNameValidator
}

describe('CreatePortfolioRouter', () => {
	it('Should return 201 with valid data', async () => {
		const { sut } = makeSut()
		const portfolio = makePortfolio()

		const response = await sut.route(portfolio)

		expect(response.status).toBe(201)
	})

	it('Should return 400 with invalid portfolio name', async () => {
		const { sut } = makeSut()
		const portfolio = { name: '' }

		const response = await sut.route(portfolio)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new MissingParamError('name'))
	})
})
