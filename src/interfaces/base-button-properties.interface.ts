export interface BaseButtonProperties {
    type: 'submit' | 'button' | 'reset'
    disabled: boolean
    loading: boolean
    variant: 'primary' | 'secondary' | 'danger'
}
