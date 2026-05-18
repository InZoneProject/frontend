interface BaseInputBaseProperties {
    modelValue: string
    label: string
    placeholder: string
    maxLength: number
    minValue: number | null
    maxValue: number | null
    isExpandable: boolean
    disabled: boolean
}

export interface BaseInputOption {
    value: string
    label: string
}

interface BaseInputTextProperties extends BaseInputBaseProperties {
    type: 'text' | 'password' | 'email' | 'tel' | 'number'
    options?: never
}

interface BaseInputSelectProperties extends BaseInputBaseProperties {
    type: 'select'
    isExpandable: false
    options: BaseInputOption[]
}

export type BaseInputProperties = BaseInputTextProperties | BaseInputSelectProperties
