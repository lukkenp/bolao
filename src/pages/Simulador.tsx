import React from 'react'
import { SimuladorBolao } from '@/components/SimuladorBolao'

export default function Simulador() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Simulador de Bolões
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Calcule o valor total do seu bolão com base na quantidade de dezenas,
        jogos e sua taxa de serviço.
      </p>
      <SimuladorBolao />
    </div>
  )
} 