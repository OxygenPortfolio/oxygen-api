import { LoginDto } from '../../domain/dtos/login-dto'
import { MissingParamError, InvalidParamError } from '../../utils/errors'
import { PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../validations'
import { HttpResponse } from '../helpers/http-response'
import { LoginRouter } from './login-router'

class AuthUseCaseSpy {
	public accessToken = 'valid_token'
	public password: string = ''
	public username: string = ''

	public async auth ({ username, password }: LoginDto) {
		this.password = password
		this.username = username
		return this.accessToken
	}
}

class AuthUseCaseWithErrorSpy {
	public async auth () {
		throw new Error('')
	}
}

function makeSut () {
	const authUseCase = makeAuthUseCase()
	const passwordValidator = new PasswordValidatorChainHandler()
	const usernameValidator = new UsernameValidatorChainHandler()
	passwordValidator.setNext(usernameValidator)
	const sut = new LoginRouter(authUseCase, passwordValidator)
	return { sut, authUseCase }
}

function makeAuthUseCase () {
	const authUseCase = new AuthUseCaseSpy()
	return authUseCase
}

function makeAuthUseCaseWithError () {
	const authUseCaseWithError = new AuthUseCaseWithErrorSpy()
	return authUseCaseWithError
}

describe('LoginRouter', () => {
	it('Should return status 400 if invalid username is provided', async () => {
		const { sut } = makeSut()
		const httpRequest = {
			password: 'any_password',
			username: ''
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new MissingParamError('username').message)
	})

	it('Should return status 400 if invalid password is provided', async () => {
		const { sut } = makeSut()
		const httpRequest = {
			username: 'any_username',
			password: ''
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new MissingParamError('password').message)
	})

	it('Should return status 400 if empty request body is provided', async () => {
		const { sut } = makeSut()
		const httpRequest: LoginDto = {
			username: '',
			password: ''
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new MissingParamError('password').message)
	})

	it('Should return 200 if valid data is provided', async () => {
		const { sut } = makeSut()
		const httpRequest = {
			username: 'valid_username',
			password: 'valid_password'
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(200)
	})

	it('Should return 400 if username has less than 3 characters', async () => {
		const { sut } = makeSut()
		const invalidUsername = 'ab'
		const httpRequest = {
			username: invalidUsername,
			password: 'valid_password'
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new InvalidParamError('username must be at least 3 characters long').message)
	})

	it('Should return 400 if username has more than 24 characters', async () => {
		const { sut } = makeSut()
		const invalidUsername = 'too_long_username_provided'
		const httpRequest = {
			username: invalidUsername,
			password: 'valid_password'
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new InvalidParamError('username must be at most 24 characters long').message)
	})

	it('Should return 400 if password has less than 8 characters', async () => {
		const { sut } = makeSut()
		const invalidPassword = '123467'
		const httpRequest = {
			password: invalidPassword,
			username: 'valid_username'
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
		expect(httpResponse.message).toBe(new InvalidParamError('password').message)
	})

	it('Should return an access token if user is authenticated', async () => {
		const { sut, authUseCase } = makeSut()
		const httpRequest = {
			password: 'valid_password',
			username: 'valid_username'
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(200)
		expect(httpResponse.data.accessToken).toEqual(authUseCase.accessToken)
	})

	it('Should call authUseCase with correct username', async () => {
		const { sut, authUseCase } = makeSut()
		const httpRequest = {
			password: 'valid_password',
			username: 'valid_username'
		}

		await sut.route(httpRequest)

		expect(httpRequest.username).toEqual(authUseCase.username)
	})

	it('Should call authUseCase with correct password', async () => {
		const { sut, authUseCase } = makeSut()
		const httpRequest = {
			password: 'valid_password',
			username: 'valid_username'
		}

		await sut.route(httpRequest)

		expect(httpRequest.password).toEqual(authUseCase.password)
	})

	it('Should return status 500 if authUseCase throws', async () => {
		const authUseCaseWithError = makeAuthUseCaseWithError()
		const validatorChain = new PasswordValidatorChainHandler()
		const usernameValidator = new UsernameValidatorChainHandler()
		validatorChain.setNext(usernameValidator)
		const sut = new LoginRouter(authUseCaseWithError, validatorChain)
		const httpRequest = {
			password: 'valid_password',
			username: 'valid_username'
		}

		expect(authUseCaseWithError.auth).rejects.toThrow()
		expect(await sut.route(httpRequest)).toEqual(HttpResponse.serverError())
	})
})
