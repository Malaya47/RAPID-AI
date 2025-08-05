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
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/engineering.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9lbmdpbmVlcmluZy5tcDQiLCJpYXQiOjE3NTQ0MjAyMTUsImV4cCI6MTc4NTk1NjIxNX0.nfX4womqYDQfpm8ABnNKrwZacagLXHLbU8NQmsHfPGk",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/gtavicecity.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9ndGF2aWNlY2l0eS5tcDQiLCJpYXQiOjE3NTQ0MjAyMzUsImV4cCI6MTc4NTk1NjIzNX0.YnhjSITg0c8PvBaFKCQf_jg2sGMZUxVdUPlJDyxYTYc",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/hitlr_viral.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9oaXRscl92aXJhbC5tcDQiLCJpYXQiOjE3NTQ0MjAyNTQsImV4cCI6MTc4NTk1NjI1NH0.N6whU4JAFOsuuBLnPAJnjn6Vuk0Awy9Ubh0KLQzzKlE",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/robots.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9yb2JvdHMubXA0IiwiaWF0IjoxNzU0NDIwMjc0LCJleHAiOjE3ODU5NTYyNzR9.l_V_9VShYDDjHJDDHQqB588iZw-VRUyStpxj9fe1rt0",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/russian_revolution.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy9ydXNzaWFuX3Jldm9sdXRpb24ubXA0IiwiaWF0IjoxNzU0NDIwMjk2LCJleHAiOjE3ODU5NTYyOTZ9.A_esrM-oMkDn5B_9ncUWsWibH4cS-9x0vy741ATJlN4",
    },
    {
      title: "SaaS Development",
      url: "https://dwdgisyhjwntfosrlsde.supabase.co/storage/v1/object/sign/example-videos/tekken.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Zjk5NjlmZS04YWFmLTQzZDktYTEwNi03MGVjMTgzZmIyYTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJleGFtcGxlLXZpZGVvcy90ZWtrZW4ubXA0IiwiaWF0IjoxNzU0NDIwMzIwLCJleHAiOjE3ODU5NTYzMjB9.mi2ImE4V1lz6CTtKo1eR8E00hx7PVoSGMR3jUcDas70",
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
