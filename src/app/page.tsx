"use client";
import { useState } from 'react'
import { Container, VStack } from 'styled-system/jsx'
import { AuthenticationCard } from '~/components/authentication-card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'

export default function Home() {
  const [poolSize, setPoolSize] = useState(0)
  const [betSize, setBetSize] = useState(0)

  const calculateBetSize = () => {
    if (poolSize < 1) {
      setBetSize(poolSize * 0.9)
      return
    }
    
    const fraction = Math.max(0, 1/Math.log(poolSize))
    if (fraction > 0.9) {
      setBetSize(poolSize * 0.9)
      return
    }

    setBetSize(poolSize * fraction)
  }

  return (
    <VStack w='screen' h='screen' justify='center'>
      <Input onKeyDown={(e) => {
        console.log(e.key)
        if (e.key !== 'Enter') return
        calculateBetSize()
      }} w='1/2' placeholder='Pool size' value={poolSize} onChange={(e) => {
        // returning if the value is not a number
        if (isNaN(Number(e.target.value)) && e.target.value !== '') return
        setPoolSize(Number(e.target.value))
      }} />
      <Button onClick={calculateBetSize}>Calculate Bet Size</Button>
      { betSize !== 0 && <Text>{betSize}</Text> }
    </VStack>
  )
}
