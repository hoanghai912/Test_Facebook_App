/* eslint-disable react/prop-types */
import moment from "moment";

const DataInbox = ({
  dataInbox,
  access_token,
  handleAddNewLabel,
  getRandomColor,
  handleDeleteLabel,
  handleSendMessage
}) => {

  return (
    <div className='p-6 overflow-hidden flex flex-col'>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Inbox</h2>
      <div className="flex-1 overflow-auto pr-2 space-y-4">
        {dataInbox.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No conversations found.</p>
        ) : (
          dataInbox.map((inbox, index) => (
            <div key={index} className='bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition'>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between mb-3 border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <a href={inbox.link} target='_blank' rel="noreferrer" className='text-lg font-bold text-blue-600 hover:text-blue-800 transition'>
                    {inbox.name}
                    <span className="ml-1 text-xs text-gray-400 font-normal">🔗</span>
                  </a>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className='px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium shadow-sm'>
                    {inbox.message_count} msgs
                  </span>
                  {inbox.unread_count > 0 && (
                    <span className='px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium shadow-sm'>
                      {inbox.unread_count} unread
                    </span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="mb-4 bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">Last Message</p>
                <div className="flex flex-col gap-1">
                  <p className='text-gray-800 italic'>&ldquo;{inbox.last_message.message || "No content"}&rdquo;</p>
                  <div className="flex justify-between items-center text-xs mt-2 text-gray-400">
                    <span className='text-orange-600 font-medium'>{inbox.last_message.from}</span>
                    <span>{moment(inbox.last_message.created_time).utcOffset(7).format('DD-MM-YYYY HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 flex gap-2">
                  <input
                    disabled={Math.abs(moment(inbox.last_message.created_time).diff(moment(), 'hours')) > 24}
                    type="text"
                    placeholder="Type a reply..."
                    className={`${inbox.psid}-inputMess flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  <button
                    disabled={Math.abs(moment(inbox.last_message.created_time).diff(moment(), 'hours')) > 24}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-sm transition"
                    onClick={() => handleSendMessage(inbox.psid, access_token)}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className='text-xs font-bold text-gray-500 uppercase'>Labels</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {inbox.labels.map((label) => (
                    <span key={label.id}
                      style={{ backgroundColor: getRandomColor() + '20', borderColor: getRandomColor() }}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm border bg-opacity-10 text-gray-700"
                    >
                      {label.page_label_name}
                      <button
                        className="ml-2 text-red-400 hover:text-red-600 font-bold px-1"
                        onClick={() => handleDeleteLabel(label.id, inbox.psid, access_token)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input type='text' placeholder="New label..." className={`${inbox.psid}-input border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none w-32`} />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-lg text-sm shadow-sm transition"
                    onClick={() => handleAddNewLabel(inbox.psid, access_token)}
                  >
                    Add
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DataInbox;