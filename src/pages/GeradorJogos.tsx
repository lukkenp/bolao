import React from 'react'
import MainLayout from '@/layout/MainLayout'
import { GameGenerator } from '@/components/lottery/GameGenerator'

export default function GeradorJogos() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerador de Jogos
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione até 20 números e gere combinações únicas para seus jogos da Mega-Sena.
            As combinações geradas são armazenadas por 24 horas para evitar repetições.
          </p>
        </div>

        <GameGenerator />
      </div>
    </MainLayout>
  )
} 