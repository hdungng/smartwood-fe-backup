import { useDialog } from './useDialog';
import { ConfirmDialogProps } from 'components/@extended/dialog';
import { merge } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';

const defaultOptions: ConfirmDialogProps = {
  title: 'Xác nhận bỏ qua các thay đổi',
  description: 'Bạn có chắc chắn muốn rời khỏi mà không lưu các thay đổi hiện tại không?',
  label: {
    accept: 'Tiếp tục',
    reject: 'Hủy bỏ'
  },
  slotProps: {
    accept: {
      color: 'primary'
    }
  }
};

export type Props = ConfirmDialogProps;

type ConfirmLeaveOptions = {
  useCustomDialog?: boolean;
  customDialogOptions?: Omit<ConfirmDialogProps, 'onAccept'>;
};

export const useConfirmLeave = (
  hasUnsavedChanges?: boolean,
  options?: ConfirmLeaveOptions
) => {
  const dialog = useDialog();
  const isConfirmingRef = useRef(false);

  const {
    customDialogOptions,
    useCustomDialog = true,
  } = options || {};
  
  const confirmLeave = useCallback(
    async (callback: VoidFunction, hasShowConfirm: boolean = false, customOptions?: Omit<ConfirmDialogProps, 'onAccept'>) => {
      const mergeOptions = merge({}, defaultOptions, customDialogOptions || {}, customOptions);

      if (!hasShowConfirm && !hasUnsavedChanges) {
        callback();
        return;
      }

      const result = await dialog.confirm({
        ...mergeOptions,
        onAccept: callback
      });

      return result?.success ?? false;
    },
    [dialog, options, hasUnsavedChanges]
  );

  const confirmLeaveWithCustomDialog = async (customOptions?: Omit<ConfirmDialogProps, 'onAccept'>) => {
    return new Promise<boolean>((resolve) => {
      const mergeOptions = merge({}, defaultOptions, customDialogOptions, customOptions);

      dialog.confirm({
        ...mergeOptions,
        onAccept: () => resolve(true),
        onReject: () => resolve(false)
      });
    });
  };

  useEffect(() => {
    if (hasUnsavedChanges === undefined) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isConfirmingRef.current) {
        if (!useCustomDialog) {
          const confirmationMessage = 'Bạn có chắc chắn muốn rời khỏi trang này? Các thay đổi chưa lưu sẽ bị mất.';
          event.preventDefault();
          event.returnValue = confirmationMessage;
          return confirmationMessage;
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect F5 or Ctrl+R
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        if (hasUnsavedChanges && useCustomDialog && !isConfirmingRef.current) {
          event.preventDefault();

          isConfirmingRef.current = true;
          confirmLeaveWithCustomDialog().then((confirmed) => {
            isConfirmingRef.current = false;
            if (confirmed) {
              window.location.reload();
            }
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    if (useCustomDialog) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (useCustomDialog) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [hasUnsavedChanges, options]);

  return {
    confirmLeave,
    confirmLeaveWithCustomDialog
  };
};
