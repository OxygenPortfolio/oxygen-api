import { ArgonCrypto } from '../../../infra/argon-crypto'

export class CryptoHelperFactory {
	public static make () {
		const cryptoHelper = new ArgonCrypto()
		return cryptoHelper
	}
}
