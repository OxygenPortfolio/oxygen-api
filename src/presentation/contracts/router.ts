import { HttpBaseResponse } from '../types/http-base-response'

export interface Router {
	route (request: unknown): Promise<HttpBaseResponse>
}
