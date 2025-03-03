const formatDate = (date: string | Date, locale: string = 'en-US', options?: Intl.DateTimeFormatOptions): string => {
	const parsedDate = new Date(date);

	if (isNaN(parsedDate.getTime())) {
		return 'Invalid Date';
	}

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	};

	return parsedDate.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

export default formatDate;

export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);

	if (isNaN(date.getTime())) {
		return 'Invalid Date';
	}

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		// second: '2-digit',
		hour12: true,
	};

	return date.toLocaleString('en-US', options);
};

export const formatDateWithMilliseconds = (dateString: string): string => {
	const date = new Date(dateString);

	if (isNaN(date.getTime())) {
		return 'Invalid Date';
	}

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	};

	const formattedDate = date.toLocaleString('en-US', options);
	// const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

	return `${formattedDate}`;
};
