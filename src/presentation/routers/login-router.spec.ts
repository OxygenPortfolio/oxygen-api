type HttpResponse = {
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
	route: (request: any) => Promise<HttpResponse>
}

class HttpErrorResponse {
	public static badRequest (): HttpResponse {
		return {
			status: 400
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

class LoginRouter implements Router {
	constructor (private readonly authUseCase: AuthUseCase) { }

	public async route (request: LoginDto): Promise<HttpResponse> {
		try {
			const { username, password } = request
			if (username.length < 3) {
				return HttpErrorResponse.badRequest()
			}

			if (password.length < 8) {
				return HttpErrorResponse.badRequest()
			}

			const accessToken = await this.authUseCase.auth({ username, password })

			return { status: 200, data: { accessToken } }
		} catch (err) {
			return HttpErrorResponse.badRequest()
		}
	}
}

function makeSut () {
	const authUseCase = makeAuthUseCase()
	const sut = new LoginRouter(authUseCase)
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
	})

	it('Should return status 400 if invalid password is provided', async () => {
		const { sut } = makeSut()
		const httpRequest = {
			username: 'any_username',
			password: ''
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
	})

	it('Should return status 400 if empty request body is provided', async () => {
		const { sut } = makeSut()
		const httpRequest: LoginDto = {
			username: '',
			password: ''
		}

		const httpResponse = await sut.route(httpRequest)

		expect(httpResponse.status).toBe(400)
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
})
