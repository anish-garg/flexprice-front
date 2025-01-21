import { Price } from '@/models/Price';
import { getCurrencySymbol } from '../common/helper_functions';
import { ChargesForBillingPeriodOne } from '@/components/organisms/Subscription/PriceTable';

export type PriceTier = {
	flat_amount: number;
	unit_amount: number;
	up_to: number;
};

export interface ExpandedPlan {
	readonly id: string;
	readonly name: string;
	readonly lookup_key: string;
	readonly description: string;
	readonly invoice_cadence: string;
	readonly trial_period: number;
	readonly tenant_id: string;
	readonly status: string;
	readonly created_at: Date;
	readonly updated_at: Date;
	readonly created_by: string;
	readonly updated_by: string;
	readonly prices: Price[] | null;
}

export type NormalizedPlan = {
	id: string;
	name: string;
	charges: {
		[billingPeriod: string]: {
			[currency: string]: {
				name: string;
				price_id: string;
				amount: string;
				display_amount: string;
				currency: string;
				transform_quantity: { divide_by: number };
				type: string;
				billing_model: string;
				billing_period: string;
				meter_name: string | undefined;
				tiers: PriceTier[];
			}[];
		};
	};
};

export const normalizePlan = (originalData: ExpandedPlan): NormalizedPlan => {
	const { id, name, prices } = originalData;

	const charges: NormalizedPlan['charges'] = {};

	for (const price of prices ?? []) {
		const billingPeriod = price.billing_period.toLowerCase();
		const currency = price.currency.toLowerCase();

		// Ensure the structure exists for the billing period
		if (!charges[billingPeriod]) {
			charges[billingPeriod] = {};
		}

		// Ensure the structure exists for the currency
		if (!charges[billingPeriod][currency]) {
			charges[billingPeriod][currency] = [];
		}

		// Append the charge to the currency-specific array
		charges[billingPeriod][currency].push({
			name,
			price_id: price.id,
			amount: price.amount,
			display_amount: price.display_amount,
			currency: getCurrencySymbol(price.currency),
			transform_quantity: price.transform_quantity['divide_by'] || 0,
			type: price.type,
			billing_period: price.billing_period.toLowerCase(),
			billing_model: price.billing_model,
			tiers: price.tiers ?? [],
			meter_name: price.meter?.name,
		});
	}

	return {
		id,
		name,
		charges,
	};
};

export const getPriceTableCharge = (charge: ChargesForBillingPeriodOne) => {
	if (charge.type === 'FIXED') {
		return `${charge.display_amount}`;
	} else {
		if (charge.billing_model === 'PACKAGE') {
			return `${charge.display_amount} / ${charge.transform_quantity.divide_by} units`;
		} else if (charge.billing_model === 'FLAT_FEE') {
			return `${charge.display_amount} / unit`;
		} else if (charge.billing_model === 'TIERED') {
			return `Starts at ${getCurrencySymbol(charge.currency)}${charge.tiers[0].unit_amount} / unit`;
		} else {
			return `${charge.display_amount}`;
		}
	}
};

export const getActualPriceForTotal = (charge: ChargesForBillingPeriodOne) => {
	let result = 0;
	if (charge.billing_model === 'PACKAGE') {
		result = parseFloat(charge.amount);
	} else if (charge.billing_model === 'TIERED') {
		result = parseFloat(String(charge.tiers[0].flat_amount));
	} else {
		result = parseFloat(charge.amount);
	}

	return result;
};
