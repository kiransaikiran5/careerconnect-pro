import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function Messaging() {
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [newMsg, setNewMsg] = useState('');
  const [startEmail, setStartEmail] = useState('');
  const [startMessage, setStartMessage] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const unreadTotal = useMemo(() => {
    return conversations.reduce(
      (total, conv) => total + Number(conv.unread_count || 0),
      0
    );
  }, [conversations]);

  const refreshHeaderCounts = useCallback(() => {
    window.dispatchEvent(new Event('careerconnect:refresh-counts'));
  }, []);

  const scrollToBottom = useCallback(() => {
    window.setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);

      const res = await api.get('/messages/conversations');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setConversations(list);

      if (list.length === 0) {
        setNewChatOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load conversations.');
      setConversations([]);
      setNewChatOpen(true);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (otherUserId) => {
      if (!otherUserId) return;

      try {
        setMessagesLoading(true);

        const res = await api.get(`/messages/conversation/${otherUserId}`);

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setMessages(list);

        // Instantly remove unread badge from the clicked conversation
        setConversations((prev) =>
          prev.map((conv) =>
            String(conv.other_user_id) === String(otherUserId)
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );

        // Instantly refresh Header message badge without page refresh
        refreshHeaderCounts();

        scrollToBottom();

        // Background refresh to update last message and order
        fetchConversations();
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Could not load messages.');
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [fetchConversations, refreshHeaderCounts, scrollToBottom]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const openChat = async (conv) => {
    const chatUser = {
      id: conv.other_user_id,
      name:
        conv.other_user_name ||
        getNameFromEmail(conv.other_user_email) ||
        `User #${conv.other_user_id}`,
      email: conv.other_user_email || '',
      role: conv.other_user_role || '',
    };

    setActiveChat(chatUser);
    setMessages([]);
    setNewChatOpen(false);

    await loadMessages(conv.other_user_id);

    inputRef.current?.focus();
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();

    const receiverEmail = startEmail.trim().toLowerCase();
    const content = startMessage.trim();

    if (!receiverEmail) {
      toast.error('Please enter receiver email.');
      return;
    }

    if (!receiverEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (receiverEmail === String(user?.email || '').toLowerCase()) {
      toast.error('You cannot message yourself.');
      return;
    }

    if (!content) {
      toast.error('Please type your first message.');
      return;
    }

    try {
      setStartingChat(true);

      const res = await api.post('/messages/', {
        receiver_email: receiverEmail,
        content,
      });

      const receiverId = res.data?.receiver_id;
      const displayName = getNameFromEmail(receiverEmail);

      const savedMessage = res.data?.id
        ? res.data
        : {
            id: `temp-${Date.now()}`,
            sender_id: user?.id,
            receiver_id: receiverId,
            content,
            sent_at: new Date().toISOString(),
            is_read: false,
          };

      setActiveChat({
        id: receiverId,
        name: displayName,
        email: receiverEmail,
      });

      setMessages([savedMessage]);
      setStartEmail('');
      setStartMessage('');
      setNewChatOpen(false);

      await fetchConversations();

      if (receiverId) {
        await loadMessages(receiverId);
      }

      refreshHeaderCounts();
      toast.success(`Conversation started with ${displayName}.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start conversation.');
    } finally {
      setStartingChat(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const content = newMsg.trim();

    if (!content) return;

    if (!activeChat?.id) {
      toast.error('Please select a conversation.');
      return;
    }

    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id,
      receiver_id: activeChat.id,
      content,
      sent_at: new Date().toISOString(),
      is_read: false,
      is_temp: true,
    };

    try {
      setSending(true);
      setNewMsg('');

      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      const res = await api.post('/messages/', {
        receiver_id: activeChat.id,
        content,
      });

      const savedMessage = res.data?.id
        ? res.data
        : {
            ...tempMessage,
            is_temp: false,
          };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? savedMessage : msg))
      );

      await fetchConversations();
      refreshHeaderCounts();
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMsg(content);
      toast.error(err.response?.data?.detail || 'Failed to send message.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-[calc(100vh-72px)] overflow-hidden bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-96 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <SidebarHeader
            unreadTotal={unreadTotal}
            loading={conversationsLoading}
            onRefresh={fetchConversations}
          />

          <div className="shrink-0 border-b border-slate-100 bg-white p-3">
            <button
              type="button"
              onClick={() => setNewChatOpen((prev) => !prev)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                newChatOpen
                  ? 'bg-slate-950 text-white'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500'
              }`}
            >
              {newChatOpen ? (
                <>
                  <CloseMiniIcon className="h-5 w-5" />
                  Close New Chat
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  New Conversation
                </>
              )}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-3">
            {newChatOpen && (
              <StartChatBox
                startEmail={startEmail}
                setStartEmail={setStartEmail}
                startMessage={startMessage}
                setStartMessage={setStartMessage}
                handleStartConversation={handleStartConversation}
                startingChat={startingChat}
              />
            )}

            <div className={newChatOpen ? 'mt-3' : ''}>
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Conversations
                </p>

                {unreadTotal > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {unreadTotal > 99 ? '99+' : unreadTotal} unread
                  </span>
                )}
              </div>

              {conversationsLoading ? (
                <ConversationSkeleton />
              ) : conversations.length === 0 ? (
                <EmptyConversation />
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv.other_user_id}
                      conv={conv}
                      active={String(activeChat?.id) === String(conv.other_user_id)}
                      onClick={() => openChat(conv)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MOBILE */}
        <div className="flex w-full flex-col md:hidden">
          <div className="shrink-0 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black">Messages</h1>
                <p className="text-xs font-semibold text-slate-300">
                  Start or open a conversation
                </p>
              </div>

              <button
                type="button"
                onClick={fetchConversations}
                className="rounded-2xl bg-white/10 p-2"
              >
                <RefreshIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveChat(null);
                  setNewChatOpen(true);
                }}
                className="shrink-0 rounded-2xl bg-indigo-500 px-3 py-2 text-xs font-black text-white"
              >
                + New
              </button>

              {conversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  type="button"
                  onClick={() => openChat(conv)}
                  className={`relative shrink-0 rounded-2xl px-3 py-2 text-xs font-black ${
                    String(activeChat?.id) === String(conv.other_user_id)
                      ? 'bg-white text-indigo-700'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {conv.other_user_name || getNameFromEmail(conv.other_user_email)}

                  {Number(conv.unread_count || 0) > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white ring-2 ring-slate-950">
                      {Number(conv.unread_count) > 99 ? '99+' : conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {!activeChat && (
            <div className="border-b border-slate-200 bg-white p-3">
              <StartChatBox
                startEmail={startEmail}
                setStartEmail={setStartEmail}
                startMessage={startMessage}
                setStartMessage={setStartMessage}
                handleStartConversation={handleStartConversation}
                startingChat={startingChat}
              />
            </div>
          )}

          <ChatPanel
            user={user}
            activeChat={activeChat}
            messages={messages}
            messagesLoading={messagesLoading}
            newMsg={newMsg}
            setNewMsg={setNewMsg}
            handleSend={handleSend}
            sending={sending}
            chatEndRef={chatEndRef}
            inputRef={inputRef}
          />
        </div>

        {/* DESKTOP CHAT AREA */}
        <main className="hidden min-w-0 flex-1 md:flex md:flex-col">
          <ChatPanel
            user={user}
            activeChat={activeChat}
            messages={messages}
            messagesLoading={messagesLoading}
            newMsg={newMsg}
            setNewMsg={setNewMsg}
            handleSend={handleSend}
            sending={sending}
            chatEndRef={chatEndRef}
            inputRef={inputRef}
          />
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SidebarHeader({ unreadTotal, loading, onRefresh }) {
  return (
    <div className="shrink-0 bg-slate-950 px-5 py-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Inbox
          </div>

          <h1 className="text-xl font-black">Messages</h1>

          <p className="mt-1 text-xs font-semibold text-slate-300">
            {unreadTotal > 0
              ? `${unreadTotal} unread message${unreadTotal === 1 ? '' : 's'}`
              : 'No unread messages'}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15 disabled:opacity-60"
          title="Refresh"
        >
          {loading ? (
            <SpinnerIcon className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function StartChatBox({
  startEmail,
  setStartEmail,
  startMessage,
  setStartMessage,
  handleStartConversation,
  startingChat,
}) {
  const previewName = startEmail.includes('@') ? getNameFromEmail(startEmail) : '';

  return (
    <form
      onSubmit={handleStartConversation}
      className="rounded-4xl border border-indigo-100 bg-white p-4 shadow-lg shadow-slate-200/80"
    >
      <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-cyan-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <MessageIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-black">Start Conversation</h2>
            <p className="mt-1 text-xs font-semibold text-indigo-100">
              Send a message using receiver email.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-500">
            Receiver Email
          </label>

          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              value={startEmail}
              onChange={(e) => setStartEmail(e.target.value)}
              placeholder="example: recruiter@gmail.com"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {previewName && (
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2">
              <Avatar name={previewName} small />

              <div className="min-w-0">
                <p className="truncate text-xs font-black text-indigo-700">
                  Chat with {previewName}
                </p>

                <p className="truncate text-[11px] font-semibold text-slate-500">
                  {startEmail}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-500">
            First Message
          </label>

          <textarea
            value={startMessage}
            onChange={(e) => setStartMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <button
          type="submit"
          disabled={startingChat}
          className="flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {startingChat ? (
            <>
              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              Starting Chat
            </>
          ) : (
            <>
              <SendIcon className="mr-2 h-5 w-5" />
              Start Chat
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ConversationItem({ conv, active, onClick }) {
  const unread = Number(conv.unread_count || 0);
  const name =
    conv.other_user_name ||
    getNameFromEmail(conv.other_user_email) ||
    `User #${conv.other_user_id}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl border p-3 text-left transition ${
        active
          ? 'border-indigo-200 bg-indigo-50 shadow-lg shadow-indigo-100/60'
          : unread > 0
            ? 'border-indigo-200 bg-white shadow-md shadow-indigo-100/70'
            : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-slate-200/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-sm ${unread > 0 ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>
              {name}
            </p>

            {unread > 0 && (
              <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>

          <p className={`mt-1 truncate text-xs ${unread > 0 ? 'font-black text-slate-700' : 'font-semibold text-slate-500'}`}>
            {conv.last_message || 'No messages yet'}
          </p>

          {conv.last_sent_at && (
            <p className="mt-1 text-[10px] font-bold text-slate-400">
              {formatDateTime(conv.last_sent_at)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyConversation() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center">
      <MessageIcon className="mx-auto h-9 w-9 text-slate-400" />

      <h3 className="mt-3 text-sm font-black text-slate-800">
        No conversations
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        Click New Conversation to start a chat.
      </p>
    </div>
  );
}

function ChatPanel({
  user,
  activeChat,
  messages,
  messagesLoading,
  newMsg,
  setNewMsg,
  handleSend,
  sending,
  chatEndRef,
  inputRef,
}) {
  if (!activeChat) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-6 text-center">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
            <MessageIcon className="h-8 w-8" />
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-950">
            Select or start a conversation
          </h2>

          <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
            Choose an existing chat or start a new one with receiver email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={activeChat.name} />

          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">
              {activeChat.name}
            </h2>

            <p className="truncate text-xs font-semibold text-slate-500">
              {activeChat.email || activeChat.role || 'Private conversation'}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-linear-to-br from-slate-50 to-indigo-50/40 p-5">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm font-bold text-slate-500">
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageIcon className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-lg font-black text-slate-900">
                No messages yet
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Send the first message.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-400 shadow-sm">
              Conversation History
            </div>

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} user={user} />
            ))}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-slate-200 bg-white p-3"
      >
        <div className="flex items-end gap-2 rounded-3xl bg-slate-50 p-2 ring-1 ring-slate-200">
          <input
            ref={inputRef}
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="h-11 flex-1 rounded-2xl border-0 bg-transparent px-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
          />

          <button
            type="submit"
            disabled={sending || !newMsg.trim()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? (
              <SpinnerIcon className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <SendIcon className="mr-2 h-5 w-5" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

function MessageBubble({ msg, user }) {
  const mine = String(msg.sender_id) === String(user?.id);

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-md sm:max-w-[68%] ${
          mine
            ? 'rounded-br-md bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-200'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-slate-200'
        }`}
      >
        <p className="whitespace-pre-line text-sm font-semibold leading-6">
          {msg.content}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-bold ${
            mine ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          <span>{formatTime(msg.sent_at || msg.created_at)}</span>
          {msg.is_temp && <span>Sending...</span>}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, small = false }) {
  const initial = String(name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 font-black text-white shadow-lg shadow-indigo-500/20 ${
        small ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
      }`}
    >
      {initial}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-44 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= HELPERS ================= */

function getNameFromEmail(email) {
  if (!email) return 'User';

  return String(email)
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ================= ICONS ================= */

function MessageIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7M5 20l3.5-3H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h.5L5 20Z" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12 20 4l-4 16-4-7-8-1Z" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseMiniIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 7 7 6 7-6" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}