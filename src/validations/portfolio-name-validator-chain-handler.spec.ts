import { InvalidParamError, MissingParamError } from '../utils/errors'
import { PortfolioNameValidatorChainHandler } from './portfolio-name-validator-chain-handler'

function makeSut () {
	const sut = new PortfolioNameValidatorChainHandler()
	return { sut }
}

describe('PasswordValidatorChainHandler', () => {
	it('Should throw if name is too long', () => {
		const { sut } = makeSut()
		const data = { name: '______________________too_long_____________________' }

		expect(() => { sut.handle(data) }).toThrow(new InvalidParamError('name must be at most 50 characters long'))
	})

	it('Should throw if password is not provided', () => {
		const { sut } = makeSut()
		const data = { }

		expect(() => { sut.handle(data) }).toThrow(new MissingParamError('name'))
	})

	it('Should not throw if password is valid', () => {
		const { sut } = makeSut()
		const data = { name: 'valid_name' }

		expect(() => { sut.handle(data) }).not.toThrow()
	})
})
