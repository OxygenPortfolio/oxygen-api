import { SignUpDto } from '../dtos/sign-up-dto'

export interface SignUpUseCase {
	signUp(signUpData: SignUpDto): Promise<string>
}
