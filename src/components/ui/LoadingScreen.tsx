import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
    fullScreen?: boolean;
    className?: string;
}

export default function LoadingScreen({ fullScreen = true, className = '' }: LoadingScreenProps) {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        : "w-full min-h-[300px] bg-transparent";

    return (
        <div className={`${containerClasses} flex flex-col items-center justify-center ${className}`}>
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <Image
                        src="/white logo_loading.svg"
                        alt="Loading..."
                        width={80}
                        height={80}
                        className="w-20 h-20 relative z-10 animate-float"
                        priority
                    />
                </div>
                <p className="text-gray-300 text-sm font-medium tracking-wider animate-pulse uppercase">
                    Данные загружаются
                </p>
            </div>
        </div>
    );
}
