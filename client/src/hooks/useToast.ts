import { toast as toastStore } from '../stores/toastStore';

export const useToast = () => {
  return {
    success: (msg: string) => toastStore.success(msg),
    error: (msg: string) => toastStore.error(msg),
    info: (msg: string) => toastStore.info(msg),
    warning: (msg: string) => toastStore.warning(msg),
  };
};
