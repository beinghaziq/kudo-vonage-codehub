import React, { useState } from 'react';
import { Button, Modal } from 'flowbite-react';

export const ConfirmationModal = () => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <>
      <Modal
        className="flex p-1 w-[24rem] items-center justify-center rounded-[1.25rem]"
        show={openModal}
        position="bottom-left"
        onClose={() => setOpenModal(false)}
        popup
      >
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
                onClick={() => setOpenModal(false)}
              >
                Yes
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
    // <div className="flex p-1 w-[24rem] items-center justify-center">
    //   <div className="flex items-center justify-center gap-[1.2rem]">
    //     <h1 className="text-center text-[#111827] font-noto-sans text-sm font-medium leading-5">
    //       Are you sure you want to end webinar?
    //     </h1>
    //   </div>
    // </div>
  );
};
