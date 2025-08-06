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
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470725/gtavicecity_b8ofgb.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470697/hitlr_viral_ngrbim.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470691/russian_revolution_jqcjtz.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470655/engineering_xusghx.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470631/thermodynamics_g7fxxu.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470610/tekken_wa25j5.mp4",
    },
    {
      title: "SaaS Development",
      url: "https://res.cloudinary.com/dk5j69wyw/video/upload/v1754470598/dragonball_j4x85u.mp4",
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
