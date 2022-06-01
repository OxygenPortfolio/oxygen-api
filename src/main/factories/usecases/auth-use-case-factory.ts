import { AuthUseCase } from '../../../domain/usecases/auth-use-case'
import { CryptoHelperFactory } from '../helpers/crypto-helper-factory'
import { TokenHelperFactory } from '../helpers/token-helper-factory'
import { UserRepositoryFactory } from '../repositories/user-repository-factory'
import { LoginValidationFactory } from '../validations/login-validation-factory'

export class AuthUseCaseFactory {
	public static make () {
		const useCase = new AuthUseCase(
			LoginValidationFactory.make(),
			UserRepositoryFactory.make(),
			CryptoHelperFactory.make(),
			TokenHelperFactory.make()
		)
		return useCase
	}
}
