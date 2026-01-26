/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { facebookService } from '../api/facebookService';
import { backendService } from '../api/backendService';
import { getRandomColor } from '../utils/helpers';
import Modal from '../components/Modal';
import DataInbox from '../components/DataInbox';
import EditFanpage from '../components/EditFanpage';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

const DashboardPage = ({ user, onLogout }) => {
    const [listFanpages, setListFanpages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null); // 'dataInbox' or 'editFanpage'

    // Data State
    const [dataInbox, setDataInbox] = useState([]);
    const [currentFanpage, setCurrentFanpage] = useState(null);
    const [fanpageDetail, setFanpageDetail] = useState(null);

    const fetchFacebookPage = async () => {
        setIsLoading(true);
        try {
            const data = await facebookService.getAccounts(user.accessToken);
            if (data) {
                setListFanpages(data);
            }
        } catch (error) {
            console.error('Error fetching pages', error);
        }
        setIsLoading(false);
    }

    const handleShowDataOfFanpage = async (fanpage) => {
        setIsLoading(true);
        setCurrentFanpage(fanpage);
        setModalContent('dataInbox');

        try {
            const data = await facebookService.getConversations(fanpage.id, fanpage.access_token);
            const inboxData = [];

            if (data.data && data.data.length > 0) {
                // Fetch labels and last messages in parallel
                const labelsPromise = Promise.all(
                    data.data.map(conversation =>
                        facebookService.getCustomLabels(conversation.participants.data[0].id, fanpage.access_token)
                    )
                );

                const messagesPromise = Promise.all(
                    data.data.map(conversation =>
                        facebookService.getLastMessage(conversation.id, fanpage.access_token)
                    )
                );

                const [labelsArr, lastMessageArr] = await Promise.all([labelsPromise, messagesPromise]);

                data.data.forEach((conversation, i) => {
                    const participant = conversation.participants.data.find(p => p.id !== fanpage.id);
                    if (!participant) return;

                    const lastMsgData = lastMessageArr[i];
                    const last_message = {
                        message: lastMsgData.length > 0 ? lastMsgData[0].message : '',
                        from: lastMsgData.length > 0 ? lastMsgData[0].from.name : '',
                        created_time: lastMsgData.length > 0 ? lastMsgData[0].created_time : ''
                    };

                    inboxData.push({
                        conversationId: conversation.id,
                        psid: participant.id,
                        name: participant.name,
                        link: `https://www.facebook.com/${conversation.link}`,
                        message_count: conversation.message_count,
                        unread_count: conversation.unread_count,
                        can_reply: conversation.can_reply,
                        labels: labelsArr[i] || [],
                        last_message
                    });
                });

                setDataInbox(inboxData);
            } else {
                setDataInbox([]);
            }
            setShowModal(true);
        } catch (error) {
            console.error(error);
            alert('Failed to load inbox data');
        }
        setIsLoading(false);
    }

    const handleEditFanpage = async (accessToken) => {
        setIsLoading(true);
        setModalContent('editFanpage');
        try {
            const details = await facebookService.getPageDetails(accessToken);
            if (details) {
                setFanpageDetail(details);
                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to load page details');
        }
        setIsLoading(false);
    }

    const handleSubcribeToAutoReply = async (pageId, accessToken) => {
        setIsLoading(true);
        try {
            const response = await facebookService.subscribeApp(pageId, accessToken);
            if (response?.success) {
                const saveRes = await backendService.savePageData(pageId, listFanpages.data.find(fanpage => fanpage.id === pageId).access_token);
                if (saveRes.success) {
                    alert('Subscribed to Auto Reply successfully');
                } else {
                    alert('Subscribed to Auto Reply failed at backend');
                }
            } else {
                alert('Subscribed to Auto Reply failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error subscribing to Auto Reply');
        }
        setIsLoading(false);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        setModalContent(null);
    }

    // --- Handlers passed to DataInbox ---
    const handleDeleteLabel = async (labelId, psid, accessToken) => {
        setIsLoading(true);
        try {
            const response = await facebookService.deleteLabel(labelId, psid, accessToken);
            if (response.success) {
                setDataInbox(prev => prev.map(inbox => {
                    if (inbox.psid === psid) {
                        return { ...inbox, labels: inbox.labels.filter(l => l.id !== labelId) };
                    }
                    return inbox;
                }));
            }
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    }

    const handleAddNewLabel = async (psid, accessToken) => {
        setIsLoading(true);
        // NOTE: Using document.getElementsByClassName is not ideal React practice, 
        // but refactoring DataInbox to use state is out of scope for "keep functions".
        // We will keep it working as is but cleaner code.
        const inputEl = document.querySelector(`.` + CSS.escape(`${psid}-input`));
        if (!inputEl) { setIsLoading(false); return; }

        const nameLabel = inputEl.value;
        if (!nameLabel) { setIsLoading(false); return; }

        try {
            const idLabel = await facebookService.createCustomLabel(nameLabel, accessToken);
            if (idLabel) {
                const response = await facebookService.addLabelToUser(idLabel, psid, accessToken);
                if (response.success) {
                    setDataInbox(prev => prev.map(inbox => {
                        if (inbox.psid === psid) {
                            return { ...inbox, labels: [...inbox.labels, { id: idLabel, page_label_name: nameLabel }] };
                        }
                        return inbox;
                    }));
                }
            }
        } catch (error) {
            console.error(error);
        }
        inputEl.value = '';
        setIsLoading(false);
    }

    const handleSendMessage = async (psid, accessToken) => {
        const inputEl = document.querySelector(`.` + CSS.escape(`${psid}-inputMess`));
        const message = inputEl?.value;

        if (!message) {
            alert('Please enter message to send');
            return;
        }

        try {
            const response = await facebookService.sendMessage(psid, message, accessToken);
            if (response?.message_id) {
                setDataInbox(prev => prev.map(inbox => {
                    if (inbox.psid === psid) {
                        return {
                            ...inbox,
                            message_count: inbox.message_count + 1,
                            last_message: {
                                message: message,
                                created_time: new Date().toISOString(),
                                from: 'You'
                            }
                        };
                    }
                    return inbox;
                }));
                inputEl.value = '';
            } else {
                alert('Send message failed');
            }
        } catch (error) {
            console.error(error);
            alert('Send message failed');
        }
    }

    const handleLogout = () => {
        onLogout();
    }
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <img src={user.picture.data.url} alt={user.name} className="w-16 h-16 rounded-full border-2 border-green-500" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Welcome, <span className="text-green-600">{user.name}</span></h2>
                            <p className="text-sm text-gray-500">Manage your Facebook Pages easily</p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={fetchFacebookPage}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md"
                        >
                            Get Fanpages
                        </button>
                        <br />
                        <br />
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {listFanpages.data?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-700">Your Fanpages</h3>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {listFanpages.data.map((fanpage, index) => (
                                <li key={index} className="p-4 hover:bg-gray-50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <span className="font-semibold text-gray-800 text-lg">{fanpage.name}</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200 text-sm font-medium transition"
                                            onClick={() => handleShowDataOfFanpage(fanpage)}
                                        >
                                            Inbox
                                        </button>
                                        <button
                                            className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded border border-amber-200 text-sm font-medium transition"
                                            onClick={() => handleEditFanpage(fanpage.access_token)}
                                        >
                                            Edit Info
                                        </button>
                                        <button
                                            className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1 rounded border border-purple-200 text-sm font-medium transition"
                                            onClick={() => handleSubcribeToAutoReply(fanpage.id, fanpage.access_token)}
                                        >
                                            Auto-Reply
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    {modalContent === 'dataInbox' && (
                        <DataInbox
                            dataInbox={dataInbox}
                            access_token={currentFanpage?.access_token}
                            handleAddNewLabel={handleAddNewLabel}
                            handleDeleteLabel={handleDeleteLabel}
                            handleSendMessage={handleSendMessage}
                            getRandomColor={getRandomColor}
                        />
                    )}
                    {modalContent === 'editFanpage' && (
                        <EditFanpage fanpageDetail={fanpageDetail} />
                    )}
                </Modal>
            )}

            {isLoading && <LoadingScreen />}
        </div>
    );
};

export default DashboardPage;
