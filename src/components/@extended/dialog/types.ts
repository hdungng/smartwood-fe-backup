import type React from 'react';
import type { PropsWithChildren } from 'react';
import type { DialogOwnerState, DialogProps, DialogTransitionSlotPropsOverrides } from '@mui/material/Dialog';
import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';
import {
  BackdropProps,
  ContainerProps,
  DialogActionsProps,
  DialogContentProps,
  ModalProps,
  SlotComponentProps,
  StackProps
} from '@mui/material';
import { PaperProps } from '@mui/material/Paper';
import { TransitionProps } from '@mui/material/transitions';
import { ButtonProps } from '@mui/material/Button';
import { DialogRequest } from 'contexts/DialogContext';

export type ConfirmDialogProps = {
  title: string;
  description?: string;
  onAccept?: AsyncVoidFunction | VoidFunction;
  onReject?: VoidFunction;
  label?: {
    accept?: string;
    reject?: string;
  };
  slots?: {
    title?: React.ReactNode;
    action?: React.ReactNode;
    content?: React.ReactNode;
  };
  slotProps?: {
    submitting?: {
      disabledAllButton?: boolean;
    };
    root?: Omit<CustomDialogProps, 'children' | 'visible' | 'onClose'>;
    accept?: Omit<ButtonProps, 'label'>;
    reject?: Omit<ButtonProps, 'label'>;
  };
};

export type CustomDialogProps = DialogRequest &
  PropsWithChildren &
  Omit<DialogProps, 'title' | 'open' | 'onClose' | 'slotProps'> & {
    title?: string;
    sx?: SxProps<Theme>;
    maxWidth?: Breakpoint;
    onClose?: VoidFunction;
    canClickOutside?: boolean;
    action?: React.ReactNode;
    slots?: {
      title?: React.ReactNode;
    };
    slotProps?: {
      root?: {
        container?: ContainerProps;
        paper?: PaperProps;
        transition?: SlotComponentProps<
          React.ElementType<Dynamic, keyof React.JSX.IntrinsicElements>,
          TransitionProps & DialogTransitionSlotPropsOverrides,
          DialogOwnerState
        >;
        backdrop?: BackdropProps;
        root?: ModalProps;
      };
      title?: StackProps;
      action?: DialogActionsProps;
      content?: DialogContentProps;
      close?: {
        disableBtnClose?: boolean;
        hiddenBtnClose?: boolean;
      };
    };
  };

export type NotifyDialogProps = {
  title: string;
  description?: string;
  onAccept?: VoidFunction;
  onReject?: VoidFunction;
  label?: {
    accept?: string;
    reject?: string;
  };
  slots?: {
    title?: React.ReactNode;
    action?: React.ReactNode;
    content?: React.ReactNode;
  };
  slotProps?: {
    root?: Omit<CustomDialogProps, 'children' | 'visible' | 'onClose'>;
    accept?: Omit<ButtonProps, 'label'> & {
      show?: boolean;
    };
    reject?: Omit<ButtonProps, 'label'> & {
      show?: boolean;
    };
  };
};
