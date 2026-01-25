import React, { useState } from 'react';

const MessageBox = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-32 border-2 border-gray-700 rounded-lg bg-base-200 p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder="Messsage Box"
        className="textarea textarea-ghost w-full h-full resize-none text-white placeholder-gray-500 bg-transparent focus:outline-none"
      />
    </div>
  );
};

export default MessageBox;