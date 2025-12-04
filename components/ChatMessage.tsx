import React from 'react';
import { Message, Sender } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
          isUser ? 'bg-green-800 text-green-200' : 'bg-emerald-900/50 text-emerald-300'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
           <div className={`relative px-4 py-3 rounded-2xl shadow-sm border ${
             isUser 
               ? 'bg-green-800 border-green-700 text-green-50 rounded-tr-none' 
               : 'bg-emerald-900/30 border-emerald-800/40 text-green-50 rounded-tl-none'
           }`}>
             
             {/* Image Attachment */}
             {message.image && (
               <div className="mb-3 rounded-lg overflow-hidden border border-green-700">
                 <img src={message.image} alt="Uploaded content" className="max-w-full max-h-60 object-cover" />
               </div>
             )}

             {/* Text Content */}
             {message.isError ? (
                <div className="flex items-center text-red-400 gap-2">
                  <AlertCircle size={16} />
                  <span>{message.text}</span>
                </div>
             ) : (
                <div className={`text-base leading-relaxed ${!isUser ? 'urdu-text' : ''}`}>
                  <MarkdownRenderer content={message.text} />
                </div>
             )}
             
             {/* Timestamp */}
             <span className="text-[10px] text-green-400/60 mt-1 block w-full text-left" dir="ltr">
               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;