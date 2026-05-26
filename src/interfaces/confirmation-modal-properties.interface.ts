export interface ConfirmationModalProperties {
    isOpen: boolean;
    loading: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    errorMessage?: string;
}
