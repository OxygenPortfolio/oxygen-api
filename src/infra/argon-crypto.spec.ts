import { Crypto } from '../domain/contracts/crypto'
import argon2 from 'argon2'

class CryptoError extends Error {
	constructor (message: string) {
		super(message)
		this.name = 'CryptoError'
	}
}

class ArgonCrypto implements Crypto {
	async compare (rawString: string, hashedString: string): Promise<boolean> {
		try {
			return await argon2.verify(hashedString, rawString)
		} catch (_) {
			throw new CryptoError('Plain string doesn\'t match hashed string')
		}
	}

	async hash (rawString: string): Promise<string> {
		return ''
	}
}

function makeSut () {
	const sut = new ArgonCrypto()
	return { sut }
}

describe('ArgonCrypto', () => {
	it('Should return true if argon returns true', async () => {
		const { sut } = makeSut()
		const rawString = 'any_string'
		const hashedString = 'any_string'

		const isValid = await sut.compare(rawString, hashedString)

		expect(isValid).toBe(true)
	})

	it('Should throw an error if hash don\'t match', async () => {
		const { sut } = makeSut()
		const rawString = 'any_string'
		const hashedString = 'wrong_string'

		expect(sut.compare(rawString, hashedString)).rejects.toThrow()
		expect(sut.compare(rawString, hashedString)).rejects.toEqual(new CryptoError('Plain string doesn\'t match hashed string'))
	})
})
