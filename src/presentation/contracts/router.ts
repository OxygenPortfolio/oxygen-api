import { HttpBaseResponse } from '../types/http-base-response'

export interface Router {
	route (request: any): Promise<HttpBaseResponse>
}
