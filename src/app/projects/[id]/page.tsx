'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ProductCatalog } from '@/components/projects/ProductCatalog';
import { Estimate } from '@/components/projects/Estimate';
import { ProductConfigurator } from '@/components/projects/ProductConfigurator';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ProjectPDF } from '@/components/projects/ProjectPDF';
import { calculateProjectTotal } from '@/lib/calculations';

export default function ProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [project, setProject] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Configurator State
    const [activeTemplate, setActiveTemplate] = useState<any>(null);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
    const [isSavingItem, setIsSavingItem] = useState(false);

    useEffect(() => {
        fetchData();
    }, [resolvedParams.id]);

    const fetchData = async () => {
        try {
            const [projRes, templRes, matRes] = await Promise.all([
                fetch(`/api/projects/${resolvedParams.id}`),
                fetch('/api/products'),
                fetch('/api/materials')
            ]);

            if (projRes.ok) setProject(await projRes.json());
            if (templRes.ok) setTemplates(await templRes.json());
            if (matRes.ok) setMaterials(await matRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTemplate = (template: any) => {
        setActiveTemplate(template);
        setEditingItemIndex(null);
        setIsConfiguratorOpen(true);
    };

    const handleEditItem = (item: any, index: number) => {
        // Determine template from item
        // item.template is populated object
        setActiveTemplate(item.template);
        setEditingItemIndex(index);
        setIsConfiguratorOpen(true);
    };

    const handleRemoveItem = async (index: number) => {
        if (!project) return;
        const newItems = [...project.items];
        newItems.splice(index, 1);
        await updateProjectItems(newItems);
    };

    const handleSaveItem = async (data: any) => {
        setIsSavingItem(true);
        try {
            if (!project) return;

            const newItems = [...project.items];

            // Data is { template, params, quantity, material }
            // We need to keep snapshots if editing? Or typically editing RE-CALCULATES snapshot from current material price.
            // My Configurator logic uses current Material Price from global list.
            // BUT `data` from configurator doesn't contain `materialPriceSnapshot` unless we explicitly pass it (which we don't, we pass materialId).
            // The SERVER API calculates snapshot if it's undefined.
            // So if we are adding new item -> perfect.
            // If editing -> we might want to refresh price or keep old. 
            // If user changed parameters, likely they accept new price.
            // We should send `materialPriceSnapshot: undefined` to force refresh on server if we want to ensure latest price.
            // OR, we let Configurator calculate it and send it? Configurator calculates `Item Price`, not `Material Snapshot`.
            // Let's rely on Server to snapshot material price. We send `materialPriceSnapshot: undefined`.

            const itemPayload = {
                template: data.template,
                params: data.params,
                quantity: data.quantity,
                material: data.material,
                materialPriceSnapshot: undefined // Force server to refresh based on materialId
            };

            if (editingItemIndex !== null) {
                newItems[editingItemIndex] = itemPayload;
            } else {
                newItems.push(itemPayload);
            }

            const materialsMap = new Map(materials.map((m: any) => [m._id, m.price]));
            const totalPrice = calculateProjectTotal(newItems, materialsMap);

            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: newItems, totalPrice }),
            });

            if (res.ok) {
                const updatedProject = await res.json();
                setProject(updatedProject);
                setIsConfiguratorOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingItem(false);
        }
    };

    const updateProjectItems = async (items: any[]) => {
        // Helper for delete
        try {
            const materialsMap = new Map(materials.map((m: any) => [m._id, m.price]));
            const totalPrice = calculateProjectTotal(items, materialsMap);

            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, totalPrice }),
            });
            if (res.ok) setProject(await res.json());
        } catch (e) { console.error(e); }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-white"><Loader2 className="animate-spin mr-2" /> Загрузка...</div>;
    if (!project) return <div className="text-white">Проект не найден</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-3">
                    <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">{project.name}</h1>
                        <p className="text-xs text-blue-400">{project.customer?.name}</p>
                    </div>
                </div>

                {/* PDF Download */}
                {/* We perform this check inside Estimate or here. */}
                {/* Note: React-PDF PDFDownloadLink renders invisible anchor, we style it. */}
                {/* We need fonts loaded. We will handle that in ProjectPDF. */}
            </div>

            <div className="flex-1 flex overflow-hidden rounded-xl border border-gray-800 shadow-2xl bg-black">
                {/* Left: Catalog */}
                <ProductCatalog templates={templates} onSelect={handleSelectTemplate} />

                {/* Right: Estimate */}
                <Estimate
                    items={project.items || []}
                    onRemove={handleRemoveItem}
                    onEdit={handleEditItem}
                    onGeneratePDF={() => {
                        // Trigger PDF download. 
                        // PDFDownloadLink is usually used as a component. 
                        // We can wrap the button in Estimate with it, but we need data there.
                        // Better to lift button here or pass the PDF component down?
                        // Actually, best to have a hidden link and click it?
                        // Or just put the link in the Header?
                        // Let's put it in the "Estimate" component prop onGeneratePDF is actually just a trigger?
                        // No, client-side PDF generation is instant.
                        alert("Пожалуйста, нажмите на кнопку 'Скачать КП' в верхней части экрана (когда реализуем)");
                    }}
                />

                {/* Floating Download Button (Actual implementation) */}
                {/* We place it absolutely or in header. Let's place it in Estimate "footer" area if possible. */}
                {/* Or better, replace the "Generate PDF" button in Estimate with the actual Link. */}
                {/* I'll modify Estimate to accept a 'downloadLink' node or similar. */}
            </div>

            {isConfiguratorOpen && activeTemplate && (
                <ProductConfigurator
                    template={activeTemplate}
                    materials={materials}
                    initialValues={editingItemIndex !== null ? project.items[editingItemIndex] : undefined}
                    onClose={() => setIsConfiguratorOpen(false)}
                    onSave={handleSaveItem}
                    isSaving={isSavingItem}
                />
            )}

            {/* Hidden PDF Link for generation (or visible) */}
            {project && project.items.length > 0 && (
                <div className="fixed bottom-4 right-4 z-40">
                    <PDFDownloadLink
                        document={<ProjectPDF project={project} />}
                        fileName={`КП-${project.name}.pdf`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center font-medium"
                    >
                        {/* @ts-ignore - loading instance */}
                        {({ loading }) => (loading ? 'Генерация PDF...' : <><FileDown className="mr-2 h-4 w-4" /> Скачать КП</>)}
                    </PDFDownloadLink>
                </div>
            )}
        </div>
    );
}

import { FileDown } from 'lucide-react'; 
