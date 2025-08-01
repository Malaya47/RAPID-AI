// src/components/create-video/VideoForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Pause,
  Play,
  Speech,
  Timer,
  ChevronUp,
  ChevronDown,
  Type,
} from "lucide-react";
import {
  VideoFormProps,
  DurationOption,
  VoiceOption,
  FontName,
  ColorName,
} from "@/types/video";
import { JSX } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
// import { generateVoicePreview } from "@/app/actions/generateVoicePreview";

export default function VideoFields({
  duration,
  setDuration,
  voice,
  setVoice,
  error,
  fontName,
  setFontName,
  fontBaseColor,
  setFontBaseColor,
  fontHighlightColor,
  setFontHighlightColor,
}: VideoFormProps): JSX.Element {
  const voices: VoiceOption[] = [
    "alloy",
    "echo",
    "fable",
    "onyx",
    "nova",
    "shimmer",
  ];
  const durations: DurationOption[] = ["30-45", "45-60", "60-90"];
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<VoiceOption | null>(null);
  const [openBaseFont, setOpenBaseFont] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const fonts: FontName[] = [
    "Anton",
    "Bangers",
    "BebasNeue",
    "Impact",
    "Knewave",
    "LeagueSpartan",
    "Montserrat",
    "PoetsenOne",
    "Poppins",
  ];

  const colors = [
    { color: "red", dotColor: "red-500" },
    { color: "blue", dotColor: "blue-500" },
    { color: "green", dotColor: "green-500" },
    { color: "indigo", dotColor: "indigo-500" },
    { color: "yellow", dotColor: "yellow-500" },
    { color: "white", dotColor: "white" },
    { color: "black", dotColor: "black" },
  ];

  // Display only first 3 voices or all voices based on state
  // const displayedVoices = showAllVoices ? voices : voices.slice(0, 2);
  const displayedVoices = voices;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoiceChange = async (voiceOption: VoiceOption) => {
    if (setVoice) setVoice(voiceOption);

    // Stop and clean up any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      setPlayingVoice(voiceOption);
      // Construct URL from voice name
      const audioUrl = `/voice-previews/${voiceOption}.mp3`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // When audio finishes, reset state
      audio.onended = () => {
        setPlayingVoice(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing voice preview:", error);
    } finally {
      setPlayingVoice(voiceOption);
    }
  };

  return (
    <Card className="md:col-span-1 bg-neutral-950 text-white border-neutral-800 rounded-3xl">
      <CardContent className="space-y-4 my-6">
        <div className="space-y-4">
          <Label htmlFor="voice" className="text-lg flex items-center gap-2">
            <Speech className="bg-indigo-600 p-2 rounded-lg w-8 h-8" />
            Voice
          </Label>
          <div className="grid grid-cols-2 gap-4 w-full">
            {displayedVoices.map((voiceOption) => (
              <Button
                key={voiceOption}
                type="button"
                variant="outline"
                className={`flex items-center justify-between w-full py-2 px-3 border bg-neutral-900 ${
                  voice === voiceOption
                    ? "border-indigo-500 bg-gradient-to-tr from-black to-indigo-900/20"
                    : "border-neutral-800"
                }`}
                // onClick={() => setVoice && setVoice(voiceOption as VoiceOption)}
                onClick={() => handleVoiceChange(voiceOption)}
              >
                <div className="flex items-center space-x-2 w-full">
                  {playingVoice === voiceOption ? (
                    <Pause className="rounded-full w-8 h-8" />
                  ) : (
                    <Play className="rounded-full w-8 h-8" />
                  )}
                  <div className="text-left">
                    <div className="capitalize">{voiceOption}</div>
                    <div className="text-xs text-neutral-500">OpenAI Voice</div>
                  </div>
                </div>
                {voice === voiceOption && (
                  <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                )}
              </Button>
            ))}
          </div>
          {/* {voices.length > 2 && (
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center text-neutral-100 hover:text-neutral-100 mt-2 bg-neutral-800 hover:bg-neutral-900 rounded-3xl"
              onClick={() => setShowAllVoices(!showAllVoices)}
            >
              {showAllVoices ? (
                <>
                  Show Less <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  View More <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )} */}
        </div>
        {/* <div className="space-y-2">
          <Label className="text-lg flex items-center gap-2">
            <Timer className="bg-indigo-600 p-2 rounded-lg w-8 h-8" />
            Duration
          </Label>
          <RadioGroup
            value={duration}
            onValueChange={(value) =>
              setDuration && setDuration(value as DurationOption)
            }
            className="flex flex-wrap gap-4"
          >
            {durations.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`duration-${option}`}
                  className="text-indigo-300 bg-neutral-800"
                />
                <Label htmlFor={`duration-${option}`}>{option} seconds</Label>
              </div>
            ))}
          </RadioGroup>
        </div> */}
        <div className="space-y-4">
          <Label className="text-lg flex items-center gap-2">
            <Type className="bg-indigo-600 p-2 rounded-lg w-8 h-8" />
            Font Customization
          </Label>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={fontName}
                onValueChange={(value) => setFontName(value as FontName)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {fonts.map((font) => (
                    <SelectItem
                      key={font}
                      value={font}
                      className="hover:bg-neutral-800"
                    >
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Base Color</Label>

              <Popover open={openBaseFont} onOpenChange={setOpenBaseFont}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`
              w-4 h-4 rounded-full
              ${fontBaseColor === "red" ? "bg-red-500" : ""}
              ${fontBaseColor === "blue" ? "bg-blue-500" : ""}
              ${fontBaseColor === "green" ? "bg-green-500" : ""}
              ${fontBaseColor === "indigo" ? "bg-indigo-500" : ""}
              ${fontBaseColor === "yellow" ? "bg-yellow-500" : ""}
              ${fontBaseColor === "white" ? "bg-white" : ""}
              ${fontBaseColor === "black" ? "bg-black" : ""}
            `}
                      />
                      <span className="capitalize text-white">
                        {fontBaseColor}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="bottom"
                  align="start"
                  className="bg-neutral-900 border border-neutral-700 p-4 rounded-xl"
                >
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.color}
                        type="button"
                        onClick={() => {
                          setFontBaseColor(color.color as ColorName);
                          setOpenBaseFont(false); // Close the popover on select
                        }}
                        className={`
              w-6 h-6 rounded-full border-2 hover:scale-110 transition
              ${fontBaseColor === color.color ? "ring-2 ring-indigo-500" : ""}
              ${
                color.color === "red"
                  ? "bg-red-500"
                  : color.color === "blue"
                  ? "bg-blue-500"
                  : color.color === "green"
                  ? "bg-green-500"
                  : color.color === "indigo"
                  ? "bg-indigo-500"
                  : color.color === "yellow"
                  ? "bg-yellow-500"
                  : color.color === "white"
                  ? "bg-white"
                  : "bg-black"
              }
            `}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Highlight Color</Label>

              <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`
            w-4 h-4 rounded-full
            ${fontHighlightColor === "red" ? "bg-red-500" : ""}
            ${fontHighlightColor === "blue" ? "bg-blue-500" : ""}
            ${fontHighlightColor === "green" ? "bg-green-500" : ""}
            ${fontHighlightColor === "indigo" ? "bg-indigo-500" : ""}
            ${fontHighlightColor === "yellow" ? "bg-yellow-500" : ""}
            ${fontHighlightColor === "white" ? "bg-white" : ""}
            ${fontHighlightColor === "black" ? "bg-black" : ""}
          `}
                      />
                      <span className="capitalize text-white">
                        {fontHighlightColor}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="bottom"
                  align="start"
                  className="bg-neutral-900 border border-neutral-700 p-4 rounded-xl"
                >
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.color}
                        type="button"
                        onClick={() => {
                          setFontHighlightColor(color.color as ColorName);
                          setHighlightOpen(false); // Close popover on selection
                        }}
                        className={`
              w-6 h-6 rounded-full border-2 hover:scale-110 transition
              ${
                fontHighlightColor === color.color
                  ? "ring-2 ring-indigo-500"
                  : ""
              }
              ${
                color.color === "red"
                  ? "bg-red-500"
                  : color.color === "blue"
                  ? "bg-blue-500"
                  : color.color === "green"
                  ? "bg-green-500"
                  : color.color === "indigo"
                  ? "bg-indigo-500"
                  : color.color === "yellow"
                  ? "bg-yellow-500"
                  : color.color === "white"
                  ? "bg-white"
                  : "bg-black"
              }
            `}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
