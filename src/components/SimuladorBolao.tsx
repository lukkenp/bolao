'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Preços oficiais da Mega Sena
const PRECOS_MEGA_SENA = {
  6: 5.00,
  7: 35.00,
  8: 140.00,
  9: 420.00,
  10: 1050.00,
  11: 2310.00,
  12: 4620.00,
  13: 8580.00,
  14: 15015.00,
  15: 25025.00,
  16: 40040.00,
  17: 61880.00,
  18: 92820.00,
  19: 135660.00,
  20: 193800.00
} as const

type DezenasType = keyof typeof PRECOS_MEGA_SENA

export function SimuladorBolao() {
  // Estados para os inputs
  const [dezenas, setDezenas] = useState<DezenasType>(6)
  const [quantidadeJogos, setQuantidadeJogos] = useState(1)
  const [taxaServico, setTaxaServico] = useState(20)

  // Estados para os valores calculados
  const [valorBase, setValorBase] = useState(0)
  const [valorComissao, setValorComissao] = useState(0)
  const [totalPagar, setTotalPagar] = useState(0)

  // Efeito para calcular os valores quando os inputs mudarem
  useEffect(() => {
    const valorBaseCalculado = PRECOS_MEGA_SENA[dezenas] * quantidadeJogos
    const comissaoCalculada = (valorBaseCalculado * taxaServico) / 100
    const totalCalculado = valorBaseCalculado + comissaoCalculada

    setValorBase(valorBaseCalculado)
    setValorComissao(comissaoCalculada)
    setTotalPagar(totalCalculado)
  }, [dezenas, quantidadeJogos, taxaServico])

  // Formatador de moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Seleção de Dezenas */}
          <div className="space-y-2">
            <Label htmlFor="dezenas">Quantidade de Dezenas</Label>
            <Select
              value={dezenas.toString()}
              onValueChange={(value) => setDezenas(Number(value) as DezenasType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a quantidade de dezenas" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRECOS_MEGA_SENA) as unknown as DezenasType[]).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} dezenas - {formatarMoeda(PRECOS_MEGA_SENA[num])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade de Jogos */}
          <div className="space-y-2">
            <Label htmlFor="jogos">Quantidade de Jogos</Label>
            <Input
              id="jogos"
              type="number"
              min="1"
              value={quantidadeJogos}
              onChange={(e) => setQuantidadeJogos(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Taxa de Serviço */}
          <div className="space-y-2">
            <Label htmlFor="taxa">Taxa de Serviço: {taxaServico}%</Label>
            <Slider
              id="taxa"
              min={20}
              max={35}
              step={1}
              value={[taxaServico]}
              onValueChange={(value) => setTaxaServico(value[0])}
              className="w-full"
            />
          </div>

          {/* Resultados */}
          <div className="mt-8 space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor Base:</span>
              <span className="font-medium">{formatarMoeda(valorBase)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Comissão ({taxaServico}%):</span>
              <span className="font-medium">{formatarMoeda(valorComissao)}</span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
              <span>Total a Pagar:</span>
              <span className="text-primary">{formatarMoeda(totalPagar)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 