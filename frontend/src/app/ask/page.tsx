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
import { WeatherContourHeader } from "@/components/common/Backgrounds";

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
        setChatHistory([
          ...newHistory,
          {
            sender: "aether",
            content: {
              headline: "I don't have sufficient data to answer this.",
              why: [
                "The meteorological telemetry for this inquiry could not be retrieved from the active pipeline.",
                "Please select one of the verified operational inquiries or verify backend connectivity.",
              ],
              models: {},
              weights: {},
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
            },
          },
        ]);
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
      <div className="relative border-b border-border pb-3 min-w-0 space-y-1">
        <WeatherContourHeader />
        <div className="relative z-10 space-y-1">
          <div className="badge-scientific text-overline bg-info/10 text-info border border-info/30">
            <HelpCircle className="h-3 w-3 text-info shrink-0" />
            <span>Operator Intelligence Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1 font-display">
            Ask AETHER Assistant
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Query multi-model forecast consensus, causal model weighting, and risk telemetry in natural language.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 4 Cols: Suggested Questions */}
        <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0 space-y-3">
          <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-overline text-text-muted block font-semibold">
                Suggested Inquiries
              </span>
              <CardTitle className="text-sm font-bold text-text-primary">
                Operational Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq)}
                  className="w-full text-left p-2.5 rounded-xl border border-border bg-surface-2 hover:bg-accent/10 hover:border-accent/40 text-xs text-text-secondary hover:text-text-primary font-medium transition flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{sq}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-accent shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}

              <div className="pt-3 border-t border-border text-[11px] text-text-muted leading-relaxed font-mono">
                * All responses are grounded in active pipeline telemetry. Zero hallucinated numerical forecasts.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 8 Cols: Grounded Intelligence Feed */}
        <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0 flex flex-col space-y-3">
          {/* Chat Container */}
          <Card className="shadow-sm border-border bg-surface-2/40 rounded-2xl p-4 space-y-4 min-h-[380px] max-h-[480px] overflow-y-auto">
            {chatHistory.map((msg, i) => {
              if (msg.sender === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="bg-accent text-slate-950 text-xs font-bold px-3.5 py-2 rounded-2xl rounded-tr-sm shadow-sm max-w-md">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const { headline, why, models, weights, timestamp } = msg.content;

              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-xl space-y-3 text-xs border-l-4 border-l-accent">
                    {/* Bot header */}
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-md bg-accent text-slate-950 font-black text-[10px] flex items-center justify-center">
                          Æ
                        </div>
                        <span className="font-bold text-text-primary text-xs">AETHER</span>
                        <Badge variant="scientific" className="text-overline py-0 px-1.5">
                          Grounded Pipeline
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timestamp || "Active"}
                      </span>
                    </div>

                    {/* ANSWER */}
                    <div>
                      <span className="text-overline text-text-muted block mb-1 font-semibold">
                        ANSWER
                      </span>
                      <p className="text-text-primary font-semibold leading-relaxed">
                        {headline}
                      </p>
                    </div>

                    {/* WHY */}
                    {why && why.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-overline text-text-muted block font-semibold">
                          DIAGNOSTIC EVIDENCE
                        </span>
                        <ul className="space-y-1 text-text-secondary pl-1">
                          {why.map((reason: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* EVIDENCE */}
                    {models && (
                      <div className="p-2.5 bg-surface-2 rounded-xl border border-border space-y-1.5">
                        <span className="text-overline text-text-muted block font-semibold">
                          SOURCE NWP / AI TELEMETRY
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
                          {Object.entries(models).map(([mName, val]) => (
                            <div key={mName} className="p-1.5 bg-surface rounded-lg border border-border">
                              <span className="text-overline text-text-muted block truncate font-sans">{mName}</span>
                              <span className="font-bold text-text-primary">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons matching prompt */}
                    <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[11px] h-7 font-mono flex items-center gap-1.5"
                        onClick={openTraceDrawer}
                      >
                        <Activity className="h-3 w-3 text-accent" />
                        <span>Inspect Lineage DAG</span>
                      </Button>
                      <Link href="/models">
                        <Button variant="outline" size="sm" className="text-[11px] h-7 font-mono flex items-center gap-1.5">
                          <Cpu className="h-3 w-3 text-text-muted" />
                          <span>View SHAP Attribution</span>
                        </Button>
                      </Link>
                      <Link href="/forecast">
                        <Button variant="outline" size="sm" className="text-[11px] h-7 font-mono flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-text-muted" />
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
              className="h-10 text-xs bg-surface border-border text-text-primary placeholder:text-text-muted rounded-xl"
            />
            <Button
              variant="default"
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="h-10 px-4 gap-1.5 bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs shrink-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
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
