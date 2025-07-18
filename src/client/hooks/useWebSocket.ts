import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const newSocket = new WebSocket(url);
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    newSocket.onerror = (event) => {
      setError(event);
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      newSocket.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.send(message);
    }
  };

  return { messages, error, sendMessage };
};

export default useWebSocket;