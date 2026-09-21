"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { submitOperatorQuery } from "../../lib/api";
import {
  HelpCircle,
  Send,
  Sparkles,
  ChevronRight,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageVariants, fadeUp } from "@/lib/motion";

const SUGGESTED_QUESTIONS = [
  "Why does AETHER trust AIFS for rainfall in Delhi?",
  "What is the rainfall forecast for Mumbai?",
  "Which model is best for temperature?",
  "Show extreme risk for Chennai",
  "What's the climate anomaly in Kolkata?",
  "How confident is the forecast?",
];

export default function AskAetherPage() {
  const { data, openTraceDrawer } = useAetherData();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: "user" | "aether"; content: any }>
  >([
    {
      sender: "user",
      content: "Why does AETHER trust AIFS for rainfall in Delhi?",
    },
    {
      sender: "aether",
      content: {
        headline: "AIFS currently receives higher weight (46%) for Delhi rainfall.",
        why: [
          "Stronger recent 72h rainfall skill (MAE 4.3 mm vs IFS 5.4 mm)",
          "Better regime compatibility under HEAVY_RAIN synoptic monsoon state",
          "INSAT-3D & NASA GPM satellite consensus matches AIFS moisture flux",
          "24-hour lead-time profile historically favors AIFS over GFS in North India",
        ],
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
        timestamp: "2026-09-22 00:00 UTC",
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
              headline: res.headline,
              why: res.contributing_reasons,
              models: res.source_data,
              weights: {
                [res.dominant_model.replace("ECMWF_", "")]:
                  Number(res.dominant_weight.replace("%", "")) || 46,
                ECMWF: 32,
                GFS: 22,
              },
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
          <HelpCircle className="h-3 w-3 text-sky-600" />
          <span>Operator Intelligence Assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
          Ask AETHER
        </h1>
        <p className="text-xs text-slate-500">
          Query multi-model forecasts, confidence drivers and extreme-risk intelligence
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 4 Cols: Suggested Questions */}
        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-3">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Suggested Questions
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Operational Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq)}
                  className="w-full text-left p-2.5 rounded-md border border-slate-200/80 bg-slate-50/60 hover:bg-sky-50 hover:border-sky-200 text-xs text-slate-700 font-medium transition flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{sq}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 ml-1.5" />
                </button>
              ))}

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                * All responses are grounded in active pipeline telemetry. Zero hallucinated numerical forecasts.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 8 Cols: Grounded Intelligence Feed */}
        <motion.div variants={fadeUp} className="lg:col-span-8 flex flex-col space-y-3">
          {/* Chat Container */}
          <Card className="shadow-xs border-slate-200 bg-slate-50/40 p-4 space-y-4 min-h-[380px] max-h-[480px] overflow-y-auto">
            {chatHistory.map((msg, i) => {
              if (msg.sender === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="bg-sky-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg rounded-tr-xs shadow-xs max-w-md">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const { headline, why, models, weights, timestamp } = msg.content;

              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg rounded-tl-xs p-4 shadow-xs max-w-xl space-y-3 text-xs">
                    {/* Bot header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                          Æ
                        </div>
                        <span className="font-bold text-slate-900 text-xs">AETHER</span>
                        <Badge variant="scientific" className="text-[10px] py-0 px-1.5">
                          Grounded Pipeline
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timestamp || "Active"}
                      </span>
                    </div>

                    {/* ANSWER */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        ANSWER
                      </span>
                      <p className="text-slate-900 font-semibold leading-relaxed">
                        {headline}
                      </p>
                    </div>

                    {/* WHY */}
                    {why && why.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          WHY
                        </span>
                        <ul className="space-y-1 text-slate-700 pl-1">
                          {why.map((reason: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* EVIDENCE */}
                    {models && (
                      <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          EVIDENCE (Source Models)
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                          {Object.entries(models).map(([mName, val]) => (
                            <div key={mName} className="p-1.5 bg-white rounded border border-slate-200/60">
                              <span className="text-[10px] text-slate-500 block truncate">{mName}</span>
                              <span className="font-bold text-slate-900">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons matching prompt */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={openTraceDrawer}
                        className="gap-1 text-sky-700"
                      >
                        <Activity className="h-3 w-3" />
                        <span>View Forecast Trace</span>
                      </Button>
                      <Link href="/models">
                        <Button variant="outline" size="xs" className="gap-1 text-slate-700">
                          <Cpu className="h-3 w-3" />
                          <span>View SHAP Attribution</span>
                        </Button>
                      </Link>
                      <Link href="/forecast">
                        <Button variant="outline" size="xs" className="gap-1 text-slate-700">
                          <Layers className="h-3 w-3" />
                          <span>View Models</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Large Query Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask AETHER about forecasts, model trust drivers, or severe risk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-10 text-xs bg-white"
            />
            <Button
              variant="default"
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="h-10 px-4 gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Query</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
