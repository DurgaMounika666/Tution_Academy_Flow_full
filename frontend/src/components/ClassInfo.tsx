import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const classInfoMap: Record<string, {
  title: string;
  description: string;
  benefits: string[];
  timings: string[];
}> = {
  "online-only": {
    title: "Online Classes",
    description: "Interactive online tuition with live sessions, flexible access, and digital progress tracking.",
    benefits: [
      "Live instructor-led classes with screen-sharing and instant doubt support.",
      "Flexible schedule options to fit busy family routines.",
      "Recorded sessions available for review anytime.",
      "Digital homework, assessments, and progress reports.",
      "Parent updates and online performance tracking.",
    ],
    timings: [
      "Monday to Friday: 6:00 PM - 8:00 PM",
      "Saturday: 10:00 AM - 12:00 PM",
      "On-demand catch-up sessions available for missed classes.",
    ],
  },
  "offline-only": {
    title: "Offline Classes",
    description: "In-person coaching with classroom practice, peer learning, and exam-ready support.",
    benefits: [
      "Structured classroom environment for focused learning.",
      "Hands-on guidance from experienced tutors.",
      "Regular revision and test practice to build confidence.",
      "Small batches for personal attention.",
      "Weekly progress checks and parent-teacher updates.",
    ],
    timings: [
      "Monday to Friday: 4:00 PM - 6:00 PM",
      "Saturday: 9:00 AM - 11:00 AM",
      "Extra doubt-clearing sessions available after class.",
    ],
  },
  "online-offline": {
    title: "Online & Offline Classes",
    description: "A hybrid learning experience that blends the convenience of online study with the focus of offline coaching.",
    benefits: [
      "Hybrid learning plan with live online classes and classroom practice.",
      "Personalised support through both digital and in-person sessions.",
      "Dedicated revision classes plus online homework follow-up.",
      "Balanced schedule for maximum flexibility and accountability.",
      "Real-time progress tracking and parent updates.",
    ],
    timings: [
      "Monday: Online 6:00 PM - 7:30 PM, Offline 4:00 PM - 5:30 PM",
      "Wednesday: Online 6:00 PM - 7:30 PM, Offline 4:00 PM - 5:30 PM",
      "Saturday: Hybrid review session 10:00 AM - 12:00 PM",
    ],
  },
};

export function ClassInfo() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const info = type ? classInfoMap[type] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {info ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{info.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{info.description}</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-950">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Why choose {info.title}?</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  {info.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-sky-500/5 p-6 dark:bg-slate-950/80">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Typical Timings</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  {info.timings.map((timing) => (
                    <li key={timing} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                      {timing}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What you get</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                This course type is designed to deliver clear learning outcomes, consistent timing, and a study plan aligned with your child’s current standard. You can always switch to another mode if you want more in-person or more online support.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class mode not found</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Please select a valid class mode from the menu above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
