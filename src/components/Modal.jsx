/* eslint-disable react/prop-types */

const Modal = (props) => {
  return (
    <div>
      <div className='modal bg-gray-300 w-full h-full opacity-90 absolute top-0 left-0' onClick={props.handleCloseModal}></div>
      <div className="modal-container bg-white w-[80%] h-[80%] absolute top-[50%] left-[50%]">
        <div className='flex justify-between items-center'>
          <div className='text-2xl font-bold text-blue-500 ml-5 mt-5'>List Inbox of page</div>
          <div className='text-4xl cursor-pointer hover:text-red-500 mr-5 mt-4' onClick={props.handleCloseModal}>&times;</div>
        </div>
        <div className="modal-content">
          
        </div>
        {props.children}
      </div>
    </div>
  );
}

export default Modal;