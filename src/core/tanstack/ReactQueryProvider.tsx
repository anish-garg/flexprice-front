import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, createContext, useContext, useState } from 'react';

interface LoadingContextType {
	isLoading: boolean;
	setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useGlobalLoading = () => {
	const context = useContext(LoadingContext);
	if (!context) throw new Error('useGlobalLoading must be used within ReactQueryProvider');
	return context;
};

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			gcTime: 0,
		},
		mutations: {
			retry: false,
		},
	},
});

export const refetchQueries = async (queryKeys?: string | string[]) => {
	await queryClient.invalidateQueries({ queryKey: queryKeys, exact: false });
	await queryClient.refetchQueries({ queryKey: queryKeys, exact: false });
};

export const invalidateQueries = async (queryKeys: string[]) => {
	await queryClient.invalidateQueries({ queryKeys, exact: false });
};

const ReactQueryProvider = ({ children }: PropsWithChildren) => {
	const [isLoading, setLoading] = useState(false);

	return (
		<LoadingContext.Provider value={{ isLoading, setLoading }}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</LoadingContext.Provider>
	);
};

export default ReactQueryProvider;
