type HttpBaseResponse = {
	status: number
	data?: any
	error?: Error
	message?: string
}

type LoginDto = {
	username: string
	password: string
}

interface Router {
	route: (request: any) => Promise<HttpBaseResponse>
}

class HttpResponse {
	public static badRequest (error: Error): HttpBaseResponse {
		return {
			status: 400,
			message: error.message,
			error
		}
	}

	public static serverError (): HttpBaseResponse {
		return {
			status: 500,
			message: 'Unexpected error'
		}
	}
}

interface AuthUseCase {
	auth: (loginData: LoginDto) => Promise<string>
}

class AuthUseCaseSpy implements AuthUseCase {
	public accessToken = 'valid_token'
	public password: string = ''
	public username: string = ''

	public async auth ({ username, password }: LoginDto) {
		this.password = password
		this.username = username
		return this.accessToken
	}
}

class InvalidParamError extends Error {
	constructor (fieldName: string) {
		super(`Invalid param: ${fieldName}`)
		this.name = 'InvalidParamError'
	}
}

class MissingParamError extends Error {
	constructor (fieldName: string) {
		super(`Missing param: ${fieldName}`)
		this.name = 'MissingParamError'
	}
}

interface ChainHandler {
	setNext: (handler: ChainHandler) => ChainHandler
	handle: (request: Record<string, unknown>) => any
}

abstract class AbstractChainHandler implements ChainHandler {
	nextHandler: ChainHandler | undefined

	public setNext (chainHandler: ChainHandler) {
		this.nextHandler = chainHandler
		return chainHandler
	}

	public handle (request: Record<string, unknown>) {
		if (this.nextHandler) return this.nextHandler.handle(request)
		return null
	}
}

class PasswordValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { password?: string }) {
		if (!request.password) throw new MissingParamError('password')
		if (request.password.length < 8) throw new InvalidParamError('password')
		return super.handle(request)
	}
}

class UsernameValidatorChainHandler extends AbstractChainHandler {
	public handle (request: { username?: string }) {
		if (!request.username) throw new MissingParamError('username')
		if (request.username.length < 8) throw new InvalidParamError('username')
		return super.handle(request)
	}
}

class LoginRouter implements Router {
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
		expect(httpResponse.message).toBe(new InvalidParamError('username').message)
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
})
