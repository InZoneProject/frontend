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
    const digitValues = ref<string[]>(Array(VALIDATION.VERIFICATION_CODE_LENGTH).fill(''))

    const setInputReference = (element: HTMLInputElement | null, index: number) => {
        if (element) {
            inputElements.value[index] = element
        }
    }

    const updateValue = () => {
        const fullCode = digitValues.value.join('')
        emit(Events.UPDATE_MODEL_VALUE, fullCode)
    }

    const handleInput = (event: Event, index: number) => {
        const targetInputElement = event.target as HTMLInputElement
        const filteredValue = targetInputElement.value.replace(VALIDATION.NUMERIC_ONLY, '')
        const availableLength = VALIDATION.VERIFICATION_CODE_LENGTH - index
        const normalizedValue =
            filteredValue.length > availableLength &&
            digitValues.value[index] &&
            filteredValue.startsWith(digitValues.value[index])
                ? filteredValue.slice(1)
                : filteredValue
        const inputDigits = normalizedValue.slice(0, availableLength)

        if (!inputDigits) {
            digitValues.value[index] = ''
            targetInputElement.value = ''
            updateValue()
            return
        }

        inputDigits.split('').forEach((digit, offset) => {
            const targetIndex = index + offset
            digitValues.value[targetIndex] = digit
            if (inputElements.value[targetIndex]) {
                inputElements.value[targetIndex].value = digit
            }
        })

        const nextFocusIndex = Math.min(
            index + inputDigits.length,
            VALIDATION.VERIFICATION_CODE_LENGTH - 1
        )
        inputElements.value[nextFocusIndex]?.focus()

        updateValue()
    }

    const handleKeyDown = (event: KeyboardEvent, index: number) => {
        if (event.key === 'Backspace') {
            if (digitValues.value[index]) {
                digitValues.value[index] = ''
                updateValue()
                return
            }

            if (index > 0) {
                event.preventDefault()
                digitValues.value[index - 1] = ''
                inputElements.value[index - 1].focus()
                updateValue()
            }
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault()
            inputElements.value[index - 1].focus()
        }

        if (event.key === 'ArrowRight' && index < VALIDATION.VERIFICATION_CODE_LENGTH - 1) {
            event.preventDefault()
            inputElements.value[index + 1].focus()
        }
    }

    const handleFocus = (event: FocusEvent) => {
        const targetInputElement = event.target as HTMLInputElement
        requestAnimationFrame(() => {
            targetInputElement.setSelectionRange(0, targetInputElement.value.length)
        })
    }

    const handlePaste = (event: ClipboardEvent, startIndex = 0) => {
        event.preventDefault()
        event.stopPropagation()

        if (properties.disabled) {
            return
        }

        const activeElementIndex = inputElements.value.findIndex((input) => input === document.activeElement)
        const targetStartIndex = activeElementIndex >= 0 ? activeElementIndex : startIndex
        const pastedText = event.clipboardData?.getData('text') || ''
        const sanitizedData = pastedText
            .replace(VALIDATION.NUMERIC_ONLY, '')
            .slice(0, VALIDATION.VERIFICATION_CODE_LENGTH - targetStartIndex)

        if (!sanitizedData) {
            return
        }

        sanitizedData.split('').forEach((character, offset) => {
            const targetIndex = targetStartIndex + offset
            digitValues.value[targetIndex] = character
            if (inputElements.value[targetIndex]) {
                inputElements.value[targetIndex].value = character
            }
        })

        updateValue()

        const nextFocusIndex = Math.min(
            targetStartIndex + sanitizedData.length,
            VALIDATION.VERIFICATION_CODE_LENGTH - 1
        )
        inputElements.value[nextFocusIndex]?.focus()
    }

    watch(() => properties.modelValue, (modelValue) => {
        if (!modelValue) {
            digitValues.value = Array(VALIDATION.VERIFICATION_CODE_LENGTH).fill('')
            inputElements.value.forEach((input) => {
                input.value = ''
            })
            return
        }

        if (modelValue !== digitValues.value.join('')) {
            digitValues.value = Array.from(
                { length: VALIDATION.VERIFICATION_CODE_LENGTH },
                (_, index) => modelValue[index] || ''
            )
            digitValues.value.forEach((digit, index) => {
                if (inputElements.value[index]) {
                    inputElements.value[index].value = digit
                }
            })
        }
    })

    watch(() => properties.disabled, (isInputDisabled) => {
        if (!isInputDisabled) {
            setTimeout(() => {
                const firstEmptyIndex = digitValues.value.findIndex((digit) => digit === '')
                const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
                inputElements.value[focusIndex]?.focus()
            }, 0)
        }
    })

    onMounted(() => {
        digitValues.value = Array.from(
            { length: VALIDATION.VERIFICATION_CODE_LENGTH },
            (_, index) => properties.modelValue[index] || ''
        )

        if (!properties.disabled) {
            const firstEmptyIndex = digitValues.value.findIndex((digit) => digit === '')
            const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
            inputElements.value[focusIndex]?.focus()
        }
    })

    return {
        digitValues,
        setInputReference,
        handleInput,
        handleKeyDown,
        handleFocus,
        handlePaste
    }
}
