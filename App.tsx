import React, { useState, useRef, useEffect } from 'react';
import { AppState, Message, Sender, Subject } from './types';
import { SUBJECTS, WELCOME_MESSAGE, CHAT_PLACEHOLDER, APP_NAME } from './constants';
import SubjectGrid from './components/SubjectGrid';
import ChatMessage from './components/ChatMessage';
import LoginScreen from './components/LoginScreen';
import { sendMessageToGemini } from './services/geminiService';
import { Send, Image as ImageIcon, X, ArrowRight, Loader2, Sparkles, Home, LogOut, Mic, MicOff } from 'lucide-react';

// Type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.Home);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('abdul_hadi_user');
    if (storedUser) {
      setUserName(storedUser);
      setIsLoggedIn(true);
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence/phrase
      recognition.interimResults = false;
      recognition.lang = 'ur-PK'; // Default to Urdu (Pakistan)

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    localStorage.setItem('abdul_hadi_user', name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setAppState(AppState.Home);
    setCurrentSubject(null);
    setMessages([]);
    localStorage.removeItem('abdul_hadi_user');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubjectSelect = (subject: Subject) => {
    setCurrentSubject(subject);
    setAppState(AppState.Chat);
    setMessages([
      {
        id: 'welcome',
        text: `السلام علیکم **${userName}**! میں آپ کا **${subject.name}** کا استاد ہوں۔ آپ مجھ سے کوئی بھی سوال پوچھ سکتے ہیں۔`,
        sender: Sender.AI,
        timestamp: Date.now()
      }
    ]);
  };

  const handleBackToHome = () => {
    setAppState(AppState.Home);
    setCurrentSubject(null);
    setMessages([]);
    setInputValue('');
    setSelectedImage(null);
    setIsListening(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("آپ کے براؤزر میں اسپیچ ریکگنیشن کی سہولت موجود نہیں ہے۔");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading || !currentSubject) return;

    // Stop listening if sending
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: Sender.User,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    const sentImage = selectedImage; // Store locally for api call
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Prepare history for API
      // Convert internal Message format to API format
      // Note: We filter out error messages
      const history = messages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.sender === Sender.User ? 'user' as const : 'model' as const,
          parts: [{ text: m.text }]
        }));

      // Extract base64 data correctly if it exists (remove data:image/xxx;base64, prefix)
      let cleanImage = null;
      if (sentImage) {
        cleanImage = sentImage.split(',')[1];
      }

      const responseText = await sendMessageToGemini(
        userMsg.text, 
        cleanImage, 
        currentSubject.promptContext, 
        history
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.AI,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: "معذرت، کچھ غلط ہو گیا ہے۔ براہ کرم دوبارہ کوشش کریں۔",
        sender: Sender.AI,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen max-w-lg mx-auto bg-green-950 shadow-2xl border-x border-green-900 overflow-hidden">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-green-950 shadow-2xl overflow-hidden relative border-x border-green-900">
      
      {/* Header */}
      <header className="flex-none p-4 border-b border-green-800 bg-green-900 z-10 flex items-center justify-between shadow-md">
        {/* Right Side (First Child in LTR) - RTL Logic applies visually via icons/text */}
        {appState === AppState.Chat ? (
           <button onClick={handleBackToHome} className="p-2 -mr-2 text-green-300 hover:text-green-100 hover:bg-green-800 rounded-full transition-colors" title="واپس">
             <ArrowRight size={24} className="transform rotate-180" /> {/* RTL arrow fix */}
           </button>
        ) : (
          <div className="w-10"></div> // Spacer
        )}
        
        <h1 className="text-xl font-bold text-green-50 flex items-center gap-2 urdu-text">
          <Sparkles className="text-emerald-400 fill-emerald-900" size={20} />
          {currentSubject ? currentSubject.name : APP_NAME}
        </h1>

        {/* Left Side (Last Child in LTR) */}
        {appState === AppState.Chat ? (
           <button onClick={handleBackToHome} className="p-2 -ml-2 text-green-300 hover:text-green-100 hover:bg-green-800 rounded-full transition-colors" title="ہوم">
             <Home size={22} />
           </button>
        ) : (
           <button onClick={handleLogout} className="p-2 -ml-2 text-green-400 hover:text-red-300 hover:bg-green-800 rounded-full transition-colors" title="Logout">
             <LogOut size={22} className="transform rotate-180" />
           </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-green-950 relative scroll-smooth">
        {appState === AppState.Home ? (
          <div className="min-h-full flex flex-col items-center justify-center p-4 py-10">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-2xl font-bold text-green-50 urdu-text leading-loose">خوش آمدید، {userName}!</h2>
              <p className="text-green-300 text-sm">آج آپ کیا پڑھنا چاہیں گے؟</p>
            </div>
            <SubjectGrid onSelect={handleSubjectSelect} />
            <div className="mt-12 text-green-600/70 text-xs font-medium font-sans">
              Developed by Abdul Hadi
            </div>
          </div>
        ) : (
          <div className="p-4 pb-24 min-h-full flex flex-col">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-end mb-4 animate-pulse">
                <div className="bg-green-900 px-4 py-3 rounded-2xl rounded-tr-none flex items-center gap-2 text-emerald-400">
                   <Loader2 size={16} className="animate-spin" />
                   <span className="text-sm">سوچ رہا ہے...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Chat Input Area */}
      {appState === AppState.Chat && (
        <footer className="flex-none p-4 bg-green-900 border-t border-green-800 absolute bottom-0 w-full z-20">
          {/* Image Preview */}
          {selectedImage && (
            <div className="absolute bottom-full right-4 mb-2 p-1 bg-green-800 rounded-lg shadow-lg border border-green-700">
              <div className="relative">
                <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                <button 
                  onClick={clearImage}
                  className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
             {/* Image Upload Button */}
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 text-green-400 hover:text-green-200 hover:bg-green-800 rounded-xl transition-colors mb-0.5"
               title="تصویر اپ لوڈ کریں"
             >
               <ImageIcon size={24} />
             </button>
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleImageUpload}
             />
             
             {/* Microphone Button */}
             <button
                onClick={toggleListening}
                className={`p-3 rounded-xl mb-0.5 transition-all duration-200 ${
                    isListening 
                    ? 'bg-red-900/50 text-red-400 animate-pulse' 
                    : 'text-green-400 hover:text-green-200 hover:bg-green-800'
                }`}
                title="بول کر لکھیں"
             >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
             </button>

             <div className="flex-1 bg-green-800 rounded-2xl border border-green-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-900 transition-all flex items-center">
               <textarea
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder={isListening ? "سن رہا ہوں..." : CHAT_PLACEHOLDER}
                 className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-3 px-4 text-green-50 placeholder-green-500 urdu-text leading-relaxed"
                 rows={1}
                 style={{ minHeight: '48px' }}
               />
             </div>

             <button 
               onClick={sendMessage}
               disabled={isLoading || (!inputValue.trim() && !selectedImage)}
               className={`p-3 rounded-xl mb-0.5 transition-all duration-200 ${
                 isLoading || (!inputValue.trim() && !selectedImage)
                 ? 'bg-green-800 text-green-600 cursor-not-allowed'
                 : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transform active:scale-95'
               }`}
             >
               {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="transform rotate-180" />} 
             </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;