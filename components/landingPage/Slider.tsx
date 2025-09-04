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
      title: "Bruce lee",
      url: "/videos/brucelee.mp4",
    },
    {
      title: "Engineering",
      url: `/videos/engineering.mp4`,
    },
    {
      title: "Father role",
      url: "/videos/father_role.mp4",
    },
    {
      title: "Goku",
      url: "/videos/goku.mp4",
    },
    {
      title: "Russian revolution",
      url: "/videos/russian_revolution.mp4",
    },
    {
      title: "Space",
      url: "/videos/space.mp4",
    },
    {
      title: "Thermodynamics",
      url: "/videos/thermodynamics.mp4",
    },
  ];

  const examplesSlider = () => (
    <div className={`w-full overflow-hidden ${className}`}>
      <Slider {...TestimonialSliderSettings} className="">
        {client.map((item, index) => (
          <div key={index} className="p-2 overflow-hidden rounded-2xl">
            <div className="w-fit mx-auto p-2 mb-5 shadow-md shadow-indigo-500 text-left rounded-2xl overflow-hidden">
              <video
                className="h-96"
                autoPlay
                playsInline
                webkit-playsinline="true"
                muted
                controls={false}
              >
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
