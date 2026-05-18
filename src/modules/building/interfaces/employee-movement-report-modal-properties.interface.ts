export interface EmployeeMovementReportModalProperties {
    isOpen: boolean
    dateValue: string
    minDate: string
    maxDate: string
    loading: boolean
    canSubmit: boolean
    employeeName: string
    locale: string
    translations: {
        title: string
        dateLabel: string
        download: string
        cancel: string
    }
}
