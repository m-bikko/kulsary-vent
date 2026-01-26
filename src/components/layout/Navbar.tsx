import Link from 'next/link';
import { Settings, FolderKanban } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/projects" className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                                <FolderKanban className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Kulsary Vent
                            </span>
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <Link href="/projects" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Проекты
                                </Link>
                                <Link href="/admin/materials" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Склад
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Link href="/admin/products" className="text-gray-400 hover:text-white p-2">
                            <Settings className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
