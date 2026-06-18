// src/pages/ai/AIAssistant.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const initialSuggestions = [
  'How can I improve my resume?',
  'How should I prepare for an interview?',
  'Which skills should I learn for frontend jobs?',
  'How can I get better job recommendations?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: makeId(),
      sender: 'bot',
      text: 'Hello! I am your AI Career Assistant. Ask me about resumes, interviews, skills, job search, or career growth.',
      category: 'welcome',
      suggestions: initialSuggestions,
      time: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const sendMessage = async (textValue) => {
    const userText = String(textValue || '').trim();

    if (!userText || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        sender: 'user',
        text: userText,
        time: new Date().toISOString(),
      },
    ]);

    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai-assistant/ask', {
        query: userText,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: 'bot',
          text:
            res.data?.response ||
            'I received your question, but I could not generate a proper response.',
          category: res.data?.category || 'general',
          suggestions: Array.isArray(res.data?.suggestions)
            ? res.data.suggestions
            : [],
          time: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get response.');

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: 'bot',
          text:
            'Sorry, I am having trouble connecting to the AI assistant. Please make sure backend is running and try again.',
          category: 'error',
          suggestions: initialSuggestions.slice(0, 3),
          time: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: makeId(),
        sender: 'bot',
        text: 'Chat cleared. Ask me anything about your career journey.',
        category: 'welcome',
        suggestions: initialSuggestions,
        time: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  const latestBotSuggestions =
    [...messages].reverse().find((msg) => msg.sender === 'bot')?.suggestions ||
    initialSuggestions;

  return (
    <div className="h-[calc(100vh-68px)] overflow-hidden bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto grid h-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* MAIN CHAT */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* HEADER */}
          <div className="relative shrink-0 bg-slate-950 px-5 py-3.5 text-white">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-12 top-0 h-16 w-16 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-12 h-16 w-16 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <BotIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    AI Career Assistant
                  </div>

                  <h1 className="truncate text-xl font-black tracking-tight">
                    Career Chat
                  </h1>

                  <p className="truncate text-xs font-semibold text-slate-300">
                    Resume tips, interviews, skills, jobs, and career guidance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearChat}
                className="shrink-0 rounded-2xl bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
              >
                Clear
              </button>
            </div>
          </div>

          {/* CHAT BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onSuggestionClick={sendMessage}
                  disabled={loading}
                />
              ))}

              {loading && <TypingBubble />}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* INPUT */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about resume, interview, skills, or jobs..."
                disabled={loading}
                className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <SendIcon className="mr-2 h-5 w-5" />
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="hidden min-h-0 space-y-4 overflow-y-auto lg:block">
          <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Quick Questions
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">
              Ask Faster
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Tap a question to start.
            </p>

            <div className="mt-4 grid gap-2">
              {latestBotSuggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-black leading-5 text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Career Tools
            </p>

            <div className="mt-4 grid gap-2">
              <SideLink to="/profile" label="Update Profile" icon={UserIcon} />
              <SideLink to="/skills" label="Add Skills" icon={SparkIcon} />
              <SideLink to="/resumes" label="Manage Resumes" icon={ResumeIcon} />
              <SideLink to="/recommendations" label="Recommendations" icon={BriefcaseIcon} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ChatBubble({ message, onSuggestionClick, disabled }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[86%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'border border-slate-200 bg-white text-slate-800'
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BotIcon className="h-4 w-4" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {formatCategory(message.category)}
            </span>
          </div>
        )}

        <p className="whitespace-pre-line text-sm font-semibold leading-6">
          {message.text}
        </p>

        {!isUser && message.suggestions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                disabled={disabled}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <p
          className={`mt-2 text-[10px] font-bold ${
            isUser ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          {formatTime(message.time)}
        </p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <SpinnerIcon className="h-4 w-4 animate-spin text-indigo-600" />

          <p className="text-sm font-black text-slate-600">
            Thinking...
          </p>
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/* ================= HELPERS ================= */

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCategory(category) {
  if (!category) return 'Assistant';

  return String(category)
    .replaceAll('_', ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ================= ICONS ================= */

function BotIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3M8 6h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9.5 16h5" />
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

function UserIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function SparkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function ResumeIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 13h8M8 17h5" />
    </svg>
  );
}

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
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