import { ChainHandler } from '../../domain/contracts/chain-handler'
import { CreatePortfolioUseCase } from '../../domain/contracts/create-portfolio-use-case'
import { CreatePortfolioDto } from '../../domain/dtos/create-portfolio-dto'
import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { PortfolioNameValidatorChainHandler } from '../../validations'
import { Router } from '../contracts/router'
import { HttpResponse } from '../helpers/http-response'
import { HttpBaseResponse } from '../types/http-base-response'

class CreatePortfolioUseCaseSpy implements CreatePortfolioUseCase {
	public params: CreatePortfolioDto
	public return: CreatePortfolioDto
	public async create (_portfolioDto: CreatePortfolioDto): Promise<unknown> {
		return this.return
	}
}

class CreatePortfolioUseCaseWithErrorSpy {
	public async create (portfolioDto: CreatePortfolioDto): Promise<unknown> {
		throw new Error()
	}
}

class CreatePortfolioRouter implements Router {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly createPortfolioUseCase: CreatePortfolioUseCase
	) {}

	public async route ({ name }: CreatePortfolioDto): Promise<HttpBaseResponse> {
		try {
			this.validatorChain.handle({ name })
			const portfolio = await this.createPortfolioUseCase.create({ name })
			return HttpResponse.created(portfolio)
		} catch (err) {
			if (err instanceof MissingParamError) return HttpResponse.badRequest(err)
			if (err instanceof InvalidParamError) return HttpResponse.badRequest(err)
			return HttpResponse.serverError()
		}
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const createPortfolioUseCase = makeCreatePortfolioUseCaseSpy()
	const sut = new CreatePortfolioRouter(validatorChain, createPortfolioUseCase)
	return { sut, createPortfolioUseCase }
}

function makeCreatePortfolioUseCaseSpy () {
	const createPortfolioUseCaseSpy = new CreatePortfolioUseCaseSpy()
	createPortfolioUseCaseSpy.return = makePortfolio()
	createPortfolioUseCaseSpy.params = makePortfolio()
	return createPortfolioUseCaseSpy
}

function makeCreatePortfolioUseCaseWithErrorSpy () {
	const createPortfolioUseCaseSpy = new CreatePortfolioUseCaseWithErrorSpy()
	return createPortfolioUseCaseSpy
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
		expect(response.data).toEqual(portfolio)
	})

	it('Should return 400 with invalid portfolio name', async () => {
		const { sut } = makeSut()
		const portfolio = { name: '' }

		const response = await sut.route(portfolio)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new MissingParamError('name'))
	})

	it('Should return 400 with long portfolio name', async () => {
		const { sut } = makeSut()
		const portfolio = { name: '______________________too_long_____________________' }

		const response = await sut.route(portfolio)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new InvalidParamError('name must be at most 50 characters long'))
	})

	it('Should call createPortfolioUseCase with correct params', async () => {
		const { sut, createPortfolioUseCase } = makeSut()
		const portfolio = makePortfolio()

		await sut.route(portfolio)

		expect(createPortfolioUseCase.params).toEqual(portfolio)
	})

	it('Should return status 500 if an unexpected error occurs', async () => {
		const validatorChain = makeValidatorChain()
		const createPortfolioUseCaseSpy = makeCreatePortfolioUseCaseWithErrorSpy()
		const portfolio = makePortfolio()
		const sut = new CreatePortfolioRouter(validatorChain, createPortfolioUseCaseSpy)

		const response = await sut.route(portfolio)

		expect(response.status).toBe(500)
		expect(response.message).toBe('Unexpected error')
	})
})
