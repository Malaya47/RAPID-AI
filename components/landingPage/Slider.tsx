/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface BrandSliderProps {
  variant: "examples";
  className?: string;
}

export const BrandSlider: React.FC<BrandSliderProps> = ({
  variant,
  className = "",
}) => {
  const ServiceSliderSettings = {
    infinite: true,
    speed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    reverse: true,
    autoplaySpeed: 100,
    cssEase: "linear",
    direction: "horizontal",
    rtl: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const TestimonialSliderSettings = {
    infinite: true,
    speed: 7000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    reverse: true,
    autoplaySpeed: 100,
    cssEase: "linear",
    direction: "left",
    rtl: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const client = [
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/hitlr_viral.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9oaXRscl92aXJhbC5tcDQiLCJpYXQiOjE3NTM5NTkxNTgsImV4cCI6MTc4NTQ5NTE1OH0.KLOdDjKJFUrQL6o9MAA0ubLIN_2ROXKvPU_rXs7lcxU",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/hitlr_viral.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9oaXRscl92aXJhbC5tcDQiLCJpYXQiOjE3NTM5NTk1ODUsImV4cCI6MTc4NTQ5NTU4NX0.b9QFmXGnKEc49LnJ6wUizAbAPZGkYuvUrrsswYYsXKE",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/tekken.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy90ZWtrZW4ubXA0IiwiaWF0IjoxNzUzOTU5NjgyLCJleHAiOjE3ODU0OTU2ODJ9.IQenVJqNKOjbXAV_sQHMy3vruaw2kSnAECk5UbwD5N4",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/engineering.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9lbmdpbmVlcmluZy5tcDQiLCJpYXQiOjE3NTQ0MTQwOTIsImV4cCI6MTc4NTk1MDA5Mn0.sj0Bfgu7wLOokTR9vQmEFjmxvRWHo2v-XLQLA1-t2k0",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/robots.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9yb2JvdHMubXA0IiwiaWF0IjoxNzU0NDE0MTQ3LCJleHAiOjE3ODU5NTAxNDd9.Qb6gQosdkjuALKKk2mFn8O2ynUbyMrSMA5Os7jaYux8",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/thermodynamics.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy90aGVybW9keW5hbWljcy5tcDQiLCJpYXQiOjE3NTQ0MTQxNzAsImV4cCI6MTc4NTk1MDE3MH0.7Eg9t-zuL8XplyFNwyUx6QOauASObjwoq7Tnf9JSLok",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/thermodynamics.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy90aGVybW9keW5hbWljcy5tcDQiLCJpYXQiOjE3NTQ0MTQ0MTEsImV4cCI6MTc4NTk1MDQxMX0.3n162z1oqiL79729T8GnvHsojsAPKHpO7S-tW3h3nrM",
    },
  ];

  const examplesSlider = () => (
    <div className={`w-full overflow-hidden ${className}`}>
      <Slider {...TestimonialSliderSettings} className="">
        {client.map((item, index) => (
          <div key={index} className="p-2 overflow-hidden rounded-2xl">
            <div className="w-fit mx-auto p-2 mb-5 shadow-md shadow-indigo-500 text-left rounded-2xl overflow-hidden">
              <video className="h-96" autoPlay muted>
                <source src={item.url} className="rounded-2xl" />
              </video>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );

  return variant === "examples" && examplesSlider();
};
