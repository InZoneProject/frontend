export interface BaseInputProperties {
    modelValue: string
    label: string
    type: 'text' | 'password' | 'email'
    placeholder: string
    maxLength: number
}