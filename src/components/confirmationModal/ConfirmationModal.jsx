import React, { useState } from 'react';
import { Button, Modal } from 'flowbite-react';
const style = {
  root: {
    base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
    show: {
      on: 'flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80',
      off: 'hidden',
    },
    sizes: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
    },
    positions: {
      'top-left': 'items-start justify-start',
      'top-center': 'items-start justify-center',
      'top-right': 'items-start justify-end',
      'center-left': 'items-center justify-start',
      center: 'items-center justify-center',
      'center-right': 'items-center justify-end',
      'bottom-right': 'items-end justify-end',
      'bottom-center': 'items-end justify-center',
      'bottom-left': 'items-end justify-start',
    },
  },
};

// eslint-disable-next-line react/prop-types
export const ConfirmationModal = ({ openModal, setOpenModal, onTogglePublisherDestroy }) => {
  const hanldeOnClick = () => {
    onTogglePublisherDestroy(false);
    setOpenModal(false);
  };
  return (
    <Modal size="md" theme={style} show={openModal} position="center" onClose={() => setOpenModal(false)} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-center text-[#111827] font-noto-sans text-sm font-medium leading-5">
            Are you sure you want to end webinar?
          </h1>
          <div className="flex justify-center gap-4">
            <Button
              className="flex items-center justify-center w-[4.75rem] rounded-[1.5625rem] border border-gray-300 bg-white shadow-sm text-gray-700 font-medium text-sm"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex items-center justify-center w-[4.75rem] rounded-[1.5625rem] border border-gray-300 bg-[#075985] shadow-sm text-white font-medium text-sm"
              onClick={hanldeOnClick}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
