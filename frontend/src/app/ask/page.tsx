"use client";

import React, { useState } from "react";
import { submitOperatorQuery } from "../../lib/api";
import { QueryResponse } from "../../lib/types";
import { HelpCircle, Send, Sparkles, AlertCircle, Database } from "lucide-react";

const SUGGESTED_QUERIES = [
  "Why is rainfall confidence low in Delhi?",
  "What model does AETHER trust most for rainfall over Mumbai in 24 hours?",
  "Is there heavy rain risk in Kolkata for the next 48 hours?",
  "Show temperature forecast for Bengaluru for the next 24 hours",
  "Why does AETHER trust AIFS over GFS in heavy rain?",
];

export const AskAetherPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const handleSearch = (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q.trim()) return;

    setLoading(true);
    submitOperatorQuery(q)
      .then(setResponse)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Operator Intelligence Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Ask AETHER
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Query multi-model forecast blending, confidence drivers, and extreme risk explanations in plain English.
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-md flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. 'Why did AETHER trust AIFS for Delhi rainfall in next 24h?'"
          className="flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <span>{loading ? "Analyzing..." : "Ask"}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Suggestions:</span>
        {SUGGESTED_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sq);
              handleSearch(sq);
            }}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Structured Grounded Response Card */}
      {response && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Verified Pipeline Assessment
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {response.headline}
            </h2>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Blended Forecast
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {response.blended_forecast}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Confidence
              </span>
              <span className="text-lg font-bold text-emerald-600 font-mono">
                {response.confidence}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Dominant Model
              </span>
              <span className="text-lg font-bold text-sky-800 font-mono">
                {response.dominant_model}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Model Weight
              </span>
              <span className="text-lg font-bold text-indigo-700 font-mono">
                {response.dominant_weight}
              </span>
            </div>
          </div>

          {/* Contributing Reasons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Atmospheric & Skill Drivers:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {response.contributing_reasons.map((r, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Source Data Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span>Raw Model Inputs:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {Object.entries(response.source_data).map(([model, val]) => (
                <span key={model} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
                  <strong className="text-slate-600">{model}:</strong> {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskAetherPage;
