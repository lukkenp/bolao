import React from 'react'
import { SimuladorBolao } from '@/components/SimuladorBolao'
import MainLayout from '@/layout/MainLayout'

export default function Simulador() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Simulador de Bolões
          </h1>
          <p className="text-muted-foreground mt-1">
            Calcule o valor total do seu bolão com base na quantidade de dezenas,
            jogos e sua taxa de serviço.
          </p>
        </div>

        <SimuladorBolao />
      </div>
    </MainLayout>
  )
} 