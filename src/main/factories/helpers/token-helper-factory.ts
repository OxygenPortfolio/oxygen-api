import { JwtToken } from '../../../infra/jwt-token'

export class TokenHelperFactory {
	public static make () {
		const tokenHelper = new JwtToken()
		return tokenHelper
	}
}
