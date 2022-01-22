import { InvalidParamError, MissingParamError } from '../../utils/errors'
import { PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../validations'
import { Crypto } from '../contracts/crypto'
import { Token } from '../contracts/token'
import { UserRepository } from '../contracts/user-repository'
import { LoginDto } from '../dtos/login-dto'
import { User } from '../types/user'
import { AuthUseCase } from './auth-use-case'

class TokenHelperSpy implements Token {
	public payload: undefined | any
	public signReturn: undefined | string
	public sign (payload: any) {
		this.payload = payload
		this.signReturn = 'token'
		return this.signReturn
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
	public async findOneByUsername (_username: string): Promise<User | null | undefined> {
		return this.user
	}

	public async insert (_userData: User): Promise<User> {
		return this.user as User
	}
}

class CryptoSpyWithError implements Crypto {
	public compareParams: undefined | any
	public compareReturn: undefined | boolean

	public async hash (rawString: string) {
		return ''
	}

	public async compare (rawString: string, hashedString: string) {
		this.compareParams = { rawString, hashedString }
		if (rawString !== hashedString) throw new InvalidParamError('username or password is not correct')
		this.compareReturn = true
		return this.compareReturn
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const userRepositorySpy = makeUserRepositorySpy()
	const cryptoSpy = makeCryptoSpy()
	const tokenHelperSpy = makeTokenHelperSpy()
	const sut = new AuthUseCase(validatorChain, userRepositorySpy, cryptoSpy, tokenHelperSpy)
	return { sut, userRepositorySpy, tokenHelperSpy, cryptoSpy }
}

function makeValidatorChain () {
	const usernameValidator = new UsernameValidatorChainHandler()
	const passwordValidator = new PasswordValidatorChainHandler()
	usernameValidator.setNext(passwordValidator)
	return usernameValidator
}

function makeUser () {
	return {
		password: 'valid_password',
		username: 'valid_username',
		email: 'valid_email@mail.com'
	}
}

function makeUserRepositorySpy () {
	const userRepositorySpy = new UserRepositorySpy()
	userRepositorySpy.user = makeUser()
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

		expect(sut.auth(loginDto)).rejects.toEqual(new InvalidParamError('password must be at least 8 characters long'))
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
			username: 'valid_username'
		}

		await sut.auth(loginDto)

		expect(tokenHelperSpy.payload).toEqual({ user: { ...loginDto, email: 'valid_email@mail.com' } })
	})

	it('Should call cryptoHelper with correct params', async () => {
		const { sut, cryptoSpy } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		await sut.auth(loginDto)

		expect(cryptoSpy.compareParams).toEqual({ rawString: loginDto.password, hashedString: loginDto.password })
	})

	it('Should return encoded token when sign is successfull', async () => {
		const { sut, tokenHelperSpy } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		await sut.auth(loginDto)

		expect(tokenHelperSpy.signReturn).toBe('token')
	})

	it('Should return true when compare is successful', async () => {
		const { sut, cryptoSpy } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		await sut.auth(loginDto)

		expect(cryptoSpy.compareReturn).toBe(true)
	})

	it('Should return correct access token successful', async () => {
		const { sut, tokenHelperSpy } = makeSut()
		const loginDto: LoginDto = {
			password: 'valid_password',
			username: 'any_username'
		}

		const accessToken = await sut.auth(loginDto)

		expect(tokenHelperSpy.signReturn).toBe(accessToken)
	})
})
