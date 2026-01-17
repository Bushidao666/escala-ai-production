"use client";

import { CreativeFormWidget } from "@/widgets/creative-form";
import { Wand2 } from "lucide-react";

export default function CreateCreativePage() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark shadow-lg">
            <Wand2 className="w-7 h-7 text-brand-black" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Criar Novo Criativo</h1>
            <p className="text-brand-gray-400 text-lg mt-1">Descreva sua visão e deixe a IA criar.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
             <CreativeFormWidget />
          </div>
          <div className="xl:col-span-1">
            {/* Sidebar Preview could be another widget */}
            <div className="text-white">Preview Placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
}
