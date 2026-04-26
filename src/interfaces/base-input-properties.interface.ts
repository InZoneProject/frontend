export interface BaseInputProperties {
    modelValue: string
    label: string
    type: 'text' | 'password' | 'email' | 'tel'
    placeholder: string
    maxLength: number
    isExpandable: boolean
    disabled: boolean
}
