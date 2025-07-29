// src/components/create-video/VideoForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
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
  const [isPlaying, setIsPlaying] = useState(false);

  const fonts: FontName[] = [
    "Anton-Regular.ttf",
    "Roboto-Regular.ttf",
    "OpenSans-Regular.ttf",
    "Montserrat-Regular.ttf",
    "Poppins-Regular.ttf",
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
  const displayedVoices = showAllVoices ? voices : voices.slice(0, 2);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoiceChange = async (voiceOption: VoiceOption) => {
    if (setVoice) setVoice(voiceOption);

    // Stop and clean up any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      setIsPlaying(true);
      // Construct URL from voice name
      const audioUrl = `/voice-previews/${voiceOption}.mp3`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("Error playing voice preview:", error);
    } finally {
      setIsPlaying(false);
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
          <div className="flex flex-col gap-4 w-full">
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
                  <Play className="bg-neutral-800 rounded-full w-8 h-8" />
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
          {voices.length > 2 && (
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
          )}
        </div>
        <div className="space-y-2">
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
        </div>
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
              <Select
                value={fontBaseColor}
                onValueChange={(value) => setFontBaseColor(value as ColorName)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                  <SelectValue placeholder="Select base color" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  {colors.map((color) => (
                    <SelectItem
                      key={color.color}
                      value={color.color}
                      className="hover:bg-neutral-800 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full bg-${color.dotColor}`}
                        />
                        <span className="capitalize">{color.color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Highlight Color</Label>
              <Select
                value={fontHighlightColor}
                onValueChange={(value) =>
                  setFontHighlightColor(value as ColorName)
                }
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                  <SelectValue placeholder="Select highlight color" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  {colors.map((color) => (
                    <SelectItem
                      key={color.color}
                      value={color.color}
                      className="hover:bg-neutral-800 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full bg-${color.dotColor}`}
                        />
                        <span className="capitalize">{color.color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
