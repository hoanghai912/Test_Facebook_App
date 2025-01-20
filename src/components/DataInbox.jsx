/* eslint-disable react/prop-types */
import moment from "moment"

const DataInbox = ({dataInbox, access_token, handleAddNewLabel,
  getRandomColor, handleDeleteLabel, handleSendMessage
}) => {

  return (
    <ul className='overflow-auto h-[80%] list-disc list-inside m-5'>
      {dataInbox.map((inbox, index) => (
        <li key={index} className='py-2'>
          <a href={inbox.link} target='_blank' className='hover:text-blue-500 font-bold'>{inbox.name} </a>
          -
          <span className='text-green-500 font-medium'> {inbox.message_count} messages </span>
          -
          <span className='text-red-500 font-medium'> {inbox.unread_count} unread </span>

          <div>
            <p className="text-blue-600">Last Message:</p>
            <span className='text-sm'>{inbox.last_message.message} </span>
            -
            <span className='text-sm text-yellow-600 font-semibold'> {moment(inbox.last_message.created_time).utcOffset(7).format('DD-MM-YYYY')} </span>
            -
            <span className='text-sm text-orange-500 font-semibold'> {inbox.last_message.from}</span>
          </div>
          <div>
            <input disabled={Math.abs(moment(inbox.last_message.created_time).diff(moment(), 'hours')) > 24} type="text" className={`${inbox.psid}-inputMess border-2`} />
            <button className={`${customStyle.styleBtnDefault} px-3 py-2 text-xs mx-2 my-2 text-cyan-700`}
              onClick={() => handleSendMessage(inbox.psid, access_token)}
            >Send Message 📩</button>
          </div>
          <p className='font-bold text-sm'>Labels of this conversation:</p>
          <input type='text' className={`${inbox.psid}-input border-2`} />
          <button className={`${customStyle.styleBtnDefault} px-3 py-2 text-xs mx-2 my-2 text-green-500`}
            onClick={() => handleAddNewLabel(inbox.psid, access_token)}
          >Add new label</button>
          <p></p>
          {inbox.labels.map((label) => {
            return (
              <div key={label.id} className='inline-block mr-2'>
                <p className={`inline-block bg-[${getRandomColor()}] p-1 px-2 rounded text-sm`}>
                  {label.page_label_name}
                  <button className={`${customStyle.styleBtnDefault} px-1 py-0.5 ml-2 text-xs text-red-500`}
                    onClick={() => handleDeleteLabel(label.id, inbox.psid, access_token)}
                  >x</button>
                </p>
              </div>
            )
          })}
        </li>
      ))}
    </ul>
  )
}

const customStyle = {
  styleBtnDefault: 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
}

export default DataInbox