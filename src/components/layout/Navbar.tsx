import Link from 'next/link';
import Image from 'next/image';
import { Settings } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/projects" className="flex items-center space-x-2">
                            <Image 
                                src="/white logo.svg" 
                                alt="Kulsary Vent Logo" 
                                width={32} 
                                height={32} 
                                className="w-20 h-20"
                            />
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
