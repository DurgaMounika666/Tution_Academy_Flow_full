/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type SupportTopic = "Admissions" | "Fees" | "Classes" | "Login" | "General";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
}

const QUICK_TOPICS: Array<{ label: string; topic: SupportTopic }> = [
  { label: "Admissions", topic: "Admissions" },
  { label: "Fees", topic: "Fees" },
  { label: "Classes", topic: "Classes" },
  { label: "Login help", topic: "Login" },
];

const TOPIC_REPLY_BANK: Record<SupportTopic, string[]> = {
  Admissions: [
    "I can help with admissions and registration. Please share the student name and grade.",
    "For admissions, I can guide you through registration, demo booking, and class selection.",
    "Admissions help is available. Tell me the student's grade and what stage you're stuck at.",
  ],
  Fees: [
    "I can help with fee status, invoices, and receipts. Share the student name or invoice ID.",
    "For fee questions, send the invoice number or the child's name and I’ll guide you.",
    "I can check payment-related questions. Tell me which fee or receipt you need help with.",
  ],
  Classes: [
    "I can help with class timings and subject schedules. Mention the class or subject you need.",
    "For class support, tell me the day, subject, or batch timing you want to confirm.",
    "I can help you find the right class schedule. Share the subject or grade.",
  ],
  Login: [
    "I can help with login issues for student, parent, and tutor accounts. Which portal is failing?",
    "For login help, tell me the portal name and what error you see.",
    "I can help with access issues. Share the portal and the exact problem message if you have one.",
  ],
  General: [
    "I can help with admissions, fees, classes, and login issues. What do you need?",
    "Tell me what you need help with and I’ll point you to the right step.",
    "I can assist with common academy questions. Please send a bit more detail.",
  ],
};

const PRECISE_REPLY_BANK: Record<SupportTopic, string[]> = {
  Admissions: [
    "For admission, use Register on the website, fill parent details, select the student's class from 1st to 10th Class, then submit. The admin receives the request with Accept/Reject options.",
  ],
  Fees: [
    "Fee status, payments, and receipts are available in the Parent Dashboard under Fees. Admins can review pending registration advance approvals in the Admin Dashboard.",
  ],
  Classes: [
    "Academy Flow supports 1st Class through 10th Class. You can choose online, offline, or online & offline mode, then book a demo from the home page.",
  ],
  Login: [
    "Student login uses Student ID and Password. Parent, Tutor, and Admin logins use Email and Password. If access fails, use Forgot Password to verify email, enter OTP, and set a new password.",
  ],
  General: [
    "I can help with admissions, fees, class selection, demo booking, login, password reset, and dashboard navigation. Please ask one of those topics for the clearest answer.",
  ],
};

const LOCALIZED_REPLY_BANK: Record<string, Record<SupportTopic, string[]>> = {
  English: PRECISE_REPLY_BANK,
  Telugu: {
    Admissions: ["ప్రవేశం కోసం వెబ్‌సైట్‌లో Register ఎంచుకుని, తల్లిదండ్రుల వివరాలు నింపి, 1st Class నుంచి 10th Class వరకు విద్యార్థి తరగతిని ఎంచుకుని Submit చేయండి. ఆ అభ్యర్థన Admin Dashboard లో Accept/Reject కోసం కనిపిస్తుంది."],
    Fees: ["ఫీజులు, చెల్లింపులు, రసీదులు Parent Dashboard లోని Fees విభాగంలో కనిపిస్తాయి. రిజిస్ట్రేషన్ అడ్వాన్స్ ఆమోదాలను Admin Dashboard లో అడ్మిన్ పరిశీలించవచ్చు."],
    Classes: ["Academy Flow లో 1st Class నుంచి 10th Class వరకు తరగతులు ఉన్నాయి. ఆన్‌లైన్, ఆఫ్‌లైన్ లేదా ఆన్‌లైన్ & ఆఫ్‌లైన్ మోడ్ ఎంచుకుని హోమ్ పేజీ నుంచి డెమో బుక్ చేయవచ్చు."],
    Login: ["Student login కి Student ID మరియు Password అవసరం. Parent, Tutor, Admin లాగిన్‌లకు Email మరియు Password అవసరం. సమస్య ఉంటే Forgot Password ద్వారా Email, OTP verify చేసి కొత్త Password సెట్ చేయండి."],
    General: ["నేను admissions, fees, class selection, demo booking, login, password reset, dashboard navigation గురించి సహాయం చేయగలను. స్పష్టమైన సమాధానం కోసం వాటిలో ఒకటి అడగండి."],
  },
  Hindi: {
    Admissions: ["प्रवेश के लिए वेबसाइट पर Register चुनें, अभिभावक विवरण भरें, 1st Class से 10th Class तक छात्र की कक्षा चुनें और Submit करें. यह अनुरोध Admin Dashboard में Accept/Reject के लिए दिखेगा."],
    Fees: ["फीस, भुगतान और रसीदें Parent Dashboard के Fees सेक्शन में मिलती हैं. रजिस्ट्रेशन एडवांस अनुमोदन Admin Dashboard में एडमिन देख सकता है."],
    Classes: ["Academy Flow में 1st Class से 10th Class तक कक्षाएं हैं. ऑनलाइन, ऑफलाइन या ऑनलाइन & ऑफलाइन मोड चुनकर होम पेज से डेमो बुक करें."],
    Login: ["Student login के लिए Student ID और Password चाहिए. Parent, Tutor और Admin login के लिए Email और Password चाहिए. समस्या हो तो Forgot Password से Email, OTP verify करके नया Password सेट करें."],
    General: ["मैं admissions, fees, class selection, demo booking, login, password reset और dashboard navigation में मदद कर सकता हूं. साफ जवाब के लिए इनमें से एक विषय पूछें."],
  },
};

const GENERIC_FOLLOW_UPS = [
  "Could you share a little more detail so I can help faster?",
  "Which class, fee, or portal are you asking about?",
  "If you share the student name or issue type, I can respond more accurately.",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "support-welcome",
    role: "assistant",
    text:
      "Hi, I’m Academy Flow Support. Ask me about admissions, fees, classes, or login help.",
    time: "Just now",
  },
];

function getTopicFromText(text: string): SupportTopic {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("fee") ||
    normalized.includes("payment") ||
    normalized.includes("invoice") ||
    normalized.includes("receipt")
  ) {
    return "Fees";
  }

  if (
    normalized.includes("admission") ||
    normalized.includes("register") ||
    normalized.includes("demo") ||
    normalized.includes("enroll")
  ) {
    return "Admissions";
  }

  if (
    normalized.includes("class") ||
    normalized.includes("schedule") ||
    normalized.includes("timing") ||
    normalized.includes("timetable")
  ) {
    return "Classes";
  }

  if (
    normalized.includes("student") ||
    normalized.includes("parent") ||
    normalized.includes("tutor") ||
    normalized.includes("login") ||
    normalized.includes("portal")
  ) {
    return "Login";
  }

  return "General";
}

function hasEnoughDetail(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length >= 4;
}

function pickVariant(seed: string, variants: string[]): string {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return variants[total % variants.length];
}

function createAssistantReply(userText: string, previousMessages: ChatMessage[], language: string): ChatMessage {
  const topic = getTopicFromText(userText);
  const lower = userText.toLowerCase();
  const lastAssistant = [...previousMessages].reverse().find((item) => item.role === "assistant");
  const repeatedTopicCount = previousMessages.filter(
    (item) => item.role === "assistant" && getTopicFromText(item.text) === topic
  ).length;

  if (!hasEnoughDetail(userText)) {
    return {
      id: `support-${Date.now()}`,
      role: "assistant",
      text: pickVariant(userText, GENERIC_FOLLOW_UPS),
      time: "Just now",
    };
  }

  if (
    lower.includes("hi") ||
    lower.includes("hello") ||
    lower.includes("hey") ||
    lower.includes("thanks") ||
    lower.includes("thank you")
  ) {
    return {
      id: `support-${Date.now()}`,
      role: "assistant",
      text: "You’re welcome. Tell me the exact issue and I’ll help step by step.",
      time: "Just now",
    };
  }

  if (lower.includes("otp") || lower.includes("forgot") || lower.includes("reset") || lower.includes("password")) {
    return {
      id: `support-${Date.now()}`,
      role: "assistant",
      text: language === "Telugu"
        ? "లాగిన్ పోర్టల్‌లో Forgot Password ఉపయోగించండి. Step 1 email verify చేస్తుంది, Step 2 OTP verify చేస్తుంది, Step 3 కొత్త Password set చేసి confirm చేయడానికి సహాయపడుతుంది."
        : language === "Hindi"
          ? "लॉगिन पोर्टल में Forgot Password इस्तेमाल करें. Step 1 email verify करता है, Step 2 OTP verify करता है, और Step 3 नया Password set और confirm करने देता है."
          : "Use Forgot Password in the login portal. Step 1 verifies your email, Step 2 verifies the OTP, and Step 3 lets you set and confirm a new password.",
      time: "Just now",
    };
  }

  if (lastAssistant && repeatedTopicCount > 2 && topic === "General") {
    return {
      id: `support-${Date.now()}`,
      role: "assistant",
      text: "I’m getting the same topic again. Share the student name, portal name, or invoice ID so I can give a more specific answer.",
      time: "Just now",
    };
  }

  return {
    id: `support-${Date.now()}`,
    role: "assistant",
    text: pickVariant(userText, (LOCALIZED_REPLY_BANK[language] || PRECISE_REPLY_BANK)[topic]),
    time: "Just now",
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatSupportWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("academyflow_support_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // Ignore invalid saved history.
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("academyflow_support_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const now = formatTime(new Date());
    const userMsg: ChatMessage = {
      id: `support-user-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: now,
    };

    setMessages((current) => [...current, userMsg, { ...createAssistantReply(trimmed, current, language), time: now }]);
    setMessage("");
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleQuickTopic = (topic: SupportTopic) => {
    const now = formatTime(new Date());
    const reply = pickVariant(`${topic}-${messages.length}`, (LOCALIZED_REPLY_BANK[language] || PRECISE_REPLY_BANK)[topic]);
    setIsOpen(true);
    setIsMinimized(false);
    setMessages((current) => [
      ...current,
      {
        id: `support-topic-${Date.now()}`,
        role: "assistant",
        text: reply,
        time: now,
      },
    ]);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-[#10b981] text-white shadow-[5px_5px_0_#000] transition-transform hover:-translate-y-0.5"
          aria-label="Open support chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-1rem)] max-w-[340px] overflow-hidden rounded-[24px] border-4 border-black bg-[#fffdf7] shadow-[8px_8px_0_#000]">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#fbbf24] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border-2 border-black bg-white text-black">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/60">
                  Academy Flow
                </p>
                <h3 className="text-sm font-black leading-tight text-black">Support Chat</h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black"
                aria-label="Minimize support chat"
              >
                <ChevronDown className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black"
                aria-label="Close support chat"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="border-b-4 border-black bg-white px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
              Quick topics
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickTopic(item.topic)}
                  className="rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black text-slate-800 transition-transform hover:-translate-y-0.5"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={listRef}
            className="max-h-[220px] space-y-2.5 overflow-y-auto bg-[#fffdf7] px-3 py-3"
          >
            {messages.map((item) => (
              <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-[18px] border-2 border-black px-3 py-2.5 text-xs leading-5 shadow-[3px_3px_0_#000] ${
                    item.role === "user" ? "bg-[#10b981] text-white" : "bg-white text-slate-900"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] opacity-80">
                    {item.role === "user" ? <span>You</span> : <span>Support</span>}
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t-4 border-black bg-white p-2.5">
            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Type your message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Ask about admissions, fees, classes, or login help..."
                  className="w-full resize-none rounded-2xl border-2 border-black bg-[#f8fafc] px-3 py-2.5 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-[#f97316] text-white shadow-[3px_3px_0_#000]"
                aria-label="Send support message"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {isOpen && isMinimized && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border-2 border-black bg-[#fffdf7] px-3 py-2 text-sm font-black text-black shadow-[5px_5px_0_#000]"
          aria-label="Restore support chat"
        >
          <MessageCircle className="h-4.5 w-4.5" />
          Support chat
        </button>
      )}
    </>
  );
}
