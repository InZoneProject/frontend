import { ref, onMounted, onUnmounted, watch } from 'vue'
import { DURATION } from '@/constants/duration.constants'

export function useBaseTimer(expiryDate: () => string, onFinish: () => void) {
    const timeLeft = ref('00:00:00')
    let intervalId: number | null = null

    const calculateTime = () => {
        const value = expiryDate()
        const expiry = new Date(value).getTime()
        const now = new Date().getTime()
        const diff = expiry - now

        if (diff <= 0) {
            timeLeft.value = '00:00:00'
            stopTimer()
            onFinish()
            return
        }

        const hours = Math.floor(diff / DURATION.MS_IN_HOUR)
        const minutes = Math.floor((diff % DURATION.MS_IN_HOUR) / DURATION.MS_IN_MINUTE)
        const seconds = Math.floor((diff % DURATION.MS_IN_MINUTE) / DURATION.MS_IN_SECOND)

        timeLeft.value = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':')
    }

    const startTimer = () => {
        stopTimer()
        calculateTime()
        intervalId = window.setInterval(calculateTime, DURATION.MS_IN_SECOND)
    }

    const stopTimer = () => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    onMounted(() => startTimer())
    onUnmounted(() => stopTimer())

    watch(expiryDate, () => startTimer())

    return {
        timeLeft
    }
}