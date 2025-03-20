import { FC } from 'react';
import { HighlightProps, Highlight, themes } from 'prism-react-renderer';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../Button';

const CodeHighlighter = Highlight as unknown as FC<HighlightProps>;

interface Props {
	code: string;
	language?: string;
	title?: string;
	className?: string;
}

const CodePreview: FC<Props> = ({ code, language, className: styles, title }) => {
	return (
		<>
			<div className={cn(' bg-[#FAFAFA]  border rounded-lg')}>
				<div className='flex justify-between py-2 px-6 items-center w-full'>
					<p className='font-semibold text-lg'>{title}</p>
					<Button
						onClick={() => {
							navigator.clipboard.writeText(code);
							toast.success('Copied to clipboard');
						}}
						className='text-muted-foreground cursor-pointer size-10'
						variant={'ghost'}>
						<Copy className='text-[#52525B]' />
					</Button>
				</div>
				<div className='p-3 bg-[#F4F4F5]'>
					<CodeHighlighter
						theme={{
							...themes.nightOwlLight,
							plain: {
								...themes.nightOwlLight.plain,
								color: '#18181B',
								backgroundColor: '#F4F4F5',
							},
						}}
						code={code}
						language={language ?? 'javascript'}>
						{({ className, style, tokens, getLineProps, getTokenProps }) => (
							<pre className={cn(className, styles)} style={{ ...style, padding: '0.5rem', borderRadius: '8px', overflowX: 'auto' }}>
								{tokens.map((line, i) => (
									<div key={i} {...getLineProps({ line })}>
										{line.map((token, key) => (
											<span key={key} {...getTokenProps({ token })} className='font-fira-code text-xs' />
										))}
									</div>
								))}
							</pre>
						)}
					</CodeHighlighter>
				</div>
			</div>
		</>
	);
};

export default CodePreview;
