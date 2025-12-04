import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { LogIn, Sparkles, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      // Name input is removed, so we pass a default generic name
      onLogin('Student'); 
    } else {
      setError('غلط پاس ورڈ (Incorrect Password)');
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-center mb-6">
             <div className="p-5 bg-green-900 rounded-full text-emerald-400 shadow-xl border border-green-800">
                <Sparkles size={56} />
             </div>
        </div>
        <h1 className="text-4xl font-bold text-green-50 urdu-text leading-relaxed">{APP_NAME}</h1>
        <p className="text-green-300 text-lg">آپ کا ذاتی AI ہوم ورک اسسٹنٹ</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="bg-green-900/40 p-8 rounded-3xl border border-green-800/50 shadow-2xl backdrop-blur-sm">
             <div className="space-y-6">
                <div className="text-right space-y-2">
                    <label htmlFor="password" className="block text-base font-medium text-green-200 urdu-text">پاس ورڈ (Password)</label>
                    <div className="relative">
                      <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          className="w-full px-5 py-4 pl-12 rounded-xl bg-green-950/80 border border-green-800 text-green-50 placeholder-green-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-left transition-all text-lg tracking-widest"
                          placeholder="••••"
                          autoFocus
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
                    </div>
                    {error && (
                      <div className="flex items-center justify-end gap-2 text-red-400 text-sm mt-2 animate-pulse">
                        <span>{error}</span>
                        <AlertCircle size={14} />
                      </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-900/20 transform hover:-translate-y-0.5 active:scale-95"
                >
                    <LogIn size={22} className="transform rotate-180" />
                    <span className="text-lg">Login</span>
                </button>
             </div>
        </div>
      </form>
      
      <div className="text-green-600/40 text-xs font-sans mt-auto">
         Developed by Abdul Hadi
      </div>
    </div>
  );
};

export default LoginScreen;