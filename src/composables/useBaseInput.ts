import { computed, nextTick, ref, watch } from 'vue'
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
    const textareaReference = ref<HTMLTextAreaElement | null>(null)

    const inputType = computed(() => {
        if (props.type === 'password') return isPasswordVisible.value ? 'text' : 'password'
        return props.type
    })

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value
    }

    const handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        if (props.type === 'select') {
            emit(Events.UPDATE_MODEL_VALUE, target.value)
            return
        }
        const normalizedValue = props.type === 'tel'
            ? normalizePhoneInputValue(target.value)
            : target.value
        let limitedValue = normalizedValue.slice(0, props.maxLength)
        if (props.type === 'number' && limitedValue.length > 0) {
            const numericValue = Number(limitedValue)
            if (!Number.isNaN(numericValue)) {
                const minLimited = props.minValue === null ? numericValue : Math.max(props.minValue, numericValue)
                const maxLimited = props.maxValue === null ? minLimited : Math.min(props.maxValue, minLimited)
                limitedValue = String(maxLimited)
            }
        }
        if (target.value !== limitedValue) {
            target.value = limitedValue
        }
        emit(Events.UPDATE_MODEL_VALUE, limitedValue)
    }

    const resizeTextarea = () => {
        if (!props.isExpandable || !textareaReference.value) return
        textareaReference.value.style.height = 'auto'
        textareaReference.value.style.height = `${textareaReference.value.scrollHeight}px`
    }

    const handleExpandableInput = (event: Event) => {
        handleInput(event)
        resizeTextarea()
    }

    watch(
        () => props.modelValue,
        () => {
            void nextTick(() => resizeTextarea())
        },
        { immediate: true }
    )

    return {
        isPasswordVisible,
        textareaReference,
        inputType,
        togglePasswordVisibility,
        handleInput,
        handleExpandableInput
    }
}
