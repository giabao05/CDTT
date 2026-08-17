'use client';
import { Truck, User, Package, Heart, Star, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoadingScreen() {

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center justify-center bg-[#F8F8F7] overflow-hidden z-[9999]">
      
      {/* Storytelling Scene Container */}
      <div className="relative w-[320px] h-[220px] flex items-end overflow-hidden mb-8">
        
        {/* Sky / Background Elements */}
        <div className="absolute top-4 left-1/4 animate-[float_4s_ease-in-out_infinite]">
          <div className="w-12 h-4 bg-zinc-200/50 rounded-full blur-sm" />
          <div className="w-8 h-4 bg-zinc-200/50 rounded-full blur-sm -mt-2 ml-2" />
        </div>
        <div className="absolute top-10 right-1/4 animate-[float_3s_ease-in-out_infinite_1s]">
          <div className="w-16 h-5 bg-zinc-200/50 rounded-full blur-sm" />
        </div>

        {/* Location Pin */}
        <div className="absolute bottom-12 left-[190px] animate-pulse">
           <MapPin size={24} className="text-[#E8002D]/20" />
        </div>

        {/* The Ground */}
        <div className="absolute bottom-8 left-4 right-4 h-1.5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent rounded-full" />

        {/* The Truck (Shipper) */}
        <div className="absolute bottom-8 left-0 animate-[drive_3s_ease-in-out_infinite] z-20">
          <Truck size={52} className="text-[#E8002D] drop-shadow-md" strokeWidth={1.5} fill="white" />
          {/* Wheel spin effect */}
          <div className="absolute bottom-1 left-2 w-3 h-3 border-2 border-zinc-800 rounded-full border-t-transparent animate-[spin_0.2s_linear_infinite]" />
          <div className="absolute bottom-1 right-2 w-3 h-3 border-2 border-zinc-800 rounded-full border-t-transparent animate-[spin_0.2s_linear_infinite]" />
        </div>

        {/* The Customer */}
        <div className="absolute bottom-8 left-[200px] animate-[jump_3s_ease-in-out_infinite] z-10">
          <User size={48} className="text-zinc-800 drop-shadow-sm" strokeWidth={1.5} />
        </div>

        {/* The Flying Package */}
        <div className="absolute bottom-[44px] left-0 animate-[toss_3s_ease-in-out_infinite] z-30">
          <div className="bg-white rounded p-0.5 shadow-md border border-[#ffaa00]">
            <Package size={20} className="text-[#E8002D]" strokeWidth={2} />
          </div>
        </div>

        {/* The Heart (Happy Customer) */}
        <div className="absolute bottom-20 left-0 animate-[heart-pop_3s_ease-in-out_infinite] z-40">
          <Heart size={28} className="text-[#E8002D] drop-shadow-md" fill="#E8002D" />
          <Star size={16} className="absolute -top-2 -right-4 text-[#ffaa00] animate-spin" fill="#ffaa00" />
        </div>

      </div>

      {/* Text Area */}
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-display font-900 tracking-wider text-[#0A0A0A] flex items-center gap-2 mt-2">
          Đợi xíu nha
          <span className="flex">
            <span className="animate-[bounce_1s_infinite] inline-block text-[#E8002D] delay-75">.</span>
            <span className="animate-[bounce_1s_infinite] inline-block text-[#E8002D]" style={{ animationDelay: '0.15s' }}>.</span>
            <span className="animate-[bounce_1s_infinite] inline-block text-[#E8002D]" style={{ animationDelay: '0.3s' }}>.</span>
          </span>
        </h2>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes drive {
          0% { transform: translateX(-80px); opacity: 0; }
          10% { opacity: 1; }
          25%, 40% { transform: translateX(80px); opacity: 1; } /* Stops to deliver */
          60%, 90% { transform: translateX(-80px); opacity: 0; } /* Drives back */
          100% { transform: translateX(-80px); opacity: 0; }
        }
        @keyframes toss {
          0%, 24% { transform: translate(80px, 0); opacity: 0; }
          25% { transform: translate(100px, -20px) rotate(45deg); opacity: 1; }
          32% { transform: translate(140px, -50px) rotate(90deg); opacity: 1; }
          40%, 75% { transform: translate(195px, 15px) rotate(0deg); opacity: 1; } /* Held by customer */
          76%, 100% { opacity: 0; }
        }
        @keyframes jump {
          0%, 39% { transform: translateY(0); }
          42%, 50%, 58% { transform: translateY(-15px); } /* Happy jumps */
          46%, 54%, 62% { transform: translateY(0); }
          65%, 100% { transform: translateY(0); }
        }
        @keyframes heart-pop {
          0%, 39% { opacity: 0; transform: translate(205px, 0) scale(0); }
          42% { opacity: 1; transform: translate(205px, -20px) scale(1.2) rotate(-10deg); }
          50% { opacity: 1; transform: translate(205px, -30px) scale(1.5) rotate(10deg); }
          60%, 100% { opacity: 0; transform: translate(205px, -45px) scale(0); }
        }
      `}</style>
    </div>
  );
}
