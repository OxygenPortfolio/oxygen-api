import { LoginDto } from '../dtos/login-dto'

export interface AuthUseCase {
	auth(loginData: LoginDto): Promise<unknown>
}
