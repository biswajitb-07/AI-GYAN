import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useChatWithAiMutation } from "../../store/userApi";

const TypingDots = () => (
  <div className="inline-flex items-center gap-1.5">
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        className="h-2 w-2 animate-bounce rounded-full bg-sky-300"
        style={{ animationDelay: `${index * 0.12}s` }}
      />
    ))}
  </div>
);

const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Tell me your use case. I will suggest AI tools fast.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [chatWithAi] = useChatWithAiMutation();

  useEffect(() => {
    if (!open) {
      return;
    }

    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  const handleSend = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAi({
        message,
        history: nextMessages.slice(-6),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply,
          suggestions: Array.isArray(response.suggestions) ? response.suggestions : [],
        },
      ]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I could not help right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      {open ? (
        <div className="w-[min(92vw,22rem)] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                <Bot size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">AI Tool Guide</p>
                <p className="text-xs text-slate-400">Quick recommendations</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-400 transition hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div ref={messagesContainerRef} className="scrollbar-hidden max-h-[24rem] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-sky-400 text-slate-950"
                    : "bg-white/5 text-slate-200"
                }`}
              >
                {message.content}
                {message.role === "assistant" && Array.isArray(message.suggestions) && message.suggestions.length ? (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((tool) => (
                      <Link
                        key={tool.slug}
                        to={`/tools/${tool.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-slate-950/70 p-2.5 transition hover:border-sky-400/30 hover:bg-slate-900/80"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2">
                          {tool.image?.url ? <img src={tool.image.url} alt={tool.name} className="h-full w-full object-contain" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{tool.name}</p>
                            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-100">
                              {tool.pricing}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-400">{tool.category}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">{tool.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="inline-flex max-w-[88%] rounded-2xl bg-white/5 px-3.5 py-3">
                <TypingDots />
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask for tool suggestions..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-400 text-slate-950 transition hover:bg-sky-300"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-300"
        >
          <Sparkles size={16} />
          Gyan chat
        </button>
      )}
    </div>
  );
};

export default AiChatWidget;
