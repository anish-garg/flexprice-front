import { Label } from '@/components/ui/label';
import { FormHeader, Spacer } from '..';
import { Switch } from '@/components/ui/switch';
import { FC } from 'react';
interface Props {
	onChange: (value: boolean) => void;
	checked: boolean;
	title?: string;
	label?: string;
	description?: string;
	error?: string;
}

const Toggle: FC<Props> = ({ onChange, checked, description, error, label, title }) => {
	return (
		<div>
			<FormHeader title={title} variant='form-component-title' />
			<div className='flex items-center space-x-4 font-open-sans'>
				<Switch id='airplane-mode' checked={checked} onCheckedChange={onChange} />
				<Label htmlFor='airplane-mode'>
					<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>{label}</p>
					<Spacer height={'4px'} />
					<p className='text-sm font-normal text-[#71717A] peer-checked:text-gray-700'>{description}</p>
				</Label>
			</div>
			{error && <p className='text-sm text-destructive'>{error}</p>}
		</div>
	);
};

export default Toggle;
