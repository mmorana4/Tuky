import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    onConfirm: null,
    onCancel: null,
    icon: null,
  });

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning',
    icon,
    onConfirm,
    onCancel,
  }) => {
    setDialog({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      icon,
      onConfirm: () => {
        setDialog(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setDialog(prev => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      },
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };

  const DialogComponent = () => (
    <ConfirmDialog
      visible={dialog.visible}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      type={dialog.type}
      icon={dialog.icon}
      onConfirm={dialog.onConfirm}
      onCancel={dialog.onCancel}
    />
  );

  return { showConfirm, hideDialog, DialogComponent };
};
