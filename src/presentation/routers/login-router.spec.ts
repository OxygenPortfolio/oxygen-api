type HttpResponse<TData> = {
	status: number
	data?: TData
	error?: Error
	message?: string
}

type LoginDto = {
	username: string
	password: string
}

interface Router {
	route: (request: any) => Promise<HttpResponse<unknown>>
}

class LoginRouter implements Router {
	async route (request: LoginDto): Promise<HttpResponse<unknown>> {
		if (!request || !request.username || !request.password) {
			return { status: 400 }
		}
		if (request.username.length < 3) {
			return { status: 400 }
		}

		if (request.password.length < 8) {
			return { status: 400 }
		}

		return { status: 200 }
	}
}

function makeSut () {
	const sut = new LoginRouter()
	return { sut }
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
})
