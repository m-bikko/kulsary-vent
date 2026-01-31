import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-gray-100 flex font-sans antialiased">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <Image
                        src="/white logo.svg"
                        alt="Kulsary Admin Logo"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                    />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Kulsary Admin
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/products" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        Шаблоны товаров
                    </Link>
                    <Link href="/admin/materials" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        Материалы
                    </Link>
                    <Link href="/admin/customers" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        Заказчики
                    </Link>
                    <div className="my-4 border-t border-gray-800"></div>
                    <Link href="/" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        ← Вернуться на сайт
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
