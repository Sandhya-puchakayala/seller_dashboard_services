"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExactAuthPage() {
  const router = useRouter();
  // Default to Login view as per the user's new screenshot
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    otp: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);

    if (!isLogin) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.mobile,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("sellerToken", data.token);
          window.location.href = "/seller-dashboard";
        } else {
          setError(data.message || "Registration failed");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
    } else {
      if (authMethod === 'mobile' && !otpSent) {
        console.log("Requesting OTP for:", formData.mobile);
        setOtpSent(true); 
      } else if (authMethod === 'email') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });
          const data = await response.json();
          if (response.ok) {
            localStorage.setItem("sellerToken", data.token);
            window.location.href = "/seller-dashboard";
          } else {
            setError(data.message || "Login failed");
          }
        } catch (err) {
          setError("Network error. Please try again.");
        }
      }
    }
    setLoading(false);
  };

  return (
    // Background explicitly tuned to a warmer paper white (#F3EDE4/F6F1E9)
    <div className="min-h-screen bg-[#F6F1E9] flex w-full font-sans text-gray-800">
      
      {/* ======================================= */}
      {/* LEFT COLUMN: MASONRY GRID PLACEHOLDERS  */}
      {/* ======================================= */}
      {/* Tighter grid spacing, lighter gray (#c4c4c4) blocks without sharp shadows */}
      <div className="hidden lg:flex w-1/2 p-12 xl:p-20 items-center justify-center">
        <div className="w-full max-w-[560px] aspect-[4/3] grid grid-cols-3 gap-5">
          <div className="flex flex-col gap-5">
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[55%]"></div>
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[35%]"></div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[40%]"></div>
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[55%]"></div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[55%]"></div>
            <div className="bg-[#c4c4c4] rounded-[24px] flex-grow min-h-[35%]"></div>
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* RIGHT COLUMN: AUTH FORM                 */}
      {/* ======================================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-20 relative">
        <div className="w-full max-w-[420px] flex flex-col items-center text-center">
          
          {/* Petoty Logo */}
          <div className="mb-8 flex flex-col items-center">
            <img 
              src="/petoty login.png" 
              alt="Petoty Logo" 
              className="w-48 md:w-52 h-auto object-contain" 
            />
          </div>
          
          {/* Header Typography aligned with Figma */}
          <h1 className="text-3xl font-medium text-gray-900 mb-2 tracking-tight">
            {!isLogin ? 'Register as Seller' : (authMethod === 'mobile' ? 'Login with OTP' : 'Login with Email')}
          </h1>
          <p className="text-[15px] text-gray-500 mb-5">
            {!isLogin ? 'Create a new seller account' : 'Enter your log in details'}
          </p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full flex flex-col text-left">
            <AnimatePresence mode="popLayout">
              
              {/* === REGISTER VIEW === */}
              {!isLogin && (
                <motion.div key="register" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col">
                  <div className="flex flex-col gap-4">
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" required />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" required />
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Mobile Number" className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" required />
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" required />
                    <button type="submit" disabled={loading} className="w-full bg-[#3c0321] text-white text-[15px] font-medium rounded-[14px] h-[56px] hover:bg-[#2e0219] transition-colors mt-2 disabled:opacity-70">
                      {loading ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === MOBILE & OTP VIEW === */}
              {isLogin && authMethod === 'mobile' && (
                <motion.div key="mobile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col">
                  
                  <div className="flex flex-col gap-4">
                    {/* The IN +91 Split Input Box matched purely against screenshot */}
                    <div className="flex border border-gray-300 rounded-[14px] overflow-hidden focus-within:border-[#4A0429] focus-within:ring-1 focus-within:ring-[#4A0429] transition-all bg-transparent h-[56px]">
                      <div className="bg-white flex items-center justify-center gap-2 px-4 border-r border-gray-300 h-full w-[100px]">
                        <span className="text-[15px] text-gray-800 font-semibold tracking-wide">IN +91</span>
                      </div>
                      <input 
                        type="tel" 
                        name="mobile" 
                        value={formData.mobile} 
                        onChange={handleInputChange} 
                        placeholder="Enter Mobile Number" 
                        className="flex-1 px-4 bg-transparent outline-none text-[15px] text-gray-900 placeholder-gray-500 font-medium" 
                        required 
                      />
                    </div>

                    {otpSent && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <input 
                          type="text" 
                          name="otp" 
                          value={formData.otp} 
                          onChange={handleInputChange} 
                          placeholder="• • • • • •" 
                          className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none transition-all tracking-[0.5em] text-center text-xl font-bold text-gray-900 mt-2" 
                          required 
                        />
                      </motion.div>
                    )}

                    {/* Dark Maroon Request OTP button */}
                    <button type="submit" className="w-full bg-[#3c0321] text-white text-[15px] font-medium rounded-[14px] h-[56px] hover:bg-[#2e0219] transition-colors mt-1 shadow-sm">
                      {otpSent ? 'Verify OTP' : 'Request OTP'}
                    </button>
                  </div>

                  {/* Divider - Or Login Using (Solid lines) */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="flex-grow border-t border-[#d1d5db]"></div>
                    <span className="text-[13px] text-[#8e97a3] font-medium tracking-wide">Or Login Using</span>
                    <div className="flex-grow border-t border-[#d1d5db]"></div>
                  </div>

                  {/* Email Button - Transparent background with border */}
                  <button 
                    type="button" 
                    onClick={() => { setAuthMethod('email'); setOtpSent(false); }}
                    className="w-full bg-transparent border border-gray-300 text-gray-800 text-[15px] font-medium rounded-[14px] h-[56px] flex items-center justify-center gap-2 hover:bg-gray-100/50 transition-colors"
                  >
                    <Mail className="w-[18px] h-[18px]" strokeWidth={2.5} /> Email
                  </button>
                </motion.div>
              )}

              {/* === EMAIL & PASSWORD VIEW === */}
              {isLogin && authMethod === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col">
                  
                  <div className="flex flex-col gap-4">
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="Email Address" 
                      className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" 
                      required 
                    />

                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      placeholder="Password" 
                      className="w-full h-[56px] px-5 bg-transparent border border-gray-300 rounded-[14px] focus:border-[#4A0429] focus:ring-1 focus:ring-[#4A0429] outline-none text-[15px] text-gray-900" 
                      required 
                    />

                    <button type="submit" disabled={loading} className="w-full bg-[#3c0321] text-white text-[15px] font-medium rounded-[14px] h-[56px] hover:bg-[#2e0219] transition-colors mt-1 shadow-sm disabled:opacity-70">
                      {loading ? 'Logging In...' : 'Log In'}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="flex-grow border-t border-[#d1d5db]"></div>
                    <span className="text-[13px] text-[#8e97a3] font-medium tracking-wide">Or Login Using</span>
                    <div className="flex-grow border-t border-[#d1d5db]"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setAuthMethod('mobile')}
                    className="w-full bg-transparent border border-gray-300 text-gray-800 text-[15px] font-medium rounded-[14px] h-[56px] flex items-center justify-center gap-2 hover:bg-gray-100/50 transition-colors"
                  >
                    Mobile & OTP
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          {/* Dotted Divider for Socials */}
          <div className="flex items-center gap-3 w-full mt-8 mb-6">
            <div className="flex-grow border-t-[1.5px] border-dotted border-[#d1d5db]"></div>
            <span className="text-[13px] text-[#8e97a3] font-medium">Or sign in with</span>
            <div className="flex-grow border-t-[1.5px] border-dotted border-[#d1d5db]"></div>
          </div>

          {/* Social Circles without shadow, thin border, pure white fill */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button className="w-[52px] h-[52px] rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>

            <button className="w-[52px] h-[52px] rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button className="w-[52px] h-[52px] rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-2 mb-6">
            <p className="text-[13px] text-[#8e97a3] font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-gray-900 font-bold hover:underline"
              >
                {isLogin ? "Sign up here" : "Login here"}
              </button>
            </p>
          </div>

          {/* Terms */}
          <p className="text-[12px] text-[#A0AAB5] mt-auto font-medium leading-relaxed">
            I accept that I have read & understood<br/>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a> and <a href="#" className="hover:text-gray-600 transition-colors">T&Cs</a>
          </p>

        </div>
      </div>
    </div>
  );
}