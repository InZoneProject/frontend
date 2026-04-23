import { ref, onMounted, watch } from 'vue'
import { Events } from '@/enums/events.enum'
import { VALIDATION } from '@/constants/validation.constants'
import type { BaseCodeInputProperties } from '@/interfaces/base-code-input-properties.interface'
import type { BaseCodeInputEmits } from '@/interfaces/base-code-input-emits.interface'

export function useBaseCodeInput(
    properties: BaseCodeInputProperties,
    emit: BaseCodeInputEmits
) {
    const inputElements = ref<HTMLInputElement[]>([])

    const setInputReference = (element: HTMLInputElement | null, index: number) => {
        if (element) {
            inputElements.value[index] = element
        }
    }

    const updateValue = () => {
        const fullCode = inputElements.value.map(input => input.value).join('')
        emit(Events.UPDATE_MODEL_VALUE, fullCode)
    }

    const handleInput = (event: Event, index: number) => {
        const targetInputElement = event.target as HTMLInputElement
        const filteredValue = targetInputElement.value.replace(VALIDATION.NUMERIC_ONLY, '')
        targetInputElement.value = filteredValue

        if (filteredValue && index < VALIDATION.VERIFICATION_CODE_LENGTH - 1) {
            inputElements.value[index + 1].focus()
        }

        updateValue()
    }

    const handleKeyDown = (event: KeyboardEvent, index: number) => {
        if (event.key === 'Backspace') {
            if (!inputElements.value[index].value && index > 0) {
                inputElements.value[index - 1].focus()
            }
        }
    }

    const handlePaste = (event: ClipboardEvent) => {
        event.preventDefault()

        if (properties.disabled) {
            return
        }

        const pastedText = event.clipboardData?.getData('text') || ''
        const sanitizedData = pastedText
            .slice(0, VALIDATION.VERIFICATION_CODE_LENGTH)
            .replace(VALIDATION.NUMERIC_ONLY, '')

        if (!sanitizedData) {
            return
        }

        const characterArray = sanitizedData.split('')
        characterArray.forEach((character, index) => {
            if (inputElements.value[index]) {
                inputElements.value[index].value = character
            }
        })

        updateValue()

        const nextFocusIndex = Math.min(characterArray.length, VALIDATION.VERIFICATION_CODE_LENGTH - 1)
        inputElements.value[nextFocusIndex]?.focus()
    }

    watch(() => properties.disabled, (isInputDisabled) => {
        if (!isInputDisabled) {
            setTimeout(() => {
                inputElements.value[0]?.focus()
            }, 0)
        }
    })

    onMounted(() => {
        if (!properties.disabled) {
            inputElements.value[0]?.focus()
        }
    })

    return {
        setInputReference,
        handleInput,
        handleKeyDown,
        handlePaste
    }
}