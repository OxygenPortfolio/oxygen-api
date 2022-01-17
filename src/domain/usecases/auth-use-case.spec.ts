import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../validations'
import { AuthUseCase as BaseAuthUseCase } from '../contracts/auth-use-case'
import { ChainHandler } from '../contracts/chain-handler'
import { Crypto } from '../contracts/crypto'
import { Token } from '../contracts/token'
import { LoginDto } from '../dtos/login-dto'

type User = {
	password: string
}

interface UserRepository {
	findOneByUsername: (username: string) => Promise<User | null | undefined>
}

class TokenHelperSpy implements Token {
	public payload: undefined | any
	public sign (payload: any) {
		this.payload = payload
		return ''
	}
}

class TokenHelperSpyWithError {
	public sign (payload: any) {
		throw new Error()
		return ''
	}
}

class UserRepositorySpy implements UserRepository {
	public user: null | undefined | User
	public async findOneByUsername (username: string) {
		return this.user
	}
}

class CryptoSpyWithError implements Crypto {
	public hash (rawString: string) {
		return ''
	}

	public compare (rawString: string, hashedString: string) {
		if (rawString !== hashedString) throw new InvalidParamError('username or password is not correct')
		return true
	}
}

class AuthUseCase implements BaseAuthUseCase {
	constructor (
		private readonly validatorChain: ChainHandler,
		private readonly userRepository: UserRepository,
		private readonly cryptoHelper: Crypto,
		private readonly tokenHelper: Token
	) {}

	public async auth ({ username, password }: LoginDto) {
		this.validatorChain.handle({ username, password })
		const user = await this.userRepository.findOneByUsername(username)
		if (!user) return null
		this.cryptoHelper.compare(password, user.password)
		this.tokenHelper.sign({ user })
		return 'token'
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const userRepositorySpy = makeUserRepositorySpy()
	const cryptoSpy = makeCryptoSpy()
	const tokenHelperSpy = makeTokenHelperSpy()
	const sut = new AuthUseCase(validatorChain, userRepositorySpy, cryptoSpy, tokenHelperSpy)
	return { sut, userRepositorySpy, tokenHelperSpy }
}

function makeValidatorChain () {
	const usernameValidator = new UsernameValidatorChainHandler()
	const passwordValidator = new PasswordValidatorChainHandler()
	usernameValidator.setNext(passwordValidator)
	return usernameValidator
}

function makeUserRepositorySpy () {
	const userRepositorySpy = new UserRepositorySpy()
	userRepositorySpy.user = { password: 'valid_password' }
	return userRepositorySpy
}

function makeCryptoSpy () {
	const cryptoSpy = new CryptoSpyWithError()
	return cryptoSpy
}

function makeTokenHelperSpy () {
	const tokenHelperSpy = new TokenHelperSpy()
	return tokenHelperSpy
}

function makeTokenHelperWithErrorSpy () {
	const tokenHelperSpy = new TokenHelperSpyWithError()
	return tokenHelperSpy
}

describe('AuthUseCase', () => {
	it('Should throw if invalid username is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: ''
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new MissingParamError('username'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should throw if invalid password is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: '',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new MissingParamError('password'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should throw if short username is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: 'ab'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('username must be at least 3 characters long'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should throw if short password is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'short',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('password'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should return an access token when valid data is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'valid_username'
		}

		const accessToken = await sut.auth(loginDto)

		expect(accessToken).toBeTruthy()
		expect(accessToken).toBeDefined()
	})

	it('Should return null if theres no user registered with provided username', async () => {
		const { sut, userRepositorySpy } = makeSut()
		userRepositorySpy.user = null
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'incorrect_username'
		}

		const accessToken = await sut.auth(loginDto)
		expect(accessToken).toBeNull()
		expect(userRepositorySpy.user).toBeNull()
		expect(userRepositorySpy.user).toBe(accessToken)
	})

	it('Should throw if too long username is provided', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'any_password',
			username: 'too_long_username_provided'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('username must be at most 24 characters long'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should return invalid param error if user is found but password is incorrect', async () => {
		const { sut } = makeSut()
		const loginDto: LoginDto = {
			password: 'wrong_password',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('username or password is not correct'))
		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should throw if tokenHelper fails', async () => {
		const validatorChain = makeValidatorChain()
		const userRepository = makeUserRepositorySpy()
		const cryptoHelperSpy = makeCryptoSpy()
		const tokenHelperSpy = makeTokenHelperWithErrorSpy()
		const sut = new AuthUseCase(validatorChain, userRepository, cryptoHelperSpy, tokenHelperSpy)
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		expect(sut.auth(loginDto)).rejects.toThrow()
	})

	it('Should call tokenHelper with correct params', async () => {
		const { sut, tokenHelperSpy } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		await sut.auth(loginDto)

		expect(tokenHelperSpy.payload).toEqual({ user: { password: loginDto.password } })
	})
})
