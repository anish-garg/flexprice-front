import { AxiosClient } from '@/core/axios/verbs';
import Customer from '@/models/Customer';
import { CustomerEntitlement } from '@/models/CustomerEntitlement';
import { PaginationType } from '@/models/Pagination';
import { Subscription } from '@/models/Subscription';
import CustomerUsage from '@/models/CustomerUsage';
interface GetCustomerResponse {
	items: Customer[];
	pagination: PaginationType;
}

interface GetCustomerSubscriptionsResponse {
	items: Subscription[];
	pagination: PaginationType;
}

interface GetCustomerEntitlementsResponse {
	customer_id: string;
	features: CustomerEntitlement[];
}

interface GetCustomerEntitlementPayload {
	customer_id: string;
	feature_id?: string;
}

export interface CreateCustomerSubscriptionPayload {
	customer_id: string;
	billing_cadence: 'RECURRING';
	billing_period: string;
	billing_period_count: number;
	currency: string;
	invoice_cadence: 'ARREAR';
	plan_id: string;
	start_date: string;
	end_date: string | null;
	lookup_key: string;
	trial_end: string | null;
	trial_start: string | null;
}

interface GetUsageSummaryResponse {
	customer_id: string;
	features: CustomerUsage[];
	pagination: PaginationType;
	period: {
		end_time: string;
		period: string;
		start_time: string;
	};
}

class CustomerApi {
	private static baseUrl = '/customers';

	public static async getCustomerById(id: string): Promise<Customer> {
		return await AxiosClient.get(`${this.baseUrl}/${id}`);
	}
	public static async getAllCustomers({ limit = 10, offset = 0 }: PaginationType): Promise<GetCustomerResponse> {
		return await AxiosClient.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
	}

	public static async deleteCustomerById(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}

	public static async createCustomerSubscription(payload: CreateCustomerSubscriptionPayload): Promise<void> {
		return await AxiosClient.post(`/subscriptions`, payload);
	}

	public static async getCustomerSubscriptions(id: string): Promise<GetCustomerSubscriptionsResponse> {
		return await AxiosClient.get(`/subscriptions?customer_id=${id}`);
	}

	public static async getCustomerSubscriptionById(id: string): Promise<Subscription> {
		return await AxiosClient.get(`/subscriptions/${id}`);
	}

	public static async createCustomer(customer: Partial<Customer>): Promise<Customer> {
		return await AxiosClient.post(`${this.baseUrl}`, customer);
	}
	public static async updateCustomer(customer: Partial<Customer>, id: string): Promise<Customer> {
		return await AxiosClient.put(`${this.baseUrl}/${id}`, customer);
	}

	public static async getEntitlements(payload: GetCustomerEntitlementPayload): Promise<GetCustomerEntitlementsResponse> {
		return await AxiosClient.get(`${this.baseUrl}/${payload.customer_id}/entitlements`);
	}

	public static async getUsageSummary(payload: GetCustomerEntitlementPayload): Promise<GetUsageSummaryResponse> {
		return await AxiosClient.get(`${this.baseUrl}/${payload.customer_id}/usage`);
	}
}

export default CustomerApi;
