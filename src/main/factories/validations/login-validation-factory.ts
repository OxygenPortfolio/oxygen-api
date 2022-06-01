import { PasswordValidatorChainHandler, UsernameValidatorChainHandler } from '../../../validations'

export class LoginValidationFactory {
	public static make () {
		const usernameValidator = new UsernameValidatorChainHandler()
		const passwordValidator = new PasswordValidatorChainHandler()
		usernameValidator.setNext(passwordValidator)
		return usernameValidator
	}
}
