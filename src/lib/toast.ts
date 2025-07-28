import { toast } from 'react-toastify';

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId: string) => toast.dismiss(toastId),
    update: (toastId: string, options: object) => toast.update(toastId, options),
};