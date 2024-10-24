"use client";
import { useState } from 'react'
import { Container, HStack, VStack } from 'styled-system/jsx'
import { AuthenticationCard } from '~/components/authentication-card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { NumberInput } from '~/components/ui/number-input';
import { Text } from '~/components/ui/text'
import { LabeledInput } from './(components)/LabeledInput';
import { Switch } from '~/components/ui/switch';

export default function Home() {
  const [poolSize, setPoolSize] = useState(0)
  const [betSize, setBetSize] = useState(0)
  const [predictedOdds, setPredictedOdds] = useState(0)
  const [posPredicted, setPosPredicted] = useState(false)
  const [bookOdds, setBookOdds] = useState(0)
  const [posBook, setPosBook] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  /**
   * 
   * @param odds in the form -100 or +100
   * @returns probability in the form 0.10 for 10%
   */
  const convertToProbability = (odds: number) => {
    if (odds < 0) {
        return Math.abs(odds) / ((Math.abs(odds) + 100))
    } else {
        return 100 / ((Math.abs(odds) + 100))
    }
  }

  /**
  * 
  * @param odds in the form 10 for 10%
  * @returns american odds in the form -100 or +100
  */
  const convertToAmerican = (odds: number) => {
    if (odds < 50) {
        return (100 / (odds / 100)) - 100
    } else if (odds > 50) {
        return (odds / (1 - (odds / 100))) * -1
    } else {
        return 100
    }
  }

  /**
   * 
   * @returns bet size calculated according to the kelly criterion
   */
  const calculateBetSize = () => {
    if (poolSize === 0) {
      setBetSize(0)
      setErrorMsg('You have no money in the pool')
      return
    }
    if (predictedOdds < 100) {
      setBetSize(0)
      setErrorMsg('Predicted odds must be greater than 100')
      return
    }
    if (bookOdds < 100) {
      setBetSize(0)
      setErrorMsg('Book odds must be greater than 100')
      return
    }
    if (convertToProbability(bookOdds) > 0.75) {
      setBetSize(0)
      setErrorMsg('You should not bet on this event or any event with a book probability greater than 75%')
      return
    }
    const realPredicted = posPredicted ? predictedOdds : predictedOdds * -1
    const realBook = posBook ? bookOdds : bookOdds * -1
    if (realPredicted > -200) {
      setBetSize(0)
      setErrorMsg('You should not bet on this event or any event with a predicted probability less than 66.67%')
      return
    }

    setErrorMsg('')

    let betSize = 0
    const fraction = Math.max(0, 1/Math.log(poolSize))
    if (poolSize < 1) {
      betSize = poolSize * 0.9
    } else if (fraction > 0.9) {
      betSize = poolSize * 0.9
    } else {
      betSize = poolSize * fraction
    }

    console.log('Real Predicted', realPredicted)
    console.log('Real Book', realBook)
    if (realPredicted > realBook) {
      setBetSize(betSize * 0.75)
      return
    }

    const predictedProb = convertToProbability(realPredicted)
    const lossProb = 1 - predictedProb

    let payout = 1
    if (posBook) {
      payout = bookOdds / 100
    } else {
      payout = 100 / bookOdds
    }

    betSize = (predictedProb - (lossProb / payout))
    console.log('Predicted', predictedProb)
    console.log('Predicted Loss', lossProb)
    console.log('Payout', payout)
    console.log('Bet size fraction', betSize)
    console.log('Bet size', poolSize*betSize)

    if (betSize < 0) {
      setBetSize(0)
      setErrorMsg('You should not bet on this event')
      return
    }

    setBetSize(betSize * poolSize)
  }

  return (
    <VStack w='screen' h='screen' justify='center'>
      <LabeledInput
        label='Bet Pool ($)'
        input={
          <NumberInput
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              calculateBetSize()
            }}
            value={poolSize.toString()}
            onValueChange={(e) => {
              if (isNaN(e.valueAsNumber)) {
                setPoolSize(0)
                return
              }
              setPoolSize(e.valueAsNumber)
            }}
          />
        }
      />
      <HStack>
        <LabeledInput
          label='Positive'
          input={
            <Switch
              onCheckedChange={(e) => setPosPredicted(e.checked)}
            />
          }
        />
        <LabeledInput
          label='Predicted Odds'
          input={
            <NumberInput
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                calculateBetSize()
              }}
              value={predictedOdds.toString()}
              onValueChange={(e) => {
                if (isNaN(e.valueAsNumber)) {
                  setPredictedOdds(0)
                  return
                }
                setPredictedOdds(e.valueAsNumber)
              }}
            />
          }
        />
      </HStack>
      <HStack>
        <LabeledInput
          label='Positive'
          input={
            <Switch
              onCheckedChange={(e) => setPosBook(e.checked)}
            />
          }
        />
        <LabeledInput
          label='Book Odds'
          input={
            <NumberInput
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                calculateBetSize()
              }}
              value={bookOdds.toString()}
              onValueChange={(e) => {
                if (isNaN(e.valueAsNumber)) {
                  setBookOdds(0)
                  return
                }
                setBookOdds(e.valueAsNumber)
              }}
            />
          }
        />
      </HStack>
      <Button onClick={calculateBetSize}>Calculate Bet Size</Button>
      { errorMsg !== '' && <Text color='red'>{errorMsg}</Text> }
      { betSize !== 0 && <Text>{betSize.toLocaleString("en-US", {currency: "USD", style: "currency"})}</Text> }
    </VStack>
  )
}
