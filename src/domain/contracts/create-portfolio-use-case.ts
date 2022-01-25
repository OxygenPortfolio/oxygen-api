import { CreatePortfolioDto } from '../dtos/create-portfolio-dto'

export interface CreatePortfolioUseCase {
	create(portfolioDto: CreatePortfolioDto): Promise<unknown>
}
