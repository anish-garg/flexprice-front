import { FC, useEffect, useState } from 'react';
import DocsDrawer from '../DocsDrawer/DocsDrawer';
import { useApiDocsStore, ApiDocsSnippet } from '@/store/useApiDocsStore';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/atoms';
import { Code2 } from 'lucide-react';
import { fetchAndExtractSnippetsByTags } from './fetch_api_docs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ApiDocs: FC = () => {
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const { snippets } = useApiDocsStore();

	// Don't render an  ything if no documentation is configured
	// if (snippets.length === 0) {
	// 	return null;
	// }

	return (
		<DocsDrawer
			isOpen={isDocsOpen}
			onOpenChange={setIsDocsOpen}
			snippets={snippets}
			trigger={
				<Button variant='outline' className='outline-none text-sm bg-gray-100 flex items-center gap-2' size='sm'>
					<Code2 className='w-4 h-4' />
					Api
				</Button>
			}
		/>
	);
};

interface ApiDocsContentProps {
	tags?: string[];
}

export const fetchApidocsJson = async (): Promise<any> => {
	const { data } = await axios.get('https://raw.githubusercontent.com/flexprice/flexprice-docs/main/api-reference/openapi.json');
	return data;
};

export const ApiDocsContent = ({ tags }: ApiDocsContentProps) => {
	const { setPageDocs, clearPageDocs } = useDocs();
	const [snippets, setSnippets] = useState<ApiDocsSnippet[]>([]);

	const { data: docs } = useQuery({
		queryKey: ['openapi-json'],
		queryFn: fetchApidocsJson,
		staleTime: 1000 * 60 * 60 * 24,
	});

	useEffect(() => {
		const fetchSnippets = async (tags: string[]) => {
			const snippets = await fetchAndExtractSnippetsByTags(tags, docs);
			setSnippets(snippets);
		};
		if (tags) {
			fetchSnippets(tags);
		}
	}, [tags, docs]);

	useEffect(() => {
		setPageDocs(snippets);
		return () => clearPageDocs();
	}, [snippets, setPageDocs, clearPageDocs]);

	return null;
};

export default ApiDocs;
