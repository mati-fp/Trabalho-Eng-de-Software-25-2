/**
 * Companies API Payload Types
 * Request payloads for company-related API calls
 */

import { CreateUserPayload } from "../users/users.payloads";

export interface CreateCompanyPayload {
  user: CreateUserPayload;
  roomId: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

