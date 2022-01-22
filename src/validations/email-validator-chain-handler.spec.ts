import { InvalidParamError, MissingParamError } from '../utils/errors'
import { EmailValidatorChainHandler } from './email-validator-chain-handler'

function makeSut () {
	const sut = new EmailValidatorChainHandler()
	return { sut }
}

describe('EmaiLValidatorChainHandler', () => {
	it('should throw if email is not provided', () => {
		const { sut } = makeSut()

		expect(() => { sut.handle({}) }).toThrow(new MissingParamError('email'))
	})

	it('should throw if email is invalid', () => {
		const { sut } = makeSut()
		const invalidEmail = { email: 'invalid_email' }

		expect(() => { sut.handle(invalidEmail) }).toThrow(new InvalidParamError('email must be a valid email'))
	})

	it('should not throw email is valid', () => {
		const { sut } = makeSut()
		const invalidEmail = { email: 'valid_email@mail.com' }

		expect(() => { sut.handle(invalidEmail) }).not.toThrow()
	})
})
