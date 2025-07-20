"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VideoFormProps } from "@/types/video"
import { JSX } from "react"

export default function VideoForm({
  textareaLabel,
  textareaPlaceholder,
  textareaValue,
  onTextareaChange,
  title,
  description
}: VideoFormProps): JSX.Element {

  return (
    <Card className="md:col-span-1 bg-neutral-950 text-white border-neutral-800 rounded-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input">{textareaLabel}</Label>
          <Textarea
            id="text-input"
            placeholder={textareaPlaceholder}
            className="min-h-80 resize-none bg-neutral-900 text-white border-neutral-800 rounded-lg"
            value={textareaValue}
            onChange={onTextareaChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}