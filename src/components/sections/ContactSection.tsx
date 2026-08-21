"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { RiSendPlaneFill, RiUserLocationFill } from "react-icons/ri";

type FormState = "idle" | "submitting" | "success" | "error";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl text-base sm:text-sm glass-card focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600";

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed");
      setFormState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormState("error");
    }
  };

  return (
    <section id="contact" className="py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-start">
          {/* Left: info */}
          <SectionReveal direction="left">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-violet-500 dark:text-violet-400 uppercase tracking-[0.18em] mb-4">
                <span className="w-5 h-px bg-violet-500" />
                Contact
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-5">
                Let&apos;s work
                <br />
                together.
              </h2>
              <p className="text-neutral-600 dark:text-neutral-100 leading-relaxed mb-8 max-w-sm">
                Have a project in mind, an opportunity to discuss, or just want
                to say hi? I&apos;d love to hear from you.
              </p>

              {/* Contact info */}
              <div className="space-y-4">
                {[
                  { icon: <RiSendPlaneFill />, label: "Email", value: "nguyenhuuthang1609@gmail.com" },
                  { icon: <RiUserLocationFill />, label: "Location", value: "Vietnam" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3.5 rounded-xl glass-card"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-0.5">
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Right: form */}
          <SectionReveal direction="right" delay={0.1}>
            {formState === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-8 rounded-2xl glass-card"
              >
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                  Message sent!
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  I&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Send another →
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 font-mono uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 font-mono uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 font-mono uppercase tracking-wide">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What's this about?"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 font-mono uppercase tracking-wide">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell me about your project or just say hello..."
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                {formState === "error" && (
                  <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                    Something went wrong. Please try again.
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={formState === "submitting"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 relative rounded-xl text-sm font-semibold text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-violet-600 to-indigo-600" />
                  <span className="absolute inset-0 bg-linear-to-r from-violet-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
                  <span className="relative">
                    {formState === "submitting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Message →"
                    )}
                  </span>
                </motion.button>
              </form>
            )}
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
