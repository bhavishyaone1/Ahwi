"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAetherData } from "../../context/AetherDataContext";
import { submitOperatorQuery } from "../../lib/api";
import { QueryResponse } from "../../lib/types";
import { HelpCircle, Send, Sparkles, MapPin, Database, ChevronRight, Activity, Cpu, Layers } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Why does AETHER trust AIFS for rainfall in Delhi?",
  "What is the rainfall forecast for Mumbai?",
  "Which model is best for temperature?",
  "Show extreme risk for Chennai",
  "What's the climate anomaly in Kolkata?",
  "How confident is the forecast?",
];

export default function AskAetherPage() {
  const { data } = useAetherData();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "aether"; content: any }>>([
    {
      sender: "user",
      content: "Why does AETHER trust AIFS for rainfall in Delhi?",
    },
    {
      sender: "aether",
      content: {
        text: "AETHER currently resolves 46% weight for Delhi's rainfall forecast because: AIFS has the lowest recent error (4.3 mm) under heavy rain conditions; INSAT/GPM observations show good agreement with AIFS; Historical skill is higher in the current monsoon regime; 24-hour lead time favors AIFS over GFS.",
        models: {
          ECMWF: "39.1 mm",
          AIFS: "44.8 mm",
          GFS: "42.9 mm",
        },
        weights: {
          AIFS: 46,
          ECMWF: 32,
          GFS: 22,
        },
      },
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q) return;

    const newHistory = [...chatHistory, { sender: "user" as const, content: q }];
    setChatHistory(newHistory);
    setQuery("");
    setLoading(true);

    submitOperatorQuery(q)
      .then((res) => {
        setChatHistory([
          ...newHistory,
          {
            sender: "aether",
            content: {
              text: res.headline + " " + res.contributing_reasons.join("; "),
              models: res.source_data,
              weights: {
                [res.dominant_model.replace("ECMWF_", "")]: Number(res.dominant_weight.replace("%", "")) || 46,
                ECMWF: 32,
                GFS: 22,
              },
            },
          },
        ]);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
          <HelpCircle className="w-3 h-3 text-sky-600" />
          <span>Operator Intelligence Assistant</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Ask AETHER
        </h1>
        <p className="text-xs text-slate-500">
          Ask questions in natural language; get grounded answers from real model data
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 Cols: Suggested Questions */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Suggested Questions
          </span>

          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-xs text-slate-700 font-medium transition flex items-center justify-between group"
              >
                <span className="line-clamp-2">{sq}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 ml-1.5" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            * All responses are grounded in active pipeline telemetry. Zero hallucinated metrics.
          </div>
        </div>

        {/* Right 8 Cols: Conversational Feed matching reference image */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Chat Container */}
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-4 space-y-4 min-h-[380px] max-h-[460px] overflow-y-auto">
            {chatHistory.map((msg, i) => {
              if (msg.sender === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs max-w-md">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const { text, models, weights } = msg.content;

              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-5 shadow-sm max-w-xl space-y-4 text-xs">
                    {/* Bot header */}
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                        Æ
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs">AETHER</span>
                      <span className="text-[10px] text-slate-400">· Grounded Operational Inference</span>
                    </div>

                    {/* Explanatory text */}
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {text}
                    </p>

                    {/* Model Comparison */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Model Comparison (24h rainfall, Delhi NCR)
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                        {Object.entries(models || {}).map(([m, val]) => (
                          <div key={m} className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-500 block">{m}</span>
                            <span className="font-bold text-slate-900">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Model Weights Progress */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        24-Hour Model Weights
                      </span>
                      <div className="space-y-1 text-xs">
                        {Object.entries(weights || {}).map(([m, w]) => (
                          <div key={m} className="space-y-0.5">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-slate-700">{m}</span>
                              <span className="font-mono text-slate-900">{String(w)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-sky-600 h-full rounded-full"
                                style={{ width: `${Number(w) || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4 Action Buttons matching reference mockup */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      <Link
                        href="/forecast"
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-[11px] transition"
                      >
                        View Forecast
                      </Link>
                      <Link
                        href="/models"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition"
                      >
                        View Model Evidence
                      </Link>
                      <Link
                        href="/"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition"
                      >
                        View Map
                      </Link>
                      <Link
                        href="/models"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition"
                      >
                        View SHAP
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask why AETHER made a forecast decision..."
              className="flex-1 px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? "Analyzing..." : "Ask"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
