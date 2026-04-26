import { ref, computed } from 'vue'
import type { BaseInputProperties } from '@/interfaces/base-input-properties.interface'
import type { BaseInputEmits } from '@/interfaces/base-input-emits.interface'
import { Events } from '@/enums/events.enum'
import { VALIDATION } from '@/constants/validation.constants'

export function isValidEmailInputValue(value: string): boolean {
    return VALIDATION.EMAIL_PATTERN.test(value.trim())
}

export function isValidPhoneInputValue(value: string): boolean {
    const normalizedValue = value.trim()
    if (normalizedValue.length === 0) {
        return true
    }
    return VALIDATION.PHONE_PATTERN.test(normalizedValue)
}

function normalizePhoneInputValue(value: string): string {
    const cleanedValue = value.replace(VALIDATION.PHONE_ALLOWED, '')
    const startsWithPlus = cleanedValue.startsWith('+')
    const digitsOnly = cleanedValue.replace(/\+/g, '')
    return startsWithPlus ? `+${digitsOnly}` : digitsOnly
}

export function useBaseInput(
    props: BaseInputProperties,
    emit: BaseInputEmits
) {
    const isPasswordVisible = ref(false)

    const inputType = computed(() => {
        if (props.type === 'password') return isPasswordVisible.value ? 'text' : 'password'
        return props.type
    })

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value
    }

    const handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement
        const normalizedValue = props.type === 'tel'
            ? normalizePhoneInputValue(target.value)
            : target.value
        const limitedValue = normalizedValue.slice(0, props.maxLength)
        if (target.value !== limitedValue) {
            target.value = limitedValue
        }
        emit(Events.UPDATE_MODEL_VALUE, limitedValue)
    }

    return {
        isPasswordVisible,
        inputType,
        togglePasswordVisibility,
        handleInput
    }
}
