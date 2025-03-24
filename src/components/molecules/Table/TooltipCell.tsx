import { FC, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
	tooltipContent: ReactNode;
	tooltipText: string;
}
const TooltipCell: FC<Props> = ({ tooltipContent, tooltipText }) => {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(tooltipText);
		toast.success('Copied to clipboard');
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className='flex items-center gap-2 group'>
						<span className='max-w-[100px] truncate cursor-pointer'>{tooltipContent || '--'}</span>
						<Copy
							onClick={copyToClipboard}
							className='w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer text-muted-foreground hover:text-foreground transition-opacity'
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tooltipText}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default TooltipCell;
