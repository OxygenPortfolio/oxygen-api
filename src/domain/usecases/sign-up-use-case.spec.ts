import { InvalidParamError } from '../../utils/errors'
import { DatabaseError } from '../../utils/errors/database-error'
import { PasswordValidatorChainHandler, UsernameValidatorChainHandler, EmailValidatorChainHandler } from '../../validations'
import { UserRepository } from '../contracts/user-repository'
import { SignUpDto } from '../dtos/sign-up-dto'
import { User } from '../types/user'
import { SignUpUseCase } from './sign-up-use-case'

class UserRepositorySpy implements UserRepository {
	public user = makeUser()
	public async findOneByUsername (_username: string): Promise<User | null | undefined> {
		return this.user
	}

	public async insert (userData: User): Promise<User | undefined> {
		if (userData.username === 'registered_user') throw new DatabaseError(`user with username ${userData.username} is already registered`)
		return this.user
	}
}

function makeSut () {
	const validatorChain = makeValidatorChain()
	const userRepository = makeUserRepository()
	const sut = new SignUpUseCase(validatorChain, userRepository)
	return { sut }
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

function makeUserRepository () {
	const userRepository = new UserRepositorySpy()
	return userRepository
}

function makeUser (): SignUpDto {
	return {
		username: 'valid_username',
		password: 'valid_password',
		email: 'valid_email@mail.com'
	}
}

describe('SignUpUseCase', () => {
	it('Should return registered user with valid data', async () => {
		const { sut } = makeSut()
		const signUpDto = makeUser()

		const user = await sut.signUp(signUpDto)

		expect(user).toBeDefined()
		expect(user).toEqual(signUpDto)
	})

	it('Should throw if username is too short', async () => {
		const { sut } = makeSut()
		const { password, email } = makeUser()
		const signUpDto = {
			password,
			email,
			username: 'aa'
		}

		expect(sut.signUp(signUpDto)).rejects.toThrow()
		expect(sut.signUp(signUpDto)).rejects.toEqual(new InvalidParamError('username must be at least 3 characters long'))
	})

	it('Should throw if username is too long', async () => {
		const { sut } = makeSut()
		const { password, email } = makeUser()
		const signUpDto = {
			password,
			email,
			username: 'too_long_username_provided'
		}

		expect(sut.signUp(signUpDto)).rejects.toThrow()
		expect(sut.signUp(signUpDto)).rejects.toEqual(new InvalidParamError('username must be at most 24 characters long'))
	})

	it('Should throw if password is too short', async () => {
		const { sut } = makeSut()
		const { username, email } = makeUser()
		const signUpDto = {
			password: 'short',
			email,
			username
		}

		expect(sut.signUp(signUpDto)).rejects.toThrow()
		expect(sut.signUp(signUpDto)).rejects.toEqual(new InvalidParamError('password must be at least 8 characters long'))
	})

	it('Should throw if email is invalid', async () => {
		const { sut } = makeSut()
		const { password, username } = makeUser()
		const signUpDto = {
			password,
			email: 'invalid_email',
			username
		}

		expect(sut.signUp(signUpDto)).rejects.toThrow()
		expect(sut.signUp(signUpDto)).rejects.toEqual(new InvalidParamError('email must be a valid email'))
	})

	it('Should throw user already exists', async () => {
		const { sut } = makeSut()
		const { password, email } = makeUser()
		const signUpDto = {
			username: 'registered_user',
			email,
			password
		}

		expect(async () => { await sut.signUp(signUpDto) }).rejects.toThrow()
		expect(async () => { await sut.signUp(signUpDto) }).rejects.toEqual(new DatabaseError(`user with username ${signUpDto.username} is already registered`))
	})
})
