import React from 'react'
import { SidebarTrigger } from './ui/sidebar'

const Header = ({ headerTitle }: { headerTitle: string }) => {
	return (
		<header className="flex h-12 items-center gap-2 border-b px-4">
			<SidebarTrigger />
			<span className="text-sm font-medium">{headerTitle}</span>
		</header>
	)
}

export default Header