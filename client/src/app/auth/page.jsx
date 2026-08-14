import React from "react";
import AuthModal from "../../features/auth/components/AuthModal";

export default function AuthPage() {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl overflow-y-auto">
      {/* Background patterns to make it look nice */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-160 h-160 bg-brand-orange/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-120 h-120 bg-white/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <AuthModal />
      </div>
    </div>
  );
}
