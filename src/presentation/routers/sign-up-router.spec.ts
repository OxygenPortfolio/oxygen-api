import { SignUpDto } from '../../domain/dtos/sign-up-dto'
import { SignUpUseCase } from '../../domain/contracts/sign-up-use-case'
import { EmailValidatorChainHandler, PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../validations'
import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { SignUpRouter } from './sign-up-router'

class SignUpUseCaseSpy implements SignUpUseCase {
	public params: SignUpDto
	public return: string

	public async signUp ({ username, password, email }: SignUpDto): Promise<string> {
		this.params = { username, password, email }
		this.return = 'valid_token'
		return this.return
	}
}

class SignUpRouterWithErrorSpy {
	public async route () {
		throw new Error()
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const signUpUseCase = makeSignUpUseCase()
	const sut = new SignUpRouter(validatorChain, signUpUseCase)
	return { sut, signUpUseCase }
}

function makeSignUpUseCase () {
	const signUpUseCase = new SignUpUseCaseSpy()
	signUpUseCase.return = 'valid_token'
	signUpUseCase.params = makeUser()
	return signUpUseCase
}

function makeUser (): SignUpDto {
	return {
		username: 'valid_username',
		password: 'valid_password',
		email: 'valid_email@mail.com'
	}
}

function makeValidatorChain () {
	const usernameValidator = new UsernameValidatorChainHandler()
	const passwordValidator = new PasswordValidatorChainHandler()
	const emailValidator = new EmailValidatorChainHandler()
	usernameValidator
		.setNext(passwordValidator)
		.setNext(emailValidator)
	return usernameValidator
}

describe('SignUpRouter', () => {
	it('Should return status 201 if user is registered successfully', async () => {
		const { sut } = makeSut()
		const user = makeUser()

		const response = await sut.route(user)

		expect(response.status).toBe(201)
	})

	it('Should return status 400 if username is invalid', async () => {
		const { sut } = makeSut()
		const user = {
			username: '',
			password: 'valid_password',
			email: 'valid_email@mail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new MissingParamError('username'))
	})

	it('Should return status 400 if username is too short', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'sh',
			password: 'valid_password',
			email: 'valid_email@mail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new InvalidParamError('username must be at least 3 characters long'))
	})

	it('Should return status 400 if username is too long', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'too_long_username_provided',
			password: 'valid_password',
			email: 'valid_email@mail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new InvalidParamError('username must be at most 24 characters long'))
	})

	it('Should return status 400 if password is invalid', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'valid_username',
			password: '',
			email: 'valid_email@mail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new MissingParamError('password'))
	})

	it('Should return status 400 if password is too short', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'valid_username',
			password: 'short',
			email: 'valid_email@mail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new InvalidParamError('password must be at least 8 characters long'))
	})

	it('Should return status 400 if email is invalid', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'valid_username',
			password: 'valid_password',
			email: ''
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new MissingParamError('email'))
	})

	it('Should return status 400 if email is malformed', async () => {
		const { sut } = makeSut()
		const user = {
			username: 'valid_username',
			password: 'valid_password',
			email: 'malformedmail.com'
		}

		const response = await sut.route(user)

		expect(response.status).toBe(400)
		expect(response.error).toEqual(new InvalidParamError('email must be a valid email'))
	})

	it('Should throw if an unexpected error occurres', async () => {
		const sut = new SignUpRouterWithErrorSpy()

		expect(async () => { await sut.route() }).rejects.toThrow()
	})

	it('Should call signUp Use Case with correct params', async () => {
		const { sut, signUpUseCase } = makeSut()
		const user = makeUser()

		await sut.route(user)

		expect(signUpUseCase.return).toEqual(signUpUseCase.return)
		expect(signUpUseCase.params).toEqual(user)
	})

	it('Should call signUp Use Case with correct params', async () => {
		const { sut, signUpUseCase } = makeSut()
		const user = makeUser()

		await sut.route(user)

		expect(signUpUseCase.return).toEqual('valid_token')
		expect(signUpUseCase.params).toEqual(user)
	})

	it('Should return correct access token with valid data', async () => {
		const { sut, signUpUseCase } = makeSut()
		const user = makeUser()

		const accessToken = await sut.route(user)

		expect(accessToken.data.accessToken).toEqual(signUpUseCase.return)
	})
})
