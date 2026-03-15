import { useEffect, useRef, useState } from "react";

import client1 from "../../assets/clients/clients1-removebg-preview.png";
import client2 from "../../assets/clients/clients2-removebg-preview.png";
import client3 from "../../assets/clients/client3.png";

const clientImages = [
  { img: client1, name: "Bharat Diesel Service" },
  { img: client2, name: "RGPV University" },
  { img: client3, name: "Timo FX" },
];

const repeated = Array.from({ length: 8 }, () => clientImages).flat();

const NORMAL_SPEED = 0.6; // px per frame
const HOVER_SPEED = 0.15; // px per frame on hover

const Clients = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const currentSpeedRef = useRef(NORMAL_SPEED);
  const hoveredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const halfWidthRef = useRef(0);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure once after mount
    halfWidthRef.current = track.scrollWidth / 2;

    const animate = () => {
      // Smoothly lerp current speed toward target — this is what kills the jerk
      const target = hoveredRef.current ? HOVER_SPEED : NORMAL_SPEED;
      currentSpeedRef.current += (target - currentSpeedRef.current) * 0.05;

      posRef.current += currentSpeedRef.current;

      // Seamless loop: reset when scrolled one full half
      if (posRef.current >= halfWidthRef.current) {
        posRef.current = 0;
      }

      track.style.transform = `translateX(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section id="clients" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#C89A3D]" />
          <span className="text-xs uppercase tracking-widest text-[#C89A3D] font-semibold">
            Trusted By
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Our <span className="text-[#C89A3D]">Clients</span>
          </h2>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            Trusted by global brands and startups for innovative technology
            solutions and long-term partnerships.
          </p>
        </div>
      </div>

      {/* Scrolling Strip */}
      <div
        className="relative"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
          setHoveredIdx(null);
        }}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #f9fafb, transparent)",
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #f9fafb, transparent)",
          }}
        />

        {/* Track — driven purely by rAF, zero CSS animation */}
        <div
          ref={trackRef}
          className="flex gap-6 w-max"
          style={{ willChange: "transform" }}
        >
          {repeated.map((client, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative flex-shrink-0 w-56 h-36 rounded-2xl overflow-hidden cursor-pointer"
              style={{
                boxShadow:
                  hoveredIdx === idx
                    ? "0 0 0 2px #C89A3D, 0 0 24px 6px rgba(200,154,61,0.35)"
                    : "0 2px 12px rgba(0,0,0,0.08)",
                transform: hoveredIdx === idx ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
              }}
            >
              {/* Image */}
              <img
                src={client.img}
                alt={client.name}
                className="w-full h-full object-contain"
                style={{
                  filter:
                    hoveredIdx === idx
                      ? "brightness(1.08)"
                      : "brightness(0.95) grayscale(20%)",
                  transition: "filter 0.4s ease",
                }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    hoveredIdx === idx
                      ? "linear-gradient(to top, rgba(200,154,61,0.55), transparent)"
                      : "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
                  transition: "background 0.4s ease",
                }}
              />

              {/* Name tag */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span
                  className="text-xs font-semibold tracking-wide"
                  style={{
                    color:
                      hoveredIdx === idx ? "#fff" : "rgba(255,255,255,0.75)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {client.name}
                </span>
              </div>

              {/* Gold dot accent */}
              {hoveredIdx === idx && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C89A3D]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
