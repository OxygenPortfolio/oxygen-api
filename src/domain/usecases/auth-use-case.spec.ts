import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../validations'
import { AuthUseCase as BaseAuthUseCase } from '../contracts/auth-use-case'
import { ChainHandler } from '../contracts/chain-handler'
import { LoginDto } from '../dtos/login-dto'

class AuthUseCase implements BaseAuthUseCase {
	constructor (private readonly validatorChain: ChainHandler) {}

	public async auth ({ username, password }: LoginDto) {
		this.validatorChain.handle({ username, password })
		return 'token'
	}
}

function makeSut () {
	const usernameValidator = new UsernameValidatorChainHandler()
	const passwordValidator = new PasswordValidatorChainHandler()
	usernameValidator.setNext(passwordValidator)
	const sut = new AuthUseCase(usernameValidator)
	return sut
}

describe('AuthUseCase', () => {
	test('Should throw if invalid username is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: ''
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new MissingParamError('username'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	test('Should throw if invalid password is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: '',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new MissingParamError('password'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	test('Should throw if short username is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: 'ab'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('username must be at least 3 characters long'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	test('Should throw if short password is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: 'short',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('password'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	test('Should throw if too long username is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: 'too_long_username_provided'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('username must be at most 24 characters long'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	test('Should return an access token valid data is provided', async () => {
		const sut = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'valid_username'
		}

		const accessToken = await sut.auth(loginDto)

		expect(accessToken).toBeTruthy()
		expect(accessToken).toBeDefined()
	})
})
