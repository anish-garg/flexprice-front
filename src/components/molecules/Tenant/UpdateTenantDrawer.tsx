import { Button, Input, Select, SelectOption, Sheet, Spacer } from '@/components/atoms';
import { FC, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Country, State, City, IState } from 'country-state-city';
import { z } from 'zod';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { logger } from '@/utils/common/Logger';
import { User } from '@/models/User';
import { UserApi } from '@/api/UserApi';

// Types and Interfaces
interface Address {
	address_line1: string;
	address_line2: string;
	address_city: string;
	address_state: string;
	address_postal_code: string;
	address_country: string;
}

// API Types
type ApiAddress = Partial<Address>;

interface ApiBillingDetails {
	address?: ApiAddress;
	email?: string;
	help_email?: string;
	phone?: string;
}

// The type that UserApi.updateUser expects
interface ApiUpdateTenantPayload {
	billing_details?: ApiBillingDetails;
	name: string;
}

// The type that UserApi.updateUser expects
interface UserApiUpdateTenantPayload {
	billing_details: {
		address: {
			address_line1: string;
			address_line2: string;
			address_city: string;
			address_state: string;
			address_postal_code: string;
			address_country: string;
		};
		email?: string;
		help_email?: string;
		phone?: string;
	};
	name: string;
}

// Form State Types
interface FormState {
	billing_details: {
		address: {
			address_line1: string;
			address_line2: string;
			address_city: string;
			address_state: string;
			address_postal_code: string;
			address_country: string;
		};
	};
	name: string;
}

interface Props {
	data?: User;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
}

// Validation Schema
const tenantSchema = z.object({
	name: z.string().min(1, 'Organization name is required'),
	billing_details: z
		.object({
			address: z
				.object({
					address_line1: z.string().optional(),
					address_line2: z.string().optional(),
					address_city: z.string().optional(),
					address_state: z.string().optional(),
					address_postal_code: z.string().optional(),
					address_country: z.string().optional(),
				})
				.optional(),
			email: z.string().email().optional(),
			help_email: z.string().email().optional(),
			phone: z.string().optional(),
		})
		.optional(),
});

// Custom Hook for Form Management
const useUpdateTenantForm = (initialData?: User) => {
	const [formData, setFormData] = useState<FormState>({
		billing_details: {
			address: {
				address_line1: initialData?.tenant?.billing_details?.address?.address_line1 || '',
				address_line2: initialData?.tenant?.billing_details?.address?.address_line2 || '',
				address_city: initialData?.tenant?.billing_details?.address?.address_city || '',
				address_state: initialData?.tenant?.billing_details?.address?.address_state || '',
				address_postal_code: initialData?.tenant?.billing_details?.address?.address_postal_code || '',
				address_country: initialData?.tenant?.billing_details?.address?.address_country || '',
			},
		},
		name: initialData?.tenant?.name || '',
	});
	const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
	const [activeState, setActiveState] = useState<IState>();

	useEffect(() => {
		if (initialData?.tenant?.billing_details) {
			setFormData({
				billing_details: {
					...initialData.tenant.billing_details,
					address: {
						...initialData.tenant.billing_details.address,
					},
				},
				name: initialData.tenant.name,
			});

			if (initialData.tenant.billing_details.address.address_country && initialData.tenant.billing_details.address.address_state) {
				const stateObj = State.getStatesOfCountry(initialData.tenant.billing_details.address.address_country).find(
					(state) => state.name === initialData.tenant.billing_details.address.address_state,
				);
				if (stateObj) {
					setActiveState(stateObj);
				}
			}
		}
	}, [initialData]);

	const handleChange = (path: string, value: string) => {
		setFormData((prev) => {
			const newData = { ...prev };
			const keys = path.split('.');
			let current: any = newData;
			for (let i = 0; i < keys.length - 1; i++) {
				if (!current[keys[i]]) {
					current[keys[i]] = {};
				}
				current = current[keys[i]];
			}
			current[keys[keys.length - 1]] = value;
			return newData;
		});
	};

	const validateForm = () => {
		const result = tenantSchema.safeParse(formData);
		if (!result.success) {
			const newErrors: Partial<Record<string, string>> = {};
			result.error.errors.forEach((error) => {
				const path = error.path.join('.');
				newErrors[path] = error.message;
			});
			setErrors(newErrors);
			return false;
		}
		setErrors({});
		return true;
	};

	const preparePayload = (): ApiUpdateTenantPayload => {
		const payload: ApiUpdateTenantPayload = {
			name: formData.name,
		};

		// Only include non-empty fields in the payload
		const address: ApiAddress = {};
		Object.entries(formData.billing_details.address).forEach(([key, value]) => {
			if (value) {
				address[key as keyof Address] = value;
			}
		});

		if (Object.keys(address).length > 0) {
			payload.billing_details = {
				address,
			};
		}

		return payload;
	};

	return {
		formData,
		errors,
		activeState,
		setActiveState,
		handleChange,
		validateForm,
		preparePayload,
	};
};

// Location Options Helper
const getLocationOptions = (
	country?: string,
	stateCode?: string,
): { countriesOptions: SelectOption[]; statesOptions: SelectOption[]; citiesOptions: SelectOption[] } => {
	const countriesOptions: SelectOption[] = Country.getAllCountries().map(({ name, isoCode }) => ({ label: name, value: isoCode }));

	const statesOptions: SelectOption[] = country
		? State.getStatesOfCountry(country).map(({ name, isoCode }) => ({ label: name, value: isoCode }))
		: [];

	const citiesOptions: SelectOption[] =
		country && stateCode ? City.getCitiesOfState(country, stateCode).map(({ name }) => ({ label: name, value: name })) : [];

	return { countriesOptions, statesOptions, citiesOptions };
};

// Main Component
const UpdateTenantDrawer: FC<Props> = ({ data, onOpenChange, open, trigger }) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = open !== undefined && onOpenChange !== undefined;
	const currentOpen = isControlled ? open : internalOpen;

	const { formData, errors, activeState, setActiveState, handleChange, validateForm, preparePayload } = useUpdateTenantForm(data);

	const { countriesOptions, statesOptions, citiesOptions } = getLocationOptions(
		formData.billing_details?.address?.address_country,
		activeState?.isoCode,
	);

	const { mutate: updateTenant, isPending } = useMutation({
		mutationFn: async () => {
			if (!data?.tenant?.id) throw new Error('Tenant ID is required');
			const apiPayload = preparePayload();

			// Convert the API payload to the format expected by UserApi.updateUser
			const payload: UserApiUpdateTenantPayload = {
				name: apiPayload.name,
				billing_details: {
					address: {
						address_line1: apiPayload.billing_details?.address?.address_line1 || '',
						address_line2: apiPayload.billing_details?.address?.address_line2 || '',
						address_city: apiPayload.billing_details?.address?.address_city || '',
						address_state: apiPayload.billing_details?.address?.address_state || '',
						address_postal_code: apiPayload.billing_details?.address?.address_postal_code || '',
						address_country: apiPayload.billing_details?.address?.address_country || '',
					},
					email: apiPayload.billing_details?.email,
					help_email: apiPayload.billing_details?.help_email,
					phone: apiPayload.billing_details?.phone,
				},
			};

			return await UserApi.updateUser(payload);
		},
		onSuccess: async () => {
			await refetchQueries(['user']);
			toast.success('Tenant details updated successfully');
			toggleOpen();
		},
		onError: (error: ServerError) => {
			logger.error(error);
			toast.error(error.error.message || 'Failed to update tenant details. Please try again.');
		},
	});

	const toggleOpen = (open?: boolean) => {
		if (isControlled) {
			onOpenChange?.(open ?? false);
		} else {
			setInternalOpen((prev) => !prev);
		}
	};

	const handleSubmit = () => {
		if (validateForm()) {
			updateTenant();
		}
	};

	const isCtaDisabled = !formData.name;

	return (
		<div>
			<Sheet
				isOpen={currentOpen}
				onOpenChange={toggleOpen}
				title='Update Tenant Details'
				description='Update your billing address details.'
				trigger={trigger}>
				<div className='space-y-4'>
					<Spacer className='!h-4' />
					<Input
						label='Organization Name'
						placeholder='Enter your organization name'
						value={formData.name}
						onChange={(e) => handleChange('name', e)}
						error={errors['name']}
					/>
					<Spacer className='!h-4' />
					<div className='relative card !p-4'>
						<span className='absolute -top-4 left-2 text-[#18181B] text-sm bg-white font-medium px-2 py-1'>Billing Details</span>
						<div className='space-y-4'>
							<Select
								label='Country'
								placeholder='Select Country'
								options={countriesOptions}
								value={formData.billing_details?.address?.address_country}
								noOptionsText='No countries Available'
								onChange={(e) => {
									handleChange('billing_details.address.address_country', e);
									handleChange('billing_details.address.address_state', '');
									handleChange('billing_details.address.address_city', '');
									setActiveState(undefined);
								}}
								error={errors['billing_details.address.address_country']}
							/>
							<Input
								label='Address Line 1'
								placeholder='Street address, P.O. box, company name, c/o'
								value={formData.billing_details?.address?.address_line1}
								onChange={(e) => handleChange('billing_details.address.address_line1', e)}
								error={errors['billing_details.address.address_line1']}
							/>
							<Input
								label='Address Line 2'
								placeholder='Apartment, suite, unit, building, floor, etc.'
								value={formData.billing_details?.address?.address_line2}
								onChange={(e) => handleChange('billing_details.address.address_line2', e)}
								error={errors['billing_details.address.address_line2']}
							/>

							<div className='grid grid-cols-2 gap-4'>
								<Select
									label='State'
									placeholder='Select State'
									options={statesOptions}
									value={formData.billing_details?.address?.address_state}
									onChange={(e) => {
										handleChange('billing_details.address.address_state', e);
										handleChange('billing_details.address.address_city', '');
										const selectedState = e
											? State.getStateByCodeAndCountry(e, formData.billing_details?.address?.address_country)
											: undefined;
										setActiveState(selectedState || undefined);
									}}
									noOptionsText='No states Available'
									error={errors['billing_details.address.address_state']}
								/>
								<Select
									label='City'
									options={citiesOptions}
									value={formData.billing_details?.address?.address_city}
									placeholder='Select City'
									noOptionsText='No cities Available'
									onChange={(e) => handleChange('billing_details.address.address_city', e)}
									error={errors['billing_details.address.address_city']}
								/>
							</div>

							<Input
								label='Postal Code'
								placeholder='Enter Postal Code'
								value={formData.billing_details?.address?.address_postal_code}
								onChange={(e) => handleChange('billing_details.address.address_postal_code', e)}
								error={errors['billing_details.address.address_postal_code']}
							/>
						</div>
					</div>

					<Spacer className='!h-4' />
					<Button isLoading={isPending} disabled={isPending || isCtaDisabled} onClick={handleSubmit}>
						{isPending ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</Sheet>
		</div>
	);
};

export default UpdateTenantDrawer;
