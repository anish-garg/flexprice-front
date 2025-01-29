interface Props {}

const UserProfile = () => {
	return (
		<div className={`h-6 flex w-full rounded-md items-center gap-2 bg-contain ${!open ? 'hidden' : ''}`}>
			<img
				src={'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk'}
				className='size-8 bg-contain rounded-md'
				alt='company logo'
			/>
			<p className='font-semibold text-[14px]'>Simplismart</p>
		</div>
	);
};

export default UserProfile;
