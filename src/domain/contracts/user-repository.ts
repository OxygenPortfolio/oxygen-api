import { User } from '../types/user'

export interface UserRepository {
	findOneByUsername(username: string): Promise<User | null | undefined>
}
